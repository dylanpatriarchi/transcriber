import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminStorage, adminDb } from "@/lib/firebaseAdmin"; // We need admin SDK for trusted backend ops
import OpenAI from "openai";
import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI lazily or check for key
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); 

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY is not set");
        }
        const openai = new OpenAI({ apiKey });

        const { fileUrl, storagePath } = await req.json();

        // Verify user authentication (via header or cookie) - simplified here, assuming frontend sends ID token
        const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];
        if (!idToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        if (!storagePath.startsWith(`users/${userId}/`)) {
            return NextResponse.json({ error: "Forbidden access to file" }, { status: 403 });
        }

        // 1. Download file from Firebase Storage
        const bucket = adminStorage.bucket();
        const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.mp3`);

        await bucket.file(storagePath).download({ destination: tempFilePath });

        // 2. Transcribe with OpenAI
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
        });

        // 3. Save result to Firestore
        await adminDb.collection("users").doc(userId).collection("transcriptions").add({
            originalFile: storagePath,
            text: transcription.text,
            createdAt: new Date(),
        });

        // Cleanup
        fs.unlinkSync(tempFilePath);

        return NextResponse.json({ text: transcription.text });
    } catch (error: any) {
        console.error("Transcription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
