"use client";

import { useAuth } from "@/hooks/useAuth";
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { useState } from "react";
import { X } from "lucide-react";

import { useInsights } from "@/hooks/useInsights";
import { useRef } from "react";
import { MonthlyGoalWidget } from "@/components/insights/MonthlyGoalWidget";
import { SoulWidget } from "@/components/insights/SoulWidget";

export default function Dashboard() {
    const { profile } = useAuth();
    const { totalSpent, healthScore, loading, currentMonthExpenses, cycleRangeLabel } = useInsights();
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    {(() => {
                        const hour = new Date().getHours();
                        const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
                        return `${greeting}, ${profile?.displayName?.split(" ")[0] || "User"}!`;
                    })()}
                </h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    + Add Expense
                </button>
            </div>

            {/* Financial Soul & Monthly Goal */}
            {!loading && (
                <div className="grid gap-6 md:grid-cols-2">
                    <SoulWidget
                        expenses={currentMonthExpenses}
                        totalSpent={totalSpent}
                        budget={profile?.monthlyBudget || 0}
                    />
                    <MonthlyGoalWidget totalSpent={totalSpent} cycleLabel={cycleRangeLabel} />
                </div>
            )}

            {/* Main Content: Expense List */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Transactions</h2>
                <ExpenseList />
            </div>

            {/* Add Modal (Simple Overlay) */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Add New Expense</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <AddExpenseForm onSuccess={() => setShowAddModal(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
