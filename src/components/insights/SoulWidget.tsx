import { useScars } from "@/hooks/useScars";
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
    const { trustScore, state, message, getOrbColor, honestyLevel, ghosts, strikes, userMode } = useFinancialSoul(expenses, totalSpent, budget);
    const { scars } = useScars(); // Fetch Scars
    const { updateProfile } = useAuth();
    const [showShare, setShowShare] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // Haptic Feedback on State Load
    useEffect(() => {
        if (state === "disappointed") {
            vibrate("warning");
        }
    }, [state]);

    // Redemption Logic (Weekly cycle)
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
    const daysLeft = Math.ceil((nextMonday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    const toggleHonesty = async () => {
        const levels: ("gentle" | "balanced" | "roast")[] = ["gentle", "balanced", "roast"];
        const currentIndex = levels.indexOf(honestyLevel);
        const nextIndex = (currentIndex + 1) % levels.length;
        await updateProfile({ honestyLevel: levels[nextIndex] });
    };

    const activeScars = scars.filter(s => s.status === 'active');
    const healedScars = scars.filter(s => s.status === 'healed');

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-6 text-white shadow-xl transition-all duration-500">
            {/* Background Atmosphere */}
            <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition-colors duration-1000 ${getOrbColor()}`} />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-100">Financial Soul</h2>
                        {userMode && userMode !== 'standard' && (
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${userMode === 'chill' ? 'bg-blue-900/50 text-blue-200 border border-blue-800' : 'bg-rose-900/50 text-rose-200 border border-rose-800'
                                }`}>
                                {userMode}
                            </span>
                        )}
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

                    {/* Active Scars (Bleeding) */}
                    {activeScars.map(scar => (
                        <div key={scar.id} className="w-full mt-2 rounded-lg bg-red-950/30 border border-red-900/50 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-900/20 rounded-full animate-pulse">
                                    <span className="text-xl">🩸</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-200 uppercase tracking-wide">Scar Tissue</p>
                                    <p className="text-xs text-red-400">{scar.cause}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-mono text-red-300">
                                    {scar.streakCount || 0}/21 Days
                                </span>
                                <div className="w-16 h-1 mt-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, ((scar.streakCount || 0) / 21) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Healed Scars (Badges) */}
                    {healedScars.length > 0 && (
                        <div className="w-full flex gap-1 mt-1 overflow-x-auto pb-1">
                            {healedScars.map(scar => (
                                <span key={scar.id} title={`Survivor: ${scar.cause}`} className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-900/50 border border-amber-700 text-[10px] cursor-help">
                                    🎖️
                                </span>
                            ))}
                        </div>
                    )}
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
