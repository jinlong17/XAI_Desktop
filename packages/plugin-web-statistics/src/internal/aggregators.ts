import { parseLocalDateKey } from "@repo/plugin-web-tokens";
/**
 * @internal — pure aggregator functions.
 *
 * Inputs: pomodoro session log (filtered to focus mode) + habits state +
 * week-start preference + clock `now` + language + raw `xai_task_cols` value.
 *
 * Outputs: a fully-populated RangeAggregate (see ../types.ts).
 *
 * All functions are pure — no I/O, no Math.random, no Date.now(). The
 * `now` parameter is the only clock source.
 *
 * api.md §5.2..§5.8.
 *
 * @remarks
 * Tasks metric: `kpis.tasksTotal` is the REAL count of `done === true` cards
 * in `xai_task_cols` (current board, range-invariant — no completion timestamp
 * on `TaskCard`). `kpis.tasksTrend` is always `"—"` (honest: no prior-window
 * baseline for a timestamp-less count). The pomodoro-as-tasks proxy has been
 * retired. Statistics NEVER writes `xai_task_cols`.
 *
 * `taskBuckets` is an honest current-state total fill: the real `done` count
 * is placed in the last bucket, all others are zero. This is NOT a time series
 * — the array length equals `labels.length` so the BarChart leaf is unchanged.
 * The Tasks BarChart panel header carries a user-visible "current board" marker
 * (REC-1 / B1 Path 1) that frames this honestly.
 */

import type { Lang } from "@repo/plugin-web-tokens";
import type {
  HabitRankingRow,
  HeatmapCell,
  RangeAggregate,
  RangeId,
  RingSegment,
  StatisticsKpis,
} from "../types.js";
import { RING_PALETTE } from "./colors.js";
import { countDoneTasks } from "./countDoneTasks.js";
import { type HabitsStateRecord } from "./isHabitsStateRecord.js";
import { type PomodoroSessionRecord } from "./isPomodoroSession.js";
import {
  addDays,
  rangeWindow,
  utcDay,
  type WeekStart,
} from "./rangeWindow.js";
import { trendPercent } from "./trendPercent.js";
import { measuredDurationMs } from './measuredDuration.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function minutesOf(s: PomodoroSessionRecord): number {
  return (measuredDurationMs(s) ?? 0) / 60_000;
}

function isInRange(s: PomodoroSessionRecord, start: Date, end: Date): boolean {
  const t = Date.parse(s.finishedAt);
  if (!Number.isFinite(t)) return false;
  return t >= start.getTime() && t <= end.getTime();
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateKeyOfFinishedAt(iso: string): string | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return dateKey(new Date(t));
}

// ---------------------------------------------------------------------------
// Bucketing
// ---------------------------------------------------------------------------

/**
 * Map each in-range focus session into a bucket index using the supplied
 * bucket boundaries (start of each bucket). Returns the bucket index, or
 * -1 if the session falls outside all buckets.
 */
function bucketIndexFor(
  finishedAt: number,
  boundaries: Date[],
  endOfRange: Date,
): number {
  const first = boundaries[0];
  if (!first) return -1;
  if (finishedAt < first.getTime()) return -1;
  if (finishedAt > endOfRange.getTime()) return -1;
  for (let i = boundaries.length - 1; i >= 0; i--) {
    const b = boundaries[i];
    if (b && finishedAt >= b.getTime()) return i;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Aggregators
// ---------------------------------------------------------------------------

export function aggregateRange(
  range: RangeId,
  rawSessions: PomodoroSessionRecord[],
  habits: HabitsStateRecord,
  weekStart: WeekStart,
  now: Date,
  lang: Lang,
  rawTaskCols: unknown = undefined,
): RangeAggregate {
  const w = rangeWindow(range, now, weekStart, lang);
  const focusSessions = rawSessions.filter((s) => s.mode === "focus");

  // Current-window buckets (focus only — tasks metric is now real, NOT session-derived)
  const focusBuckets = new Array<number>(w.labels.length).fill(0);
  for (const s of focusSessions) {
    const t = Date.parse(s.finishedAt);
    if (!Number.isFinite(t)) continue;
    const idx = bucketIndexFor(t, w.bucketBoundaries, w.end);
    if (idx >= 0) {
      focusBuckets[idx] = (focusBuckets[idx] ?? 0) + minutesOf(s);
    }
  }

  // Real tasks done count (current board, range-invariant).
  // The proxy (counting focus sessions as tasks) has been retired.
  // Statistics NEVER writes xai_task_cols — read-only aggregator.
  const currentTasksTotal = countDoneTasks(rawTaskCols);

  // Honest taskBuckets fill: place the real total in the last bucket,
  // zeros elsewhere. NOT a time series. JSDoc above explains why.
  const taskBuckets = new Array<number>(w.labels.length).fill(0);
  if (w.labels.length > 0 && currentTasksTotal > 0) {
    taskBuckets[w.labels.length - 1] = currentTasksTotal;
  }

  // KPIs derived from current vs prior window totals
  const currentFocusMinutes = focusBuckets.reduce((a, b) => a + b, 0);
  const priorFocusMinutes = focusSessions.reduce((acc, s) => {
    return isInRange(s, w.priorStart, w.priorEnd) ? acc + minutesOf(s) : acc;
  }, 0);

  const dailyAvgMinutes = w.labels.length > 0
    ? Math.round(currentFocusMinutes / w.labels.length)
    : 0;
  const priorDailyAvgMinutes = w.labels.length > 0
    ? Math.round(priorFocusMinutes / w.labels.length)
    : 0;

  // Habits kept fraction (current range)
  const totalHabits = habits.habits.length;
  let keptCurrent = 0;
  for (const h of habits.habits) {
    const checkIns = habits.checkIns[h.id] ?? {};
    let hit = false;
    for (const dk of Object.keys(checkIns)) {
      const t = (parseLocalDateKey(dk)?.getTime() ?? Number.NaN);
      if (Number.isFinite(t) && t >= w.start.getTime() && t <= w.end.getTime()) {
        hit = true;
        break;
      }
    }
    if (hit) keptCurrent++;
  }
  const habitsKeptStr = `${keptCurrent}/${totalHabits}`;

  const kpis: StatisticsKpis = {
    tasksTotal: currentTasksTotal,
    focusMinutesTotal: currentFocusMinutes,
    habitsKeptStr,
    dailyAvgMinutes,
    // tasksTrend is always "—": no honest prior-window for a timestamp-less
    // current-board count. The proxy's fabricated +N% trend has been retired.
    tasksTrend: "—",
    focusTrend: trendPercent(currentFocusMinutes, priorFocusMinutes),
    habitsKeptTrend:
      totalHabits > 0 && keptCurrent === totalHabits ? "100%" : habitsKeptStr,
    avgTrend: trendPercent(dailyAvgMinutes, priorDailyAvgMinutes),
  };

  // Hour distribution (24 buckets, minutes)
  const hourDistribution = new Array<number>(24).fill(0);
  for (const s of focusSessions) {
    const t = Date.parse(s.finishedAt);
    if (!Number.isFinite(t)) continue;
    if (t < w.start.getTime() || t > w.end.getTime()) continue;
    const hr = new Date(t).getHours();
    hourDistribution[hr] = (hourDistribution[hr] ?? 0) + minutesOf(s);
  }
  const maxHour = hourDistribution.reduce((a, b) => Math.max(a, b), 0);
  const peakHour = maxHour > 0 ? hourDistribution.indexOf(maxHour) : null;

  // Tag distribution from habit emoji grouping (current range)
  const groupCounts = new Map<string, { emoji: string; label: string; count: number }>();
  for (const h of habits.habits) {
    const checkIns = habits.checkIns[h.id] ?? {};
    let inRange = 0;
    for (const dk of Object.keys(checkIns)) {
      const t = (parseLocalDateKey(dk)?.getTime() ?? Number.NaN);
      if (Number.isFinite(t) && t >= w.start.getTime() && t <= w.end.getTime()) {
        inRange++;
      }
    }
    if (inRange === 0) continue;
    const existing = groupCounts.get(h.emoji);
    if (existing) {
      existing.count += inRange;
    } else {
      groupCounts.set(h.emoji, {
        emoji: h.emoji,
        label: lang === "zh" ? h.title.zh : h.title.en,
        count: inRange,
      });
    }
  }
  const groupsArr = Array.from(groupCounts.values()).sort((a, b) => b.count - a.count);
  const topGroups = groupsArr.slice(0, 5);
  const groupsTotal = topGroups.reduce((acc, g) => acc + g.count, 0);
  const tagDistribution: RingSegment[] = topGroups.map((g, i) => ({
    emoji: g.emoji,
    label: g.label,
    percent: groupsTotal > 0 ? Math.round((g.count / groupsTotal) * 100) : 0,
    color: RING_PALETTE[i] ?? RING_PALETTE[RING_PALETTE.length - 1] ?? "var(--accent)",
  }));

  // Habit ranking
  const qualifyingDays = countQualifyingDays(range, w.start, w.end, habits);
  const ranking: HabitRankingRow[] = habits.habits.map((h) => {
    const checkIns = habits.checkIns[h.id] ?? {};
    let kept = 0;
    for (const dk of Object.keys(checkIns)) {
      const t = (parseLocalDateKey(dk)?.getTime() ?? Number.NaN);
      if (Number.isFinite(t) && t >= w.start.getTime() && t <= w.end.getTime()) {
        kept++;
      }
    }
    const percent = qualifyingDays > 0
      ? Math.min(100, Math.round((kept / qualifyingDays) * 100))
      : 0;
    return {
      id: h.id,
      titleEn: h.title.en,
      titleZh: h.title.zh,
      emoji: h.emoji,
      percent,
      streak: computeStreak(habits.checkIns[h.id] ?? {}, now),
    };
  });
  ranking.sort((a, b) => b.percent - a.percent);
  const habitRanking = ranking.slice(0, 5);

  return {
    range,
    unmeasuredFocusSessions: focusSessions.filter(s => isInRange(s, w.start, w.end) && measuredDurationMs(s) === null).length,
    labels: w.labels,
    focusBuckets,
    taskBuckets,
    kpis,
    peakHour,
    hourDistribution,
    tagDistribution,
    habitRanking,
  };
}

function civilDayOrdinal(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

function countQualifyingDays(
  range: RangeId,
  start: Date,
  end: Date,
  habits: HabitsStateRecord,
): number {
  if (range === "week") return 7;
  if (range === "month") {
    // Days from month-start to today (capped at month-end).
    const days = civilDayOrdinal(end) - civilDayOrdinal(start) + 1;
    return Math.max(1, Math.min(days, 31));
  }
  // range === "all"
  let earliest: number | null = null;
  for (const habitId of Object.keys(habits.checkIns)) {
    for (const dk of Object.keys(habits.checkIns[habitId] ?? {})) {
      const t = (parseLocalDateKey(dk)?.getTime() ?? Number.NaN);
      if (Number.isFinite(t)) {
        if (earliest === null || t < earliest) earliest = t;
      }
    }
  }
  if (earliest === null) return 1;
  const days = civilDayOrdinal(end) - civilDayOrdinal(new Date(earliest)) + 1;
  return Math.max(1, Math.min(days, 365));
}

/**
 * Compute current streak by counting consecutive local civil day keys backward
 * from `now` while a check-in is present. Stops at the first gap.
 */
export function computeStreak(
  checkIns: Record<string, boolean>,
  now: Date,
): number {
  let streak = 0;
  let cursor = utcDay(now);
  // Walk back up to 365 days.
  for (let i = 0; i < 365; i++) {
    const key = dateKey(cursor);
    if (checkIns[key]) {
      streak++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

// ---------------------------------------------------------------------------
// Heatmap support — also pure
// ---------------------------------------------------------------------------

const LEVEL_THRESHOLDS: ReadonlyArray<{ min: number; level: HeatmapCell["level"] }> = [
  { min: 91, level: 4 },
  { min: 46, level: 3 },
  { min: 16, level: 2 },
  { min: 1, level: 1 },
];

export function bucketLevel(minutes: number): HeatmapCell["level"] {
  for (const t of LEVEL_THRESHOLDS) {
    if (minutes >= t.min) return t.level;
  }
  return 0;
}

export { dateKey as dateKeyOf };
export { dateKeyOfFinishedAt };
