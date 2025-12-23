"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, storage, auth } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/components/AuthContext";
import { Transcription, AIInsightsResponse } from "@/types";
import ReactMarkdown from "react-markdown";
import {
    FileAudio, Calendar, ChevronLeft, Download, Trash2, Clock,
    Sparkles, MessageSquare, Brain, HelpCircle, FileText, Loader2, RefreshCw
} from "lucide-react";
import Link from "next/link";
import ChatModule from "@/components/study/ChatModule";
import FlashcardModule from "@/components/study/FlashcardModule";
import QuizModule from "@/components/study/QuizModule";

type TabType = 'content' | 'summary' | 'chat' | 'flashcards' | 'quiz';

export default function TranscriptionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [transcription, setTranscription] = useState<Transcription | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('summary');
    const [viewMode, setViewMode] = useState<'raw' | 'markdown'>('markdown');
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (authLoading || !user || !id) return;

        const docRef = doc(db, "users", user.uid, "transcriptions", id as string);

        // Use onSnapshot for real-time updates when AI data is saved
        const unsubscribe = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const item = {
                    id: docSnap.id,
                    ...data
                } as Transcription;

                setTranscription(item);

                // Auto-switch tab if summary exists and we are on content
                if (activeTab === 'content' && item.summary) {
                    setActiveTab('summary');
                }

                // Fetch audio URL if not already fetched
                if (!audioUrl) {
                    try {
                        const audioRef = ref(storage, item.originalFile);
                        const url = await getDownloadURL(audioRef);
                        setAudioUrl(url);
                    } catch (e) {
                        console.error("Error getting audio URL:", e);
                    }
                }
                setLoading(false);
            } else {
                router.push("/dashboard/transcriptions");
            }
        });

        return () => unsubscribe();
    }, [user, id, authLoading, router, audioUrl]);

    const generateAI = async (type: 'summary' | 'flashcards' | 'quiz' | 'all') => {
        if (!transcription || isGenerating) return;
        setIsGenerating(type);

        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch("/api/ai/insights", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    transcriptionId: transcription.id,
                    text: transcription.text,
                    type
                }),
            });

            const data: AIInsightsResponse = await response.json();
            if (data.error) throw new Error(data.error);

            // onSnapshot will handle the state update
            setActiveTab(type === 'all' ? 'summary' : type);
        } catch (err) {
            console.error(err);
            alert("AI Generation failed. Please check your OpenAI balance or try again.");
        } finally {
            setIsGenerating(null);
        }
    };

    const deleteTranscription = async () => {
        if (!transcription || !window.confirm("Are you sure you want to permanently delete this transcription and the associated audio file?")) return;

        setIsDeleting(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch("/api/transcriptions/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    transcriptionId: transcription.id,
                    storagePath: transcription.originalFile
                }),
            });

            if (!response.ok) throw new Error("Delete failed");
            router.push("/dashboard/transcriptions");
        } catch (err) {
            console.error(err);
            alert("Failed to delete.");
            setIsDeleting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-gray-400 font-medium italic">Preparing your study session...</div>
            </div>
        );
    }

    if (!transcription) return null;

    return (
        <div className="max-w-4xl mx-auto pb-32 px-4 md:px-0">
            {/* Breadcrumbs & Delete */}
            <div className="flex items-center justify-between mb-8">
                <Link
                    href="/dashboard/transcriptions"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to list
                </Link>

                <button
                    onClick={deleteTranscription}
                    disabled={isDeleting}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    title="Delete transcription"
                >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                </button>
            </div>

            {/* Hero Section */}
            <div className="space-y-4 mb-10">
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg w-fit border border-gray-100">
                    <FileAudio className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 font-mono truncate max-w-[200px]">
                        {transcription.originalFile.split('/').pop()}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                    {transcription.originalFile.split('/').pop()?.split('.')[0] || "Analysis"}
                </h1>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {transcription.createdAt?.toDate ? transcription.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </div>
                    {audioUrl && (
                        <a href={audioUrl} download className="flex items-center gap-1.5 hover:text-black transition-colors">
                            <Download className="w-3.5 h-3.5" />
                            Download original
                        </a>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-4 z-30 mb-10 p-1.5 bg-gray-100/80 backdrop-blur-md rounded-2xl flex flex-wrap gap-1 shadow-sm border border-white/20 overflow-x-auto no-scrollbar">
                {[
                    { id: 'summary', label: 'Summary', icon: Sparkles },
                    { id: 'content', label: 'Draft', icon: FileText },
                    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
                    { id: 'flashcards', label: 'Cards', icon: Brain },
                    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 ${activeTab === tab.id
                                ? 'bg-white shadow-lg text-black scale-105'
                                : 'text-gray-500 hover:text-black'
                            }`}
                    >
                        <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-black' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Viewport */}
            <div className="min-h-[400px]">
                {/* TAB: CONTENT */}
                {activeTab === 'content' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Original Transcript</h2>
                            {transcription.markdown && (
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button onClick={() => setViewMode('markdown')} className={`px-3 py-1 text-[10px] font-black uppercase rounded ${viewMode === 'markdown' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Formatted</button>
                                    <button onClick={() => setViewMode('raw')} className={`px-3 py-1 text-[10px] font-black uppercase rounded ${viewMode === 'raw' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Raw</button>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border border-gray-100 rounded-[2.5rem] bg-white shadow-sm prose prose-lg max-w-none leading-relaxed font-medium">
                            {viewMode === 'markdown' && transcription.markdown ? (
                                <div className="markdown-content">
                                    <ReactMarkdown>{transcription.markdown}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap text-gray-800">{transcription.text}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: SUMMARY */}
                {activeTab === 'summary' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        {!transcription.summary ? (
                            <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                                <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">No summary yet</h3>
                                <p className="text-gray-400 text-sm mb-8">Let AI analyze this audio and create a concise summary for you.</p>
                                <button
                                    onClick={() => generateAI('summary')}
                                    disabled={!!isGenerating}
                                    className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-sm flex items-center gap-2 mx-auto hover:bg-gray-800 transition-all active:scale-95"
                                >
                                    {isGenerating === 'summary' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {isGenerating === 'summary' ? "Analyzing..." : "Generate AI Summary"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Deep Summary</h2>
                                    <button onClick={() => generateAI('summary')} className="p-2 text-gray-300 hover:text-black transition-colors" title="Regenerate">
                                        <RefreshCw className={`w-4 h-4 ${isGenerating === 'summary' ? 'animate-spin text-black' : ''}`} />
                                    </button>
                                </div>
                                <div className="p-10 border border-gray-100 rounded-[2.5rem] bg-white shadow-sm">
                                    <div className="prose prose-lg max-w-none text-gray-900 leading-relaxed font-medium">
                                        <ReactMarkdown>{transcription.summary}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: CHAT */}
                {activeTab === 'chat' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ChatModule contextText={transcription.text} />
                    </div>
                )}

                {/* TAB: FLASHCARDS */}
                {activeTab === 'flashcards' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!transcription.flashcards ? (
                            <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                                <Brain className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Study Cards</h3>
                                <p className="text-gray-400 text-sm mb-8">Generate interactive flashcards to help you memorize key concepts.</p>
                                <button
                                    onClick={() => generateAI('flashcards')}
                                    disabled={!!isGenerating}
                                    className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-sm flex items-center gap-2 mx-auto"
                                >
                                    {isGenerating === 'flashcards' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {isGenerating === 'flashcards' ? "Creating cards..." : "Generate Flashcards"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Dynamic Cards</h2>
                                    <button onClick={() => generateAI('flashcards')} className="p-2 text-gray-300 hover:text-black transition-colors">
                                        <RefreshCw className={`w-4 h-4 ${isGenerating === 'flashcards' ? 'animate-spin text-black' : ''}`} />
                                    </button>
                                </div>
                                <FlashcardModule cards={transcription.flashcards} />
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: QUIZ */}
                {activeTab === 'quiz' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!transcription.quiz ? (
                            <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                                <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Test Your Knowledge</h3>
                                <p className="text-gray-400 text-sm mb-8">Generate a custom quiz to verify how much you've learned.</p>
                                <button
                                    onClick={() => generateAI('quiz')}
                                    disabled={!!isGenerating}
                                    className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-sm flex items-center gap-2 mx-auto"
                                >
                                    {isGenerating === 'quiz' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {isGenerating === 'quiz' ? "Preparing quiz..." : "Generate Quiz"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Adaptive Quiz</h2>
                                    <button onClick={() => generateAI('quiz')} className="p-2 text-gray-300 hover:text-black transition-colors">
                                        <RefreshCw className={`w-4 h-4 ${isGenerating === 'quiz' ? 'animate-spin text-black' : ''}`} />
                                    </button>
                                </div>
                                <QuizModule questions={transcription.quiz} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Persistent Audio Player (Floating) */}
            {audioUrl && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 w-[90%] md:w-[600px] bg-black text-white p-2 rounded-2xl shadow-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileAudio className="w-5 h-5" />
                    </div>
                    <audio controls className="w-full h-10 invert brightness-0" style={{ filter: 'invert(1)' }}>
                        <source src={audioUrl} type="audio/mpeg" />
                    </audio>
                </div>
            )}
        </div>
    );
}
