import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (privateKey && clientEmail) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
                projectId: projectId,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
            console.log("Firebase Admin initialized with explicit credentials.");
        } catch (error) {
            console.error("Error initializing Firebase Admin with credentials:", error);
        }
    } else {
        console.warn("Missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL. Attempting default init...");
        try {
            admin.initializeApp();
            console.log("Firebase Admin initialized with default credentials.");
        } catch (e) {
            console.warn("Firebase Admin default init failed:", e);
        }
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
