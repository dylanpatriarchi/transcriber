"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

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
            const fileId = uuidv4();
            const storageRef = ref(storage, `users/${auth.currentUser.uid}/uploads/${fileId}-${file.name}`);

            // 1. Upload to Firebase Storage
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setUploading(false);
            setTranscribing(true);

            // 2. Call API to transcribe
            const token = await auth.currentUser.getIdToken();
            const response = await fetch("/api/transcribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileUrl: downloadURL,
                    storagePath: storageRef.fullPath
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Transcription failed with status ${response.status}`);
            }

            setSuccessMsg("Transcription complete! Check the list below.");
            setFile(null);
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setUploading(false);
            setTranscribing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Audio</h3>

            <div className="space-y-4">
                <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-200"
                />

                {error && <div className="text-red-500 text-sm">{error}</div>}
                {sucessMsg && <div className="text-green-500 text-sm">{sucessMsg}</div>}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading || transcribing}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${(!file || uploading || transcribing)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                >
                    {uploading ? "Uploading..." : transcribing ? "Transcribing..." : "Upload & Transcribe"}
                </button>
            </div>
        </div>
    );
}
