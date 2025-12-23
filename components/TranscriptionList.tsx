"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Transcription } from "@/types";

export default function TranscriptionList() {
    const { user } = useAuth();
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Use a simple query first to avoid index issues during dev.
        // Ideally, for production with many records, you'd want a composite index on [userId, createdAt]
        const q = query(collection(db, "users", user.uid, "transcriptions"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Transcription[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                items.push({
                    id: doc.id,
                    originalFile: data.originalFile,
                    text: data.text,
                    createdAt: data.createdAt
                });
            });

            // Client-side sort is sufficient for small-to-medium lists
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
            <div className="flex justify-center py-8">
                <div className="animate-pulse flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
                Your Transcriptions
            </h3>

            {transcriptions.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">You haven't uploaded any files yet.</p>
                </div>
            ) : (
                transcriptions.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-shadow hover:shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                {item.originalFile.split('/').pop()}
                            </span>
                            <span className="text-xs text-gray-400">
                                {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'Just now'}
                            </span>
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {item.text}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
