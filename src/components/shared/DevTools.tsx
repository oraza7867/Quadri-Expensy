"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { getExpensyDb } from "@/lib/firebase";
import { Wrench, X, RefreshCw, ShieldAlert, Heart, RotateCcw } from "lucide-react";
import { vibrate } from "@/lib/haptics";

export function DevTools() {
    const db = getExpensyDb();
    const { user, profile, updateProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    // Auto-hide in production ideally, but for now we keep it accessible via secret tap
    // Tap bottom-left corner 5 times
    const handleSecretTap = () => {
        setClickCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5) {
                setIsOpen(true);
                return 0;
            }
            return newCount;
        });
    };

    const handleResetTrust = async () => {
        if (!confirm("Reset Trust to 80?")) return;
        await updateProfile({ trustScore: 80, mode: 'standard' });
        vibrate("success");
    };

    const handleCrashTrust = async () => {
        if (!confirm("Crash Trust to 15 (Lockout)?")) return;
        await updateProfile({ trustScore: 15 });
        vibrate("error");
    };

    const handleSimulateCoach = async () => {
        // Set created at to NOW
        await updateProfile({ createdAt: new Date() });
        alert("Coach Mode Active (Protection Enabled)");
    };

    const handleExitCoachMode = async () => {
        // Set created at to 30 days ago
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 30);
        await updateProfile({ createdAt: oldDate });
        alert("Coach Mode ENDED. Protection lifted.");
    };

    const handleResetOnboarding = async () => {
        if (!confirm("Reset Moral Contract? App will block you.")) return;
        await updateProfile({ moralContract: null, mode: 'standard' });
        window.location.reload();
    };

    const handleWipeScars = async () => {
        if (!user) return;
        if (!confirm("Delete all scars?")) return;
        const col = collection(db, "users", user.uid, "scars");
        const snap = await getDocs(col);
        snap.forEach(async (d) => {
            await deleteDoc(doc(db, "users", user.uid, "scars", d.id));
        });
        alert("Scars Wiped.");
    };

    const handleForceScar = async () => {
        if (!user || !profile) return;
        const currentMonth = new Date().toISOString().slice(0, 7);
        await addDoc(collection(db, "users", user.uid, "scars"), {
            date: currentMonth,
            cause: "Dev Force Scar",
            trustSnapshot: profile.trustScore,
            status: 'active',
            streakCount: 0,
            createdAt: serverTimestamp()
        });
        alert("Scar Added.");
    };

    if (!profile) return null;

    return (
        <>
            {/* Secret Trigger Area (Bottom Left) */}
            {!isOpen && (
                <div
                    onClick={handleSecretTap}
                    className="fixed bottom-0 left-0 h-16 w-16 z-50 opacity-0"
                    title="Tap 5 times for DevTools"
                />
            )}

            {/* Visible Toggle for Convenience during QA */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-4 z-40 rounded-full bg-gray-900 p-3 text-white shadow-xl opacity-50 hover:opacity-100 transition-opacity"
                >
                    <Wrench size={20} />
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Wrench className="text-indigo-600" />
                                DEV CONSOLE
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-bold text-gray-400 uppercase">Trust Control</p>
                                <div className="mt-2 flex gap-2">
                                    <button onClick={handleResetTrust} className="flex-1 py-2 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                                        Reset (80)
                                    </button>
                                    <button onClick={handleCrashTrust} className="flex-1 py-2 bg-red-100 text-red-700 rounded-md text-xs font-bold">
                                        Crash (15)
                                    </button>
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="range" min="0" max="100"
                                        value={profile.trustScore}
                                        onChange={(e) => updateProfile({ trustScore: Number(e.target.value) })}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-center text-xs font-mono mt-1">{profile.trustScore}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleSimulateCoach} className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex flex-col items-center gap-1">
                                    <RefreshCw size={16} /> Coach Mode
                                </button>
                                <button onClick={handleExitCoachMode} className="p-3 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold flex flex-col items-center gap-1">
                                    <RefreshCw size={16} /> Exit Coach
                                </button>
                                <button onClick={handleResetOnboarding} className="p-3 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex flex-col items-center gap-1">
                                    <RotateCcw size={16} /> Reset Contract
                                </button>
                                <button onClick={handleForceScar} className="p-3 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold flex flex-col items-center gap-1">
                                    <ShieldAlert size={16} /> Add Scar
                                </button>
                                <button onClick={handleWipeScars} className="p-3 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold flex flex-col items-center gap-1">
                                    <Heart size={16} /> Wipe Scars
                                </button>
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-[10px] text-center text-gray-400 font-mono">
                                    UID: {user?.uid.slice(0, 8)}...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
