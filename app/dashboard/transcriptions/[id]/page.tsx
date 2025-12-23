"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/components/AuthContext";
import { Transcription } from "@/types";
import ReactMarkdown from "react-markdown";
import { FileAudio, Calendar, ChevronLeft, Download, Trash2, Clock } from "lucide-react";
import Link from "next/link";

export default function TranscriptionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [transcription, setTranscription] = useState<Transcription | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'raw' | 'markdown'>('markdown');

    useEffect(() => {
        if (authLoading || !user || !id) return;

        const fetchTranscription = async () => {
            try {
                const docRef = doc(db, "users", user.uid, "transcriptions", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const item = {
                        id: docSnap.id,
                        originalFile: data.originalFile,
                        text: data.text,
                        markdown: data.markdown,
                        createdAt: data.createdAt
                    } as Transcription;

                    setTranscription(item);
                    if (item.markdown) setViewMode('markdown');
                    else setViewMode('raw');

                    // Get audio URL
                    try {
                        const audioRef = ref(storage, item.originalFile);
                        const url = await getDownloadURL(audioRef);
                        setAudioUrl(url);
                    } catch (e) {
                        console.error("Error getting audio URL:", e);
                    }
                } else {
                    console.error("No such document!");
                    router.push("/dashboard/transcriptions");
                }
            } catch (error) {
                console.error("Error fetching transcription:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTranscription();
    }, [user, id, authLoading, router]);

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-gray-400 font-medium italic">Loading transcription...</div>
            </div>
        );
    }

    if (!transcription) return null;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Breadcrumb / Back Navigation */}
            <div className="mb-8">
                <Link
                    href="/dashboard/transcriptions"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to transcriptions
                </Link>
            </div>

            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-10 border-b border-gray-100">
                <div className="space-y-4 min-w-0">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg w-fit">
                        <FileAudio className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-mono font-medium text-gray-700 truncate max-w-[250px] sm:max-w-none">
                            {transcription.originalFile.split('/').pop()}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight leading-tight">
                        {transcription.originalFile.split('/').pop()?.split('.')[0] || "Audio Transcription"}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-4 h-4" />
                            {transcription.createdAt?.toDate ? transcription.createdAt.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-4 h-4" />
                            {transcription.createdAt?.toDate ? transcription.createdAt.toDate().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* Action buttons could go here */}
                    {audioUrl && (
                        <a
                            href={audioUrl}
                            download
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:border-black transition-all text-sm font-semibold"
                        >
                            <Download className="w-4 h-4" />
                            Download Audio
                        </a>
                    )}
                </div>
            </div>

            {/* Audio Player Container */}
            {audioUrl && (
                <div className="sticky top-20 z-10 bg-white/80 backdrop-blur-md p-4 border border-gray-200 rounded-2xl shadow-sm mb-12">
                    <audio controls className="w-full h-12" style={{ accentColor: '#000' }}>
                        <source src={audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}

            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Transcription Content</h2>

                    {transcription.markdown && (
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('markdown')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'markdown'
                                    ? 'bg-white shadow-sm text-black scale-105'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Formatted
                            </button>
                            <button
                                onClick={() => setViewMode('raw')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'raw'
                                    ? 'bg-white shadow-sm text-black scale-105'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Raw Text
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-8 border border-gray-100 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="prose prose-lg max-w-none text-gray-900 leading-relaxed font-medium">
                        {viewMode === 'markdown' && transcription.markdown ? (
                            <div className="markdown-content">
                                <ReactMarkdown>
                                    {transcription.markdown}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap">
                                {transcription.text}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
