"use client";

import { useReminders } from "@/hooks/useReminders";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Calendar, Tag, IndianRupee, Bell, RefreshCw, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const SUBSCRIPTION_CATEGORIES = [
    "Electricity",
    "Water",
    "Internet",
    "Rent",
    "Netflix",
    "Spotify",
    "Gym",
    "Insurance",
    "Others",
];

export function AddReminderForm({ onSuccess }: { onSuccess?: () => void }) {
    const { addReminder, reminders } = useReminders();
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Freemium Limit Check
    const REMINDER_LIMIT = 5;
    const isLimitReached = false; // Limits temporarily removed during pre-launch

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(SUBSCRIPTION_CATEGORIES[0]);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
    const [frequency, setFrequency] = useState<"monthly" | "quarterly" | "yearly">("monthly");
    const [type, setType] = useState<"bill" | "subscription">("bill");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;

        if (isLimitReached) {
            return; // UI already shows disabled state, but double check
        }

        setLoading(true);
        try {
            await addReminder({
                name,
                amount: Number(amount),
                category,
                dueDate,
                frequency,
                type,
            });
            // Reset
            setName("");
            setAmount("");
            if (onSuccess) onSuccess();
        } catch (error) {
            alert("Failed to create reminder");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {isLimitReached && (
                <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-yellow-600" />
                        <div>
                            <h3 className="text-sm font-bold text-yellow-800">Free Limit Reached</h3>
                            <p className="text-xs text-yellow-700 mt-1">
                                You have reached the limit of {REMINDER_LIMIT} reminders. Upgrade to Premium to add unlimited bills.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Type Selection */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => setType("bill")}
                    className={cn(
                        "flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-colors",
                        type === "bill"
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                >
                    Variable Bill
                </button>
                <button
                    type="button"
                    onClick={() => setType("subscription")}
                    className={cn(
                        "flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-colors",
                        type === "subscription"
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                >
                    Fixed Subscription
                </button>
            </div>

            {/* Name Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLimitReached}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100"
                    placeholder={type === "bill" ? "Electricity Bill" : "Netflix Premium"}
                    required
                />
            </div>

            {/* Amount Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    {type === "bill" ? "Estimated Amount" : "Fixed Amount"}
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <IndianRupee className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isLimitReached}
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100"
                        placeholder="0.00"
                        required
                        min="1"
                    />
                </div>
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isLimitReached}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100"
                >
                    {SUBSCRIPTION_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Due Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Next Due Date</label>
                    <div className="relative mt-1">
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            disabled={isLimitReached}
                            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100"
                            required
                        />
                    </div>
                </div>

                {/* Frequency */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cycle</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                            <RefreshCw className="h-3 w-3 text-gray-400" />
                        </div>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as any)}
                            disabled={isLimitReached}
                            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-8 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
                <div className="flex items-center gap-2">
                    <Bell className="h-3 w-3" />
                    <span>We'll remind you 3 days before, 1 day before, and on the due date.</span>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || isLimitReached}
                className={cn(
                    "w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500",
                    (loading || isLimitReached) && "opacity-70 cursor-not-allowed"
                )}
            >
                {loading ? "Scheduling..." : isLimitReached ? "Upgrade to Add More" : "Create Reminder"}
            </button>
        </form>
    );
}
