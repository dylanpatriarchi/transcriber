export interface Flashcard {
    question: string;
    answer: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
}

export interface Transcription {
    id: string;
    originalFile: string;
    text: string;
    markdown?: string;
    summary?: string;
    flashcards?: Flashcard[];
    quiz?: QuizQuestion[];
    createdAt: any;
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

export interface AIInsightsRequest {
    transcriptionId: string;
    text: string;
    type: 'summary' | 'flashcards' | 'quiz' | 'all';
}

export interface AIInsightsResponse {
    summary?: string;
    flashcards?: Flashcard[];
    quiz?: QuizQuestion[];
    error?: string;
}
