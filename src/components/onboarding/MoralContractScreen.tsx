"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Lock, AlertTriangle, CheckCircle } from "lucide-react";

export default function MoralContractScreen() {
    const { updateProfile } = useAuth();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSign = async () => {
        if (!agreed) return;
        setLoading(true);
        try {
            await updateProfile({
                moralContract: {
                    signedAt: new Date().toISOString(),
                    version: 1,
                    agreedToHardMode: true
                },
                mode: "standard" // Default start
            });
            // The AuthContext update will cause a re-render, unmounting this screen naturally
        } catch (error) {
            console.error("Failed to sign contract", error);
            alert("Connection error. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gray-950 p-6 text-center text-white">
                    <Shield className="mx-auto h-12 w-12 text-white/90" />
                    <h1 className="mt-4 text-2xl font-bold tracking-tight">The Moral Contract</h1>
                    <p className="mt-2 text-sm text-gray-400">Expensy is not a normal tracker.</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <p className="font-semibold text-gray-900">
                            By continuing, you agree to the following Terms of Discipline:
                        </p>

                        <ul className="space-y-3">
                            <li className="flex gap-3">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                                <span>
                                    <strong>I accept the Truth.</strong> Expensy will call out my harmful spending patterns, even if it feels uncomfortable.
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <Lock className="h-5 w-5 shrink-0 text-red-600" />
                                <span>
                                    <strong>I accept Consequences.</strong> If my Trust Score drops too low, features (like Analytics) may be locked until I redeem myself.
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                                <span>
                                    <strong>I accept Responsibility.</strong> I can leave anytime. But while I am here, I commit to facing my financial reality.
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Agreement Box */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            <span className="text-sm font-medium text-gray-900">
                                I, the undersigned, agree to hold myself accountable.
                            </span>
                        </label>
                    </div>

                    {/* Action */}
                    <button
                        onClick={handleSign}
                        disabled={!agreed || loading}
                        className="w-full rounded-xl bg-gray-900 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? "Signing..." : "Sign & Begin Journey"}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        v2.0 Protocol • Identity & Discipline System
                    </p>
                </div>
            </div>
        </div>
    );
}
