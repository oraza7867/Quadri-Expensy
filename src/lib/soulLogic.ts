import { UserProfile, UserMode, Scar } from "./types";

/**
 * Calculates whether the user is in "Coach Mode" (First 7 days).
 * In Coach Mode, harsh penalties (Lockouts, Active Scars) are suspended.
 */
export function isCoachMode(createdAt: any): boolean {
    if (!createdAt) return true; // Fail safe to coach mode if undefined

    // Handle Firestore Timestamp vs JS Date
    const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7;
}

/**
 * Checks if Analytics should be locked based on Trust Score and Buffer.
 * Rule: Trust < 30 = Locked.
 */
export function isAnalyticsLocked(trustScore: number, isCoach: boolean, mode: UserMode): boolean {
    if (isCoach) return false; // Coach mode protects from lockout
    if (mode === "chill") return false; // Chill mode never locks
    return trustScore < 30;
}

/**
 * Checks if "Wants" category should be disabled.
 * Rule: Trust < 10 = Disabled.
 */
export function isWantsDisabled(trustScore: number, isCoach: boolean, mode: UserMode): boolean {
    if (isCoach) return false;
    if (mode === "chill") return false;
    // Hardcore mode might have stricter rules later, but for now 10 is the floor
    return trustScore < 10;
}

/**
 * Evaluates if a SCAR should be added.
 * Rule: Trust < 20 AND No active scar for this month.
 */
export function shouldAddScar(trustScore: number, currentMonthScars: Scar[], isCoach: boolean): boolean {
    if (isCoach) return false;
    if (trustScore >= 20) return false;

    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const hasActiveScar = currentMonthScars.some(s => s.date === currentMonth && s.status === 'active');

    return !hasActiveScar;
}

/**
 * Evaluates if a Scar should be HEALED.
 * Rule: Streak >= 21 days.
 */
export function shouldHealScar(scar: Scar, currentTrust: number): boolean {
    if (scar.status === 'healed') return false;
    // Note: The streak counter increment logic needs to happen in the hook/component
    // This function just checks the finish line.
    return (scar.streakCount || 0) >= 21 && currentTrust >= 40;
}

/**
 * Returns the UI State for the Soul Widget based on Trust Logic.
 */
export function getSoulState(trustScore: number): "zen" | "observing" | "disappointed" {
    if (trustScore >= 80) return "zen";
    if (trustScore >= 40) return "observing";
    return "disappointed";
}
