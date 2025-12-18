"use client";

import { useInsights } from "@/hooks/useInsights";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

export function InsightsOverview() {
    const { currentMonthExpenses, insights, loading } = useInsights();

    const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalCount = currentMonthExpenses.length;

    if (loading) return <div className="h-32 animate-pulse rounded-xl bg-gray-100" />;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Total Spend Card */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-md">
                <p className="text-indigo-100">Total Spent (This Month)</p>
                <h2 className="mt-1 text-3xl font-bold">{formatCurrency(totalSpent)}</h2>
                <p className="mt-2 text-sm text-indigo-200">
                    {totalCount} transactions recorded
                </p>
            </div>

            {/* Insights List */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-gray-900">Smart Insights</h3>
                {insights.length === 0 ? (
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <CheckCircle className="text-green-500" size={18} />
                        <p>Your spending looks healthy!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {insights.map((insight, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-3 rounded-lg p-3 text-sm ${insight.type === 'danger' ? 'bg-red-50 text-red-700' :
                                        insight.type === 'warning' ? 'bg-orange-50 text-orange-700' :
                                            'bg-blue-50 text-blue-700'
                                    }`}
                            >
                                <div className="mt-0.5">
                                    {insight.type === 'danger' ? <AlertTriangle size={16} /> : <Info size={16} />}
                                </div>
                                <p>{insight.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
