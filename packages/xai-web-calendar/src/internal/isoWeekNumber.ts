/**
 * @internal — ISO 8601 week-number computation.
 *
 * Algorithm (per ISO 8601 §3.2.2):
 *   1. Shift the given date to the Thursday of its week (week numbers are
 *      anchored on Thursday so that any week with a Thursday belongs to
 *      the year that Thursday falls in).
 *   2. Find the Thursday of the first ISO week (the first Thursday of the
 *      calendar year).
 *   3. The week number is 1 + floor((targetThursday - firstThursday) / 7days).
 *
 * Reference: en.wikipedia.org/wiki/ISO_8601 §week_dates.
 */

const MS_PER_DAY = 86_400_000;

export function isoWeekNumber(date: Date): number {
  // Work in UTC to avoid DST flips moving days.
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // ISO weekday: 1 (Mon) .. 7 (Sun).
  const isoDow = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  // Shift to Thursday of the current ISO week.
  d.setUTCDate(d.getUTCDate() + 4 - isoDow);
  const isoYear = d.getUTCFullYear();
  // First Thursday of isoYear.
  const jan1 = new Date(Date.UTC(isoYear, 0, 1));
  const jan1Dow = jan1.getUTCDay() === 0 ? 7 : jan1.getUTCDay();
  // Offset from Jan 1 to the first Thursday: (4 - jan1Dow + 7) % 7.
  const firstThursdayOffset = (4 - jan1Dow + 7) % 7;
  const firstThursday = new Date(jan1.getTime() + firstThursdayOffset * MS_PER_DAY);
  return Math.floor((d.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY)) + 1;
}
