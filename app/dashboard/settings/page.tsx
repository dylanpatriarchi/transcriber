"use client";

import { useAuth } from "@/components/AuthContext";
import { User, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
            </div>

            <div className="space-y-6">
                <section className="p-6 border border-gray-200 rounded-xl bg-white">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-5 h-5 text-gray-400" />
                        <h3 className="font-bold text-lg">Profile</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                            <div className="text-sm font-medium">{user?.email}</div>
                        </div>
                    </div>
                </section>

                <section className="p-6 border border-gray-200 rounded-xl bg-white opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <h3 className="font-bold text-lg">Security (Coming Soon)</h3>
                    </div>
                    <p className="text-sm text-gray-500">Change password and enable two-factor authentication.</p>
                </section>
            </div>
        </div>
    );
}
