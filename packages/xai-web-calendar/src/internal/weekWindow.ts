/**
 * @internal — week-window computation for WeekView.
 *
 * Given an `activeDate` key and `weekStart` (0=Sun, 1=Mon), returns an ordered
 * array of 7 date keys representing the full week that CONTAINS `activeDate`.
 *
 * Design ref: design.md §15.7 weekWindowFor signature.
 * Depends on: parseDateKey.ts (stepDateKey, parseDateKey).
 */

import { parseDateKey, stepDateKey } from "./parseDateKey.js";

/**
 * Returns 7 date keys [weekStart, weekStart+1, …, weekStart+6] where
 * the window contains `activeDateKey`.
 *
 * @param activeDateKey  "YYYY-MM-DD" of the active date.
 * @param weekStart      0 = Sunday-first, 1 = Monday-first.
 */
export function weekWindowFor(activeDateKey: string, weekStart: 0 | 1): string[] {
  const { year, month, day } = parseDateKey(activeDateKey);
  // Compute day-of-week (0=Sun) for the active date using UTC to avoid DST.
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=Sun..6=Sat
  // How many days back from activeDateKey is the first day of its week?
  const daysBack = (dow - weekStart + 7) % 7;
  // Build the 7-key array
  const window: string[] = [];
  for (let i = 0; i < 7; i++) {
    window.push(stepDateKey(activeDateKey, -daysBack + i));
  }
  return window;
}
