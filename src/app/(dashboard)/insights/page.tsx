"use client";

import { BudgetManager } from "@/components/insights/BudgetManager";
import { InsightsOverview } from "@/components/insights/InsightsOverview";
import { useAuth } from "@/hooks/useAuth";
import { TrustGate } from "@/components/guards/TrustGate";

export default function InsightsPage() {
    const { profile } = useAuth();

    return (
        <TrustGate>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Monthly Insights
                    </h1>
                    {profile?.isPremium && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                            PREMIUM UNLOCKED
                        </span>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Overall Monthly Goal */}
                </div>

                <InsightsOverview />

                <div className="grid gap-6 md:grid-cols-1">
                    <BudgetManager />
                </div>

                {!profile?.isPremium && (
                    <div className="mt-8 rounded-xl bg-gray-900 p-8 text-center text-white">
                        <h3 className="text-xl font-bold">Unlock Advanced Trends</h3>
                        <p className="mt-2 text-gray-400">
                            Get month-over-month comparison and category velocity analysis with Premium.
                        </p>
                        <button className="mt-4 rounded-lg bg-indigo-500 px-6 py-2 font-semibold hover:bg-indigo-400">
                            Upgrade for ₹99
                        </button>
                    </div>
                )}
            </div>
        </TrustGate>
    );
}
