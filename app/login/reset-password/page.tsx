"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Mic, ChevronLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess(false);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email. Please check the address.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6 font-sans">
            <div className="w-full max-w-[320px] space-y-8">
                {/* Logo/Icon */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">Reset Password</h1>
                    <p className="text-sm text-gray-500 text-center">
                        {success
                            ? "Check your inbox for the reset link."
                            : "Enter your email to receive a password reset link."}
                    </p>
                </div>

                {success ? (
                    <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex flex-col items-center gap-3 text-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                            <p className="text-sm font-semibold text-green-700">Email Sent Successfully</p>
                        </div>
                        <Link
                            href="/login"
                            className="w-full py-3 px-4 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 rounded-md bg-red-50 text-red-600 text-xs font-medium text-center border border-red-100 italic">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors text-sm font-medium"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </button>

                            <Link
                                href="/login"
                                className="w-full py-3 px-4 bg-white text-gray-500 border border-gray-100 rounded-lg text-sm font-bold hover:text-black transition-all flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Cancel
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
