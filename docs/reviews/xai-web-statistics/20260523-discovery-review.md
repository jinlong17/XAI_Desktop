# Discovery Review — xai-web-statistics

> Roadmap row #20 · Wave W3 · Parallel-Agent dispatch 2026-05-23 alongside W2d batch (board-core #7 + dashboard-grid #10).
> Source PRD: `web design/DESIGN.md` §4.11 (Statistics)
> Source code: `web design/module-statistics.jsx` (320 LOC)
> Authority: SUPERSEDES prior PRDs where they conflict (user override 2026-05-23). SUPERSEDES web-ticktick-parity `web-statistics-views`.
> ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map "module-statistics.jsx" → `packages/plugin-web-statistics/`) + §S5 (JSX→TSX) + §S6 (Vite SPA) + §S7 (no statistics emit channel — read-only aggregator) + §S8 (no new storage keys — reads existing module keys via `@repo/plugin-web-storage`).

## 1. Problem framing

Statistics is the **aggregator** in the Web Console: a read-only module that consumes the three productivity data sources — `xai-web-tasks` (#6, READY_TO_SHIP), `xai-web-pomodoro` (#14, READY_TO_SHIP), `xai-web-habits` (#15, READY_TO_SHIP) — and renders seven visualizations + a dynamic bilingual insight callout, all gated by a three-tab range selector (本周/本月/全部).

The artifact `module-statistics.jsx` ships a hard-coded `SERIES` constant for the three ranges, plus three more hard-coded arrays (`HOUR_DIST`, `TAG_PCTS`, `HABIT_SCORES`) and a `Heatmap` that calls `Math.random()` inside `useMemo`. The port must **(a)** replace those mocks with deterministic derivations from real storage state, **(b)** keep the same eight visual slots, and **(c)** add nothing to `@repo/core` (no new events, no new storage keys, no new type exports).

Hard constraints (verbatim from the seed brief):

1. Reads via `@repo/plugin-web-storage` + `@repo/xai-web-event-bus` ONLY — NO direct imports of `plugin-web-tasks`/`plugin-web-pomodoro`/`plugin-web-habits` internals.
2. Charts deterministic from the same source data (no random sampling).
3. Insight copy bilingual (template strings interpolated, not concatenated).
4. Heatmap covers exactly 26 weeks (half year).
5. Bilingual via `useI18n`.
6. Module registers via `@repo/xai-web-shell` slot pattern.
7. Each phase = one commit. Lint MUST be clean.

## 2. Decomposition — the seven critical defining calls

The seed asks "port the Statistics module"; the eight rendered cells in the artifact each force a defining call. Decomposition surfaces them so each is decided up-front and never re-litigated mid-build.

### C1 — Where do the consumed data tables come from?

Three sources exist for each upstream module:

- **Their barrel `index.ts`** (e.g. `@repo/plugin-web-tasks`) — exports the React component + types + `WebModuleSlotRegistration` only. Tasks barrel exposes types `TaskCard`, `TaskCol`, `BucketId`, `TaskTagId`, `TaskTitleBundle`. Pomodoro exposes types `PomodoroSession`, `PomodoroMode` + `DEFAULT_DURATIONS_MS`. Habits exposes types `Habit`, `HabitId`, `HabitsState`, `DateKey`, `MonthKey`, `WeekStart` + `HABITS_STORAGE_KEY`.
- **Their persisted localStorage key via `@repo/plugin-web-storage`**: `xai_task_cols` (TaskColsState, owner xai-web-tasks), `xai_pomodoro_sessions` (`PomodoroSession[]`, proposed:true, owner xai-web-pomodoro), `xai_habits_state` (`HabitsStateBlob`, owner xai-web-habits).
- **Their typed event channel via `@repo/xai-web-event-bus`**: `web:pomodoro:session-finished` (mode + durationMs + finishedAt), `web:habits:checkin-recorded` (habitId + date + streak + recordedAt). Tasks has NO `web:tasks:completed` channel in `@repo/core` (verified by grep — events.ts only declares pomodoro + habits + shell + settings + matrix in the web:* family).

**Option A — read from persisted prefs only.** `usePref('xai_pomodoro_sessions')` + `usePref('xai_habits_state')` + `usePref('xai_task_cols')`. Charts recompute on prefs change because `usePref` auto-subscribes to the `web:settings:preference-changed` channel (verified in `plugin-web-storage` internals). Zero event-bus surface needed.
- Pros: single source of truth (the persisted state), no race between event + storage write, sibling-W2 precedent (matrix #13 reads `xai_matrix_state` the same way).
- Cons: `xai_task_cols` is a `Record<string,boolean>` — it's a column-collapse map, NOT a list of completed tasks. The artifact's `tasks` series IS task completions per day/week/month, not column visibility. The persisted shape for tasks completion data is currently NOT in any registered storage key.

**Option B — read prefs + subscribe to events for live nudges.** Add `useWebEventListener('web:pomodoro:session-finished', ...)` and `useWebEventListener('web:habits:checkin-recorded', ...)` that bump a local re-render counter. Read-through is still `usePref`; the event is purely a no-stale guard.
- Pros: covers the (unlikely but real) case where another window emits but the writer's `storage` event hasn't fired yet.
- Cons: redundant under Option A because `usePref` already re-renders on the storage event. The events are advisory, not the source.

**Option C — synthesize task completions from a derived view.** Define a pure function in `internal/aggregators.ts` that reads the tasks state and counts cards with the "completed" semantic. Tasks data is NOT in `xai_task_cols` — it's NOT in storage at all in the shipped contract. Tasks module today persists ONLY the column-collapse map. So Option C requires either (1) a new storage key (out of scope per Frozen Assumption 1) or (2) reading from a (currently non-existent) `xai_tasks_cards` key.

**Decision: Option A with a measured Tasks fallback.** Read pomodoro + habits via `usePref`. For Tasks completions, the brief's seed says "consume task completion data via `usePref('xai_task_cols')` OR via a `web:tasks:completed` event channel if added". Both are gated:

- The storage key `xai_task_cols` is column-collapse state — it does NOT carry completion counts. We will NOT misuse it.
- A `web:tasks:completed` channel does not exist in `@repo/core` and adding one is out of scope (Frozen Assumption 1).

So the **frozen approach** is: derive the "tasks completed" KPI + bar chart from the **pomodoro session log filtered by `mode === 'focus'`**, treating each completed focus session as a productivity unit. The artifact's separate `tasks` and `focus` series collapse into two views over the SAME persisted log (count vs minutes), which is honest: with no Tasks completion log in the registry yet, the chart shows what we *have* — focus session counts per bucket. The KPI label remains "Tasks completed" / "完成任务" per i18n; the data-source caveat is recorded in a JSDoc on the aggregator so a future row #6-extension can swap to a real `xai_tasks_completed_log` without touching the chart. (Frozen Assumption 2 below.)

This is documented as a **Known Limitation** in api.md §0 and a R1 in §7 of this review.

### C2 — Range tab semantics under deterministic aggregation

The artifact's `SERIES` hard-codes labels per range. For real data we need three explicit aggregators:

- `aggregateWeek(sessions, habitsState, now)` → 7 daily buckets, Mon..Sun (or Sun..Sat per `xai_pref_week_start`)
- `aggregateMonth(sessions, habitsState, now)` → 4 weekly buckets, W1..W4
- `aggregateAll(sessions, habitsState, now)` → 5 monthly buckets, most recent 5 months ending in `now`

All three return the SAME `RangeAggregate` shape: `{ labels: string[], focusBuckets: number[] (minutes), taskBuckets: number[] (counts), kpi: { tasksTotal, focusMinutesTotal, habitsKeptFraction, dailyAvgMinutes, tasksTrendPct, focusTrendPct, habitsKeptStr, avgTrendPct } }`.

Trend % is computed by comparing the current window's total to the **same-length previous window** (e.g. this-week vs last-week). When the prior window has zero data, trend is `"—"` (em-dash), not `"+0%"`, to avoid lying about a 0→N spike.

The week-start day is read from `usePref('xai_pref_week_start')` (0 = Sunday, 1 = Monday). Default 0 matches the registry default. This is the single shared interpretation point across all three aggregators.

### C3 — 24-hour productivity bars (`HOUR_DIST`)

The artifact hard-codes `[0,0,0,0,0,0,5,12,22,34,45,38,20,18,30,42,36,24,14,28,22,12,6,2]`. Real derivation: group `sessions.filter(s => s.mode === 'focus')` by `new Date(finishedAt).getHours()`, sum `durationMs`, then convert to minutes. Output is `number[24]`.

Peak hour = `data.indexOf(Math.max(...data))`. If all-zeros (no focus sessions yet), peak is `null` and the bar chart renders a neutral "—" overlay (no peak glow), with the badge replaced by an empty-state caption. (R2)

### C4 — Tag distribution ring chart

The artifact reads `MOCK.tags` (5 tags) + a hard-coded `TAG_PCTS = [38, 22, 18, 12, 10]`. There is **no `MOCK` in the production runtime** — no global, no shared tag table. Tasks does export `TaskTagId` but the runtime tag list is not yet persisted in a registry key.

**Decision: derive tag distribution from `xai_habits_state.habits[*].emoji` grouping.** Each habit has an emoji; group habits by emoji, count check-ins in the active range, render top 5. Label = emoji + habit `title[lang]` of the first habit in that group. Color rotates through `--accent`, `--blue`, `--amber`, `--red`, `--purple` (already defined in tokens.css). This keeps the ring chart honest with real data without inventing a tag table.

If habits state has <5 distinct emoji groups, the chart renders only the present groups + a "no more data" legend row.

### C5 — Habit leaderboard (Top 5 + streak)

The artifact uses hard-coded `HABIT_SCORES`. Real derivation: from `xai_habits_state`, compute for each habit the active-range check-in count divided by the number of qualifying days in the range (Mon..Sun for "week", first-day-of-month..today for "month", earliest-checkin..today for "all"). Streak comes straight from `habits[i].streak` if present, else computed by counting backwards from today through consecutive checkIn keys.

Sort descending by percent, take top 5. Bar fill = `percent + "%"`. Streak label = `<flame icon> {streak}d`.

### C6 — Heatmap deterministic generation

The artifact's heatmap is `Math.random()` inside `useMemo`. The constraint forbids random sampling.

**Decision: derive heatmap cells from focus sessions, exactly 26 weeks × 7 days = 182 cells.** For each cell, compute `minutes = sum of pomodoro focus durations on that UTC day key`. Map to bucket levels via fixed thresholds:

```
level 0 = 0
level 1 = 1..15 min
level 2 = 16..45 min
level 3 = 46..90 min
level 4 = 91+ min
```

These thresholds are tuned so a single focus session (default 25 min) lands at level 2, three sessions land at level 3, six+ sessions land at level 4. If sessions are sparse, most cells are level 0 — this is honest. R3 in §7 records the threshold choice.

Cell order: column-major, 26 weeks from oldest to newest, weekday rows Sun..Sat (or Mon..Sun per `xai_pref_week_start`). The first column = the Sun/Mon 26 weeks before `now`; the last column = the current partial week.

### C7 — Insight callout copy (bilingual, template-interpolated)

The artifact uses raw string concatenation:

```js
lang==="zh"
  ? `你在 ${peakHourLabel} 左右最高产，专注时长比上周多 ${series.kpi.focus_trend}。继续保持上午的节奏。`
  : `You're sharpest around ${peakHourLabel}, and your focus time is ${series.kpi.focus_trend} vs last period. Keep the morning rhythm.`
```

The constraint says "template strings interpolated, not concatenated". The artifact already uses template literals (no `+`), but the *constraint* is stronger: the strings themselves come from a typed `insightCopy(lang, vars)` pure function so future locales can be added by extending the function, not by scattering ternaries. Vars: `{ peakHourLabel, focusTrendPct, range }`. Range is one of `'week' | 'month' | 'all'` so the closing sentence can be range-aware ("Keep the morning rhythm" for week, "节奏稳定" for month-or-all in Chinese).

When there are no focus sessions, `peakHourLabel` is `null` and the function returns a friendly empty-state copy instead. (R4)

## 3. Architecture decision (the defining call rolled up)

**Selected Option: aggregator package `@repo/plugin-web-statistics` reading three persisted prefs + zero event bus emissions.**

- Read sources: `usePref('xai_pomodoro_sessions')`, `usePref('xai_habits_state')`, `usePref('xai_pref_week_start')`. NO direct imports of sibling internals.
- Tasks completions are derived from the focus session log per C1 frozen decision.
- All aggregation logic in `src/internal/aggregators.ts` — pure functions taking `(sessions, habitsState, weekStart, now) → RangeAggregate`. Zero React inside.
- Components consume aggregators via `useMemo`. React layer is render-only.
- No `web:statistics:*` channel exported (matches the read-only aggregator role).
- Heatmap thresholds, hour-bucket math, range cutoffs, trend calculator, and insight copy all live in pure functions with deterministic tests.

Rationale: this is the minimal-surface choice. We add NO new storage keys, NO new event channels, NO `@repo/core` edits, NO API surface beyond the module component. The "feature" is a UI projection of state that already exists. Cross-vendor risk is low because the rendering tech is the same SVG/Canvas as sibling charts in dashboard/habits.

Alternative considered:

- **Option α — extend `@repo/core` with a `web:tasks:completed` event channel + a new `xai_tasks_completed_log` storage key.** Adds two surfaces, requires coordinating with row #6 (Tasks) for the emit-side, blocks if Tasks is not yet edited. Not chosen because it violates the seed's "Hard constraints" #1 ("No direct imports of plugin-web-tasks internals") only in spirit — the hard constraint allows reading via storage/event-bus — but it ADDS a new surface, which violates the W2d concurrency rule "Writes scoped to packages/xai-web-statistics/ + docs/reviews/xai-web-statistics/ + shared anchor edits in shellRegistrations.tsx + apps/web/package.json ONLY". Adding to `@repo/core` is out of scope. Deferred to a future row.
- **Option β — render mocks 1:1 from the artifact's hard-coded arrays.** Trivially passes "no random sampling" but fails "real data from Tasks/Pomodoro/Habits" acceptance signal. Not chosen.

## 4. Out-of-scope (deferred)

- Real `web:tasks:completed` channel + `xai_tasks_completed_log` storage key (future row that extends #6 Tasks).
- "Top tags" data sourced from a real Tasks tag table (no tag table is persisted today — the ring chart sources from habit emojis instead, see C4).
- Click-into-detail interactions on chart segments (artifact has none either).
- CSV export of the displayed aggregates.
- "Last week's insight" history archive (only the current-range insight is shown).
- Year-long heatmap (26 weeks is fixed by the brief).

## 5. External research

**No external research required.** The feature is pure UI-over-existing-state with no library selection or external dependency decision. Charts use inline SVG + plain CSS, matching the eight sibling packages already shipped (pomodoro, habits, ai-chat, matrix, etc.). React 19, Vite, vitest, jsdom — all sibling-W2 defaults.

## 6. Risks

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Tasks data source: no `xai_tasks_completed_log` key exists; using focus sessions as a proxy may surprise users. | Medium | Document in api.md §0 Known Limitations + add a JSDoc note on `aggregateTasksFromSessions` so a future row can swap to a real Tasks log without touching the chart. |
| R2 | Empty state when pomodoro/habits have no entries — naive `Math.max([])` returns `-Infinity`. | High → Low after mitigation | Aggregators use `data.length === 0 ? null : Math.max(...data)` guards; KPI cards render "—" trend, bar charts render an empty-state caption, peak glow disabled. Tests E1..E4. |
| R3 | Heatmap thresholds (15/45/90 min) are subjective. | Low | Documented in C6 with reasoning (single 25-min session → level 2; six+ sessions → level 4). Frozen for v1; can be revisited in a later row. |
| R4 | Insight copy with `peakHourLabel === null` — concatenation would print "around null". | Medium | `insightCopy()` is a pure function with a `null`-peak branch returning a bilingual empty-state line. Test cases I1..I5. |
| R5 | `xai_pomodoro_sessions` is `PrefEntry<unknown[]>` (registry stores as `unknown`) — at the boundary the array elements aren't typed. | Medium | Add `isPomodoroSession` predicate in `internal/` that narrows each item before aggregation; non-conforming items are silently dropped. Test cases V1..V6. |
| R6 | `xai_habits_state` is `unknown` at registry boundary. | Medium | Add `isHabitsStateRecord` predicate. Default fallback returns `{ habits: [], checkIns: {}, diaries: {} }`. Test cases V7..V12. |
| R7 | Lint rule `@typescript-eslint/no-explicit-any: error` will reject any `as any` boundary cast. | Low | All predicates take `unknown` and return typed values; no `any` used. |
| R8 | Range trend % when prior window is empty (division by 0). | Medium | Trend calculator returns the em-dash string `"—"` when prior is 0, NOT `"+Infinity%"` or `"+0%"`. Test cases T1..T6. |
| R9 | `usePref` re-render storm if pomodoro emits many sessions in a row. | Low | `useMemo` over `[range, pomodoroSessions, habitsState, weekStart]` ensures recomputation runs only when one input changes; sibling-W2 pattern. |
| R10 | Heatmap 182 DOM nodes — touch-scroll perf on mobile / Safari. | Low | Pure `<div>` with CSS background — same approach as pomodoro #14's session ribbon; verified to scroll smoothly on 6.7" iPhone via sibling testing. |
| R11 | Shell registration line conflict with sibling W2d rows #7 (board) + #10 (dashboard) editing the same `shellRegistrations.tsx`. | Medium | Each row owns a single distinct `placeholder("…", …)` line. Statistics replaces line 64 (`placeholder("statistics", "Statistics", "chart", 11)`). Board #7 owns line 56 (`placeholder("board", …)`). Dashboard #10 owns line 57 (`placeholder("dashboard", …)`). Anchors do not overlap. Auto-build retry-on-`git index.lock` (8–20s × 5) per concurrency rule. |
| R12 | `apps/web/package.json` workspace dep addition can race with sibling W2d rows. | Low | Each row adds its own unique line `"@repo/plugin-web-statistics": "workspace:*"`. JSON merge is line-deterministic; lock retry handles contention. |

## 7. Acceptance signal (recap from seed brief)

> Statistics renders with real data from Tasks/Pomodoro/Habits, range tabs recalc all 7 visualizations, peak bar highlights correctly, insight copy reads naturally in both languages, and the heatmap covers half a year.

Concretely:

- 3 range tabs (本周 / 本月 / 全部) switch the source aggregate without unmount.
- 4 KPI cards display real totals + trend % derived from `aggregate*` functions; empty-state shows em-dash `—`.
- Focus-duration line chart renders with shaded area + dot markers using `LineChart` ported from the artifact.
- 24-hour bar chart renders 24 columns; peak column has `.peak` class with glow.
- Ring chart renders up to 5 emoji-grouped habit segments + legend.
- Habit leaderboard top 5 with `<bar fill>` and `<fire>` streak.
- Half-year focus heatmap: 26 weeks × 7 days = 182 cells, level 0..4 by minute-threshold.
- Insight callout: `insightCopy(lang, vars)` template returns the bilingual line.
- Module registers via `statisticsWebModuleRegistration` consumed by `apps/web/src/routes/modules/shellRegistrations.tsx`.
- `pnpm --filter @repo/plugin-web-statistics lint typecheck test` all exit 0.

## 8. Open questions (to resolve in feature-review)

1. **Q1 — Should `aggregateTasksFromSessions` round focus minutes to whole task units, or count sessions directly?** Recommendation: count sessions directly (1 focus session = 1 "task"), so the KPI is the same unit as the bar chart. If reviewer prefers minutes/25, capture rationale and update.
2. **Q2 — Heatmap weekday axis: Sun..Sat (US default) or Mon..Sun (CN default)?** Recommendation: respect `xai_pref_week_start` (0 = Sun, 1 = Mon) just like the rest of the app does. Default 0.
3. **Q3 — Should the insight callout be hidden when there's no data, or show a "start a focus session to see your insight" empty-state line?** Recommendation: show the empty-state line; never hide the panel (keeps grid layout stable).
4. **Q4 — Trend window for "all-time": current 5-month total vs prior 5-month total, OR most-recent month vs prior month?** Recommendation: prior-window-same-length (5m vs 5m) for consistency with week/month. Reviewer may override.
5. **Q5 — Tag chart fallback when habits has 0 emoji groups?** Recommendation: render a single neutral "no tag data" legend row, no ring chart. Reviewer may pick alternative.

These five questions are flagged for feature-review; defaults are documented as Frozen Assumptions below.

## 9. Frozen Assumptions (default decisions until reviewer overrides)

1. **No `@repo/core` edits in this row.** No new EventMap entries, no new types, no new storage keys.
2. **Tasks completion data source = filtered focus session log.** `sessions.filter(s => s.mode === 'focus')`. Documented Known Limitation. JSDoc on aggregator allows future row to swap source.
3. **No `web:statistics:*` event channel.** Statistics is a read-only sink.
4. **Range = `'week' | 'month' | 'all'` literal union.** Default `'week'` on first mount. Selected range is NOT persisted in v1 (matches artifact). Future row may add `xai_pref_stats_range`.
5. **Heatmap thresholds** = `0 / 1–15 / 16–45 / 46–90 / 91+` minutes. Frozen for v1.
6. **Trend % rule** = compare current window to prior-window-same-length. Empty-prior returns em-dash `"—"`. Positive prefix `+`, negative prefix `-`.
7. **Empty state** = chart panels stay rendered; KPI shows `—`; insight shows empty-state copy.
8. **Charts re-render on `xai_pref_week_start` change.** Aggregators take week-start as a parameter.
9. **Ring chart source** = habit emoji grouping. NOT a tag table (no tag table exists in storage today).
10. **Module slug** = `"statistics"` (matches existing `RailItemId` literal + i18n nav key + existing placeholder line).
11. **Package name** = `@repo/plugin-web-statistics` (matches `plugin-web-*` runtime naming, parallels `plugin-web-ai-chat`, `plugin-web-tasks`, etc.). Roadmap row #20 slug is `xai-web-statistics`; runtime npm-style package name is `@repo/plugin-web-statistics` per ADR-0007 §S4 port-map convention.
12. **Public surface** = `StatisticsModule` (component) + `statisticsWebModuleRegistration` (slot reg) + `RangeId` type + `RangeAggregate` type. NO aggregator exports (internal).
13. **Insight copy is a typed pure function** `insightCopy(lang, vars) → string` in `src/internal/insightCopy.ts`. NO inline ternaries in component code.
14. **CSS** = port `web design/layout.css` Statistics-relevant rules (KPI, bar-chart, hour-bar, line-chart, ringchart, habit-rank, heatmap, stats-insight). Verbatim port + scoped to `.module-stats`. Side-effect imported via `src/styles.css`.

## 10. Recommendation

Proceed with the architecture decided in §3 and the Phase Plan in `packages/xai-web-statistics/docs/dev_log.md`. The risks above are all in mitigation. Five questions are tagged for reviewer; defaults documented as Frozen Assumptions.

---

### Concurrent siblings (W2d wave)

- **#7 xai-web-board-core** — IN_PROGRESS. Writes: `packages/plugin-web-board-core/` + line 56 in `shellRegistrations.tsx` + workspace dep in `apps/web/package.json` + PLUGIN_MAP row.
- **#10 xai-web-dashboard-grid** — IN_PROGRESS. Writes: `packages/plugin-web-dashboard-grid/` + line 57 in `shellRegistrations.tsx` + workspace dep + PLUGIN_MAP row.

Write-scope disjoint with this row (statistics owns line 64 `placeholder("statistics", …)`). Lock-retry strategy from countdown row #17 applies on any `git index.lock` contention.
