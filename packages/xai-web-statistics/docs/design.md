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
