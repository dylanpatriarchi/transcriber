"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { TranscribeRequest, TranscribeResponse } from "@/types";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AudioUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleUpload = async () => {
        if (!file || !auth.currentUser) return;

        setUploading(true);
        setError("");
        setSuccessMsg("");

        try {
            if (!file.type.startsWith('audio/')) {
                throw new Error("Please upload a valid audio file.");
            }

            const fileId = uuidv4();
            const storageRef = ref(storage, `users/${auth.currentUser.uid}/uploads/${fileId}-${file.name}`);

            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setUploading(false);
            setTranscribing(true);

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

            setSuccessMsg("Transcription complete!");
            setFile(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setUploading(false);
            setTranscribing(false);
        }
    };

    const isProcessing = uploading || transcribing;

    return (
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">New Transcription</h2>

            <div className="space-y-4">
                {/* File Input */}
                <label className="block">
                    <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${file ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                        }`}>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                            disabled={isProcessing}
                        />
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                            {file ? file.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Audio files only</p>
                    </div>
                </label>

                {/* Status Messages */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || isProcessing}
                    className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${!file || isProcessing
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                >
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {uploading ? "Uploading..." : transcribing ? "Processing transcription..." : "Start Transcription"}
                </button>
            </div>
        </div>
    );
}
