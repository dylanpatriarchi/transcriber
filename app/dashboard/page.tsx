"use client";

import AudioUploader from "@/components/AudioUploader";
import { useAuth } from "@/components/AuthContext";
import { Mic, Zap, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-10">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-gray-500 mt-1">
                    Welcome back, {user?.email}
                </p>
            </div>

            {/* Quick Actions Grid */}
            <section>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group p-6 border border-gray-200 rounded-xl bg-white hover:border-black transition-all cursor-default">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-lg">New Transcription</h4>
                        <p className="text-gray-500 text-sm mt-1">Upload any audio file to start transcribing with AI.</p>
                    </div>

                    <Link href="/dashboard/transcriptions" className="group p-6 border border-gray-200 rounded-xl bg-white hover:border-black transition-all">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                            <Zap className="w-5 h-5 text-black" />
                        </div>
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg">View History</h4>
                            <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Browse and search through your previous transcriptions.</p>
                    </Link>
                </div>
            </section>

            {/* Upload Section */}
            <section>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Upload Audio
                </h3>
                <AudioUploader />
            </section>
        </div>
    );
}
