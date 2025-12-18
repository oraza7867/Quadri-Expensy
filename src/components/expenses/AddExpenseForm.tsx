import { useExpenses } from "@/hooks/useExpenses";
import { useState } from "react";
import { Calendar, Tag, FileText, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinancialSoul } from "@/hooks/useFinancialSoul";
import { ConscienceModal } from "./ConscienceModal";
import { useAuth } from "@/hooks/useAuth";
import { useInsights } from "@/hooks/useInsights";
import { vibrate } from "@/lib/haptics";

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
    const { trustScore } = useFinancialSoul([], totalSpent, profile?.monthlyBudget || 0);

    const [loading, setLoading] = useState(false);
    const [showConscienceModal, setShowConscienceModal] = useState(false);

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
            vibrate("success");
            // Reset form
            setAmount("");
            setNote("");
            setShowConscienceModal(false); // Ensure modal is closed
            if (onSuccess) onSuccess();
        } catch (error) {
            alert("Failed to add expense");
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
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
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
            </form>

            <ConscienceModal
                isOpen={showConscienceModal}
                onClose={() => setShowConscienceModal(false)}
                onConfirm={handleRiskyConfirm}
                score={trustScore}
                amount={Number(amount)}
            />
        </>
    );
}
