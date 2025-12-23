"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { useAuth } from "./AuthContext";
import { Transcription } from "@/types";
import ReactMarkdown from "react-markdown";
import { FileAudio, Calendar } from "lucide-react";

export default function TranscriptionList() {
    const { user } = useAuth();
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [loading, setLoading] = useState(true);
    const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
    const [viewModes, setViewModes] = useState<Record<string, 'raw' | 'markdown'>>({});

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "users", user.uid, "transcriptions"));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
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

            // Fetch audio URLs
            const urls: Record<string, string> = {};
            for (const item of items) {
                try {
                    const audioRef = ref(storage, item.originalFile);
                    urls[item.id] = await getDownloadURL(audioRef);
                } catch (e) {
                    console.error("Failed to get audio URL:", e);
                }
            }
            setAudioUrls(urls);
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

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-6">Your Transcriptions</h2>

            {transcriptions.length === 0 ? (
                <div className="text-center py-16 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-500">No transcriptions yet. Upload an audio file to get started.</p>
                </div>
            ) : (
                transcriptions.map((item) => {
                    const currentMode = viewModes[item.id] || 'markdown';
                    const hasMarkdown = !!item.markdown;

                    return (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-sm transition-shadow">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FileAudio className="w-4 h-4" />
                                    <span className="font-mono">{item.originalFile.split('/').pop()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                                </div>
                            </div>

                            {/* Audio Player */}
                            {audioUrls[item.id] && (
                                <div className="mb-4">
                                    <audio controls className="w-full h-10" style={{ accentColor: '#000' }}>
                                        <source src={audioUrls[item.id]} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}

                            {/* View Toggle */}
                            {hasMarkdown && (
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setViewModes(prev => ({ ...prev, [item.id]: 'markdown' }))}
                                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${currentMode === 'markdown'
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Formatted
                                    </button>
                                    <button
                                        onClick={() => setViewModes(prev => ({ ...prev, [item.id]: 'raw' }))}
                                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${currentMode === 'raw'
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Raw
                                    </button>
                                </div>
                            )}

                            {/* Content */}
                            <div className="prose prose-sm max-w-none">
                                {currentMode === 'markdown' && hasMarkdown ? (
                                    <div className="text-gray-800 leading-relaxed">
                                        <ReactMarkdown>{item.markdown || ""}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {item.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
