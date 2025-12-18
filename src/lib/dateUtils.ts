import { startOfDay, endOfDay, subMonths, addMonths, setDate, lastDayOfMonth, isAfter, isBefore } from "date-fns";

export interface CycleRange {
    start: Date;
    end: Date;
}

/**
 * Calculates the current budget cycle range based on a custom reset day.
 * 
 * Logic:
 * - If today >= resetDay: Cycle started this month on resetDay.
 * - If today < resetDay: Cycle started last month on resetDay.
 * 
 * Edge Case (The "February 31st" Problem):
 * - If user picks 31, and it's Feb, we clamp to Feb 28/29.
 */
export function getCycleRange(currentDate: Date, resetDay: number = 1): CycleRange {
    const safeResetDay = Math.min(Math.max(1, resetDay), 31);

    // Check if we passed the reset day in the current month
    // We construct a candidate start date for this month
    let startCandidate = setDate(currentDate, safeResetDay);

    // If the constructed date is invalid (e.g. Feb 30), setDate wraps overlap. 
    // BUT date-fns/setDate behaves smartly or wraps. 
    // Robust approach: Clamp to end of month if needed.
    const currentMonthLastDay = lastDayOfMonth(currentDate).getDate();
    const actualStartDayThisMonth = Math.min(safeResetDay, currentMonthLastDay);

    startCandidate = setDate(currentDate, actualStartDayThisMonth);
    startCandidate = startOfDay(startCandidate);

    let rangeStart: Date;

    if (isAfter(currentDate, startCandidate) || currentDate.getTime() === startCandidate.getTime()) {
        // We are IN the cycle that started this month
        rangeStart = startCandidate;
    } else {
        // We are in the cycle that started LAST month
        // Go back one month
        const prevMonth = subMonths(currentDate, 1);
        const prevMonthLastDay = lastDayOfMonth(prevMonth).getDate();
        const actualStartDayPrevMonth = Math.min(safeResetDay, prevMonthLastDay);
        rangeStart = startOfDay(setDate(prevMonth, actualStartDayPrevMonth));
    }

    // End date is always: Start Date + 1 Month - 1ms
    // But precisely: The day before the next cycle starts.
    const nextMonthDate = addMonths(rangeStart, 1);
    // Find valid start day for next month
    const nextMonthLastDay = lastDayOfMonth(nextMonthDate).getDate();
    const actualStartDayNextMonth = Math.min(safeResetDay, nextMonthLastDay);

    const nextCycleStart = startOfDay(setDate(nextMonthDate, actualStartDayNextMonth));
    const rangeEnd = new Date(nextCycleStart.getTime() - 1); // 23:59:59.999 of previous day

    return { start: rangeStart, end: rangeEnd };
}

/**
 * Returns formatted string for UI
 */
export function formatCycleRange(range: CycleRange): string {
    return `${range.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${range.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}
