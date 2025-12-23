"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

interface Transcription {
    id: string;
    originalFile: string;
    text: string;
    createdAt: any;
}

export default function TranscriptionList() {
    const { user } = useAuth();
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "users", user.uid, "transcriptions"),
            // orderBy("createdAt", "desc") // Requires index, might error initially without it
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: Transcription[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as Transcription);
            });
            // Client-side sort to avoid index requirement for now
            items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setTranscriptions(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <div className="text-center py-4">Loading transcriptions...</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Transcriptions</h3>

            {transcriptions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No transcriptions yet.</p>
            ) : (
                transcriptions.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-gray-400 font-mono break-all">{item.originalFile.split('/').pop()}</span>
                            <span className="text-xs text-gray-400">
                                {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'Just now'}
                            </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{item.text}</p>
                    </div>
                ))
            )}
        </div>
    );
}
