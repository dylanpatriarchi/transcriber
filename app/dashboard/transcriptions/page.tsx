"use client";

import TranscriptionList from "@/components/TranscriptionList";

export default function TranscriptionsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transcriptions</h1>
                <p className="text-gray-500 mt-1">
                    Review and manage your processed audio files.
                </p>
            </div>

            <TranscriptionList />
        </div>
    );
}
