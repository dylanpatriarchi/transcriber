import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import OpenAI from "openai";
import { AIInsightsRequest, AIInsightsResponse, Flashcard, QuizQuestion } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OpenAI API key missing" }, { status: 500 });
        }
        const openai = new OpenAI({ apiKey });

        // Authenticate user
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        const { transcriptionId, text, type } = await req.json() as AIInsightsRequest;
        if (!transcriptionId || !text || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const results: AIInsightsResponse = {};

        // 1. Generate Summary
        if (type === 'summary' || type === 'all') {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Summarize the following transcription into concise, professional bullet points." },
                    { role: "user", content: text }
                ],
                temperature: 0.5,
            });
            results.summary = response.choices[0]?.message?.content || "";
        }

        // 2. Generate Flashcards
        if (type === 'flashcards' || type === 'all') {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Generate 5-8 flashcards (question and answer) based on the following text. Return ONLY a JSON array of objects with 'question' and 'answer' keys. Do not include markdown formatting or other text." },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            });
            const content = response.choices[0]?.message?.content || "{\"flashcards\": []}";
            results.flashcards = JSON.parse(content).flashcards;
        }

        // 3. Generate Quiz
        if (type === 'quiz' || type === 'all') {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Generate a 5-question multiple choice quiz based on the following text. Return ONLY a JSON object with a 'quiz' key containing an array of objects with keys: 'question', 'options' (array of 4 strings), 'correctAnswer' (string matching one option), and 'explanation'. Do not include markdown formatting or other text." },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            });
            const content = response.choices[0]?.message?.content || "{\"quiz\": []}";
            results.quiz = JSON.parse(content).quiz;
        }

        // Update Firestore
        const updateData: any = {};
        if (results.summary) updateData.summary = results.summary;
        if (results.flashcards) updateData.flashcards = results.flashcards;
        if (results.quiz) updateData.quiz = results.quiz;

        await adminDb.collection("users").doc(userId).collection("transcriptions").doc(transcriptionId).update(updateData);

        return NextResponse.json(results);
    } catch (error: any) {
        console.error("AI Insights Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
