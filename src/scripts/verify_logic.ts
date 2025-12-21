
import { isCoachMode, isAnalyticsLocked, isWantsDisabled, shouldAddScar, shouldHealScar } from '../lib/soulLogic';
import { getCycleRange } from '../lib/dateUtils';
import { getSoulMessage, getSafeHonestyLevel, SOUL_COPY } from '../lib/soulCopy';
import { Scar, UserMode } from '../lib/types';

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

function assert(description: string, actual: any, expected: any) {
    if (actual === expected) {
        console.log(`${GREEN}✔ PASS: ${description}${RESET}`);
    } else {
        console.error(`${RED}✘ FAIL: ${description}${RESET}`);
        console.error(`  Expected: ${expected}`);
        console.error(`  Actual:   ${actual}`);
        process.exit(1);
    }
}

console.log("\n🧪 STARTING v2.0 LOGIC VERIFICATION\n");

// --- 1. COACH MODE ---
console.log("--- 1. Coach Mode Logic ---");
const now = new Date();
const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

assert("New User (5 days) is Coach", isCoachMode(fiveDaysAgo), true);
assert("Old User (8 days) is NOT Coach", isCoachMode(eightDaysAgo), false);

// --- 2. LOCKOUT LOGIC ---
console.log("\n--- 2. Lockout Logic (Trust < 30) ---");
// isAnalyticsLocked(trust, isCoach, mode)
assert("Standard Mode + Trust 29 = LOCKED", isAnalyticsLocked(29, false, "standard"), true);
assert("Standard Mode + Trust 30 = OPEN", isAnalyticsLocked(30, false, "standard"), false);
assert("Coach Mode + Trust 20 = OPEN (Protected)", isAnalyticsLocked(20, true, "standard"), false);
assert("Chill Mode + Trust 10 = OPEN (Protected)", isAnalyticsLocked(10, false, "chill"), false);

// --- 3. WANTS DISABLE LOGIC ---
console.log("\n--- 3. Wants Disable Logic (Trust < 10) ---");
assert("Standard Mode + Trust 9 = DISABLED", isWantsDisabled(9, false, "standard"), true);
assert("Standard Mode + Trust 10 = ENABLED", isWantsDisabled(10, false, "standard"), false);
assert("Chill Mode + Trust 5 = ENABLED", isWantsDisabled(5, false, "chill"), false);

// --- 4. SCAR HEALING LOGIC ---
console.log("\n--- 4. Scar Healing Logic ---");
// shouldHealScar(scar, currentTrust) -> Needs Streak >= 21 AND Trust >= 40
const activeScar: Scar = {
    id: "1", date: "2025-01", cause: "Test", trustSnapshot: 10, status: "active", streakCount: 0
};

const almostHealed = { ...activeScar, streakCount: 20 };
const readyToHeal = { ...activeScar, streakCount: 21 };

assert("Streak 20, Trust 80 -> NO HEAL", shouldHealScar(almostHealed, 80), false);
assert("Streak 21, Trust 30 -> NO HEAL (Trust too low)", shouldHealScar(readyToHeal, 30), false);
assert("Streak 21, Trust 40 -> HEAL", shouldHealScar(readyToHeal, 40), true);

// --- 5. SOUL VOICE ---
console.log("\n--- 5. Soul Voice ---");
assert("Roast Voice is savage", SOUL_COPY.zen.roast.includes("Rare W"), true);
assert("Gentle Voice is kind", SOUL_COPY.zen.gentle.includes("handling money well"), true);

// --- 6. DATE LOGIC (Check for crash) ---
console.log("\n--- 6. Date Utils (Cycle Range) ---");
const range = getCycleRange(new Date("2025-02-15"), 1); // Feb 15
// Should be Feb 1 - Feb 28 (or 29)
console.log(`  Cycle for Feb 15 (Reset 1): ${range.start.toLocaleDateString()} -> ${range.end.toLocaleDateString()}`);
// Check components instead of ISO string (Timezone safe)
assert("Cycle Start Month is Feb (1)", range.start.getMonth(), 1); // 0-indexed, 1=Feb
assert("Cycle Start Day is 1", range.start.getDate(), 1);

console.log("\n✅ ALL TESTS PASSED. SYSTEM IS LOGICALLY SOUND.");
