"use client";

import { useState, useEffect } from "react";
import {
    collection,
    query,
    where,
    onSnapshot,
    Timestamp,
    addDoc,
    deleteDoc,
    doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { getCycleRange } from "@/lib/dateUtils";
import { subMonths } from "date-fns";

export interface Budget {
    id: string;
    category: string;
    limitAmount: number;
    month: string; // YYYY-MM
}

export interface Insight {
    type: "success" | "warning" | "danger" | "info";
    message: string;
}

import { formatCycleRange } from "@/lib/dateUtils";

// ... existing imports

export function useInsights() {
    const { user, profile: userProfile } = useAuth();

    // 1. Calculate Cycle Ranges for UI Label
    // (We use a safe default for server/initial render to avoid hydration mismatch, or just let it adjust)
    const [cycleRangeLabel, setCycleRangeLabel] = useState("");

    // State
    const [currentMonthExpenses, setCurrentMonthExpenses] = useState<any[]>([]);
    const [lastMonthTotal, setLastMonthTotal] = useState(0);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [healthScore, setHealthScore] = useState(100);
    const [loading, setLoading] = useState(true);

    // Helper: Get Month String "YYYY-MM"
    const getMonthStr = (date: Date) => date.toISOString().slice(0, 7);

    useEffect(() => {
        if (!user || !userProfile) return;

        const now = new Date();
        const resetDay = userProfile.budgetResetDay || 1;

        // 1. Calculate Cycle Ranges
        const currentCycle = getCycleRange(now, resetDay);
        setCycleRangeLabel(formatCycleRange(currentCycle));

        // For last cycle, we look back from before the current start
        // Safe bet: subtract 15 days from current start to land in previous cycle
        const lastCycleDate = subMonths(currentCycle.start, 0); // Wait, subMonths(start, 1) is safer?
        // Actually, let's just use the previous month of 'now' logic from dateUtils? 
        // No, best is to subtract 1 ms from current start to get end of previous, then query range.
        // But let's use getCycleRange on a date definitely in the past.
        const prevDate = new Date(currentCycle.start.getTime() - (1000 * 60 * 60 * 24 * 5)); // 5 days before start
        const lastCycle = getCycleRange(prevDate, resetDay);

        // Fetch Current Cycle Expenses
        const qExpenses = query(
            collection(db, "expenses"),
            where("uid", "==", user.uid),
            where("date", ">=", Timestamp.fromDate(currentCycle.start)),
            where("date", "<=", Timestamp.fromDate(currentCycle.end))
        );

        const qLastMonth = query(
            collection(db, "expenses"),
            where("uid", "==", user.uid),
            where("date", ">=", Timestamp.fromDate(lastCycle.start)),
            where("date", "<=", Timestamp.fromDate(lastCycle.end))
        );

        const unsubExpenses = onSnapshot(qExpenses, (snap) => {
            const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
            setCurrentMonthExpenses(docs);
        });

        const unsubLastMonth = onSnapshot(qLastMonth, (snap) => {
            const total = snap.docs.reduce((sum, d) => sum + Number(d.data().amount), 0);
            setLastMonthTotal(total);
        });

        // 2. Fetch Active Budgets for this month (Still using Calendar Month for categorization? Or Cycle?)
        // CEO Rec: Budgets should probably align with cycle too.
        // BUT 'month' field in budget buckets is YYYY-MM.
        // Complex migration. For now, let's keep budget buckets as Calendar Month to avoid breaking everything.
        // Or better: The budget applies to the cycle that *contains* this month?
        // Let's stick to Calendar Month for defined Budgets (limits) for now to minimize risk, 
        // as users usually think of "January Budget" even if they pay from 25th.
        const currentMonthStr = getMonthStr(now);
        const qBudgets = query(
            collection(db, "budgets"),
            where("uid", "==", user.uid),
            where("month", "==", currentMonthStr)
        );

        const unsubBudgets = onSnapshot(qBudgets, (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Budget[];
            setBudgets(docs);
        });

        return () => {
            unsubExpenses();
            unsubBudgets();
            unsubLastMonth();
        };
    }, [user, userProfile]);

    // 3. Generate Insights (Rule-Based)
    useEffect(() => {
        if (!user) return;

        const generatedInsights: Insight[] = [];
        const totalSpent = currentMonthExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
        const monthlyBudget = userProfile?.monthlyBudget || 0;

        // Rule: Comparison with Last Month
        if (lastMonthTotal > 0) {
            const diff = totalSpent - lastMonthTotal;
            const percent = ((diff / lastMonthTotal) * 100).toFixed(0);

            if (diff > 0) {
                generatedInsights.push({
                    type: "warning",
                    message: `You've spent ₹${diff} (${percent}%) more than last month. Check your recent transactions.`
                });
            } else {
                generatedInsights.push({
                    type: "success",
                    message: `Great job! You've saved ₹${Math.abs(diff)} compared to last month.`
                });
            }
        }

        // Rule: Total Spend Advice (Fallback if no last month data)
        if (lastMonthTotal === 0 && totalSpent > 50000) {
            generatedInsights.push({ type: "warning", message: "Your spending is high this month (> ₹50k). Review your big expenses." });
        }

        // Calculate Health Score (Start at 100)
        let score = 100;

        // Rule: Overall Budget Health (High Impact)
        if (monthlyBudget > 0) {
            const overallRatio = totalSpent / monthlyBudget;
            if (overallRatio > 1.0) {
                score -= 30; // Huge penalty for breaking global budget
                generatedInsights.push({ type: "danger", message: `🚨 You've exceeded your Monthly Goal of ₹${monthlyBudget}!` });
            } else if (overallRatio > 0.85) {
                score -= 10;
                generatedInsights.push({ type: "warning", message: `⚠️ You are at 85% of your Monthly Goal.` });
            }
        }

        // Rule: Category Budgets (Medium Impact)
        budgets.forEach(budget => {
            const categorySpent = currentMonthExpenses
                .filter(e => e.category === budget.category)
                .reduce((sum, e) => sum + Number(e.amount), 0);

            const ratio = categorySpent / budget.limitAmount;
            const overAmount = categorySpent - budget.limitAmount;

            if (ratio >= 1.0) {
                score -= 15;
                generatedInsights.push({
                    type: "danger",
                    message: `🚨 You're ₹${overAmount} over on ${budget.category}.`
                });
            } else if (ratio >= 0.8) {
                score -= 5;
            }
        });

        // Penalty for spending more than last month (Low Impact)
        if (lastMonthTotal > 0 && totalSpent > lastMonthTotal) {
            score -= 5;
        }

        setInsights(generatedInsights);
        setHealthScore(Math.max(0, score)); // Ensure score doesn't go below 0
        setLoading(false);
    }, [currentMonthExpenses, budgets, user, lastMonthTotal, userProfile]);

    // Actions
    const addBudget = async (category: string, limit: number) => {
        if (!user) return;
        const currentMonthStr = getMonthStr(new Date());
        await addDoc(collection(db, "budgets"), {
            uid: user.uid,
            category,
            limitAmount: Number(limit),
            month: currentMonthStr,
            alertThreshold: 0.8
        });
    };

    const deleteBudget = async (id: string) => {
        await deleteDoc(doc(db, "budgets", id));
    };

    const totalSpent = currentMonthExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return {
        currentMonthExpenses,
        totalSpent, // Export this so Dashboard can pass it to widget
        budgets,
        img_healthScore: healthScore,
        healthScore,
        insights,
        loading,
        addBudget,
        deleteBudget
    };
}
