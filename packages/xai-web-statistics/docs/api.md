# API Contract — xai-web-statistics

## §0 Public surface

The ONLY allowed import path is `@repo/plugin-web-statistics`. Importing from `src/internal/*` is forbidden by ADR-0007 §S4 + the project red-line "index.ts is a plugin's only public surface".

```ts
// @repo/plugin-web-statistics
export { StatisticsModule } from "./StatisticsModule.js";
export type { StatisticsModuleProps } from "./StatisticsModule.js";
export { statisticsWebModuleRegistration } from "./registration.js";
export type {
  RangeId,
  RangeAggregate,
  KpiCellId,
  StatisticsKpis,
  HeatmapCell,
} from "./types.js";

// side-effect CSS — applied once globally when this package is first imported
import "./styles.css";
```

NO export of: aggregator functions, predicates, heatmap helper, insight copy function, icons, or any internal type.

### Known Limitations

- **Tasks completion data source is the focus session log.** Until a `web:tasks:completed` event channel + a `xai_tasks_completed_log` storage key are introduced in a future row, "Tasks completed" KPI + the tasks bar chart are derived from `xai_pomodoro_sessions.filter(s => s.mode === 'focus')`. Documented on the aggregator JSDoc.
- **Range selection is not persisted.** A future row may add `xai_pref_stats_range` and back the component state with `usePref`.
- **Heatmap thresholds are subjective.** Frozen at `0 / 1–15 / 16–45 / 46–90 / 91+` minutes for v1.

## §1 Public types

```ts
// src/types.ts

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
  /** Total focus sessions (proxy for tasks completed). */
  tasksTotal: number;
  /** Total focus minutes summed across the active range. */
  focusMinutesTotal: number;
  /** "kept / total" string for the habits KPI — e.g. "5/5", "23/30", or "0/0". */
  habitsKeptStr: string;
  /** Average focus minutes per bucket in the range. */
  dailyAvgMinutes: number;
  /** Display trend strings (e.g. "+12%", "-5%", "—"). */
  tasksTrend: string;
  focusTrend: string;
  habitsKeptTrend: string; // habits don't use percent — always the kept fraction string ("5/5" etc) or "100%"
  avgTrend: string;
}

/**
 * One heatmap cell. Level 0..4 is computed from `minutes` via the fixed
 * threshold map documented in design.md Frozen Assumption 5.
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

/**
 * The structured aggregate consumed by every leaf component in the module.
 * Pure function output of aggregators.ts.
 */
export interface RangeAggregate {
  /** The range this aggregate was computed for. */
  range: RangeId;
  /** Bucket labels (length = focusBuckets.length = taskBuckets.length). */
  labels: string[];
  /** Focus minutes per bucket. */
  focusBuckets: number[];
  /** Focus sessions per bucket — also the "tasks" series. */
  taskBuckets: number[];
  /** KPI cells. */
  kpis: StatisticsKpis;
  /** Peak hour 0..23, or null if no focus minutes in range. */
  peakHour: number | null;
  /** 24-element hour distribution in minutes. Always length 24. */
  hourDistribution: number[];
  /** Up to 5 (emoji, label, percent, color) tuples. */
  tagDistribution: Array<{
    emoji: string;
    label: string;
    percent: number;
    color: string;
  }>;
  /** Up to 5 (habit, percent, streak) tuples sorted desc by percent. */
  habitRanking: Array<{
    id: string;
    titleEn: string;
    titleZh: string;
    emoji: string;
    percent: number;
    streak: number;
  }>;
}
```

## §2 Storage keys read

This row reads — never writes — the following `@repo/plugin-web-storage` keys:

| Key | Codec | Default | Owner |
|---|---|---|---|
| `xai_pomodoro_sessions` | `json` (array) | `[]` | `xai-web-pomodoro` (#14) |
| `xai_habits_state` | `json` (object) | `{ schemaVersion:1, habits:[], checkIns:{}, diaries:{} }` | `xai-web-habits` (#15) |
| `xai_pref_week_start` | `number` | `0` | `xai-web-calendar` (#12) |

Reads go through `usePref(<key>)` so the component auto-rerenders on `web:settings:preference-changed`.

### Boundary widening predicates

The registry types are `unknown` / `HabitsStateBlob = unknown` at the storage boundary. This package narrows before consumption:

```ts
// src/internal/isPomodoroSession.ts
export function isPomodoroSession(v: unknown): v is PomodoroSession {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    (obj.mode === "focus" || obj.mode === "short-break" || obj.mode === "long-break") &&
    typeof obj.durationMs === "number" &&
    typeof obj.finishedAt === "string"
  );
}

// src/internal/isHabitsStateRecord.ts
export interface HabitsStateRecord {
  habits: Habit[];
  checkIns: Record<string, Record<string, boolean>>; // habitId → { date → true }
  diaries: Record<string, unknown>;
}
export function isHabitsStateRecord(v: unknown): v is HabitsStateRecord;

// src/internal/isHabit.ts
export interface Habit {
  id: string;
  emoji: string;
  title: { en: string; zh: string };
  streak?: number;
  frequency?: "daily" | "weekdays" | "weekly";
}
export function isHabit(v: unknown): v is Habit;
```

Non-conforming items are silently dropped (logged via `console.debug` in dev only).

## §3 Events

### §3.1 Listened

NONE. This module does not subscribe to any `web:*` channel. The `usePref` hook handles live updates internally.

### §3.2 Emitted

NONE. Statistics is a read-only aggregator (frozen assumption #3).

## §4 Module slot registration

```ts
// src/registration.tsx
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { StatisticsModule } from "./StatisticsModule.js";
import { useWebShell } from "@repo/xai-web-shell";

function StatisticsModuleRoute() {
  const { lang } = useWebShell();
  return <StatisticsModule lang={lang} />;
}

export const statisticsWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "statistics",
  label: "Statistics",
  defaultChildPath: "",
  children: [
    { path: "", render: StatisticsModuleRoute },
    { path: "*", render: StatisticsModuleRoute },
  ],
  icon: "chart",
  railOrder: 11,
  i18nKey: "nav.statistics",
  showInRail: true,
};
```

The shell anchor edit in `apps/web/src/routes/modules/shellRegistrations.tsx` replaces the existing placeholder line:

```diff
- placeholder("statistics", "Statistics", "chart",     11),
+ statisticsWebModuleRegistration,  // xai-web-statistics row #20 (railOrder 11)
```

And the corresponding import is added in the import block:

```ts
// xai-web-statistics row #20
import { statisticsWebModuleRegistration } from "@repo/plugin-web-statistics";
```

## §5 Aggregator semantics (internal — for test design only)

### §5.1 `rangeWindow(range, now, weekStart)`

Returns `{ start: Date, end: Date, priorStart: Date, priorEnd: Date, labels: string[], bucketBoundaries: Date[] }`.

- `range = "week"`: 7 buckets, Mon..Sun (or Sun..Sat per `weekStart`). `bucketBoundaries[i]` is the midnight at the start of bucket `i` in UTC. `priorStart`/`priorEnd` is the same-length window one week earlier.
- `range = "month"`: 4 buckets, ISO weeks W1..W4 within the current month. Last bucket extends to month-end if the month has a partial fifth week.
- `range = "all"`: 5 buckets, the most-recent 5 months ending in `now`'s month. Labels are short month names in the active language.

Labels are language-aware: returned `labels` array is already localized.

### §5.2 `aggregateWeek / aggregateMonth / aggregateAll`

```ts
function aggregateWeek(
  sessions: PomodoroSession[],
  habits: HabitsStateRecord,
  weekStart: 0 | 1,
  now: Date,
  lang: Lang,
): RangeAggregate;
```

Returns a fully-populated `RangeAggregate`. Pure function: no I/O, no `Math.random`, no `Date.now()` (the `now` parameter is the only clock source).

### §5.3 `computeKpis(currentAgg, priorAgg, habits, range)`

Pure. Trend strings are produced by `trendPercent`. Habits kept = number of habits with ≥1 check-in in range divided by total habits length, formatted as `"kept/total"`. When `total === 0`, returns `"0/0"`.

### §5.4 `trendPercent(current, prior)`

- `prior === 0 && current === 0` → `"—"`
- `prior === 0 && current > 0` → `"—"` (avoid lying about ∞ growth)
- otherwise → `"{sign}{abs}%"` where sign is `+` or `-` and `abs = Math.round(((current - prior) / prior) * 100)`. Examples: `+12%`, `-5%`, `+0%`.

### §5.5 `hourDistribution(sessions, range, now, weekStart)`

Returns `number[24]`. Each entry is total focus minutes summed for that hour-of-day within the active range. Hour bucket = `new Date(s.finishedAt).getHours()`. Filtered to `mode === 'focus'`.

### §5.6 `peakHour(hourDistribution)`

Returns `data.indexOf(Math.max(...data))` if max > 0, else `null`.

### §5.7 `tagDistribution(habits, range, now)`

Groups habits by `emoji`, counts in-range check-ins per group, takes top 5 groups by count. Returns `[{ emoji, label, percent, color }]` where:

- `label` = `habits[0].title[lang]` of the first habit in the group (for the legend; the component receives `lang` and resolves at render).
- `percent` = `Math.round((count / totalCount) * 100)` with `totalCount` = sum across all groups.
- `color` rotates through `--accent`, `--blue`, `--amber`, `--red`, `--purple` per group order.

If `totalCount === 0`, returns empty array.

### §5.8 `habitRanking(habits, range, now, weekStart)`

For each habit, `percent = Math.round((inRangeCheckInCount / qualifyingDaysCount) * 100)`. `streak` reads from `habits[i].streak ?? 0`. Sorts descending by percent, returns top 5.

`qualifyingDaysCount`:
- range="week": 7
- range="month": days-in-month so far
- range="all": days since the earliest check-in across all habits, capped at 365

### §5.9 `heatmapCells(sessions, weekStart, now)`

Returns `HeatmapCell[182]` (26 weeks × 7 days). Each cell:

- `date` = UTC YYYY-MM-DD for the (week, day) coordinate
- `minutes` = sum of focus session durations finished on that UTC date
- `level` per the threshold map above

The cell ordering is column-major: index `i = week * 7 + day`. The first cell (`i=0`) is the start-of-week day, 26 weeks before `now`'s week. The last cell (`i=181`) is `now`'s day in the current week.

### §5.10 `insightCopy(lang, vars)`

```ts
interface InsightVars {
  peakHourLabel: string | null;   // "09:00" or null when no data
  focusTrendStr: string;           // "+8%" / "—"
  range: RangeId;
}
function insightCopy(lang: Lang, vars: InsightVars): string;
```

Cases:

- `peakHourLabel === null` →
  - `en`: `"Once you log a focus session, an insight will appear here."`
  - `zh`: `"完成一次专注后，这里会显示本次洞察。"`
- otherwise, range-aware copy:
  - `range = "week"`:
    - en: `"You're sharpest around {peakHourLabel}, and your focus time is {focusTrendStr} vs last week. Keep the morning rhythm."`
    - zh: `"你在 {peakHourLabel} 左右最高产，专注时长比上周 {focusTrendStr}。继续保持上午的节奏。"`
  - `range = "month"`:
    - en: `"You're sharpest around {peakHourLabel}, and your focus time is {focusTrendStr} vs last month. Steady rhythm."`
    - zh: `"你在 {peakHourLabel} 左右最高产，专注时长比上月 {focusTrendStr}。节奏稳定。"`
  - `range = "all"`:
    - en: `"You're sharpest around {peakHourLabel}, and your focus time is {focusTrendStr} vs the prior period. Long-game energy."`
    - zh: `"你在 {peakHourLabel} 左右最高产，专注时长比上一周期 {focusTrendStr}。长期稳健。"`

Strings use `${}` template interpolation, never `+` concatenation.

## §6 i18n keys consumed

All keys already exist in `@repo/plugin-web-tokens/i18n.ts` (verified by grep):

- `statistics.title` — "Statistics" / "统计"
- `statistics.this_week` — "This Week" / "本周"
- `statistics.this_month` — "This Month" / "本月"
- `statistics.all_time` — "All time" / "全部时间"
- `statistics.tasks_completed` — "Tasks completed" / "完成任务"
- `statistics.focus_time` — "Focus time" / "专注时长"
- `statistics.habits_kept` — "Habits kept" / "保持习惯"
- `statistics.daily_avg` — "Daily average" / "日均"
- `nav.statistics` — "Statistics" / "统计" (for the rail tooltip via `WebModuleSlotRegistration.i18nKey`)

Other UI copy that is NOT in the bundle (chart titles like "Focus trend", peak badge "Peak {label}", "By tag", "Habit leaderboard", "Focus heatmap", "Last 26 weeks", "Less" / "More", "This week's insight") uses inline `lang === "zh" ? "…" : "…"` ternaries, matching the W2 precedent set by ai-chat, meditation, and pomodoro. Frozen assumption 14 documents this; no edit to `@repo/plugin-web-tokens` in this row.

## §7 Component props

```ts
// src/StatisticsModule.tsx
export interface StatisticsModuleProps {
  /** Language source. Threaded down from the shell via `useWebShell().lang`. */
  lang: Lang;
}

// src/KpiCard.tsx
interface KpiCardProps {
  cellId: KpiCellId;
  colorVar: string; // "var(--accent)" etc
  icon: "check" | "timer" | "pin" | "flame";
  label: string;
  value: string | number;
  unit?: string;
  trend: string;
}

// src/LineChart.tsx
interface LineChartProps {
  labels: string[];
  data: number[];
  colorVar: string;
  unit?: string;
}

// src/BarChart.tsx
interface BarChartProps {
  labels: string[];
  data: number[];
  colorVar: string;
  unit?: string;
}

// src/HourBar.tsx
interface HourBarProps {
  data: number[];        // length 24
  peak: number | null;
}

// src/RingChart.tsx
interface RingChartProps {
  segments: Array<{ percent: number; color: string }>;
}

// src/HabitRank.tsx
interface HabitRankProps {
  ranking: RangeAggregate["habitRanking"];
  lang: Lang;
}

// src/Heatmap.tsx
interface HeatmapProps {
  cells: HeatmapCell[]; // length 182
}

// src/InsightCallout.tsx
interface InsightCalloutProps {
  copy: string; // pre-resolved via insightCopy()
}
```

## §8 Error semantics

- All inputs to aggregators are guarded by predicates; invalid items dropped silently.
- All `Math.max([])` guards return `null` / `"—"` instead of `-Infinity` / `"+Infinity%"`.
- Division by zero (empty prior window) returns the em-dash `"—"`.
- Components NEVER throw at the React boundary; all conditional UI paths render an empty-state.
- The barrel must not export anything that is `undefined` at module load — `index-barrel.test.ts` enforces this.

## §9 Versioning

This is row #20's initial release (v1). No migrations. Future increments may:

- Add a real `web:tasks:completed` channel (paired row #6 extension).
- Add `xai_pref_stats_range` storage key.
- Add a `xai_pref_heatmap_thresholds` storage key.

Any of those require a feature-plan increment block per the SOP, NOT in-place edits.

---
