# Design Snapshot — xai-web-statistics

## Decision header

| Field | Value |
|---|---|
| Selected Option | **Aggregator package** — `@repo/plugin-web-statistics` reads `xai_pomodoro_sessions` + `xai_habits_state` + `xai_pref_week_start` via `usePref`, derives all 7 visualizations through pure functions in `src/internal/aggregators.ts`. Zero event-bus emit. NO `@repo/core` edits. |
| Review Doc | `docs/reviews/xai-web-statistics/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console.md` row #20 (W3 · Aggregator) |
| Source PRD | `web design/DESIGN.md` §4.11 (Statistics) |
| Source Code | `web design/module-statistics.jsx` (320 LOC) + Statistics CSS rules in `web design/layout.css` |
| Target Package | `packages/xai-web-statistics/` → `@repo/plugin-web-statistics` |
| ADR Anchor | `docs/adr/0007-xai-web-console-build-form.md` §S4 (port-map row "module-statistics.jsx" → `packages/plugin-web-statistics/`) + §S5 (JSX→TSX rules) + §S6 (Vite SPA build form) + §S7 (no `web:statistics:*` channel — read-only aggregator) + §S8 (no new storage keys — reads existing `xai_pomodoro_sessions` / `xai_habits_state` / `xai_pref_week_start`) |
| Last Updated | 2026-05-23 |

## Frozen Assumptions

1. **No `@repo/core` source edits.** No new EventMap entries, no new types, no new storage keys.
2. **Tasks completion data source = filtered focus session log.** `sessions.filter(s => s.mode === 'focus')`. Documented Known Limitation in api.md §0. A JSDoc on `aggregateTasksFromSessions` permits a future row to swap source without touching the chart layer.
3. **No `web:statistics:*` event channel.** Statistics is a read-only sink — does NOT emit.
4. **Range = `'week' | 'month' | 'all'` literal union.** Default `'week'` on first mount. Selected range is NOT persisted in v1 (matches artifact).
5. **Heatmap thresholds (minutes per UTC day)** = `level 0 = 0`, `level 1 = 1..15`, `level 2 = 16..45`, `level 3 = 46..90`, `level 4 = 91+`. Frozen for v1.
6. **Trend % rule** = compare current window to prior-window-same-length. Empty-prior returns em-dash `"—"`. Positive prefix `+`, negative prefix `-`. Rounded to whole percent.
7. **Empty state** = chart panels stay rendered; KPI shows `—` for value + trend; insight shows empty-state copy; peak bar glow disabled.
8. **`xai_pref_week_start`** is read and threaded through every aggregator + heatmap; default 0 (Sunday).
9. **Ring chart source** = habit emoji grouping (top 5). NOT a tag table (no tag table is persisted today).
10. **Module slug** = `"statistics"` (matches `RailItemId` literal + i18n `nav.statistics` + existing placeholder line in `shellRegistrations.tsx`).
11. **Package name** = `@repo/plugin-web-statistics`. Parallels `plugin-web-ai-chat`, `plugin-web-tasks`, etc.
12. **Public surface** = `StatisticsModule` (component) + `statisticsWebModuleRegistration` (slot reg) + `RangeId` type + `RangeAggregate` type. Aggregators are internal.
13. **Insight copy** is a typed pure function `insightCopy(lang, vars) → string` in `src/internal/insightCopy.ts`. NO inline ternaries in component code.
14. **CSS** = port Statistics-relevant rules from `web design/layout.css` (KPI, bar-chart, hour-bar, line-chart, ringchart, habit-rank, heatmap, stats-insight) verbatim into `src/styles.css`, scoped under `.module-stats`. Side-effect imported via `src/index.ts`.

## Component graph

```
@repo/plugin-web-statistics (this row)
├── src/index.ts                       — public surface (StatisticsModule, statisticsWebModuleRegistration, RangeId, RangeAggregate)
├── src/StatisticsModule.tsx           — top-level composition, range tabs, useMemo over aggregators
├── src/KpiCard.tsx                    — single KPI cell (icon + label + value + unit + trend)
├── src/LineChart.tsx                  — SVG line chart with shaded area + dot markers
├── src/BarChart.tsx                   — vertical bar chart (focus tasks per bucket)
├── src/HourBar.tsx                    — 24-column hourly bar chart + peak glow + 3-step labels
├── src/RingChart.tsx                  — donut chart of habit emoji groups
├── src/HabitRank.tsx                  — top-5 habit leaderboard with streak flame
├── src/Heatmap.tsx                    — 26-week × 7-day deterministic heatmap
├── src/InsightCallout.tsx             — sparkle icon + h4 + p (uses insightCopy)
├── src/registration.tsx               — WebModuleSlotRegistration (consumed in P3)
├── src/styles.css                     — ported Statistics CSS rules
├── src/types.ts                       — public RangeId, RangeAggregate, KpiCellId types
├── src/internal/
│   ├── icons.tsx                      — inline SVGs (check, timer, pin, flame, sparkle, fire, chart)
│   ├── isPomodoroSession.ts           — narrows unknown → PomodoroSession (mode + durationMs + finishedAt)
│   ├── isHabitsStateRecord.ts         — narrows unknown → { habits, checkIns, diaries }
│   ├── isHabit.ts                     — narrows habit entry shape
│   ├── aggregators.ts                 — aggregateWeek/Month/All + computeKpis + hourDistribution + tagDistribution + habitRanking
│   ├── heatmapCells.ts                — pure function emitting 182 cells (26w × 7d)
│   ├── insightCopy.ts                 — pure (lang, vars) → string
│   ├── trendPercent.ts                — (current, prior) → string (+N%, -N%, "—")
│   ├── rangeWindow.ts                 — (range, now, weekStart) → { start, end, priorStart, priorEnd, labels[], bucketBoundaries[] }
│   └── colors.ts                      — ring chart color palette ('--accent', '--blue', '--amber', '--red', '--purple')
└── src/__tests__/
    ├── isPomodoroSession.test.ts
    ├── isHabitsStateRecord.test.ts
    ├── trendPercent.test.ts
    ├── rangeWindow.test.ts
    ├── aggregators.test.ts            — covers aggregateWeek/Month/All, computeKpis, hourDistribution, tagDistribution, habitRanking
    ├── heatmapCells.test.ts
    ├── insightCopy.test.ts
    ├── KpiCard.test.tsx
    ├── LineChart.test.tsx
    ├── BarChart.test.tsx
    ├── HourBar.test.tsx
    ├── RingChart.test.tsx
    ├── HabitRank.test.tsx
    ├── Heatmap.test.tsx
    ├── InsightCallout.test.tsx
    ├── StatisticsModule.test.tsx
    ├── registration.test.tsx
    └── index-barrel.test.ts
```

## Dependencies

| Dep | Kind | Why |
|---|---|---|
| `@repo/plugin-web-tokens` | dep | `useI18n(lang)` + `Lang` type |
| `@repo/plugin-web-storage` | dep | `usePref('xai_pomodoro_sessions' / 'xai_habits_state' / 'xai_pref_week_start')` |
| `@repo/xai-web-shell` | dep | `WebModuleSlotRegistration` + `useWebShell()` (lang source in module route) |
| `@repo/core` | indirect via tokens | type-only flow |
| `react`, `react-dom` | peerDep | components |
| `@testing-library/react`, `vitest`, `jsdom`, `@testing-library/jest-dom`, `@types/react`, `@types/react-dom`, `typescript`, `@repo/eslint-config`, `@repo/typescript-config` | devDep | sibling-W2 standard scaffolding |

NO dependency on `@repo/plugin-web-tasks`, `@repo/plugin-web-pomodoro`, `@repo/plugin-web-habits` runtime. NO dependency on `@repo/xai-web-event-bus` runtime emit/listen (the storage hook covers our live-update needs because `usePref` already subscribes to the `web:settings:preference-changed` channel internally).

## State machine

```
[ idle@week ] ── click "本月" ──► [ idle@month ]
[ idle@week ] ── click "全部" ──► [ idle@all ]
[ idle@*   ] ── storage event ──► [ idle@* ] (recompute via useMemo)
[ idle@*   ] ── lang change ──► [ idle@* ] (re-render labels only; data unchanged)
```

- `range` is the only React state in the top-level module (`useState<RangeId>('week')`).
- Source data + aggregates flow through `useMemo` keyed on `[range, pomodoroSessions, habitsState, weekStart]`.
- No subscriptions, no event-bus listeners, no timers.

## Aggregator data flow

```
                         ┌─ usePref('xai_pomodoro_sessions') ──┐
                         │                                       │
                         ├─ usePref('xai_habits_state')         │
StatisticsModule ───────►│                                       ├─► useMemo
                         ├─ usePref('xai_pref_week_start')      │
                         │                                       │
                         └─ range, lang                         ─┘
                                                                  │
                                                                  ▼
                                                       aggregators.ts (pure)
                                                                  │
                          ┌────────────┬─────────────┬────────────┴────────────┬─────────────┬───────────┬────────────┐
                          │            │             │                         │             │           │            │
                          ▼            ▼             ▼                         ▼             ▼           ▼            ▼
                       KPI cells    Line chart   Bar chart                  HourBar     Ring chart   HabitRank   Heatmap + InsightCallout
```

Each leaf consumes pre-computed slices of `RangeAggregate` (plus `heatmapCells` for the heatmap, plus `tagDistribution` for the ring chart, plus `habitRanking` for HabitRank). No leaf re-derives from raw sessions.

## Risks recap

R1 Tasks-source proxy, R2 empty-state guards, R3 heatmap thresholds, R4 insight null-peak, R5/R6 unknown-narrowing predicates, R7 no `any`, R8 trend divide-by-zero, R9 useMemo render, R10 heatmap perf, R11 shell anchor concurrency, R12 workspace dep concurrency. All in mitigation in discovery review §6.

## Out-of-scope (deferred)

- Real `web:tasks:completed` channel + a real Tasks completion log storage key.
- Tag-table-sourced ring chart.
- Chart-click drill-downs.
- CSV export.
- Insight history archive.
- Year-long heatmap.
- Persisted range selection.

---

## §SRA — Extension: Real Tasks-Completed Aggregation (retire pomodoro proxy)

> **APPEND-ONLY extension** of the SHIPPED row #20 design above. Authority:
> ADR-0010 §D4 carve-out `1ba5902`. Discovery:
> `docs/reviews/xai-web-statistics-real-aggregation/20260529-discovery-review.md`.
> Manifest: `docs/workflow/roadmap/xai-web-statistics-real-aggregation.md`.
> This section SUPERSEDES Frozen Assumption #2 ("Tasks completion data source =
> filtered focus session log") and the "Known Limitation" R1 — the proxy is
> RETIRED here.

### SRA.1 Decision header

| Field | Value |
|---|---|
| Selected Option | **Real `done`-count read** — add a 4th read key `xai_task_cols` via `usePref` + a LOCAL `narrowTaskCols` predicate + a pure `countDoneTasks(taskCols): number` aggregator; feed the "Tasks completed" KPI from the real `done===true` count; RETIRE the pomodoro-as-tasks proxy in `aggregateRange`; set `tasksTrend = "—"`. READ-ONLY on `xai_task_cols`. |
| Review Doc | `docs/reviews/xai-web-statistics-real-aggregation/20260529-discovery-review.md` |
| Review Date | 2026-05-29 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-statistics-real-aggregation.md` row #1 |
| Carve-out | `docs/reviews/_p0-carve-outs/20260529-statistics-real-aggregation.md` (commit `1ba5902`) |
| Authority Anchor | ADR-0010 §D4 (Accepted 2026-05-26) |
| Branch | `web` (NOT `dev`) |
| Status | NEEDS_REVIEW (plan only — no implementation code) |

### SRA.2 Frozen Assumptions (extension — supersede #2/R1)

1. **Tasks-completed source = `xai_task_cols`** (the SHIPPED key; T-10 made `TaskCard.done?: boolean` real). Proxy RETIRED.
2. **Read shape = `Record<BucketId, { tasks: TaskCard[]; completed?: TaskCard[] }>`**, registry default `{}`. Cards at `col.tasks` (+ optional `col.completed`), **NOT flattened** (RD2 guard). `done` absent/undefined === `false`.
3. **Metric = all-bucket `done===true` count** — **CURRENT-board, RANGE-INVARIANT**. `TaskCard` has NO completion timestamp; `date`/`dateZh` are display strings (not parseable ISO). Per-day/per-window completion CANNOT be honestly claimed (D-QT discipline). KPI shows the same number on week/month/all. Identical semantics to SHIPPED dashboard `StatTasks` (`taskStats.countDone().done`).
4. **`tasksTrend = "—"`** — no honest prior-window baseline for a timestamp-less current-state count. Retires the proxy's fabricated `+N%`.
5. **Surfaces = "Tasks completed" KPI (real count) + Tasks BarChart (honest single-total / current-bucket fill — NO fabricated time split; BarChart component NOT rewritten).** **(REVISED post-review B1 / Path 1):** BOTH surfaces carry a USER-VISIBLE "current board" / "当前看板" honesty marker so the range-invariant number is not misread as a per-range total on the range-tab page. KPI marker = new optional `KpiCard.subLabel` prop; BarChart marker = a muted sub-label in the panel header (`sc-head`, NOT the chart body). KPI-only stays a blessed fallback (OQ-B) if the honest BarChart fill proves awkward at build.
6. **Honest empty** = KPI shows `0` when the `done` total === 0 (no fabricated number). The "current board" marker still renders at `0` (an honest empty board is still "current board: 0").
7. **pomodoro metrics UNTOUCHED** — focus minutes / daily-avg / peak-hour / hour-distribution / heatmap / focus LineChart all stay derived from real `xai_pomodoro_sessions`. **habits aggregation UNTOUCHED** (already real).
8. **Read pattern** = `usePref("xai_task_cols")` + LOCAL `narrowTaskCols`, NEVER `import "@repo/plugin-web-tasks"`. Cross-module contract = registry key string.
9. **Selector re-implemented in-package** (dashboard's `countDone` is `internal/`, un-importable). ~10 LOC; justified duplication (RA1).
10. **READ-ONLY on `xai_task_cols`** — NO `setPref("xai_task_cols", …)` anywhere. Public surface UNCHANGED (`index.ts` exports unchanged; `narrowTaskCols` + `countDoneTasks` + the new `internal/strings.ts` all stay `internal/`).
11. **(REVISED post-review B1)** i18n / copy = **ZERO `plugin-web-tokens` edit; ≤2 NEW LOCAL bilingual STR strings** in `src/internal/strings.ts` (the "current board" marker), mirroring the SHIPPED dashboard `STR_WIDGET_EMPTY` (`stat_tasks_empty`) + `strEmpty(key,lang)` precedent. `statistics.tasks_completed` is still reused unchanged for the label; the metric VALUE is still numeric. The local-STR map is the project convention (tasks `STR_TASK_COMPOSER`, calendar `STR_EVENT_COMPOSER`, dashboard `STR_WIDGET_EMPTY`) and is NOT an i18n-bundle change.
12. **Zero edits to:** `packages/core/` (incl. `src/types/events.ts`), `@repo/plugin-web-tokens` (the i18n bundle — the local `internal/strings.ts` is NOT this), the storage registry (no new key), the host shell registration, the BarChart/LineChart/RingChart/Heatmap component **bodies** (the KPI marker is an additive `KpiCard.subLabel` prop on the KPI cell — not a chart; the BarChart marker is in the panel `<div>`, not the chart leaf), SHIPPED archives, ADRs, `dev` branch.

### SRA.3 Component / module graph (extension delta)

```
@repo/plugin-web-statistics  (EXTENSION — only the marked nodes change)
├── src/StatisticsModule.tsx          — ADD `const [rawTaskCols] = usePref("xai_task_cols");`
│                                        + `narrowTaskCols(rawTaskCols)` memo
│                                        + thread into the aggregateRange useMemo deps
│                                        + pass `subLabel={strStats("current_board", …)}` to the tasks KpiCard  (Path 1)
│                                        + render the SAME "current board" marker in the Tasks BarChart panel `sc-head`  (REC-1)
├── src/KpiCard.tsx          (EDIT)   — ADD optional `subLabel?: string` to KpiCardProps + render
│                                        a muted sub-label line; the 3 non-tasks call sites omit it
│                                        (additive; NOT a chart; NOT a rewrite — see discovery §3.5)
├── src/styles.css           (EDIT?)  — OPTIONAL `.kpi-sublabel` muted rule (or reuse `.muted`); no new token
├── src/internal/
│   ├── narrowTaskCols.ts   (NEW)      — unknown → Record<BucketId,{tasks;completed?}> predicate
│   │                                     (mirrors dashboard isTaskColsRecord; RD2 guard)
│   ├── countDoneTasks.ts   (NEW, or folded into aggregators.ts)
│   │                                     — pure (taskCols) → number (all-bucket done count)
│   ├── strings.ts          (NEW)      — LOCAL STR map `STR_STATS_TASKS = { current_board: {en,zh} }`
│   │                                     + `strStats(key,lang)`; ≤2 keys; mirrors dashboard STR_WIDGET_EMPTY;
│   │                                     @internal — NOT exported from index.ts (Path 1 / RA7)
│   └── aggregators.ts      (EDIT)     — aggregateRange gains a `taskCols` param;
│                                         RETIRE the L110-130 task-increment proxy;
│                                         kpis.tasksTotal = countDoneTasks(taskCols);
│                                         kpis.tasksTrend = "—";
│                                         taskBuckets = honest fill (Q3/OQ-C)
└── src/__tests__/
    ├── narrowTaskCols.test.ts  (NEW)  — AC-SRA-NARROW-1..N (mirror AC-RD-TASKS-1)
    ├── countDoneTasks.test.ts  (NEW)  — AC-SRA-TASKS-1..N (mirror AC-RD-TASKS-2..5)
    ├── KpiCard.test.tsx        (EDIT) — NEW K5: `subLabel` renders only when passed; K1..K4 stay green
    ├── aggregators.test.ts     (EDIT) — A14 replaced (real count, not session count);
    │                                     + tasksTrend "—" + no-mutation assertion
    └── StatisticsModule.test.tsx (EDIT) — S2 updated (real done count); + honest-zero
    │                                       + assert the "current board" marker renders on KPI + BarChart panel
```

Public `src/index.ts`, `src/registration.tsx`, and `src/types.ts` (the `StatisticsKpis`/`RangeAggregate` shapes are unchanged — only the VALUES feeding `tasksTotal`/`tasksTrend`/`taskBuckets` change) are **UNCHANGED**. The chart component **bodies** (BarChart/LineChart/RingChart/Heatmap) are **UNCHANGED**. **`KpiCard.tsx` gains ONE optional `subLabel?` prop (Path 1 / B1) — this supersedes the earlier "KPI JSX unchanged / no new prop" wording in SRA.5.** `index-barrel.test.ts` still asserts the SAME export set (the new `internal/strings.ts` is NOT exported).

### SRA.4 Dependencies (extension delta)

| Dep | Kind | Why |
|---|---|---|
| `@repo/plugin-web-storage` | existing dep | ADD `usePref("xai_task_cols")` read (4th key — read-only). |

NO new dependency. Explicitly NOT depending on `@repo/plugin-web-tasks` (read its registry key, never its package).

### SRA.5 Data-flow delta

```
                  ┌─ usePref('xai_pomodoro_sessions') ─┐   (UNCHANGED — pomodoro metrics)
                  ├─ usePref('xai_habits_state')       │   (UNCHANGED — habits metrics)
StatisticsModule ►├─ usePref('xai_pref_week_start')    ├─► useMemo ─► aggregateRange(...)
                  ├─ usePref('xai_task_cols')  (NEW)   │              │
                  └─ range, lang                        ┘              ├─ countDoneTasks(taskCols) ─► kpis.tasksTotal (REAL)
                                                                       ├─ kpis.tasksTrend = "—"
                                                                       └─ taskBuckets = honest fill (no fake time split)

  + strStats("current_board", lang) ──► KpiCard subLabel (tasks)  +  Tasks BarChart panel sc-head   (Path 1 / REC-1)
```

The Tasks KPI + Tasks BarChart now reflect the real board AND carry a user-visible "current board" marker; the focus LineChart, HourBar, RingChart, HabitRank, Heatmap, and InsightCallout are byte-for-byte unaffected.

**REC-2 (doc-sync, build-time):** the build MUST update BOTH the live `src/types.ts:23` `StatisticsKpis.tasksTotal` JSDoc AND the `api.md §1` line 51 — currently both say "Total focus sessions … (proxy for tasks completed)". New text: "real count of `done` cards across all `xai_task_cols` buckets (current board, range-invariant)". This is not only a doc-prose change in SRA.5; it touches the published `types.ts` JSDoc the consumer sees.

### SRA.6 Risks recap (extension)

RA1 logic duplication (justified), RA2 read-shape (predicate + RD2 tests), RA3 accidental mutation (read-only + grep gate + identity assertion), RA4 pomodoro/habits regression (surgical edit + existing tests green), RA5 window dishonesty (range-invariant + "—" + **user-visible "current board" marker** — Path 1), RA6 BarChart fabrication (honest fill, no time split, **panel marker frames it**), RA7 copy (**≤2 LOCAL STR via `internal/strings.ts`; ZERO `plugin-web-tokens` edit** — dashboard `STR_WIDGET_EMPTY` precedent), RA8 signature ripple (callers updated same phase), **RA9 `KpiCard.subLabel` prop addition (optional; 3 non-tasks cells omit it + new K5 test — additive, not a rewrite)**. Full table: discovery §6.1.

### SRA.7 Out-of-scope (deferred — extension)

- Reading `xai_calendar_events` for a calendar/event stat (discovery Q1 — additive later row).
- A real `web:tasks:completed` event channel or a `xai_tasks_completed_log` with completion timestamps (would enable honest per-window completion — separate future row; would relax SRA.2#3/#4).
- Any change to pomodoro/habits aggregation, chart component bodies, or persisted range selection.
