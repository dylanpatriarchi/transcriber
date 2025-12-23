export interface Transcription {
    id: string;
    originalFile: string;
    text: string;
    markdown?: string; // New field for formatted text
    createdAt: any; // Firestore Timestamp
}

export interface TranscribeRequest {
    fileUrl: string;
    storagePath: string;
}

export interface TranscribeResponse {
    text?: string;
    markdown?: string;
    error?: string;
}
