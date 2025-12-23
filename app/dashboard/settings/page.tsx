"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { User, Shield, Key, Loader2, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SettingsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleResetPassword = async () => {
        if (!user?.email) return;
        setIsLoading(true);
        setError("");
        setSuccess(false);
        try {
            await sendPasswordResetEmail(auth, user.email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <section className="p-8 border border-gray-200 rounded-3xl bg-white shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <h3 className="font-bold text-xl">Profile</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Email Address</label>
                            <div className="text-sm font-semibold bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 w-fit min-w-[240px]">
                                {user?.email}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="p-8 border border-gray-200 rounded-3xl bg-white shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <Shield className="w-5 h-5 text-gray-500" />
                        </div>
                        <h3 className="font-bold text-xl">Security</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <Key className="w-4 h-4" />
                                    Password Management
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                                    Receive a link to your email address to securely change your password.
                                </p>
                            </div>

                            <div className="flex-shrink-0">
                                {success ? (
                                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-in fade-in slide-in-from-right-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Email Sent
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={isLoading}
                                        className="px-6 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 disabled:bg-gray-200"
                                    >
                                        {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                        {isLoading ? "Sending..." : "Reset Password"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-red-500 font-medium italic mt-2 ml-2">
                                {error}
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
