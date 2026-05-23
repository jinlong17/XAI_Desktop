/**
 * @internal — Month title formatter.
 *
 * EN: "May 2026" (using `common.{jan..dec}` bundle).
 * ZH: "2026 年 5 月".
 *
 * See docs/design.md §6.6.
 */

import type { Lang } from "@repo/plugin-web-tokens";

const EN_MONTH_KEYS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

/**
 * Lookup-only bundle shape — accepts the structural sub-type
 * `{ common: { jan: string; ... } }` we use here. We intentionally don't
 * accept the full I18NBundle to avoid coupling internal helpers to the
 * package surface.
 */
interface MonthBundle {
  common: Record<(typeof EN_MONTH_KEYS)[number], string>;
}

export function formatMonthTitle(
  year: number,
  month: number,
  lang: Lang,
  t: MonthBundle,
): string {
  if (lang === "zh") {
    return year + " 年 " + month + " 月";
  }
  const idx = Math.min(Math.max(month - 1, 0), 11);
  const monthKey = EN_MONTH_KEYS[idx] as (typeof EN_MONTH_KEYS)[number];
  return t.common[monthKey] + " " + year;
}
