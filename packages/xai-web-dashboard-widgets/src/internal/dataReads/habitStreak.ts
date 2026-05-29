/**
 * @internal — habitStreak selector.
 *
 * Computes the max per-habit strict-consecutive streak (days) across all habits,
 * re-implementing habits' C1 `computeStreak` locally (cannot import internal/).
 *
 * Metric for StatStreak:
 *   - For each habit, compute its strict-consecutive streak (today-anchored, UTC day keys).
 *   - Return the maximum across all habits.
 *
 * **Date basis = UTC.** Habits store check-in keys as UTC "YYYY-MM-DD" (C1 semantics
 * from `xai-web-habits/src/types.ts:16-17` + `internal/computeStreak.ts`).
 * DO NOT use local clock for this (RD3 guard; AC-RD-HABIT-5 pins it).
 *
 * C1 rule (from `xai-web-habits/src/internal/computeStreak.ts`):
 *   - If today (UTC) is not checked → streak = 0.
 *   - Walk backwards day-by-day; count consecutive checked days.
 *
 * Authority: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #8
 * Discovery: docs/reviews/xai-web-dashboard-real-data/20260528-discovery-review.md §3.3
 */

import { isHabitsState, EMPTY_HABITS_STATE } from "./isHabitsState.js";

/**
 * Produces "YYYY-MM-DD" in UTC for a given Date.
 * Matches habits owner's `utcDateKey`.
 */
export function utcDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * C1 strict-consecutive streak for a single habit (local re-implementation).
 * - If today (UTC) is NOT checked → 0.
 * - Walk backwards day-by-day counting consecutive checked days.
 */
function singleHabitStreak(
  checkIns: Record<string, true>,
  today: Date,
): number {
  const todayKey = utcDateKey(today);
  if (checkIns[todayKey] !== true) return 0;

  let streak = 1;
  const cursor = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1),
  );

  while (checkIns[utcDateKey(cursor)] === true) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (streak > 100_000) break; // safety guard
  }

  return streak;
}

/**
 * Returns the maximum per-habit strict-consecutive streak across all habits.
 *
 * @param store  Raw value from `usePref("xai_habits_state")`.
 * @param now    Current Date (injected for testability — no `Date.now()`).
 * @returns      Max streak days (≥0). 0 if no habits or no streak.
 */
export function maxStreak(store: unknown, now: Date): number {
  const state = isHabitsState(store) ? store : EMPTY_HABITS_STATE;
  if (state.habits.length === 0) return 0;

  let best = 0;
  for (const habit of state.habits) {
    const habitCheckIns = state.checkIns[habit.id] ?? {};
    const s = singleHabitStreak(habitCheckIns as Record<string, true>, now);
    if (s > best) best = s;
  }
  return best;
}
