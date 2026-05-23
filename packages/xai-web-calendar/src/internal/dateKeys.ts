/**
 * @internal — UTC-based date helpers.
 *
 * All date keys are UTC so DST transitions never shift the perceived day.
 * See docs/design.md §6.1.
 */

/** Zero-pad a non-negative integer to 2 digits. */
export function pad2(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

/** Return the UTC date key "YYYY-MM-DD" for the given Date. */
export function utcDateKey(d: Date): string {
  return (
    d.getUTCFullYear() +
    "-" +
    pad2(d.getUTCMonth() + 1) +
    "-" +
    pad2(d.getUTCDate())
  );
}

/** True iff `year` is a leap year by the Gregorian rule. */
export function isLeapYear(year: number): boolean {
  if (year % 4 !== 0) return false;
  if (year % 100 !== 0) return true;
  return year % 400 === 0;
}

/** Number of days in `month` (1..12) of `year`. */
export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30;
  return 31;
}
