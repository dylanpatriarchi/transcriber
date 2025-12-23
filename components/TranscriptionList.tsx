"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Transcription } from "@/types";
import { FileAudio, Calendar, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

export default function TranscriptionList() {
    const { user } = useAuth();
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "users", user.uid, "transcriptions"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Transcription[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                items.push({
                    id: doc.id,
                    originalFile: data.originalFile,
                    text: data.text,
                    markdown: data.markdown,
                    createdAt: data.createdAt
                });
            });

            items.sort((a, b) => {
                const secondsA = a.createdAt?.seconds || 0;
                const secondsB = b.createdAt?.seconds || 0;
                return secondsB - secondsA;
            });

            setTranscriptions(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transcriptions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-pulse text-gray-400">Loading transcriptions...</div>
            </div>
        );
    }

    if (transcriptions.length === 0) {
        return (
            <div className="text-center py-16 border border-gray-200 rounded-xl bg-gray-50 border-dashed">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No transcriptions yet.</p>
                <p className="text-gray-400 text-sm mt-1">Upload an audio file on the dashboard to get started.</p>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
                {transcriptions.map((item) => (
                    <Link
                        key={item.id}
                        href={`/dashboard/transcriptions/${item.id}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-black transition-colors">
                                <FileAudio className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-semibold text-sm truncate max-w-[200px] sm:max-w-md">
                                    {item.originalFile.split('/').pop()}
                                </h4>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                                        <Calendar className="w-3 h-3" />
                                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                    </div>
                                    {item.markdown && (
                                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter border border-green-100">
                                            Formatted
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-all group-hover:translate-x-1" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
