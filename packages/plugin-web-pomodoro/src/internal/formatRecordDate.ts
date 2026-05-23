/**
 * Format a local date key (YYYY-MM-DD) as a human-readable label for the focus record list.
 *
 * Labels:
 *   today     → "Today" (en) / "今天" (zh)
 *   yesterday → "Yesterday" (en) / "昨天" (zh)
 *   other     → "M/D" (en) / "M月D日" (zh)  (no leading zero on month or day)
 *
 * API contract: packages/xai-web-pomodoro/docs/api.md §4
 * Design: packages/xai-web-pomodoro/docs/design.md §10 (L-A)
 */

import type { Lang } from "@repo/plugin-web-tokens";

/**
 * @param dateKey - "YYYY-MM-DD" local date key.
 * @param lang    - Active language.
 * @param todayKey - "YYYY-MM-DD" for today (injectable for testability; defaults to local today).
 * @returns Human-readable date label string.
 */
export function formatRecordDate(
  dateKey: string,
  lang: Lang,
  todayKey?: string,
): string {
  const todayResolved = todayKey ?? localDateKey(new Date());
  const today = todayResolved;
  const yesterday = localDateKey(new Date(parseDateKey(today).getTime() - 24 * 60 * 60 * 1000));

  if (dateKey === today) {
    return lang === "zh" ? "今天" : "Today";
  }
  if (dateKey === yesterday) {
    return lang === "zh" ? "昨天" : "Yesterday";
  }

  // "M/D" or "M月D日"
  const parts = dateKey.split("-");
  const month = parseInt(parts[1] ?? "1", 10);
  const day = parseInt(parts[2] ?? "1", 10);

  if (lang === "zh") {
    return `${month}月${day}日`;
  }
  return `${month}/${day}`;
}

/** Return the local YYYY-MM-DD for a Date object. */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string into a local midnight Date. */
function parseDateKey(dateKey: string): Date {
  const parts = dateKey.split("-").map(Number);
  const y = parts[0] ?? 2000;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(y, m - 1, d);
}
