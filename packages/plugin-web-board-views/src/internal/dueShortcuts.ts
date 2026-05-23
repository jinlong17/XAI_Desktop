/**
 * @internal — pure due-date shortcut helpers.
 *
 * These produce the string format used throughout the board views:
 *   - "Today" (en) / "今天" (zh)
 *   - "M/D"  (e.g. "5/24")
 *
 * Hard constraint per DESIGN.md §4.3 + api.md §3.
 */

import type { Lang } from "./i18n.js";

/** Emit the "Today" quick-shortcut label in the current language. */
export function todayShortcut(lang: Lang): string {
  return lang === "zh" ? "今天" : "Today";
}

/**
 * Emit "M/D" for tomorrow (today + 1).
 * Accepts explicit year/month/day for deterministic testing.
 */
export function tomorrowShortcut(
  year: number,
  month: number, // 1-based
  day: number,
): string {
  const d = new Date(year, month - 1, day + 1);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * Emit "M/D" for the NEXT Monday.
 * - If today is Monday, returns NEXT Monday (today + 7).
 * - If today is Sunday (0), returns Monday (today + 1).
 * - Otherwise returns the nearest upcoming Monday.
 *
 * Accepts explicit year/month/day for deterministic testing.
 */
export function nextMondayShortcut(
  year: number,
  month: number, // 1-based
  day: number,
): string {
  const today = new Date(year, month - 1, day);
  const dow = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysUntilMon = dow === 0 ? 1 : dow === 1 ? 7 : 8 - dow;
  const d = new Date(year, month - 1, day + daysUntilMon);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
