/**
 * @internal — formatTargetLabel.ts
 *
 * Converts a "YYYY-MM-DD" string into a compact date label:
 *   - Same calendar year as `now`: "M/D"    (e.g. "10/1")
 *   - Different calendar year:    "M/D/YY"  (e.g. "1/15/27")
 *
 * The `lang` parameter is accepted but the format is language-neutral
 * (numeric M/D is used in both EN and ZH per the prototype style).
 *
 * Returns the target_date string as-is if it doesn't match the date format.
 *
 * Design: packages/xai-web-countdown/docs/design.md §6
 */

import type { Lang } from "@repo/plugin-web-tokens";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatTargetLabel(target_date: string, lang: Lang): string {
  // lang parameter is reserved for future locale-specific format variations;
  // the numeric M/D format is language-neutral per design.md §6
  void lang;
  const m = DATE_RE.exec(target_date);
  if (!m) return target_date;
  const y = m[1] as string;
  const mo = m[2] as string;
  const d = m[3] as string;
  const year = parseInt(y, 10);
  const month = parseInt(mo, 10);
  const day = parseInt(d, 10);
  const currentYear = new Date().getFullYear();
  if (year === currentYear) {
    return `${month}/${day}`;
  }
  // Cross-year: M/D/YY (two-digit year)
  const yy = String(year).slice(-2);
  return `${month}/${day}/${yy}`;
}
