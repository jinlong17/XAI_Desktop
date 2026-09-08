/**
 * @internal — computeStreak.ts
 * C1 strict-consecutive streak including today.
 *
 * Design: design.md §6.1
 * - If today is not checked, return 0.
 * - Walk backwards day-by-day; increment streak for each consecutive checked day.
 * - Zero-out on any skip.
 */

import type { DateKey } from "../types.js";
import { utcDateKey } from "./dateKeys.js";

/**
 * Computes the current consecutive streak for a habit.
 *
 * C1 semantics (design.md §6.1):
 * - Streak starts at today. If today is not checked → 0.
 * - Walk backwards: every consecutive checked day increments streak.
 * - Any gap resets the count (zero-out on skip).
 *
 * @param habitCheckIns  Sparse map of { [YYYY-MM-DD]: true } for this habit.
 * @param today          Reference date (typically `new Date()`).
 */
export function computeStreak(
  habitCheckIns: Readonly<Record<DateKey, true>>,
  today: Date,
): number {
  const todayKey = utcDateKey(today);
  if (habitCheckIns[todayKey] !== true) return 0;

  let streak = 1;
  const cursor = new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate() - 1,
  ));

  while (habitCheckIns[utcDateKey(cursor)] === true) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (streak > 100_000) break; // safety guard against pathological state
  }

  return streak;
}
