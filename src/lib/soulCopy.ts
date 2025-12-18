export type SoulState = "zen" | "observing" | "disappointed";
export type HonestyLevel = "gentle" | "balanced" | "roast";

export const SOUL_COPY: Record<SoulState, Record<HonestyLevel, string>> = {
    zen: {
        gentle: "You're handling money well. Stay steady.",
        balanced: "Looking good. Keep going.",
        roast: "Rare W. Don’t mess it up."
    },
    observing: {
        gentle: "Just keep an eye on this.",
        balanced: "This is starting to add up.",
        roast: "Hmm. Pattern forming."
    },
    disappointed: {
        gentle: "We need to slow down.",
        balanced: "This is affecting your goals.",
        roast: "This is exactly why we talked."
    }
};

const ESSENTIAL_CATEGORIES = ["Food", "Health", "Education", "Bills", "Rent", "Groceries", "Transport"];

/**
 * Enforces the "Safe Roast" rule.
 * If the context involves an essential category, we downgrade "roast" to "balanced".
 * We never mock survival needs.
 */
export function getSafeHonestyLevel(level: HonestyLevel, category?: string): HonestyLevel {
    if (level === "roast" && category && ESSENTIAL_CATEGORIES.includes(category)) {
        return "balanced";
    }
    return level;
}

export function getSoulMessage(state: SoulState, level: HonestyLevel): string {
    return SOUL_COPY[state][level];
}
