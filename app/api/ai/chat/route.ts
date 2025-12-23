import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API key missing" }, { status: 500 });
        const openai = new OpenAI({ apiKey });

        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const idToken = authHeader.split("Bearer ")[1];
        await adminAuth.verifyIdToken(idToken);

        const { messages, contextText } = await req.json();

        const systemPrompt = `You are a helpful AI assistant. You must ONLY answer questions based on the provided transcription context below. If the answer is not in the context, politely inform the user that you can only discuss the content of the transcription.
        
        CONTEXT:
        ${contextText}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            temperature: 0.5,
        });

        return NextResponse.json({ message: response.choices[0]?.message?.content || "" });
    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
