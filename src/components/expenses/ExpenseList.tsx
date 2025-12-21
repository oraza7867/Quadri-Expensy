"use client";

import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseCard } from "./ExpenseCard";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

export function ExpenseList() {
    const { expenses, deleteExpense, loading, error } = useExpenses();
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterDate, setFilterDate] = useState("All"); // "All", "This Month", "Last Month"

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
                ))}
            </div>
        );
    }

    // If we have an error BUT we also have compiled expenses (from cache), show data + soft error
    // If we have an error and NO data, show blocking error
    if (error && expenses.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-lg bg-red-50 p-4 text-red-600">
                <AlertCircle className="mr-2 h-5 w-5" />
                {error}
            </div>
        );
    }

    const filteredExpenses = expenses.filter(expense => {
        const matchesCategory = filterCategory === "All" || expense.category === filterCategory;

        let matchesDate = true;

        // Safety check for date
        if (!expense.date || !expense.date.seconds) return false;

        const expenseDate = new Date(expense.date.seconds * 1000);
        const now = new Date();

        if (filterDate === "This Month") {
            matchesDate = expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
        } else if (filterDate === "Last Month") {
            const lastMonth = new Date();
            lastMonth.setMonth(now.getMonth() - 1);
            matchesDate = expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear();
        }

        return matchesCategory && matchesDate;
    });

    const CATEGORIES = ["All", "Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Education", "Others"];

    if (expenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <div className="mb-4 rounded-full bg-indigo-50 p-4">
                    <AlertCircle size={32} className="text-indigo-500" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Quiet day?</p>
                <p className="text-sm">No expenses tracked yet. Add one to see your financial health!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Sync Warning if Data + Error */}
            {error && expenses.length > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-amber-50 p-2 px-3 text-xs text-amber-700">
                    <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Using offline data. Check connection/rules.
                    </span>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2 pb-2">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="All">All Time</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                </select>
            </div>

            <div className="space-y-3">
                {filteredExpenses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No matching expenses found.</p>
                ) : (
                    filteredExpenses.map((expense) => (
                        <ExpenseCard key={expense.id} expense={expense} onDelete={deleteExpense} />
                    ))
                )}
            </div>
        </div>
    );
}
