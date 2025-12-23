import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, adminStorage } from "@/lib/firebaseAdmin";

export async function DELETE(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        const { transcriptionId, storagePath } = await req.json();
        if (!transcriptionId || !storagePath) return NextResponse.json({ error: "Missing IDs" }, { status: 400 });

        // 1. Delete from Firestore
        await adminDb.collection("users").doc(userId).collection("transcriptions").doc(transcriptionId).delete();

        // 2. Delete from Storage
        try {
            const bucket = adminStorage.bucket();
            await bucket.file(storagePath).delete();
        } catch (storageError) {
            console.warn("Storage deletion failed or file already gone:", storageError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
