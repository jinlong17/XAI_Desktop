/**
 * @internal — range window calculator.
 *
 * Given a range (week/month/all), a clock "now", a week-start preference, and
 * a language, returns:
 *   - start/end of the active window (UTC instants)
 *   - priorStart/priorEnd (the same-length window immediately preceding)
 *   - labels[] (already localized)
 *   - bucketBoundaries[] (start of each bucket, UTC)
 *
 * Pure function — no clock access (uses the supplied `now`).
 *
 * api.md §5.1.
 */

import type { Lang } from "@repo/plugin-web-tokens";
import type { RangeId } from "../types.js";

export type WeekStart = 0 | 1;

export interface RangeWindow {
  start: Date;
  end: Date;
  priorStart: Date;
  priorEnd: Date;
  labels: string[];
  bucketBoundaries: Date[];
}

const WEEK_LABELS_EN_SUN: readonly string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_LABELS_EN_MON: readonly string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_LABELS_ZH_SUN: readonly string[] = ["日", "一", "二", "三", "四", "五", "六"];
const WEEK_LABELS_ZH_MON: readonly string[] = ["一", "二", "三", "四", "五", "六", "日"];

const MONTH_LABELS_EN: readonly string[] = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function utcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000);
}

function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate()));
}

/**
 * Find the start-of-week UTC midnight for `now`, given weekStart preference.
 */
function startOfWeek(now: Date, weekStart: WeekStart): Date {
  const today = utcDay(now);
  const dow = today.getUTCDay(); // 0..6, Sun=0
  let offset = dow - weekStart;
  if (offset < 0) offset += 7;
  return addDays(today, -offset);
}

function endOfDay(d: Date): Date {
  return new Date(d.getTime() + 86_400_000 - 1);
}

function weekLabels(lang: Lang, weekStart: WeekStart): string[] {
  if (lang === "zh") {
    return [...(weekStart === 0 ? WEEK_LABELS_ZH_SUN : WEEK_LABELS_ZH_MON)];
  }
  return [...(weekStart === 0 ? WEEK_LABELS_EN_SUN : WEEK_LABELS_EN_MON)];
}

function monthLabel(monthIdx: number, lang: Lang): string {
  if (lang === "zh") return `${monthIdx + 1} 月`;
  return MONTH_LABELS_EN[monthIdx] ?? "";
}

export function rangeWindow(
  range: RangeId,
  now: Date,
  weekStart: WeekStart,
  lang: Lang,
): RangeWindow {
  if (range === "week") {
    const sow = startOfWeek(now, weekStart);
    const eow = endOfDay(addDays(sow, 6));
    const priorStart = addDays(sow, -7);
    const priorEnd = endOfDay(addDays(priorStart, 6));
    const bucketBoundaries: Date[] = [];
    for (let i = 0; i < 7; i++) bucketBoundaries.push(addDays(sow, i));
    return {
      start: sow,
      end: eow,
      priorStart,
      priorEnd,
      labels: weekLabels(lang, weekStart),
      bucketBoundaries,
    };
  }

  if (range === "month") {
    const today = utcDay(now);
    const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
    const monthEnd = new Date(nextMonthStart.getTime() - 1);
    const priorMonthStart = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1),
    );
    const priorMonthEnd = new Date(monthStart.getTime() - 1);

    // 4 weekly buckets. Bucket i starts at day i*7 + 1. The last bucket
    // absorbs any extra days (29..31).
    const bucketBoundaries: Date[] = [];
    for (let i = 0; i < 4; i++) {
      bucketBoundaries.push(
        new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), i * 7 + 1)),
      );
    }
    const labels = lang === "zh"
      ? ["1 周", "2 周", "3 周", "4 周"]
      : ["W1", "W2", "W3", "W4"];
    return {
      start: monthStart,
      end: monthEnd,
      priorStart: priorMonthStart,
      priorEnd: priorMonthEnd,
      labels,
      bucketBoundaries,
    };
  }

  // range === "all": 5 monthly buckets ending in now's month.
  const today = utcDay(now);
  const monthIdx = today.getUTCMonth();
  const year = today.getUTCFullYear();
  const startMonthIdx = monthIdx - 4;
  const startYear = year + Math.floor(startMonthIdx / 12);
  const startMonth = ((startMonthIdx % 12) + 12) % 12;
  const start = new Date(Date.UTC(startYear, startMonth, 1));
  const end = new Date(Date.UTC(year, monthIdx + 1, 1) - 1);
  const priorEnd = new Date(start.getTime() - 1);
  const priorStart = addMonths(start, -5);

  const bucketBoundaries: Date[] = [];
  const labels: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = addMonths(start, i);
    bucketBoundaries.push(d);
    labels.push(monthLabel(d.getUTCMonth(), lang));
  }

  return { start, end, priorStart, priorEnd, labels, bucketBoundaries };
}

export { utcDay, addDays, addMonths, endOfDay, startOfWeek };
