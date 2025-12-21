"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { getExpensyDb } from "@/lib/firebase";
import { generateMorningBriefing } from "@/lib/briefingLogic";
import { Sun, Check, ArrowRight } from "lucide-react";
import { vibrate } from "@/lib/haptics";
import { UserProfile } from "@/lib/types";

export function MorningBriefing() {
    const db = getExpensyDb();
    const { user, profile } = useAuth();
    const [briefing, setBriefing] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkBriefing = async () => {
            if (!user || !profile) return;

            // 1. Check Local Storage
            const today = new Date().toISOString().split('T')[0];
            const lastViewed = localStorage.getItem(`briefing_viewed_${user.uid}`);

            if (lastViewed === today) return; // Already seen today

            // 2. Fetch Yesterday's Data
            setLoading(true);
            try {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
                const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

                const q = query(
                    collection(db, "users", user.uid, "expenses"),
                    where("date", ">=", Timestamp.fromDate(startOfDay)),
                    where("date", "<=", Timestamp.fromDate(endOfDay))
                );

                const snapshot = await getDocs(q);
                const expenses = snapshot.docs.map(d => d.data());
                const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                // 3. Generate Content
                const content = generateMorningBriefing(profile, totalSpent, profile.monthlyBudget || 0);

                setBriefing(content);
                setIsOpen(true);
                vibrate("warning");
            } catch (err) {
                console.error("Failed to load briefing", err);
            } finally {
                setLoading(false);
            }
        };

        checkBriefing();
    }, [user, profile]);

    const handleDismiss = () => {
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`briefing_viewed_${user.uid}`, today);
        setIsOpen(false);
        vibrate("success");
    };

    if (!isOpen || !briefing) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-200 to-orange-100 p-6 text-center">
                    <Sun className="mx-auto h-12 w-12 text-amber-600 animate-pulse" />
                    <h2 className="mt-4 text-2xl font-bold text-amber-900">{briefing.headline}</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2 text-center">
                        <p className="text-gray-600 text-lg leading-relaxed">
                            {briefing.body}
                        </p>
                        {briefing.trustChange !== 0 && (
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${briefing.trustChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                Trust: {briefing.trustChange > 0 ? '+' : ''}{briefing.trustChange}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-2">
                            Mornng Mission
                        </p>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-gray-900 p-1 mt-0.5">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {briefing.actionItem}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-white font-bold shadow-lg active:scale-95 transition-all"
                    >
                        I'm Ready <ArrowRight className="h-4 w-4" />
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        07:00 AM Protocol
                    </p>
                </div>
            </div>
        </div>
    );
}
