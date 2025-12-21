import { UserProfile } from "./types";

interface BriefingContent {
    headline: string;
    body: string;
    trustChange: number;
    actionItem: string;
}

export function generateMorningBriefing(
    profile: UserProfile,
    yesterdaySpent: number,
    yesterdayBudget: number // Daily breakdown or just general context
): BriefingContent {
    // 1. Analyze Trust Movement
    // Ideally we would compare track historic trust. 
    // For MVP v2: We infer based on current state and yesterday's spend.

    // Default: Neutral
    let content: BriefingContent = {
        headline: "A New Day.",
        body: "Yesterday was quiet. Today is another chance to build Trust.",
        trustChange: 0,
        actionItem: "Check your budget."
    };

    const dailyLimit = profile.monthlyBudget ? profile.monthlyBudget / 30 : 1000;

    if (yesterdaySpent > dailyLimit * 1.5) {
        // High Spend
        content = {
            headline: "Yesterday was heavy.",
            body: `You spent ₹${yesterdaySpent}. That's above your daily average.`,
            trustChange: -5, // Simulated heuristic for the briefing context
            actionItem: "Identify one 'Want' you can cut today."
        };
    } else if (yesterdaySpent === 0) {
        // Zero Spend
        content = {
            headline: "Clean Slate.",
            body: "You spent nothing yesterday. That's discipline.",
            trustChange: +2,
            actionItem: "Keep the streak alive."
        };
    }

    // Context Overrides based on Score
    if (profile.trustScore < 40) {
        content.headline = "We need to talk.";
        content.body = "Your Trust Score is critical. Yesterday didn't help.";
        content.actionItem = "Review your 'Needs' vs 'Wants' immediately.";
    }

    return content;
}
