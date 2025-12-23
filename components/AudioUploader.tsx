"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { TranscribeRequest, TranscribeResponse } from "@/types";

export default function AudioUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [error, setError] = useState("");
    const [sucessMsg, setSuccessMsg] = useState("");

    const handleUpload = async () => {
        if (!file || !auth.currentUser) return;

        setUploading(true);
        setError("");
        setSuccessMsg("");

        try {
            // Validate file type client-side
            if (!file.type.startsWith('audio/')) {
                throw new Error("Please upload a valid audio file.");
            }

            const fileId = uuidv4();
            const storageRef = ref(storage, `users/${auth.currentUser.uid}/uploads/${fileId}-${file.name}`);

            // 1. Upload to Firebase Storage
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setUploading(false);
            setTranscribing(true);

            // 2. Call API to transcribe
            const token = await auth.currentUser.getIdToken();

            const payload: TranscribeRequest = {
                fileUrl: downloadURL,
                storagePath: storageRef.fullPath
            };

            const response = await fetch("/api/transcribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Transcription failed with status ${response.status}`);
            }

            const data: TranscribeResponse = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setSuccessMsg("Transcription complete! Check the list below.");
            setFile(null);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            console.error(err);
        } finally {
            setUploading(false);
            setTranscribing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 transition-all">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">New Transcription</h3>

            <div className="space-y-4">
                <label className="block">
                    <span className="sr-only">Choose audio file</span>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-200
                cursor-pointer focus:outline-none"
                    />
                </label>

                {error && (
                    <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {sucessMsg && (
                    <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium">
                        {sucessMsg}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading || transcribing}
                    className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all transform
            ${(!file || uploading || transcribing)
                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-[0.98]'}`}
                >
                    {uploading ? "Uploading Audio..." : transcribing ? "Processing Transcription..." : "Start Transcription"}
                </button>
            </div>
        </div>
    );
}
