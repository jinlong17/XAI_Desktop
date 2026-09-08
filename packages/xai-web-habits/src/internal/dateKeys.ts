/**
 * @internal — dateKeys.ts
 * Pure date helper utilities for the habits module.
 *
 * All keys use UTC to eliminate DST edge cases (design.md §6, frozen assumption 4).
 * Design: design.md §6
 */

import type { DateKey, MonthKey, WeekStart } from "../types.js";

/** Pad a number to 2 digits (e.g. 5 → "05"). */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Returns `true` if `year` is a leap year (Gregorian calendar). */
export function isLeapYear(year: number): boolean {
  // Divisible by 400 → leap
  // Divisible by 100 but not 400 → not leap
  // Divisible by 4 but not 100 → leap
  // Otherwise → not leap
  return (year % 400 === 0) || (year % 100 !== 0 && year % 4 === 0);
}

/**
 * Returns the UTC-based day key for the given Date.
 * Format: `YYYY-MM-DD`.
 */
export function utcDateKey(d: Date): DateKey {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/**
 * Returns the UTC-based month key for the given Date.
 * Format: `YYYY-MM`.
 */
export function monthKey(d: Date): MonthKey {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
}

/**
 * Returns the number of days in the given month.
 * @param year  Full year (e.g. 2026)
 * @param month0 Zero-based month (0 = January, 11 = December)
 */
export function daysInMonth(year: number, month0: number): number {
  // Day 0 of next month = last day of this month
  return new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
}

/**
 * Returns an array of 7 Date objects for the week containing `now`,
 * where the week starts on the day specified by `weekStart`.
 *
 * All dates are UTC-midnight values (time = 00:00:00 UTC).
 *
 * @param now       Reference date (typically `new Date()`)
 * @param weekStart "sun" (default) or "mon"
 */
export function weekDates(now: Date, weekStart: WeekStart = "sun"): Date[] {
  // Get the UTC day-of-week for `now`
  const todayDow = now.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // How many days back to reach the start of the week?
  const startOffset = weekStart === "sun"
    ? todayDow            // Sun=0, Mon=1, ..., Sat=6
    : ((todayDow + 6) % 7); // Mon=0, Tue=1, ..., Sun=6

  const result: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - startOffset + i,
    ));
    result.push(d);
  }
  return result;
}
