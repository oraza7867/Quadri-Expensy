import { useFinancialSoul } from "@/hooks/useFinancialSoul";
import { useAuth } from "@/hooks/useAuth";
import { Settings2, Share2, Ghost, Info } from "lucide-react";
import { SoulShareModal } from "./SoulShareModal";
import { useState, useEffect } from "react";
import { SoulState } from "@/lib/soulCopy";
import { vibrate } from "@/lib/haptics";
import { SoulTutorialModal } from "@/components/onboarding/SoulTutorial";

export function SoulWidget({
    expenses = [],
    totalSpent = 0,
    budget = 0
}: {
    expenses?: any[];
    totalSpent?: number;
    budget?: number;
}) {
    const { trustScore, state, message, getOrbColor, honestyLevel, ghosts, strikes } = useFinancialSoul(expenses, totalSpent, budget);
    const { updateProfile } = useAuth();
    const [showShare, setShowShare] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // Haptic Feedback on State Load
    useEffect(() => {
        if (state === "disappointed") {
            vibrate("warning");
        }
    }, [state]);

    // Redemption Logic
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
    const daysLeft = Math.ceil((nextMonday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    const toggleHonesty = async () => {
        const levels: ("gentle" | "balanced" | "roast")[] = ["gentle", "balanced", "roast"];
        const currentIndex = levels.indexOf(honestyLevel);
        const nextIndex = (currentIndex + 1) % levels.length;
        await updateProfile({ honestyLevel: levels[nextIndex] });
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-6 text-white shadow-xl transition-all duration-500">
            {/* Background Atmosphere */}
            <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition-colors duration-1000 ${getOrbColor()}`} />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-100">Financial Soul</h2>
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="rounded-full bg-white/10 p-1 text-gray-400 hover:bg-white/20 hover:text-white transition-colors"
                            title="Format Explanation"
                        >
                            <Info size={14} />
                        </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <button
                            onClick={toggleHonesty}
                            className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-400 hover:bg-gray-700 transition-colors"
                        >
                            {honestyLevel}
                        </button>
                    </div>

                    <p className="mt-2 text-2xl font-light leading-relaxed text-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        "{message}"
                    </p>
                </div>

                {/* The Orb */}
                <div className="flex flex-col items-center gap-2">
                    {/* Share Button (Passive & Clean) */}
                    <button
                        onClick={() => setShowShare(true)}
                        className="mb-2 rounded-full bg-white/10 p-2 text-white/50 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                        title="Share Trust Score"
                    >
                        <Share2 size={16} />
                    </button>

                    <div className={`h-16 w-16 rounded-full transition-all duration-1000 ${getOrbColor()} flex items-center justify-center`}>
                        <span className="text-xl font-bold text-white drop-shadow-md">
                            {trustScore}
                        </span>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Trust
                    </span>
                </div>
            </div>

            {/* Context/Ghosts - Real Data */}
            <div className="mt-6 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                    {/* State Badge */}
                    {state === 'disappointed' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-950/50 border border-rose-900 px-2 py-1 text-xs text-rose-300">
                            ⚠️ High Alert
                        </span>
                    )}
                    {state === 'zen' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-teal-950/50 border border-teal-900 px-2 py-1 text-xs text-teal-300">
                            ✨ Zen Mode
                        </span>
                    )}

                    {/* Active Ghosts */}
                    {ghosts.map(ghost => (
                        <span key={ghost} className="inline-flex items-center gap-1 rounded-md bg-gray-800 border border-gray-700 px-2 py-1 text-xs text-gray-300">
                            <Ghost size={12} /> {ghost}
                        </span>
                    ))}
                </div>

                {/* Redemption Tip (Only if Disappointed) */}
                {state === 'disappointed' && (
                    <p className="text-xs font-medium text-teal-400 animate-pulse">
                        💡 Survive {daysLeft} more days with 0 strikes to heal.
                    </p>
                )}
            </div>

            <SoulShareModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                trustScore={trustScore}
                state={state}
                ghost={ghosts[0] || null}
            />

            <SoulTutorialModal
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
            />
        </div>
    );
}
