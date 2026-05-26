/**
 * @internal — pure date-key helpers for "YYYY-MM-DD" strings.
 *
 * Used by CalendarModule state refactor (activeDate SoT), WeekView, DayView,
 * and placeEventBlocks.
 *
 * All operations in local calendar arithmetic (not UTC) because week/day views
 * show local-clock hour rows per design.md §15.2 #2.
 */

/** Validated representation of a parsed date key. */
export interface DateKeyParts {
  year: number;
  month: number; // 1..12
  day: number;   // 1..31
}

/**
 * Parse "YYYY-MM-DD" into { year, month, day }.
 * Throws on malformed input (misuse guard — callers should validate before parsing).
 */
export function parseDateKey(key: string): DateKeyParts {
  const parts = key.split("-");
  if (parts.length !== 3) throw new Error(`parseDateKey: invalid format "${key}"`);
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error(`parseDateKey: non-integer component in "${key}"`);
  }
  if (month < 1 || month > 12) throw new Error(`parseDateKey: month out of range in "${key}"`);
  if (day < 1 || day > 31) throw new Error(`parseDateKey: day out of range in "${key}"`);
  return { year, month, day };
}

/**
 * Try-parse variant — returns null on malformed input instead of throwing.
 * Used by CalendarModule deep-link handler (validates user-supplied payload).
 */
export function tryParseDateKey(key: string): DateKeyParts | null {
  try {
    return parseDateKey(key);
  } catch {
    return null;
  }
}

/** Format { year, month, day } → "YYYY-MM-DD". */
export function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Extract the { year, month } from a date key without parsing day. */
export function dateKeyMonth(key: string): { year: number; month: number } {
  const { year, month } = parseDateKey(key);
  return { year, month };
}

/** Days in a month (respects leap years). */
function _daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Advance (or rewind) a date key by `deltaDays` calendar days.
 * Uses local Date arithmetic so DST adjustments are handled by the JS engine.
 */
export function stepDateKey(key: string, deltaDays: number): string {
  const { year, month, day } = parseDateKey(key);
  // Use noon UTC to avoid any DST ambiguity when creating the Date.
  const base = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + deltaDays);
  return formatDateKey(
    base.getUTCFullYear(),
    base.getUTCMonth() + 1,
    base.getUTCDate(),
  );
}

/** Returns true if two date keys refer to the same calendar day. */
export function sameDateKey(a: string, b: string): boolean {
  return a === b;
}

/** Returns the number of calendar days in the month containing `key`. */
export function daysInMonthForKey(key: string): number {
  const { year, month } = parseDateKey(key);
  return _daysInMonth(year, month);
}
