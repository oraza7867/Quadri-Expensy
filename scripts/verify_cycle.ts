
import { getCycleRange, formatCycleRange } from "../src/lib/dateUtils";

const runTest = (name: string, currentDate: string, resetDay: number) => {
    const date = new Date(currentDate);
    const range = getCycleRange(date, resetDay);
    console.log(`[${name}] Date: ${currentDate}, ResetDay: ${resetDay}`);
    console.log(`Result: ${formatCycleRange(range)}`);
    // Basic assertion logs
    console.log(`Start: ${range.start.toISOString()}`);
    console.log(`End:   ${range.end.toISOString()}`);
    console.log('---');
};

console.log("Running Cycle Logic Verification...");

// Case 1: Standard (Reset Day 1)
runTest("Standard Cycle", "2025-12-18", 1);
// Expected: Dec 1 - Dec 31

// Case 2: Past Reset Day (Reset Day 15, Today 18)
runTest("Mid-Month Active", "2025-12-18", 15);
// Expected: Dec 15 - Jan 14

// Case 3: Future Reset Day (Reset Day 25, Today 18)
runTest("Mid-Month Previous", "2025-12-18", 25);
// Expected: Nov 25 - Dec 24

// Case 4: Edge Case (Feb 29 Check - leap year 2024? 2025 is not)
// Select 30th on Feb 15th
runTest("February Edge", "2025-02-15", 30);
// Expected: Jan 30 - Feb 27 (or 28 depending on logic logic)
