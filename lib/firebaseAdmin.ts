import * as admin from 'firebase-admin';

// Helper to handle private key formatting for both escaped and unescaped newlines, and remove quotes
const formatPrivateKey = (key: string) => {
    const rawKey = key.replace(/^"|"$/g, '');
    return rawKey.replace(/\\n/g, '\n');
};

const initializeFirebaseAdmin = () => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Missing Firebase Admin credentials (NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY)");
    }

    try {
        // Use a unique name for the app to avoid conflicts with default app or HMR issues
        const appName = "transcriber-server";

        // Check if existing app instance exists
        const existingApp = admin.apps.find(app => app?.name === appName);
        if (existingApp) {
            return existingApp;
        }

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: formatPrivateKey(privateKey),
            }),
            projectId,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        }, appName);
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error);
        throw error;
    }
};

// Initialize immediately to catch errors at startup/module load
const app = initializeFirebaseAdmin();

export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);
export const adminStorage = admin.storage(app);

