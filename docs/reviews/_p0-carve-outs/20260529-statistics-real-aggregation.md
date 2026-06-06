# P0 Carve-Out — xai-web-statistics-real-aggregation

**Date:** 2026-05-29
**Authority:** ADR-0010 §D4 — new feature plans require an explicit P0 carve-out commit.
**Triggering evidence:** usability recheck — "Statistics reads xai_pomodoro_sessions + xai_habits_state only; no task counter; tasks-completed is faked." Confirmed at `packages/plugin-web-statistics/src/internal/aggregators.ts:16`: comment "sessions as 'tasks completed' because no `xai_tasks_completed_log`".
**Operator decision:** item 3 local cluster #4 per session directive 2026-05-29.

---

## 1. Background

`StatisticsModule.tsx` reads `xai_pomodoro_sessions` + `xai_habits_state` + `xai_pref_week_start`. The aggregator has an explicit proxy hack: it counts **pomodoro sessions as "tasks completed"** because, at build time, there was no task-completion signal to read.

**T-10 (SHIPPED 2026-05-28) changed this** — task completion now persists as `done: true` inside `xai_task_cols`. So Statistics can now read REAL completed-task data and retire the pomodoro proxy.

## 2. Scope

**`xai-web-statistics-real-aggregation`** — Realistic v1

### In scope
- Statistics reads `xai_task_cols` (the SHIPPED key, now carrying `done`) and computes a **real "tasks completed"** metric (count of `done:true` cards, with the existing time-window/boundary logic the aggregators already apply to pomodoro/habits).
- **Retire the pomodoro-as-tasks-completed proxy hack** (`aggregators.ts:16`): the "tasks completed" KPI/chart now reflects real task data; pomodoro stats stay as their own (real) metric.
- Honest empty/zero state when no tasks are done (no fabricated numbers).
- Read via the existing `usePref` + narrow pattern already used for pomodoro/habits (add `xai_task_cols` read + a `narrowTaskCols`/task-completed aggregator in `internal/aggregators.ts`).
- Optionally surface a task-completed series in the existing charts (BarChart/LineChart/KpiCard) — planner decides which existing surfaces consume the new metric vs minimal KPI-only.

### Planner's call
- Whether to also read `xai_calendar_events` for a calendar/event stat (default: **defer** — keep v1 to retiring the tasks-completed proxy + real task metric; calendar stat is additive later). Justify.
- Exact "tasks completed" window semantics (today / this week / range tabs) — align with how pomodoro/habits windows already work + the date-basis discipline from dashboard-real-data (task dates are bucket-derived, not precise per-day — so "tasks completed" likely counts `done` cards in the current view window using the same honest approximation; planner defines + stays honest like D-QT).

### Out of scope
- External data / new API / sync / IndexedDB.
- Rewriting the chart components (BarChart/LineChart/RingChart/Heatmap stay; only their data source for the tasks metric changes).
- Habit/pomodoro aggregation changes (those already read real data — leave intact).

### NOT triggered
- New registry key (xai_task_cols already exists). New dep / CSP. `packages/core/src/types/events.ts` edit. `plugin-web-tokens` (local STR if any). Other plugin imports (read xai_task_cols via usePref + key string — same cross-module read pattern as dashboard-real-data #3d, Cmd-K adapters; NOT a plugin import). SHIPPED archive / ADR / `dev`.

## 3. Impact

### Modified
- `packages/plugin-web-statistics/src/StatisticsModule.tsx` (+`xai_task_cols` read + narrow).
- `packages/plugin-web-statistics/src/internal/aggregators.ts` (real tasks-completed aggregator; retire proxy comment+logic).
- possibly `internal/` narrow helper; `docs/` extend.

### Created
- `docs/workflow/roadmap/xai-web-statistics-real-aggregation.md` (by feature-plan).

### NOT modified
- `xai_task_cols` itself (READ-ONLY — Statistics must never write tasks). pomodoro/habits aggregation logic (already real). chart components' rendering. registry, core/events, tokens, other plugins, archives, ADR, `dev`.

## 4. Workflow path

carve-out commit → feature-plan → feature-review → feature-build → feature-verify → ship. Cross-vendor smoke DEFERRED per ADR-0008 §S3.

## 5. Acceptance anchor

Satisfied when: completing tasks (via the SHIPPED checkbox → `done:true`) makes the Statistics "tasks completed" metric reflect the real count (not a pomodoro-session proxy), shows honest zero when nothing is done, and never mutates `xai_task_cols` — verified by automated tests + (deferred) cross-vendor smoke.
