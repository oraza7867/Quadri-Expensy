export type SoulState = "zen" | "observing" | "disappointed";
export type HonestyLevel = "gentle" | "balanced" | "roast";
export type UserMode = "chill" | "standard" | "hardcore";

export interface MoralContract {
    signedAt: string;         // ISO Date
    version: number;          // e.g., 1
    agreedToHardMode: boolean;
}

export interface Scar {
    id: string;               // Auto-ID
    date: string;             // "2025-12" (Month Key)
    cause: string;            // "December Crash: Food Overspend"
    trustSnapshot: number;    // e.g., 15
    status: 'active' | 'healed';
    healedAt?: string; // ISO Date for healing
    streakCount?: number; // Days of good behavior
    lastStreakUpdate?: string; // ISO Date of last increment
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isPremium: boolean;
    currency: string;
    monthlyBudget?: number;
    trustScore: number;       // 0-100 (Base Memory)
    honestyLevel: HonestyLevel;
    mode: UserMode;           // v2.0 New Field
    moralContract: MoralContract | null; // v2.0 New Field

    strikes: {
        count: number;
        lastReset: string;    // ISO Date String
    };
    budgetResetDay?: number;  // 1-31, default 1
    createdAt: any;           // Firestore Timestamp or Date
}
