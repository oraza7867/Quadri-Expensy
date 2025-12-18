"use client";

import { useInsights } from "@/hooks/useInsights";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
    "Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Education", "Others"
];

export function BudgetManager() {
    const { budgets, currentMonthExpenses, addBudget, deleteBudget } = useInsights();
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [amount, setAmount] = useState("");

    const handleCreate = async () => {
        if (!amount) return;
        await addBudget(category, Number(amount));
        setShowForm(false);
        setAmount("");
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Monthly Budgets</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                    <Plus size={16} /> Set Budget
                </button>
            </div>

            {showForm && (
                <div className="mb-4 flex gap-2 rounded-lg bg-gray-50 p-3">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="rounded-md border-gray-300 text-sm"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Limit"
                        className="w-24 rounded-md border-gray-300 text-sm"
                    />
                    <button
                        onClick={handleCreate}
                        className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white"
                    >
                        Save
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {budgets.length === 0 && !showForm && (
                    <p className="text-center text-sm text-gray-500">No budgets set for this month.</p>
                )}

                {budgets.map(budget => {
                    const spent = currentMonthExpenses
                        .filter(e => e.category === budget.category)
                        .reduce((sum, e) => sum + Number(e.amount), 0);

                    const percent = Math.min((spent / budget.limitAmount) * 100, 100);
                    const color = percent > 90 ? "bg-red-500" : percent > 70 ? "bg-orange-500" : "bg-green-500";

                    return (
                        <div key={budget.id}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">{budget.category}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">
                                        {formatCurrency(spent)} / {formatCurrency(budget.limitAmount)}
                                    </span>
                                    <button onClick={() => deleteBudget(budget.id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100">
                                <div
                                    className={`h-2 rounded-full ${color} transition-all duration-500`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
