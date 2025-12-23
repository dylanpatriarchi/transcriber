"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { auth } from "@/lib/firebase";
import AudioUploader from "@/components/AudioUploader";
import TranscriptionList from "@/components/TranscriptionList";
import { LogOut, Mic, FileText } from "lucide-react";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        <h1 className="text-lg font-semibold">Transcriber</h1>
                    </div>
                    <button
                        onClick={() => auth.signOut()}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                    <p className="text-gray-600">Welcome back, {user.email}</p>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                                <Mic className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-medium">New Transcription</div>
                                <div className="text-xs text-gray-500">Upload audio file</div>
                            </div>
                        </button>

                        <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <div className="font-medium">View All</div>
                                <div className="text-xs text-gray-500">Browse transcriptions</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="mb-8">
                    <AudioUploader />
                </div>

                {/* Transcriptions List */}
                <div>
                    <TranscriptionList />
                </div>
            </main>
        </div>
    );
}
