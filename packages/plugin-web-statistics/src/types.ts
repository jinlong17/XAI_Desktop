/**
 * Public types for @repo/plugin-web-statistics.
 *
 * API contract: packages/xai-web-statistics/docs/api.md §1
 * Design: packages/xai-web-statistics/docs/design.md
 */

import type { Lang } from "@repo/plugin-web-tokens";

/** Range selector value. */
export type RangeId = "week" | "month" | "all";

/** A KPI cell identifier. Used for testing and a11y labels. */
export type KpiCellId = "tasks" | "focus" | "habits" | "daily-avg";

/**
 * Aggregated KPI row.
 *
 * `trendXxx` is a display string already including sign + percent suffix,
 * or "—" when the prior window is empty. Never null.
 */
export interface StatisticsKpis {
  /** Real count of `done === true` cards in `xai_task_cols` (current board, range-invariant — no completion timestamp on TaskCard; see api.md §0). */
  tasksTotal: number;
  /** Total focus minutes summed across the active range. */
  focusMinutesTotal: number;
  /** "kept / total" string for the habits KPI — e.g. "5/5", "23/30", or "0/0". */
  habitsKeptStr: string;
  /** Average focus minutes per bucket in the range. */
  dailyAvgMinutes: number;
  /** Display trend string (e.g. "+12%", "-5%", "—"). */
  tasksTrend: string;
  focusTrend: string;
  /** Habits don't use percent — show the kept fraction or "100%" when full. */
  habitsKeptTrend: string;
  avgTrend: string;
}

/**
 * One heatmap cell. Level 0..4 is computed from `minutes` via fixed
 * thresholds — see design.md Frozen Assumption 5.
 */
export interface HeatmapCell {
  /** Column index 0..25 (oldest week first). */
  week: number;
  /** Row index 0..6 (offset from the week-start day per `xai_pref_week_start`). */
  day: number;
  /** UTC date key for the cell (YYYY-MM-DD). */
  date: string;
  /** Focus minutes summed on this UTC day. */
  minutes: number;
  /** Bucketed level 0..4 — driven by `minutes`. */
  level: 0 | 1 | 2 | 3 | 4;
}

/** Ring chart segment. */
export interface RingSegment {
  emoji: string;
  label: string;
  percent: number;
  color: string;
}

/** Habit leaderboard row. */
export interface HabitRankingRow {
  id: string;
  titleEn: string;
  titleZh: string;
  emoji: string;
  percent: number;
  streak: number;
}

/**
 * The structured aggregate consumed by every leaf component in the module.
 * Output of pure aggregator functions in src/internal/aggregators.ts.
 */
export interface RangeAggregate {
  range: RangeId;
  labels: string[];
  focusBuckets: number[];
  taskBuckets: number[];
  kpis: StatisticsKpis;
  peakHour: number | null;
  hourDistribution: number[];
  tagDistribution: RingSegment[];
  habitRanking: HabitRankingRow[];
}

/** Props for `<StatisticsModule/>`. */
export interface StatisticsModuleProps {
  /** Language source. Threaded down from the shell via `useWebShell().lang`. */
  lang: Lang;
}
