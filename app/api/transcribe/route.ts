import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminStorage, adminDb } from "@/lib/firebaseAdmin";
import OpenAI from "openai";
import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { TranscribeRequest, TranscribeResponse } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("Server misconfiguration: OPENAI_API_KEY is missing");
            return NextResponse.json<TranscribeResponse>({ error: "Server error: Transcription service unavailable" }, { status: 500 });
        }

        // Lazy initialization validation is done above
        const openai = new OpenAI({ apiKey });

        let body: Partial<TranscribeRequest>;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json<TranscribeResponse>({ error: "Invalid JSON body" }, { status: 400 });
        }

        if (!body.fileUrl || !body.storagePath) {
            return NextResponse.json<TranscribeResponse>({ error: "Missing required fields: fileUrl, storagePath" }, { status: 400 });
        }
        const { storagePath } = body;

        // Verify Authentication
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json<TranscribeResponse>({ error: "Unauthorized: Missing Bearer token" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        let userId: string;

        try {
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            userId = decodedToken.uid;
        } catch (e) {
            console.warn("Token verification failed:", e);
            return NextResponse.json<TranscribeResponse>({ error: "Unauthorized: Invalid token" }, { status: 401 });
        }

        // Security Check: Access Control
        if (!storagePath.startsWith(`users/${userId}/`)) {
            console.warn(`Security Alert: User ${userId} attempted to access ${storagePath}`);
            return NextResponse.json<TranscribeResponse>({ error: "Forbidden: You do not have access to this file" }, { status: 403 });
        }

        // 1. Download file
        const bucket = adminStorage.bucket();
        const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.mp3`);

        try {
            await bucket.file(storagePath).download({ destination: tempFilePath });
        } catch (downloadError: any) {
            console.error("Storage download failed:", downloadError);
            return NextResponse.json<TranscribeResponse>({ error: "Failed to access audio file from storage" }, { status: 404 });
        }

        // 2. Transcribe
        let transcriptionText = "";
        try {
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-1",
            });
            transcriptionText = transcription.text;
        } catch (openaiError: any) {
            console.error("OpenAI API error:", openaiError);
            return NextResponse.json<TranscribeResponse>({ error: "Transcription service error" }, { status: 502 });
        } finally {
            // Cleanup temp file
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }

        // 2.5. Format as Markdown using OpenAI
        let markdownText = "";
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional editor. Format the following raw transcription into clean, organized Markdown. Use headers (##, ###), bullet points, bold text, and other markdown formatting where appropriate to improve readability. Preserve all content but structure it professionally."
                    },
                    {
                        role: "user",
                        content: transcriptionText
                    }
                ],
                temperature: 0.3,
            });
            markdownText = completion.choices[0]?.message?.content || transcriptionText;
        } catch (markdownError: any) {
            console.warn("Markdown formatting failed, using raw text:", markdownError);
            markdownText = transcriptionText; // Fallback to raw if formatting fails
        }

        // 3. Save to Firestore
        try {
            await adminDb.collection("users").doc(userId).collection("transcriptions").add({
                originalFile: storagePath,
                text: transcriptionText,
                markdown: markdownText,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        } catch (dbError) {
            console.error("Firestore write error:", dbError);
            return NextResponse.json<TranscribeResponse>({ error: "Failed to save transcription result" }, { status: 500 });
        }

        return NextResponse.json<TranscribeResponse>({ text: transcriptionText, markdown: markdownText });

    } catch (error: any) {
        console.error("Unexpected Transcription error:", error);
        return NextResponse.json<TranscribeResponse>({ error: "Internal Server Error" }, { status: 500 });
    }
}
// Import admin for FieldValue typing if needed, or import FieldValue directly
import * as admin from 'firebase-admin'; 
