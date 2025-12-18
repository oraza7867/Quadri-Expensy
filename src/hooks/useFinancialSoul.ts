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

    // Rule: Over Total Budget (-65)
    // KILL SWITCH: If you are over budget, you CANNOT be in "Zen" or "Observing".
    // Even if Base Trust is 100 (Max), this penalty drops you to 35 (Disappointed).
    // 100 - 65 = 35.
    // This satisfies the strict requirement: "If spent > budget, system CANNOT remain gentle".
    if (budget > 0 && totalSpent > budget) {
        contextPenalty += 65;
    }

    // Rule: Risky Spend (-20)
    // Adjusted from -10 to -20.
    // If Over Budget, this ALWAYS triggers (Broke = Risky).
    // Total Penalty = -30 + -20 = -50.
    // Result: 80 - 50 = 30 (Disappointed).
    // Interpretation: 
    // - If Over Budget, remaining is <= 0. Thus ANY expense > 0 is Risky.
    // - If Under Budget, remaining is positive. Threshold = 30% of Remaining.
    if (budget > 0) {
        const remaining = Math.max(0, budget - totalSpent);
        const riskyThreshold = remaining * 0.30;

        // If remaining is 0 (Over Budget), threshold is 0. All +ve expenses are risky.
        // If remaining is high, threshold is high.
        const hasRiskySpend = expenses.some(e => Number(e.amount) > riskyThreshold);

        if (hasRiskySpend) {
            contextPenalty += 20;
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
