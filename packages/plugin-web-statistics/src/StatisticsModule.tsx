import { useLocalDayClock } from "@repo/plugin-web-tokens";
/**
 * StatisticsModule.tsx — top-level composition for @repo/plugin-web-statistics.
 *
 * Reads FOUR storage keys via usePref (READ-ONLY — never writes any key):
 *   - xai_pomodoro_sessions (PomodoroSession[])
 *   - xai_habits_state      (HabitsStateBlob)
 *   - xai_pref_week_start   (0 | 1)
 *   - xai_task_cols         (Record<BucketId,TaskCol>) — for real done count
 *
 * Derives RangeAggregate + HeatmapCell[] via pure aggregators (no random,
 * deterministic, useMemo-keyed) and passes pre-computed data to leaf
 * components. Range tabs (本周 / 本月 / 全部) flip a useState; no event
 * bus listeners.
 *
 * "Tasks completed" KPI now reads the REAL `done === true` count from
 * `xai_task_cols` (current board, range-invariant). A user-visible
 * "current board" / "当前看板" sub-label on the KPI + BarChart panel
 * header frames the number honestly (B1 / Path 1).
 *
 * api.md §0 / §5 / §7 / §SRA.
 */

import * as React from "react";
import { useMemo, useState } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import type {
  RangeAggregate,
  RangeId,
  StatisticsModuleProps,
} from "./types.js";
import { aggregateRange } from "./internal/aggregators.js";
import { heatmapCells } from "./internal/heatmapCells.js";
import { insightCopy } from "./internal/insightCopy.js";
import {
  EMPTY_HABITS_STATE,
  isHabitsStateRecord,
} from "./internal/isHabitsStateRecord.js";
import {
  isPomodoroSession,
  type PomodoroSessionRecord,
} from "./internal/isPomodoroSession.js";
import { strStats } from "./internal/strings.js";
import { IconChart } from "./internal/icons.js";
import { KpiCard } from "./KpiCard.js";
import { LineChart } from "./LineChart.js";
import { BarChart } from "./BarChart.js";
import { HourBar } from "./HourBar.js";
import { RingChart } from "./RingChart.js";
import { HabitRank } from "./HabitRank.js";
import { Heatmap } from "./Heatmap.js";
import { InsightCallout } from "./InsightCallout.js";

function formatHourLabel(hr: number | null): string | null {
  if (hr === null) return null;
  return `${String(hr).padStart(2, "0")}:00`;
}

function narrowSessions(raw: unknown): PomodoroSessionRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: PomodoroSessionRecord[] = [];
  for (const item of raw) {
    if (isPomodoroSession(item)) out.push(item);
  }
  return out;
}

function narrowHabitsState(raw: unknown) {
  if (isHabitsStateRecord(raw)) return raw;
  return EMPTY_HABITS_STATE;
}

function narrowWeekStart(raw: unknown): 0 | 1 {
  return raw === 1 ? 1 : 0;
}

export function StatisticsModule({
  lang,
}: StatisticsModuleProps): React.ReactElement {
  const { s } = useI18n(lang);
  const [range, setRange] = useState<RangeId>("week");

  const [rawSessions] = usePref("xai_pomodoro_sessions");
  const [rawHabits] = usePref("xai_habits_state");
  const [rawWeekStart] = usePref("xai_pref_week_start");
  // READ-ONLY: Statistics never writes xai_task_cols.
  const [rawTaskCols] = usePref("xai_task_cols");

  const sessions = useMemo(() => narrowSessions(rawSessions), [rawSessions]);
  const habits = useMemo(() => narrowHabitsState(rawHabits), [rawHabits]);
  const weekStart = narrowWeekStart(rawWeekStart);

  // `now` is captured once per mount; aggregators are pure given `now`.
  const { now } = useLocalDayClock();

  const agg: RangeAggregate = useMemo(
    () => aggregateRange(range, sessions, habits, weekStart, now, lang, rawTaskCols),
    [range, sessions, habits, weekStart, now, lang, rawTaskCols],
  );

  // Bilingual "current board" marker for the Tasks KPI + BarChart panel (B1 / Path 1).
  const currentBoardLabel = strStats("current_board", lang === "zh" ? "zh" : "en");

  const cells = useMemo(
    () => heatmapCells(sessions, weekStart, now),
    [sessions, weekStart, now],
  );

  const peakHourLabel = formatHourLabel(agg.peakHour);
  const insight = insightCopy(lang, {
    peakHourLabel,
    focusTrendStr: agg.kpis.focusTrend,
    range,
  });

  const focusHoursDisplay = `${Math.floor(agg.kpis.focusMinutesTotal / 60)}`;
  const focusMinsRemainder = agg.kpis.focusMinutesTotal % 60;
  const focusUnit = `h ${focusMinsRemainder}m`;

  const habitsKeptKept = agg.kpis.habitsKeptStr.split("/")[0] ?? "0";
  const habitsKeptTotal = agg.kpis.habitsKeptStr.includes("/")
    ? `/${agg.kpis.habitsKeptStr.split("/")[1] ?? "0"}`
    : agg.kpis.habitsKeptStr;

  return (
    <div className="module module-stats">
      <header className="module-head">
        <h1 className="module-title">
          <IconChart size={18} /> {s("statistics.title")}
        </h1>
        <span className="grow" />
        <div className="seg" role="tablist" aria-label="range">
          <button
            aria-selected={range === "week"}
            data-testid="stats-range-week"
            onClick={() => setRange("week")}
          >
            {s("statistics.this_week")}
          </button>
          <button
            aria-selected={range === "month"}
            data-testid="stats-range-month"
            onClick={() => setRange("month")}
          >
            {s("statistics.this_month")}
          </button>
          <button
            aria-selected={range === "all"}
            data-testid="stats-range-all"
            onClick={() => setRange("all")}
          >
            {s("statistics.all_time")}
          </button>
        </div>
      </header>

      <div className="stats-grid">
        {/* KPIs */}
        <div className="kpi-row">
          <KpiCard
            cellId="tasks"
            colorVar="var(--accent)"
            icon="check"
            label={s("statistics.tasks_completed")}
            value={agg.kpis.tasksTotal}
            trend={agg.kpis.tasksTrend}
            subLabel={currentBoardLabel}
          />
          <KpiCard
            cellId="focus"
            colorVar="var(--blue)"
            icon="timer"
            label={s("statistics.focus_time")}
            value={focusHoursDisplay}
            unit={focusUnit}
            trend={agg.kpis.focusTrend}
          />
          <KpiCard
            cellId="habits"
            colorVar="var(--amber)"
            icon="pin"
            label={s("statistics.habits_kept")}
            value={habitsKeptKept}
            unit={habitsKeptTotal}
            trend={agg.kpis.habitsKeptTrend}
          />
          <KpiCard
            cellId="daily-avg"
            colorVar="var(--red)"
            icon="flame"
            label={s("statistics.daily_avg")}
            value={agg.kpis.dailyAvgMinutes}
            unit="m"
            trend={agg.kpis.avgTrend}
          />
        </div>

        {/* Focus trend line chart (full width) */}
        <div className="stats-chart stats-trend panel">
          <div className="sc-head">
            <h3>{lang === "zh" ? "专注时长趋势" : "Focus trend"}</h3>
            <div className="sc-totals mono">
              {`${agg.kpis.focusMinutesTotal} min · ${agg.labels.length} ${
                lang === "zh" ? "段" : "buckets"
              }`}
            </div>
          </div>
          <LineChart
            labels={agg.labels}
            data={agg.focusBuckets}
            colorVar="var(--accent)"
            unit="m"
          />
        </div>

        {/* Tasks bar chart — current board, range-invariant (B1 / Path 1 / REC-1) */}
        <div className="stats-chart panel">
          <div className="sc-head">
            <h3>{s("statistics.tasks_completed")}</h3>
            <div className="sc-totals mono">
              {agg.kpis.tasksTotal}
              <span
                className="muted"
                style={{ fontSize: "11px", marginLeft: "6px" }}
                data-testid="tasks-barchart-marker"
              >
                {currentBoardLabel}
              </span>
            </div>
          </div>
          <BarChart
            labels={agg.labels}
            data={agg.taskBuckets}
            colorVar="var(--blue)"
          />
        </div>

        {/* Productive hours (24-hour bar) */}
        <div className="stats-chart panel">
          <div className="sc-head">
            <h3>{lang === "zh" ? "高产时段" : "Productive hours"}</h3>
            <div className="sc-totals mono">
              {peakHourLabel
                ? `${lang === "zh" ? "高峰" : "Peak"} ${peakHourLabel}`
                : lang === "zh"
                  ? "暂无峰值"
                  : "No peak yet"}
            </div>
          </div>
          <HourBar data={agg.hourDistribution} peak={agg.peakHour} />
        </div>

        {/* Tag breakdown donut */}
        <div className="stats-donut panel">
          <h3>{lang === "zh" ? "标签分布" : "By tag"}</h3>
          <RingChart segments={agg.tagDistribution} />
          <ul className="legend">
            {agg.tagDistribution.length === 0 && (
              <li className="muted">
                {lang === "zh" ? "暂无标签数据" : "No tag data"}
              </li>
            )}
            {agg.tagDistribution.map((seg, i) => (
              <li key={`${seg.emoji}-${i}`}>
                <span
                  className="leg-dot"
                  style={{ color: seg.color }}
                />
                <span>
                  {seg.emoji} {seg.label}
                </span>
                <span className="grow" />
                <span className="mono">{seg.percent}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Habit leaderboard */}
        <div className="stats-habits panel">
          <h3>{lang === "zh" ? "习惯排行" : "Habit leaderboard"}</h3>
          <HabitRank ranking={agg.habitRanking} lang={lang} />
        </div>

        {/* Heatmap */}
        <div className="stats-heat panel">
          <h3>
            {lang === "zh" ? "专注热力图" : "Focus heatmap"}{" "}
            <span
              className="muted mono"
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              {lang === "zh" ? "近 26 周" : "Last 26 weeks"}
            </span>
          </h3>
          <Heatmap cells={cells} />
          <div className="heat-legend">
            <span className="muted">{lang === "zh" ? "少" : "Less"}</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <span key={v} className={`heat-cell heat-${v}`} />
            ))}
            <span className="muted">{lang === "zh" ? "多" : "More"}</span>
          </div>
        </div>

        {/* Insight callout */}
        <InsightCallout copy={insight} lang={lang} />
      </div>
    </div>
  );
}

export type { StatisticsModuleProps };
