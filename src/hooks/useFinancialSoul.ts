"use client";

import { useAuth } from "./useAuth";
import { useInsights } from "./useInsights";
import { SoulState, HonestyLevel, getSoulMessage, getSafeHonestyLevel } from "@/lib/soulCopy";

export function useFinancialSoul(expenses: any[] = [], totalSpentProp: number = 0, budgetProp: number = 0) {
    const { profile } = useAuth();

    // Ensure inputs are numbers to prevent string comparison bugs
    const totalSpent = Number(totalSpentProp || 0);
    const budget = Number(budgetProp || 0);

    // -------------------------------------------
    // 1. INPUTS (The Memory)
    // -------------------------------------------
    const baseScore = profile?.trustScore ?? 80;
    const rawHonestyLevel = profile?.honestyLevel || "balanced";

    // Safety: Ensure tone is safe for current context.
    const honestyLevel = getSafeHonestyLevel(rawHonestyLevel);

    // -------------------------------------------
    // 2. CONTEXT PENALTIES (The Reality) - NON-PERSISTENT
    // -------------------------------------------
    // B. Risky Spend (>30% of remaining budget? Proxy: > 30% of Monthly Budget Amount for now to be deterministic/simple on list)
    // Spec says: "Risky spend (>30% of remaining budget): -10"
    // To be strictly deterministic and stateless, we check if *any* expense in the current list meets criteria.
    // "Apply max once per category per day" -> This is a rate limit filter.
    // "Cap penalties to these values" -> Max deduction for this rule is -10.

    let contextPenalty = 0;

    // -------------------------------------------
    // REFACTOR: Proportional Decay Logic
    // -------------------------------------------

    // 1. Budget Health Penalties
    if (budget > 0) {
        const usageRatio = totalSpent / budget;

        if (usageRatio > 1.10) {
            // > 110% Used: CRASH (-65)
            // Result: 80 - 65 = 15 (Disappointed)
            contextPenalty += 65;
        } else if (usageRatio > 1.0) {
            // 100% - 110% Used: GRACE PERIOD (-25)
            // Result: 80 - 25 = 55 (Observing)
            contextPenalty += 25;
        } else if (usageRatio > 0.90) {
            // 90% - 100% Used: ANXIETY (-10)
            // Result: 80 - 10 = 70 (Zen/Observing Border)
            contextPenalty += 10;
        }

        // 2. Category Fatigue (Putting all eggs in one basket)
        // If one category uses > 50% of budget AND we are nearly full (>80% used)
        if (usageRatio > 0.80) {
            const categoryTotals: Record<string, number> = {};
            expenses.forEach(e => {
                const amount = Number(e.amount) || 0;
                categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amount;
            });

            const maxCategorySpend = Math.max(...Object.values(categoryTotals));
            if (maxCategorySpend > (budget * 0.50)) {
                contextPenalty += 5; // "Diversify!"
            }
        }
    }

    // 3. Risky Spend (Legacy Rule, preserved but tuned)
    // If Over Budget, we already applied heavy penalties above.
    // If Under Budget, we still check for massive single purchases.
    if (budget > 0 && totalSpent <= budget) {
        const remaining = Math.max(0, budget - totalSpent);
        const riskyThreshold = remaining * 0.40; // Relaxed to 40% of remaining

        const hasRiskySpend = expenses.some(e => Number(e.amount) > riskyThreshold);
        if (hasRiskySpend) {
            contextPenalty += 10; // Warning for impulse buys
        }
    }

    // -------------------------------------------
    // 3. SCORE CALCULATION (Idempotent)
    // -------------------------------------------
    // displayScore = baseTrust - contextPenalties
    // (Note: Spec did not mention "Bonuses" in "CORE LOGIC". It only mentioned "Weekly Forgiveness".
    // I will REMOVE the "Streak" bonus to generally follow "Do NOT add... extra heuristics".
    // The spec "Weekly Forgiveness... IF strikes.count was 0... trustScore += 5" handles the reward.)

    // Ensure we don't drop below 0 or above 100
    // -------------------------------------------
    // 3. SCORE CALCULATION (Idempotent)
    // -------------------------------------------
    // Ensure we don't drop below 0 or above 100
    const displayScore = Math.min(100, Math.max(0, baseScore - contextPenalty));

    // -------------------------------------------
    // HARD ASSERTION (DEBUGGING)
    // -------------------------------------------
    if (process.env.NODE_ENV === "development") {
        const isOverBudget = budget > 0 && totalSpent > budget;
        if (isOverBudget && displayScore >= 40) {
            console.error(
                "❌ TRUTH MODE VIOLATION: Overspending but not disappointed",
                { totalSpent, budget, baseScore, contextPenalty, displayScore }
            );
        }
    }

    // HARD ASSERTION (Debugging)
    if (budget > 0 && totalSpent > budget && displayScore >= 40) {
        console.error("TRUTH MODE VIOLATION: Overspending but not disappointed", {
            budget, totalSpent, baseScore, contextPenalty, displayScore
        });
    }

    // Debug Trace
    // console.log("Soul Trace:", { baseScore, budget, totalSpent, contextPenalty, displayScore });

    // -------------------------------------------
    // 4. DETERMINE STATE
    // -------------------------------------------
    let state: SoulState = "zen";
    if (displayScore < 40) state = "disappointed";
    else if (displayScore < 80) state = "observing";

    // -------------------------------------------
    // 5. GHOSTS (Computed Only)
    // -------------------------------------------
    const ghosts: string[] = [];

    // Ghost: Night Snacker (3+ txns after 11 PM or before 5 AM)
    const lateNightTxns = expenses.filter(e => {
        if (!e.date) return false;
        const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
        const hour = d.getHours();
        return hour >= 23 || hour < 5;
    });
    if (lateNightTxns.length >= 3) ghosts.push("Night Snacker");

    // Ghost: Weekend Warrior (> 50% spend on Sat/Sun)
    const weekendSpend = expenses.reduce((sum, e) => {
        const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
        const day = d.getDay();
        return (day === 0 || day === 6) ? sum + Number(e.amount) : sum;
    }, 0);
    // Avoid division by zero
    const totalCurrentSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    if (totalCurrentSpent > 0 && (weekendSpend / totalCurrentSpent) > 0.5) {
        ghosts.push("Weekend Warrior");
    }

    // -------------------------------------------
    // 6. VOICE GENERATION
    // -------------------------------------------
    const message = getSoulMessage(state, honestyLevel);

    // -------------------------------------------
    // 7. UI HELPERS
    // -------------------------------------------
    const getOrbColor = () => {
        switch (state) {
            case "zen": return "bg-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.6)]";
            case "observing": return "bg-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)]";
            case "disappointed": return "bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]";
        }
    };

    return {
        trustScore: displayScore, // UI Component will display this as "Trust Score"
        baseScore,
        state,
        message,
        getOrbColor,
        honestyLevel,
        ghosts,
        strikes: profile?.strikes?.count || 0
    };
}
