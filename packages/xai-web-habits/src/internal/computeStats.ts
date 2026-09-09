/**
 * @internal — computeStats.ts
 * Pure stat-computation helpers.
 *
 * Design: design.md §6.2
 */

import type { DateKey } from "../types.js";
import { pad2, isLeapYear } from "./dateKeys.js";

/**
 * Returns the number of check-ins in the same calendar month as `ref` (UTC).
 */
export function computeMonthlyCount(
  habitCheckIns: Readonly<Record<DateKey, true>>,
  ref: Date,
): number {
  const prefix = `${ref.getFullYear()}-${pad2(ref.getMonth() + 1)}-`;
  return Object.keys(habitCheckIns).filter((k) => k.startsWith(prefix)).length;
}

/**
 * Returns the monthly check-in rate as a percentage (0–100, integer).
 * Denominator = days elapsed so far in the month (1..31).
 */
export function computeMonthlyRate(
  habitCheckIns: Readonly<Record<DateKey, true>>,
  ref: Date,
): number {
  const checks = computeMonthlyCount(habitCheckIns, ref);
  const daysSoFar = ref.getDate(); // 1..31
  if (daysSoFar === 0) return 0;
  return Math.round((checks / daysSoFar) * 100);
}

/**
 * E1 year-scoped 6/365 progress.
 * Numerator = check-ins in the same calendar year as `ref`.
 * Denominator = 365 (or 366 on leap years).
 */
export function compute365(
  habitCheckIns: Readonly<Record<DateKey, true>>,
  ref: Date,
): { numerator: number; denominator: 365 | 366 } {
  const year = ref.getFullYear();
  const prefix = `${year}-`;
  const numerator = Object.keys(habitCheckIns).filter((k) => k.startsWith(prefix)).length;
  const denominator: 365 | 366 = isLeapYear(year) ? 366 : 365;
  return { numerator, denominator };
}
