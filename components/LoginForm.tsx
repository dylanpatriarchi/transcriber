"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Mic } from "lucide-react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to sign in. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6">
            <div className="w-full max-w-[320px] space-y-8">
                {/* Logo/Icon */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Transcriber</h1>
                    <p className="text-sm text-gray-500 text-center">
                        Enter your credentials to access your dashboard.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-xs font-medium text-center border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "Signing in..." : "Continue"}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-xs text-gray-400 leading-relaxed px-4">
                        Don't have an account? <br />
                        <span className="text-black font-semibold">Contact administrator</span> to request access.
                    </p>
                </div>
            </div>
        </div>
    );
}
