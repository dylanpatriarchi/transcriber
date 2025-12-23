"use client";

import Sidebar from "./Sidebar";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-sans">
                <div className="animate-pulse text-gray-400 font-medium">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white font-sans text-black">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-4 py-8 md:px-12 md:py-12">
                <div className="max-w-4xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
