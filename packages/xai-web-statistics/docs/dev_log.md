# Dev Log — xai-web-statistics

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-statistics |
| Title | Web Console Statistics Module — read-only aggregator over `xai_pomodoro_sessions` + `xai_habits_state` + `xai_pref_week_start`; range tabs (本周/本月/全部); 4 KPI cards with trend %; focus-duration line chart + shaded area; 24-hour productivity bars + peak auto-highlight + glow; emoji-grouped habit ring chart; top-5 habit ranking + streak flame; deterministic half-year focus heatmap (26w × 7d) with fixed 0/15/45/90/91+ minute thresholds; bilingual weekly-insight callout via typed `insightCopy(lang, vars)` pure function. NO `@repo/core` edits; NO event emit; NO new storage keys. |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-build (or feature-auto-build for the full pass) |
| Verify Cross-vendor | queued for ship-time (Codex/Cursor per W3 manifest header — ring chart `stroke-dasharray` parity + heatmap `color-mix` + reduced-motion bar transitions) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W3 dispatch concurrent with W2d batch siblings #7 board-core + #10 dashboard-grid) |
| Executor | Claude Opus 4.7 1M (feature-review, 2026-05-23) |
| Updated | 2026-05-23 11:30 |
| Dispatched By | xai-roadmap-loop (W3 parallel dispatch alongside W2d) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #20 (W3 · Aggregator) |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port map "module-statistics.jsx" → `packages/plugin-web-statistics/`) + §S5 (JSX→TSX rules) + §S6 (Vite SPA) + §S7 (no `web:statistics:*` channel — read-only aggregator) + §S8 (no new storage keys — reads `xai_pomodoro_sessions` / `xai_habits_state` / `xai_pref_week_start`) |
| Concurrent Siblings | #7 xai-web-board-core (IN_PROGRESS, W2d) · #10 xai-web-dashboard-grid (IN_PROGRESS, W2d) — write-scope-disjoint |
| Write Scope | **planning phase**: `packages/xai-web-statistics/docs/` + `docs/reviews/xai-web-statistics/` ONLY. **build phase (later)** extends to `packages/plugin-web-statistics/` (new package) + a single-line edit on line 64 of `apps/web/src/routes/modules/shellRegistrations.tsx` (the `placeholder("statistics", "Statistics", "chart", 11)` line) + a one-line workspace dep addition in `apps/web/package.json` + a single row update in `docs/PLUGIN_MAP.md` |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-statistics/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-statistics/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-statistics/docs/design.md`
- API contract: `packages/xai-web-statistics/docs/api.md`
- Test strategy: `packages/xai-web-statistics/docs/test.md`

## Decision Headline

Port `web design/module-statistics.jsx` (320 LOC) + the Statistics section of `web design/layout.css` into a typed Vite+React 19 package `@repo/plugin-web-statistics`.

**The defining call** — *where does Tasks-completion data come from without violating the read-only / no-core-edit constraint?* — is decided as **"derive from the pomodoro focus session log"**: `xai_pomodoro_sessions.filter(s => s.mode === 'focus')` is the proxy. The KPI label remains "Tasks completed" / "完成任务" per i18n (already shipped in `@repo/plugin-web-tokens`); a JSDoc on `aggregateTasksFromSessions` permits a future row to swap the source without touching the chart layer. Documented as a Known Limitation in `api.md` §0.

All chart data flows through pure aggregator functions in `src/internal/aggregators.ts` keyed on `[range, sessions, habitsState, weekStart, now]`. **Heatmap is fully deterministic** — `Math.random` is forbidden, replaced by minute-threshold bucketing (0 / 1–15 / 16–45 / 46–90 / 91+).

**Insight copy** is a typed pure function `insightCopy(lang, vars) → string` with three range-aware bilingual templates and an empty-state path when `peakHourLabel === null`. NO `+` concatenation in component code.

**No `@repo/core` source edits.** No new EventMap entries, no new storage keys, no new types. Statistics is a pure read-only sink — no `web:statistics:*` channel exists or will be added.

**Concurrency with sibling W2d rows #7 and #10** is write-scope disjoint:
- statistics edits line 64 of `shellRegistrations.tsx` (`placeholder("statistics", ...)`)
- board-core (#7) edits line 56 (`placeholder("board", ...)`)
- dashboard-grid (#10) edits line 57 (`placeholder("dashboard", ...)`)
The `apps/web/package.json` workspace-dep list edit is single-line-per-row. Auto-build retry-on-`git index.lock` (8–20s × 5) per concurrency rule from countdown row #17.

## Phase Plan (3 phases — per seed brief default)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run".
> `feature-auto-build` walks the same plan but does ALL phases without a stop.

### Phase P1 — Package scaffolding + pure layer (predicates + aggregators + heatmap + insightCopy + trendPercent + rangeWindow)

**Scope**

1. **Create runtime package** at `packages/plugin-web-statistics/`:
   - `package.json` (name `@repo/plugin-web-statistics`, deps per api.md §13)
   - `tsconfig.json` (extends `@repo/typescript-config/react-library.json`)
   - `manifest.json` (`status: "In-Dev"`, `type: "ui"`, `owner: "xai-web-statistics row #20"`)
   - `vitest.config.ts` (jsdom; setupFiles loads `vitest.setup.ts`; include `src/__tests__/**/*.{test,spec}.{ts,tsx}`)
   - `vitest.setup.ts` (`localStorage.clear()` afterEach + `@testing-library/jest-dom` import)
   - `eslint.config.js` (extends `@repo/eslint-config/react-internal` + `@typescript-eslint/no-explicit-any: error`)
2. **Public types** in `src/types.ts`: `RangeId`, `KpiCellId`, `StatisticsKpis`, `HeatmapCell`, `RangeAggregate` per api.md §1.
3. **Internal pure modules** in `src/internal/`:
   - `isPomodoroSession.ts` — predicate narrowing `unknown` → `PomodoroSession`
   - `isHabitsStateRecord.ts` — predicate narrowing `unknown` → `HabitsStateRecord`
   - `isHabit.ts` — predicate narrowing
   - `trendPercent.ts` — pure (current, prior) → string
   - `rangeWindow.ts` — pure (range, now, weekStart, lang) → window object with labels[] + bucketBoundaries[]
   - `aggregators.ts` — `aggregateWeek/Month/All` + `computeKpis` + `hourDistribution` + `peakHour` + `tagDistribution` + `habitRanking` per api.md §5
   - `heatmapCells.ts` — pure (sessions, weekStart, now) → `HeatmapCell[182]`
   - `insightCopy.ts` — pure (lang, vars) → string
   - `colors.ts` — palette constant
   - `icons.tsx` — inline SVGs (check, timer, pin, flame, sparkle, fire, chart)
4. **Public surface (P1 subset)** in `src/index.ts` per api.md §0 — exports the types only. `StatisticsModule` placeholder lands in P2; `statisticsWebModuleRegistration` lands in P3.
5. **Tests (P1 subset per test.md §3 pure layer)**:
   - `isPomodoroSession.test.ts` (V1..V6)
   - `isHabitsStateRecord.test.ts` (V7..V12)
   - `trendPercent.test.ts` (T1..T8)
   - `rangeWindow.test.ts` (W1..W12)
   - `aggregators.test.ts` (A1..A20)
   - `heatmapCells.test.ts` (H1..H8)
   - `insightCopy.test.ts` (I1..I8)
   - `index-barrel.test.ts` (IB1..IB2 — exports limited to types in P1)

**Acceptance**
- `pnpm --filter @repo/plugin-web-statistics lint` exits 0 (`--max-warnings 0`).
- `pnpm --filter @repo/plugin-web-statistics test` exits 0; all P1 tests pass.
- `pnpm --filter @repo/plugin-web-statistics typecheck` exits 0.
- Commit: `feat(plugin-web-statistics): P1 scaffolding + pure aggregator layer (W3 row #20)`.

### Phase P2 — Components + `StatisticsModule` composition + CSS

**Scope**

1. **Components** in `src/`:
   - `KpiCard.tsx` (props per api.md §7)
   - `LineChart.tsx` (SVG with shaded area + dot markers, ported from module-statistics.jsx LineChart)
   - `BarChart.tsx` (vertical bars, ported)
   - `HourBar.tsx` (24 columns + peak glow class, ported)
   - `RingChart.tsx` (donut, ported)
   - `HabitRank.tsx` (top-5 leaderboard with streak flame)
   - `Heatmap.tsx` (renders pre-computed cells)
   - `InsightCallout.tsx` (sparkle icon + h4 + p)
   - `StatisticsModule.tsx` (top-level composition; reads `usePref` x3; useMemo over aggregators; range tabs; passes pre-computed data to leaves)
2. **CSS** in `src/styles.css` — port Statistics-relevant rules from `web design/layout.css` (`.stats-grid`, `.kpi-row`, `.kpi`, `.kpi-ico`, `.kpi-label`, `.kpi-val`, `.kpi-trend`, `.stats-chart`, `.sc-head`, `.bar-chart`, `.bar-col`, `.bar-track`, `.bar-fill`, `.bar-label`, `.hour-bar`, `.hbar-col`, `.hbar-col.peak`, `.hbar-track`, `.hbar-fill`, `.line-chart`, `.lc-labels`, `.stats-donut`, `.ringchart`, `.legend`, `.leg-dot`, `.stats-habits`, `.habit-rank`, `.hrank-row`, `.hrank-i`, `.hrank-emoji`, `.hrank-body`, `.hrank-title`, `.hrank-bar`, `.hrank-streak`, `.stats-heat`, `.heatmap`, `.heat-cell`, `.heat-0`..`.heat-4`, `.heat-legend`, `.stats-insight`, `.seg`, `.muted`, `.mono`). Verbatim port + scoped under `.module-stats`. Side-effect imported via `src/index.ts`.
3. **Public surface** in `src/index.ts` — adds `StatisticsModule` + `StatisticsModuleProps` export. Side-effect `import "./styles.css"`. NO registration export yet.
4. **Tests (P2 subset per test.md §3 component layer)**:
   - `KpiCard.test.tsx` (K1..K4)
   - `LineChart.test.tsx` (L1..L4)
   - `BarChart.test.tsx` (B1..B4)
   - `HourBar.test.tsx` (HB1..HB5)
   - `RingChart.test.tsx` (R1..R3)
   - `HabitRank.test.tsx` (HR1..HR4)
   - `Heatmap.test.tsx` (HM1..HM3)
   - `InsightCallout.test.tsx` (IC1..IC2)
   - `StatisticsModule.test.tsx` (S1..S10)
   - `index-barrel.test.ts` updated (still no registration; module export present)

**Acceptance**
- `pnpm --filter @repo/plugin-web-statistics lint` exits 0 (`--max-warnings 0`).
- `pnpm --filter @repo/plugin-web-statistics test` exits 0; all P1 + P2 tests pass.
- `pnpm --filter @repo/plugin-web-statistics typecheck` exits 0.
- Commit: `feat(plugin-web-statistics): P2 components + StatisticsModule composition + ported CSS (W3 row #20)`.

### Phase P3 — Slot registration + host wire-up + PLUGIN_MAP row + workspace dep

**Scope**

1. **`src/registration.tsx`** — `statisticsWebModuleRegistration` per api.md §4.
2. **Public surface** in `src/index.ts` — adds `statisticsWebModuleRegistration` export.
3. **Tests**:
   - `registration.test.tsx` (RE1..RE3)
   - `index-barrel.test.ts` updated to include registration (IB1..IB4)
4. **Shell anchor edit** in `apps/web/src/routes/modules/shellRegistrations.tsx`:
   - Add import line near the other module imports: `import { statisticsWebModuleRegistration } from "@repo/plugin-web-statistics";` with a comment `// xai-web-statistics row #20`.
   - Replace line 64 `placeholder("statistics", "Statistics", "chart", 11),` with `statisticsWebModuleRegistration,  // xai-web-statistics row #20 (railOrder 11)`.
   - Use `Edit` tool (NOT `Write`) per concurrency rule. Apply `git index.lock` retry (8–20s × 5).
5. **Workspace dep** in `apps/web/package.json` — add `"@repo/plugin-web-statistics": "workspace:*"` in `dependencies` (alphabetical position relative to other `@repo/plugin-web-*` entries). Use `Edit` per concurrency rule.
6. **`docs/PLUGIN_MAP.md`** — update the existing row (or add) for `xai-web-statistics` to mark status `Stable` post-build (or `In-Dev` if still pending verify; final state set by feature-verify).
7. **Lint + typecheck across the workspace touch points**:
   - `pnpm --filter @repo/plugin-web-statistics lint typecheck test` ⇒ 0
   - `pnpm --filter @apps/web typecheck` ⇒ 0
   - `pnpm --filter @repo/eslint-config build` (no-op, just confirms config still loads) ⇒ 0

**Acceptance**
- All phase gates pass.
- Commit: `feat(plugin-web-statistics): P3 slot registration + host wire-up + PLUGIN_MAP row (W3 row #20)`.

## Risks ledger (snapshot from discovery review §6)

| ID | Risk | Status |
|---|---|---|
| R1 | Tasks-source proxy via focus sessions | Documented Known Limitation in api.md §0 |
| R2 | Empty-state guards for Math.max([]) | Aggregators return `null` / `—`; tests A1, T3..T4, HB3 |
| R3 | Heatmap thresholds subjective | Frozen at 0/15/45/90 minutes; tests H7 |
| R4 | Insight null-peak | Empty-state branch in insightCopy; tests I1..I2 |
| R5/R6 | Unknown narrowing | Predicates with full coverage tests V1..V12 |
| R7 | No `any` | Lint rule enforced; predicates take `unknown` |
| R8 | Trend divide by zero | trendPercent returns "—"; tests T3..T5 |
| R9 | useMemo render churn | Sibling-W2 standard; deps array on aggregator inputs |
| R10 | Heatmap perf (182 cells) | Pure divs; sibling pattern verified |
| R11 | Shell anchor concurrency | Disjoint lines 56/57/64; Edit+retry |
| R12 | Workspace dep concurrency | Edit+retry on `package.json` |

## Review Notes (filled by feature-review)

### Verdict: APPROVED

Reviewed against the five gates (discovery quality, design alignment, contract completeness, phase plan quality, architecture risk).

**Gates passed**

1. **Discovery quality** — 7 defining calls (C1..C7) each with options + tradeoffs + frozen decision. R1..R12 risk matrix has explicit mitigation for every entry. 14 frozen assumptions provide unambiguous defaults for the build phase. 5 open questions are tagged but already have recommended answers documented as Frozen Assumptions — `feature-build` can proceed without re-asking.

2. **Design alignment** — `design.md` decision header points to the same review doc; frozen assumptions match across discovery review §9 and design §1; component graph (17 src + 18 test files) matches what api.md §1 and §7 declare.

3. **Contract completeness** — `api.md` §1 has full TypeScript signatures for every public type; §2 lists the three storage keys read and their codecs; §3 declares both halves of the event surface as NONE (read-only sink); §5 specifies every aggregator's pure-function semantics (W1..W12, A1..A20 numbered test refs); §7 lists every component prop interface; §8 spells out error semantics ("never throw at the React boundary"). No `any` anywhere. Predicates cover the unknown→typed narrowing.

4. **Phase plan quality** — 3 phases each with explicit file lists, explicit test inventory references, explicit acceptance gates, and a one-line commit message. P1 = pure layer (no React), P2 = components + composition, P3 = registration + host wire-up. Concurrent W2d siblings (rows #7, #10) are write-scope-disjoint by anchor line (56 vs 57 vs 64). Lock-retry strategy borrowed from countdown row #17.

5. **Architecture risk** — Zero `@repo/core` edits. Zero new storage keys (reads `xai_pomodoro_sessions`, `xai_habits_state`, `xai_pref_week_start` — all already shipped). Zero new event channels. Zero new i18n keys (all 8 `statistics.*` keys verified present in `@repo/plugin-web-tokens/i18n.ts` lines 192–200 EN, 389–397 ZH). `nav.statistics` already present. The shell anchor edit is a one-line `placeholder(...) → statisticsWebModuleRegistration` swap on line 64.

**Honest concerns recorded (NOT blockers)**

- **NC1 — Tasks-source proxy**: the "Tasks completed" KPI + bar chart derive from `pomodoroSessions.filter(s => s.mode === 'focus')`, not from a real Tasks completion log. This is honest given the constraint set (no `@repo/core` edits, no new storage keys) — `xai_task_cols` is column-collapse state, NOT a completion log. The discovery review (§3 Option α, §9 Frozen Assumption 2) and api.md §0 Known Limitations both flag this; a future row #6-extension can swap the source without touching the chart layer because `aggregateTasksFromSessions` is the single point of substitution. Acceptable for v1.

- **NC2 — Range selection not persisted**: `range` lives in `useState` only; a refresh resets to 'week'. Sibling W2 modules behave the same. A future `xai_pref_stats_range` storage key is documented in api.md §9 as a v2 extension.

- **NC3 — Heatmap thresholds are subjective**: 0/15/45/90/91+ min buckets are tuned for "1 focus session → level 2, 6+ → level 4". Discovery review §6 R3 records the reasoning; frozen for v1.

**Action items for `feature-build`**

- Apply concurrency retry (8–20s × 5) on `git index.lock` per W2d concurrency rule when editing `shellRegistrations.tsx` (line 64) and `apps/web/package.json`.
- Verify lint with `--max-warnings 0` at every phase commit; do NOT downgrade to `--max-warnings 1`.
- Use `Edit` (not `Write`) for `shellRegistrations.tsx` and `apps/web/package.json` — unique anchor strings make Edit deterministic.
- Confirm `manifest.json` has `status: "In-Dev"` initially; `feature-verify` flips to `Stable` on green.
- Each phase commit ends with the agreed body: Why / What / Scope / Risk / Docs / Tests (per `docs/conventions/COMMIT_CONVENTION.md`).

## Work Log

### 2026-05-23 — Claude Opus 4.7 1M — feature-plan (fresh)

- Created discovery review at `docs/reviews/xai-web-statistics/20260523-discovery-review.md` covering problem framing, seven defining calls (C1..C7), architecture decision, out-of-scope, risk matrix (R1..R12), acceptance signal, 5 open questions, 14 frozen assumptions.
- Created `packages/xai-web-statistics/docs/design.md` with decision header, frozen assumptions, component graph (17 source files + 18 test files), dependencies, state machine, aggregator data flow diagram.
- Created `packages/xai-web-statistics/docs/api.md` with public surface, Known Limitations, full public type definitions, storage-key read list, boundary predicates, event semantics (none), slot registration, aggregator semantics (§5.1–§5.10), i18n keys consumed, component props, error semantics, versioning.
- Created `packages/xai-web-statistics/docs/test.md` with strategy table, mock strategy (no usePref mock; direct localStorage seed), test inventory by file (V/T/W/A/H/I/K/L/B/HB/R/HR/HM/IC/S/RE/IB families = 100+ test cases), fixtures, lint/typecheck gates, cross-vendor smoke queue.
- Created `packages/xai-web-statistics/docs/dev_log.md` with full Status Panel, 3-phase plan (P1 pure layer / P2 components / P3 host wire-up), risks ledger, work log.
- Commits: none yet (planning phase produces docs only; commit happens at feature-build P1).
- Next step: `feature-review` — validate plan against the 5 open questions + concurrency-write-scope + Known Limitation acceptability.

### 2026-05-23 11:30 — Claude Opus 4.7 1M — feature-review (verdict: APPROVED)

- Reviewed all four planning artifacts against the five-gate checklist.
- All gates pass. Three honest concerns (NC1/NC2/NC3) recorded but NOT blockers — each has a Frozen Assumption + documented future-row swap path.
- Action items for feature-build recorded above (concurrency retry, --max-warnings 0, Edit-not-Write, manifest.json status, commit body convention).
- Status flipped to APPROVED. Suggested Next = feature-build (or feature-auto-build for the full pass).
- Commits: — (review writes docs only).
- Next step: `feature-auto-build` — execute all 3 phases per the Phase Plan, each ending with one green commit.
