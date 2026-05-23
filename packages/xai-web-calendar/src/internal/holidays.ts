/**
 * @internal — Holiday lookup table.
 *
 * v1 ships only the 2 holidays the design source surfaces in May 2026
 * (i18n.js:510 Labor Day, line 515 Mother's Day equivalents — note: the
 * prototype hard-codes them into the rows[] array, not as a table). We lift
 * them into a typed table here so future months/years extend without
 * touching grid logic.
 *
 * Future row may add more entries (e.g., national holidays for other
 * countries via locale-aware sources).
 */

export interface HolidayEntry {
  year: number;
  /** 1..12. */
  month: number;
  /** 1..31. */
  day: number;
  /** i18n key, e.g. "cal.holiday_mayday". */
  i18nKey: string;
}

export const HOLIDAYS: ReadonlyArray<HolidayEntry> = [
  { year: 2026, month: 5, day: 1, i18nKey: "cal.holiday_mayday" },
  { year: 2026, month: 5, day: 9, i18nKey: "cal.holiday_mothers_day" },
];

/** Return the i18n key for the holiday on (year, month, day), or undefined. */
export function findHolidayKey(
  year: number,
  month: number,
  day: number,
): string | undefined {
  for (const h of HOLIDAYS) {
    if (h.year === year && h.month === month && h.day === day) {
      return h.i18nKey;
    }
  }
  return undefined;
}
