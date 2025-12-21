"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { X, Lock, HeartHandshake } from "lucide-react";
import { vibrate } from "@/lib/haptics";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function ApologyModal({ isOpen, onClose }: Props) {
    const { profile, updateProfile } = useAuth();
    const [apology, setApology] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (apology.length < 50) {
            vibrate("error");
            alert("A real apology requires reflection. Please write at least 50 characters.");
            return;
        }

        setLoading(true);
        try {
            // Apply Mercy (+5 Trust Bump) to unlock features
            // This is a one-time override per trigger.
            // In a real backend, we'd log this event.
            // For MVP: We bump trust slightly to cross the 10 threshold if they are stuck below it.
            const currentScore = profile?.trustScore || 0;
            const newScore = currentScore < 15 ? 15 : currentScore + 2;

            await updateProfile({
                trustScore: newScore
            });

            vibrate("success");
            setApology("");
            onClose();
        } catch (error) {
            console.error("Failed to submit apology", error);
            alert("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-rose-100 p-2">
                            <Lock className="h-5 w-5 text-rose-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Unlock Wants</h3>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Your Trust Score is too low to buy "Wants".
                        To unlock this category instantly, you must <strong>acknowledge</strong> why you lost discipline.
                    </p>

                    <div className="space-y-1">
                        <textarea
                            value={apology}
                            onChange={(e) => setApology(e.target.value)}
                            className="w-full rounded-xl border-gray-300 bg-gray-50 p-4 text-sm focus:border-rose-500 focus:ring-rose-500 min-h-[120px]"
                            placeholder="I admit that I have been impulsive with my spending..."
                        />
                        <div className="flex justify-end">
                            <span className={`text-xs font-medium ${apology.length >= 50 ? "text-green-600" : "text-gray-400"}`}>
                                {apology.length} / 50 min
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || apology.length < 50}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
                    >
                        {loading ? "Verifying..." : "Submit Apology"} <HeartHandshake className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
