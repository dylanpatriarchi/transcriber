export interface Transcription {
    id: string;
    originalFile: string;
    text: string;
    createdAt: any; // Firestore Timestamp
}

export interface TranscribeRequest {
    fileUrl: string;
    storagePath: string;
}

export interface TranscribeResponse {
    text?: string;
    error?: string;
}
