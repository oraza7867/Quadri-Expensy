"use client";

import { useExpenses } from "@/hooks/useExpenses";
import { useState } from "react";
import { Calendar, Tag, FileText, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinancialSoul } from "@/hooks/useFinancialSoul";
import { ConscienceModal } from "./ConscienceModal";
import { useAuth } from "@/hooks/useAuth";
import { useInsights } from "@/hooks/useInsights";
import { vibrate } from "@/lib/haptics";

import { ESSENTIAL_CATEGORIES } from "@/lib/soulCopy";
import { Lock } from "lucide-react";
import { ApologyModal } from "@/components/modals/ApologyModal";

const CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Bills",
    "Health",
    "Education",
    "Others",
];

export function AddExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
    const { addExpense } = useExpenses();
    const { profile, updateProfile } = useAuth();
    const { totalSpent } = useInsights(); // Fetch spending reality

    // Pass Reality to Soul so it returns Effective Score (e.g., 30 if over budget)
    const { trustScore, wantsDisabled } = useFinancialSoul([], totalSpent, profile?.monthlyBudget || 0);

    const [loading, setLoading] = useState(false);
    const [showConscienceModal, setShowConscienceModal] = useState(false);
    const [showApology, setShowApology] = useState(false);

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [note, setNote] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    const handleAddExpense = async () => {
        if (!amount || Number(amount) <= 0) return;

        setLoading(true);
        try {
            await addExpense({
                amount: Number(amount),
                category,
                note,
                date: new Date(date),
            });

            // ---------------------------------------------------------
            // REALITY CHECK (The Fix for Transient Penalties)
            // ---------------------------------------------------------
            console.log("🔍 REALITY CHECK START");
            console.log("💰 Budget:", profile?.monthlyBudget, "Total Spent:", totalSpent, "Added:", amount);

            // ---------------------------------------------------------
            // UNIVERSAL SYNC (The Real Fix)
            // ---------------------------------------------------------
            console.log("🔍 REALITY CHECK START");

            if (profile?.monthlyBudget && profile.monthlyBudget > 0) {
                // We need to recalculate the "Effective Score" with this NEW expense included.
                // The `trustScore` from useFinancialSoul is based on CURRENT total (before add).
                // So we do a quick projection.

                const newTotal = totalSpent + Number(amount);
                const usageRatio = newTotal / profile.monthlyBudget;
                let penalty = 0;

                // Sync with useFinancialSoul logic manually for now to be safe
                if (usageRatio > 1.10) penalty = 65;
                else if (usageRatio > 1.0) penalty = 25;
                else if (usageRatio > 0.90) penalty = 10;

                // Effective Score Projection
                const currentBase = profile.trustScore ?? 80;
                const projectedScore = Math.max(0, 80 - penalty);

                console.log("📊 Projecting Score:", { currentBase, projectedScore, penalty });

                // CRITICAL RULE: If the Projected Score is lower than Persisted Score,
                // we MUST persist it to enforce Lockouts/Scars.
                if (projectedScore < currentBase) {
                    console.log(`📉 DOMINO EFFECT: Dropping Trust from ${currentBase} to ${projectedScore}`);
                    await updateProfile({ trustScore: projectedScore });
                }
            } else {
                console.log("❌ NO BUDGET SET - Skipping Reality Check");
            }

            vibrate("success");
            // Reset form
            setAmount("");
            setNote("");
            setShowConscienceModal(false); // Ensure modal is closed
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            alert(`Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRiskyConfirm = async () => {
        // Apply Penalty to Base Score (Memory)
        // Rule: "persist trustScore -= 5"
        const currentBase = profile?.trustScore ?? 80;
        const penalty = 5;
        const newScore = Math.max(0, currentBase - penalty);

        // Update Strikes
        // Rule: "Max 3 strikes per week. After 3 strikes, STOP escalating."
        // We track them, but cap the count at 3 for any visual logic used elsewhere.
        const currentStrikes = profile?.strikes?.count || 0;
        const newStrikes = Math.min(3, currentStrikes + 1);

        const updates: any = { trustScore: newScore };

        // Preserve existing strike structure but update count
        if (profile?.strikes) {
            updates.strikes = {
                ...profile.strikes,
                count: newStrikes
            };
        } else {
            // Fallback initialization if missing
            updates.strikes = {
                count: newStrikes,
                lastReset: new Date().toISOString()
            };
        }

        await updateProfile(updates);

        // Proceed with expense
        await handleAddExpense();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(amount);

        // Conscience Check Logic (Safe & Frictionless for Essentials)
        // 1. Check if Category is "Want" (Not Essential)
        const ESSENTIALS = ["Food", "Health", "Education", "Bills", "Rent", "Groceries", "Transport"];
        const isEssential = ESSENTIALS.includes(category);

        // 2. Trigger Rule: High Impact (> 1000) AND Low Trust (< 40) AND Non-Essential
        if (!isEssential && numAmount > 1000 && trustScore < 40) {
            setShowConscienceModal(true);
            return;
        }

        await handleAddExpense();
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <IndianRupee className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 bg-white pl-10 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg py-3"
                            placeholder="0.00"
                            required
                            min="1"
                        />
                    </div>
                </div>

                {/* Category Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Tag className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 bg-white pl-10 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
                        >
                            {CATEGORIES.map((c) => {
                                const isEssential = ESSENTIAL_CATEGORIES.includes(c);
                                const isDisabled = wantsDisabled && !isEssential;
                                return (
                                    <option key={c} value={c} disabled={isDisabled}>
                                        {isDisabled ? `🔒 ${c} (Locked)` : c}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    {wantsDisabled && (
                        <button
                            type="button"
                            onClick={() => setShowApology(true)}
                            className="mt-2 text-xs text-rose-600 font-medium flex items-center gap-1 hover:underline hover:text-rose-800 transition-colors"
                        >
                            <Lock className="h-3 w-3" />
                            Unlock Wants (Submit Apology)
                        </button>
                    )}
                </div>

                {/* Date & Note Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 bg-white pl-10 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Note (Optional)</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 bg-white pl-10 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
                                placeholder="Description"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                        loading && "cursor-not-allowed opacity-70"
                    )}
                >
                    {loading ? "Adding..." : "Add Expense"}
                </button>
            </form >

            <ApologyModal isOpen={showApology} onClose={() => setShowApology(false)} />

            <ConscienceModal
                isOpen={showConscienceModal && !wantsDisabled}
                onClose={() => setShowConscienceModal(false)}
                onConfirm={handleRiskyConfirm}
                score={trustScore}
                amount={Number(amount)}
            />
        </>
    );
}
