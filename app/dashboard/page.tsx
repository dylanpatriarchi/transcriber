"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { auth } from "@/lib/firebase";
import AudioUploader from "@/components/AudioUploader";
import TranscriptionList from "@/components/TranscriptionList";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <button
                        onClick={() => auth.signOut()}
                        className="text-sm text-red-600 hover:text-red-500"
                    >
                        Sign Out
                    </button>
                </div>

                <AudioUploader />
                <TranscriptionList />
            </div>
        </div>
    );
}
