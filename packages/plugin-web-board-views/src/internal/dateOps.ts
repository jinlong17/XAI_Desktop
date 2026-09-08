/**
 * @internal — pure ISO date-offset helpers for Calendar and Timeline views.
 *
 * All functions operate relative to a caller-supplied `today` Date so they
 * can be tested deterministically without touching the system clock. Parsing
 * and date formatting delegate to board-core's typed date contract.
 */

import { isoDateFromOffset, parseIsoDateOnly } from "@repo/plugin-web-board-core";

const DAYS = 30;

/**
 * Parse an ISO date-only string into a day-offset from `today` (0 = today).
 */
export function parseDay(isoDate: string | undefined | null, today: Date): number | null {
  const parts = parseIsoDateOnly(isoDate);
  if (!parts) return null;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((date.getTime() - todayStart.getTime()) / 86_400_000);
}

/**
 * Convert a day-offset back to an ISO date-only string.
 */
export function dayToStr(offset: number, today: Date): string {
  return isoDateFromOffset(offset, today);
}

/**
 * Parse a valid ISO date into current-month calendar day.
 */
export function calendarDayInMonth(
  isoDate: string | undefined,
  year: number,
  month: number,
): number | null {
  const parts = parseIsoDateOnly(isoDate);
  if (!parts) return null;
  if (parts.year !== year || parts.month !== month) {
    return null;
  }
  return parts.day;
}

/**
 * Convert a calendar day in the supplied month to an ISO date-only string.
 */
export function calendarDayToIso(year: number, month: number, day: number): string | null {
  const candidate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (!parseIsoDateOnly(candidate)) {
    return null;
  }
  return candidate;
}

/**
 * Clamp a day offset to [0, DAYS-1] (30-day gantt window).
 */
export function clampDay(n: number): number {
  return Math.max(0, Math.min(DAYS - 1, n));
}
