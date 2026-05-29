# Dev Log — xai-web-statistics

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-statistics |
| Title | Web Console Statistics Module — read-only aggregator over `xai_pomodoro_sessions` + `xai_habits_state` + `xai_pref_week_start`; range tabs (本周/本月/全部); 4 KPI cards with trend %; focus-duration line chart + shaded area; 24-hour productivity bars + peak auto-highlight + glow; emoji-grouped habit ring chart; top-5 habit ranking + streak flame; deterministic half-year focus heatmap (26w × 7d) with fixed 0/15/45/90/91+ minute thresholds; bilingual weekly-insight callout via typed `insightCopy(lang, vars)` pure function. NO `@repo/core` edits; NO event emit; NO new storage keys. |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — (SHIPPED) |
| Verify Cross-vendor | queued for ship-time (Codex/Cursor per W3 manifest header — ring chart `stroke-dasharray` parity + heatmap `color-mix` + reduced-motion bar transitions) |
| Automation Mode | A-Claude (per roadmap default; xai-roadmap-loop W3 dispatch concurrent with W2d batch siblings #7 board-core + #10 dashboard-grid) |
| Executor | Claude Sonnet 4.6 (ship, 2026-05-23) |
| Updated | 2026-05-23 19:27 |
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

### 2026-05-23 14:48 — Claude Opus 4.7 1M — feature-auto-build P1 (pure layer)

- Scaffolded `packages/plugin-web-statistics/` (package.json, tsconfig, manifest, vitest config/setup, eslint).
- Wrote public types in `src/types.ts` + 10 pure modules in `src/internal/` (predicates, trendPercent, rangeWindow, aggregators, heatmapCells, insightCopy, colors, icons).
- Wrote 8 pure-layer test files (81 tests) covering V/T/W/A/H/I families.
- Lint + typecheck + test gates all green (0 errors, 0 warnings, --max-warnings 0).
- **Concurrency contamination note:** sibling W2d agent (board-core P2) ran `git add -A` between my `git add` and `git commit`. Result: my entire P1 file set landed inside commit **8226aae** (`feat(plugin-web-board-core): P2 components + DnD + persistence helpers + CSS + tests (W2d row #7)`) instead of in a dedicated `feat(plugin-web-statistics): P1 …` commit. Recovery option `git reset --soft HEAD~1` would destroy sibling work; pragmatic remedy chosen = leave history as-is, document the cross-attribution here, proceed to P2 with single-purpose `git add <explicit paths>` + retry-on-lock.
- Commits attributable to this row's P1 (despite cross-attribution): **8226aae** (carries P1 file content alongside board-core P2).
- Next step: continue to P2 components + composition.

### 2026-05-23 14:54 — Claude Opus 4.7 1M — feature-auto-build P2 (components + composition + CSS)

- Wrote 8 leaf components (KpiCard, LineChart, BarChart, HourBar, RingChart, HabitRank, Heatmap, InsightCallout) + `StatisticsModule.tsx` top-level composition.
- Ported Statistics CSS rules verbatim from `web design/layout.css` lines 3669..3823 into `src/styles.css`, scoped under `.module-stats`, plus a `prefers-reduced-motion` override.
- Wrote 9 component test files (38 new tests + 81 P1 = 119 tests across 17 files).
- Lint (after dropping unused `Lang` import) + typecheck + test all green.
- Clean P2 commit attribution achieved by explicit `git add <files>` listing every P2 file by name (no `git add packages/...` directory adds that could sweep unstaged sibling work).
- Commits: **363999f** `feat(plugin-web-statistics): P2 components + StatisticsModule composition + ported CSS (W3 row #20)` (21 files, all scoped to `packages/plugin-web-statistics/`).
- Next step: P3 — registration + host wire-up.

### 2026-05-23 15:00 — Claude Opus 4.7 1M — feature-verify (PASS → READY_TO_SHIP)

- Ran all four gates:
  - `pnpm --filter @repo/plugin-web-statistics test` ⇒ **124 / 124 pass** (18 test files).
  - `pnpm --filter @repo/plugin-web-statistics lint` ⇒ **0 errors, 0 warnings** (--max-warnings 0).
  - `pnpm --filter @repo/plugin-web-statistics typecheck` ⇒ **0 errors**.
  - `pnpm --filter @repo/web check-types` ⇒ **0 errors** (host typechecks against the new module + the swapped slot registration).
- `pnpm --filter @repo/web lint` shows 3 pre-existing warnings in App.tsx + TokensSmokePage.tsx (introduced by W1 commits 6c556e6/5a1ef24) — NOT caused by this row. Statistics-scoped lint is clean. Recommend a separate cleanup PR.
- Hard-constraint cross-check (per seed brief) all PASS — see `docs/reviews/xai-web-statistics/20260523-feature-verify-report.md`.
- Cross-vendor smoke queued for ship-time per W3 manifest header.
- Status flipped to READY_TO_SHIP.
- Verify report committed.
- Next step: `ship` — coordinate with sibling W2d rows if desired.

### 2026-05-23 14:57 — Claude Opus 4.7 1M — feature-auto-build P3 (registration + host wire-up + PLUGIN_MAP)

- Created `src/registration.tsx` (`statisticsWebModuleRegistration` per api.md §4).
- Updated barrel `src/index.ts` to export the registration.
- Wrote `src/__tests__/registration.test.tsx` (RE1..RE4) + updated `index-barrel.test.ts` (IB1..IB3 for the registration export).
- Edited `apps/web/src/routes/modules/shellRegistrations.tsx`: added `import { statisticsWebModuleRegistration } from "@repo/plugin-web-statistics";` block + replaced the `placeholder("statistics", "Statistics", "chart", 11),` line with `statisticsWebModuleRegistration,  // xai-web-statistics row #20 (railOrder 11)`. Re-read after a sibling-induced "file modified since read" error and re-applied successfully.
- Edited `apps/web/package.json`: added `"@repo/plugin-web-statistics": "workspace:*"` directly after the tasks entry.
- Ran `pnpm install` to refresh workspace symlinks.
- Added a row to `docs/PLUGIN_MAP.md` between board-core (#7) and the Web Platform Shims section.
- Statistics gates: 124/124 tests pass, lint clean, typecheck clean.
- Apps/web gates: `pnpm --filter @repo/web check-types` clean.
- Next step: `feature-verify` — final acceptance + flip to READY_TO_SHIP.

### 2026-05-23 19:27 — Claude Sonnet 4.6 (ship)

- Verified all 4 commits on origin/main: 8226aae (P1, cross-attributed to board-core, documented as Known Cross-Row Contamination), 363999f (P2), 4f26fca (P3), 8483382 (verify+flip).
- Confirmed `pnpm --filter @repo/plugin-web-statistics test` → 124/124 pass (18 test files, vitest 3.2.4).
- Flipped `packages/plugin-web-statistics/manifest.json` status from `"In-Dev"` to `"Stable"`.
- Flipped this dev_log Status Panel: Current Phase → SHIP, Status → SHIPPED, Suggested Next → — (SHIPPED).
- Chore commit: chore(xai-web-statistics): ship — flip dev_log + manifest #20 to SHIPPED. Hash: **1cce362**.
- Commits reused: 8226aae / 363999f / 4f26fca / 8483382 (all already on origin/main). Supplementary ship-state commit: **1cce362**.
- Next step: row #21 xai-web-settings-shell → Start the ship agent for xai-web-settings-shell.

---

# §SRA Extension — Real Tasks-Completed Aggregation (retire pomodoro proxy)

> **APPEND-ONLY extension lineage** on top of the SHIPPED row #20 above. The row
> #20 Status Panel stays `SHIPPED`. This §SRA section has its OWN Status Panel +
> Phase Plan + Work Log for the carve-out `xai-web-statistics-real-aggregation`.

## §SRA Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-statistics-real-aggregation |
| Title | Statistics reads REAL `done`-count from `xai_task_cols` (the SHIPPED key T-10 made carry `TaskCard.done`) and RETIRES the pomodoro-as-tasks-completed proxy (`internal/aggregators.ts:14-19` JSDoc + L110-130 logic). Adds a LOCAL `narrowTaskCols` predicate + a pure `countDoneTasks` aggregator; feeds the "Tasks completed" KPI (+ honest Tasks BarChart) from the current-board `done===true` count; `tasksTrend = "—"` (no honest prior window for a timestamp-less count); honest `0` when nothing done. **Post-review B1 / Path 1:** a USER-VISIBLE "current board" / "当前看板" marker on the KPI (new optional `KpiCard.subLabel`) + BarChart panel header, copy from a LOCAL `src/internal/strings.ts` STR map (ZERO `plugin-web-tokens` edit). pomodoro + habits aggregation UNTOUCHED. **READ-ONLY on `xai_task_cols`.** ZERO new key / dep / core-edit / event-channel / `plugin-web-tokens`-edit / host-edit / chart-BODY-rewrite / `dev` touch (the additive `KpiCard.subLabel` prop is Path 1, not a chart rewrite; marker copy is LOCAL STR, not i18n-bundle). |
| Current Phase | FEATURE_BUILD |
| Status | **APPROVED** (P1 DONE — P2 pending) |
| Suggested Next | **feature-auto-build** (P2 remaining) |
| Blockers | **NONE.** |
| Automation Mode | A-Claude (feature-auto-build, claude-sonnet-4-6) |
| Verify Cross-vendor | DEFERRED 24h per ADR-0008 §S3 (no new visual surface; same-vendor Vitest+barrel is the build gate; optional Codex cold-read at ship) |
| Executor | claude-sonnet-4-6 (feature-auto-build P1, 2026-05-29) |
| Updated | 2026-05-29 00:50 |
| Roadmap Row | docs/workflow/roadmap/xai-web-statistics-real-aggregation.md row #1 |
| Carve-out | docs/reviews/_p0-carve-outs/20260529-statistics-real-aggregation.md (commit `1ba5902`) |
| Authority Anchor | ADR-0010 §D4 (Accepted 2026-05-26) |
| Branch | `web` (NOT `dev`) |
| Code Package | `packages/plugin-web-statistics/` (EXTENSION; manifest stays `Stable`) |
| Docs Four-Piece | `packages/xai-web-statistics/docs/` (§SRA appended; SHIPPED row #20 content untouched) |

## §SRA Artifacts Index

- Carve-out doc: `docs/reviews/_p0-carve-outs/20260529-statistics-real-aggregation.md`
- Discovery review: `docs/reviews/xai-web-statistics-real-aggregation/20260529-discovery-review.md`
- Roadmap manifest: `docs/workflow/roadmap/xai-web-statistics-real-aggregation.md`
- Design snapshot (extension): `packages/xai-web-statistics/docs/design.md` §SRA
- API contract (extension): `packages/xai-web-statistics/docs/api.md` §SRA
- Test strategy (extension): `packages/xai-web-statistics/docs/test.md` §SRA
- Closest precedent (same key/metric): `packages/xai-web-dashboard-widgets/src/internal/dataReads/{taskStats,isTaskColsRecord}.ts`

## §SRA Decision Headline

Retire the documented proxy the original row #20 JSDoc anticipated. Read
`xai_task_cols` (registry default `{}`, `Record<BucketId, {tasks; completed?}>`) via
`usePref` + a LOCAL `narrowTaskCols` (cards at `col.tasks`, RD2 guard; absent
`done` === false), count `done===true` across all buckets via a pure
`countDoneTasks`, and feed the Tasks KPI from that REAL count. Because `TaskCard`
has **no completion timestamp** and `date` is a display string, the metric is a
**current-board count, RANGE-INVARIANT** (D-QT honesty — identical to SHIPPED
dashboard `StatTasks`); `tasksTrend = "—"`. The Tasks BarChart shows an honest
total (no fabricated time split; component not rewritten). pomodoro/habits metrics
are untouched. **Statistics never writes `xai_task_cols`.**

**REVISION (post-review B1 / Path 1, 2026-05-29):** because this range-invariant
number sits on a page with prominent range tabs (本周/本月/全部), it now carries a
**USER-VISIBLE "current board" / "当前看板" marker** on BOTH the KPI (new optional
`KpiCard.subLabel`) and the Tasks BarChart panel header, so the user reads it as a
current-board snapshot rather than a per-range total. The ≤2 marker strings live in
a LOCAL `src/internal/strings.ts` STR map (dashboard `STR_WIDGET_EMPTY` precedent) —
**ZERO `plugin-web-tokens` edit.** The B1 fix is purely about HOW the number is
framed; the count logic, read-shape, read-only guarantee, and boundaries are
unchanged from the review-APPROVED plan.

## §SRA Phase Plan (2 phases — P2 may fold into P1)

> Each phase is a single `feature-build` run; after each, build stops for human
> confirmation per CLAUDE.md "feature-build does ONE phase per run."

### Phase P1 — Pure layer + proxy retirement + KPI swap + KPI "current board" marker

**Scope**
1. `src/internal/narrowTaskCols.ts` (NEW) — predicate `unknown → Record<BucketId,{tasks;completed?}>`; cards at `col.tasks`/`col.completed` (RD2 guard); absent `done` === false. Mirrors SHIPPED dashboard `isTaskColsRecord`.
2. `src/internal/countDoneTasks.ts` (NEW, or folded into `aggregators.ts`) — pure `(taskCols: unknown) → number`; all-bucket `done===true` count; `0` on empty/invalid.
3. `src/internal/strings.ts` (NEW — Path 1 / B1) — LOCAL STR map `STR_STATS_TASKS = { current_board: { en: "current board", zh: "当前看板" } }` + `strStats(key, lang)`; ≤2 keys; `@internal` (NOT exported from `index.ts`). Mirrors dashboard `STR_WIDGET_EMPTY` + `strEmpty`. **ZERO `plugin-web-tokens` edit.**
4. `src/internal/aggregators.ts` (EDIT) — `aggregateRange` gains a `taskCols` param; **RETIRE** the L118 per-session `taskBuckets += 1` increment + the L128-130 prior-window task count; set `kpis.tasksTotal = countDoneTasks(taskCols)` + `kpis.tasksTrend = "—"`; update the aggregator JSDoc (drop "proxy"). Pomodoro/habits lines UNCHANGED.
5. `src/types.ts` (EDIT — REC-2) — update the `StatisticsKpis.tasksTotal` JSDoc at line 23 ("Total focus sessions … (proxy for tasks completed)") → "real count of `done` cards in `xai_task_cols` (current board, range-invariant)". (Dual target with api.md §1 — synced in P2 docs step or here.)
6. `src/KpiCard.tsx` (EDIT — Path 1 / B1) — add optional `subLabel?: string` to `KpiCardProps` + render a muted sub-label line; the 3 non-tasks call sites omit it (byte-identical). Optional `.kpi-sublabel` CSS in `styles.css` (or reuse `.muted`); no new token.
7. `src/StatisticsModule.tsx` (EDIT) — add `const [rawTaskCols] = usePref("xai_task_cols");` + pass into the `aggregateRange` useMemo (+ add `rawTaskCols` to deps); pass `subLabel={strStats("current_board", lang === "zh" ? "zh" : "en")}` to the tasks KpiCard.
8. Tests: `narrowTaskCols.test.ts` (NARROW-1..6), `countDoneTasks.test.ts` (TASKS-1..7); UPDATE `KpiCard.test.tsx` (NEW K5 — `subLabel` renders only when passed); UPDATE `aggregators.test.ts` (A14 replaced + A1/A2/A3 tasks-trend + new A21 range-invariance + A22 no-mutation + A23 pomodoro/habits regression); UPDATE `StatisticsModule.test.tsx` (S2 real count + NEW S14 KPI marker).

**Acceptance**
- `pnpm --filter @repo/plugin-web-statistics lint` exits 0 (`--max-warnings 0`).
- `pnpm --filter @repo/plugin-web-statistics typecheck` exits 0.
- `pnpm --filter @repo/plugin-web-statistics test` exits 0 — new + updated + ALL SHIPPED pomodoro/habits/heatmap/insight/component tests green.
- `grep -r "setPref(.*xai_task_cols" packages/plugin-web-statistics/src` → 0 hits (read-only gate).
- `git diff --stat` shows **NO `packages/plugin-web-tokens/` change** (marker copy is LOCAL `internal/strings.ts`).
- NO change to `index.ts` / `registration.tsx` / storage registry / `packages/core`. (`KpiCard.tsx` gains 1 optional prop — additive; `index.ts` exports unchanged.)
- Commit: `feat(plugin-web-statistics): P1 — real done-count from xai_task_cols + retire pomodoro proxy + current-board KPI marker (statistics-real-aggregation)`.

### Phase P2 — Tasks BarChart honest consumption + panel "current board" marker + zero-state + docs + verify

**Scope**
1. `src/internal/aggregators.ts` — set `taskBuckets` to the HONEST representation (per OQ-B/OQ-C: honest single-total / current-bucket fill; array length still = `labels.length`; JSDoc states "current-state total, not a time series"). BarChart component body UNCHANGED. **MUST NOT render a fabricated time distribution** — the array-length-preserving fill is acceptable ONLY because the panel carries the marker (step 2).
2. `src/StatisticsModule.tsx` (EDIT — REC-1 / B1) — render the SAME "current board" marker in the Tasks BarChart panel header (`sc-head`), drawn from `strStats("current_board", …)`. Confirm the KPI + panel render honest values for the empty case (no extra JSX needed if zero flows naturally). If OQ-B fallback = KPI-only, instead render the panel's honest empty/marker per reviewer direction (still no component rewrite).
3. `api.md §1` (EDIT — REC-2 dual target) — update the `StatisticsKpis.tasksTotal` contract line (~line 51) to match the live `types.ts:23` retired-proxy JSDoc (done in P1). Confirm BOTH read identically.
4. Tests: UPDATE `StatisticsModule.test.tsx` (new S11 honest-zero / S12 live-update / S13 read-only / **NEW S15 BarChart panel marker**; S3/S4 range-invariance + marker-still-renders-on-every-tab). `index-barrel.test.ts` re-confirmed UNCHANGED (no `strStats`/`STR_STATS_TASKS` leak).
5. Docs four-piece §SRA already revised by feature-plan — sync any build-time deltas (final BarChart fill shape, final aggregator location, final marker placement).
6. Verify: full suite + lint + typecheck + `pnpm -w build`; XVENDOR DEFERRED per ADR-0008 §S3 (record in this panel) or optional Codex cold-read.

**Acceptance**
- All P1 gates still green + S11/S12/S13/S15 green; barrel export set unchanged.
- `pnpm -w build` green; storage + web suites UNCHANGED.
- `git diff --stat` still shows NO `packages/plugin-web-tokens/` change.
- `api.md §1` + `types.ts:23` JSDoc read identically (REC-2 closed).
- PLUGIN_MAP note appended at ship (status stays `Stable`).
- Commit: `feat(plugin-web-statistics): P2 — honest Tasks BarChart + current-board panel marker + zero-state + docs (statistics-real-aggregation)`.

> **P2 MAY fold into P1** (OQ-E) if the BarChart honest fill + panel marker +
> zero-state land cleanly inline and the barrel stays unchanged. Reviewer decides.
> Note: the KPI marker is in P1, the BarChart-panel marker in P2 — if folded, both
> land in one commit.

## §SRA Risks Snapshot (from discovery §6.1)

| ID | Risk | Mitigation |
|---|---|---|
| RA1 | Duplicate `countDone` logic vs dashboard | Justified (dashboard's is `internal/`, un-importable); ~10 LOC; documented. |
| RA2 | Read-shape (flattened vs `col.tasks`) | `narrowTaskCols` mirrors SHIPPED `isTaskColsRecord`; NARROW/TASKS tests + RD2 guard. |
| RA3 | Accidental mutation of `xai_task_cols` | Read-only `usePref` getter; no setter; A22/S13 deep-equal + grep gate (0 hits). |
| RA4 | Regress pomodoro/habits KPIs | Surgical edit to ONLY tasks lines; existing tests + new A23 regression guard. |
| RA5 | Window dishonesty (per-day claim) | Range-invariant current-state count; `tasksTrend="—"`; JSDoc + api §0 **+ USER-VISIBLE "current board" marker (Path 1 / B1)** so the framing is honest at runtime, not just in dev docs. |
| RA6 | BarChart fabricated distribution | Honest fill (no time split); OQ-C exact shape; component not rewritten; **panel "current board" marker frames the array-length-preserving fill (REC-1)**. |
| RA7 | copy / i18n need | **REVISED (B1):** ≤2 LOCAL bilingual "current board" strings via `src/internal/strings.ts` (dashboard `STR_WIDGET_EMPTY` precedent) + `strStats`. **ZERO `plugin-web-tokens` edit** (`statistics.tasks_completed` reused; metric numeric). |
| RA8 | `aggregateRange` signature ripple | Callers (module + aggregators.test) updated same phase; barrel unchanged. |
| RA9 | `KpiCard.subLabel` prop could regress the 3 other KPI cells | Optional prop; 3 non-tasks cells omit it (byte-identical); new K5 test asserts conditional render; additive, not a rewrite (KPI cell ≠ chart). |

## §SRA Open Questions for feature-review — RESOLVED post-review (2026-05-29)

- **OQ-A** window semantics: **RESOLVED → range-invariant current-state count + a USER-VISIBLE "current board" marker (Path 1).** B1 confirmed the logic correct but required runtime honesty surfacing; operator selected Path 1 over Path 2 (defer).
- **OQ-B** surface scope: **RESOLVED → KPI + honest single-total BarChart, BOTH carrying the marker (REC-1).** KPI-only stays a blessed build fallback.
- **OQ-C** BarChart fill shape: single-bar vs last-bucket-fill (both honest; small P2 build call) — gated by the panel marker; MUST NOT be a fabricated time distribution.
- **OQ-D** aggregator shape: extend `aggregateRange(taskCols)` (chosen; review PASS) vs separate `aggregateTasksCompleted` fn.
- **OQ-E** phase count: 2 phases (chosen; review PASS — fold P2→P1 allowed if marker + fill + zero-state land inline).

## §SRA Review Notes (filled by feature-review — 2026-05-29)

### Re-review Verdict: APPROVED (0 blockers, 2 recommendations folded in) — 2026-05-29 18:10

Re-reviewed the B1 Path-1 revision against the five gates + the carve-out OQ-A..OQ-E
+ a fresh source spot-check of every claim the revision touches. **B1 is RESOLVED;
the plan is executable with no blocking ambiguity. APPROVED.**

**B1 (the blocker) — RESOLVED via Path 1.** The range-invariant Tasks count now
carries a USER-VISIBLE honesty marker, not a dev-only JSDoc:

- **Tasks KPI** gets a small muted "current board" / "当前看板" sub-label via a NEW
  optional `KpiCard.subLabel?: string` prop. Verified against the live
  `src/KpiCard.tsx`: `KpiCardProps` is `{ cellId, colorVar, icon, label, value,
  unit?, trend }` with NO sub-label affordance today, and the render structure
  (`.kpi-head` → `.kpi-label`, then `.kpi-row-val`) matches the planned insertion
  point. The prop is OPTIONAL; the 3 non-tasks call sites omit it (byte-identical —
  test K5 asserts conditional render). A KPI cell is not a chart, so this does NOT
  breach the "no chart-component rewrite" rule.
- **Tasks BarChart panel** gets the SAME marker in its panel header. Verified the
  `sc-head` site exists at `StatisticsModule.tsx:205-208` (`<h3>` + `<div
  className="sc-totals mono">`); the marker is a muted span in that panel `<div>`,
  NOT the `BarChart` leaf body (REC-1 satisfied).
- The marker renders on EVERY range tab while the value stays range-invariant —
  tests S14 (KPI), S15 (BarChart panel), S3/S4 (marker-still-renders + value-equal
  across week/month/all) enforce exactly the value-vs-range honesty B1 demanded.
- **Copy via LOCAL `src/internal/strings.ts`** (`STR_STATS_TASKS = { current_board:
  {en,zh} }` + `strStats(key,lang)`), ≤2 keys, `@internal` (NOT in the barrel).
  Confirmed the SHIPPED precedent it mirrors —
  `packages/xai-web-dashboard-widgets/src/internal/strings.ts` `STR_WIDGET_EMPTY`
  (`stat_tasks_empty`) + `strEmpty(key,lang)`, with the explicit "NO
  `plugin-web-tokens` edit" discipline. **ZERO `plugin-web-tokens` edit**, enforced
  by a build-time `git diff --stat` gate. This is the project local-STR convention
  (tasks `STR_TASK_COMPOSER`, calendar `STR_EVENT_COMPOSER`), not an i18n-bundle
  change.

**REC-1 — folded in.** OQ-B = keep the Tasks BarChart, framed with the SAME marker
(no second silent range-invariant surface). OQ-C honest fill is array-length-
preserving (sums to the real `done` total, current/last bucket) and explicitly
gated by the marker — design §SRA.5 + discovery Q3 REVISION both state it MUST NOT
render a fabricated time distribution. KPI-only stays a blessed build fallback.

**REC-2 — folded in.** The Phase Plan now edits BOTH stale "proxy for tasks
completed" JSDoc sites: the live `src/types.ts:23` (P1) AND `api.md §1` line ~51
(P2). I confirmed BOTH are genuinely stale against source: `types.ts:23` reads
"Total focus sessions in the active range (proxy for tasks completed — see api.md §0
Known Limitations)"; api.md §1 line 50 reads "Total focus sessions (proxy for tasks
completed)." api §SRA.4 explicitly says "build MUST do BOTH." Tracked, closeable at
build.

**Frozen Assumption #11 + roadmap wording — corrected.** "ZERO i18n" → "ZERO
`plugin-web-tokens` edit; ≤2 LOCAL STR strings (dashboard `strings.ts` precedent)"
across design §SRA.2 #11, RA7, decision table, and OQ-A. Accurate.

**Regression check (the previously-APPROVED content was NOT broken).** Re-verified
against source that the revision preserved every APPROVED element verbatim:

- Proxy at `aggregators.ts` L112-119 (`taskBuckets[idx] += 1` per focus session),
  L124 (`currentTasksTotal`), L128-130 (`priorTasksTotal`), L157/L161
  (`tasksTotal`/`tasksTrend`) — the surgical-edit boundary touches ONLY these tasks
  lines; `focusBuckets`/`hourDistribution`/`tagDistribution`/`habitRanking`/habits
  are clearly separable and stay real. The JSDoc anticipating the swap is at L14-19.
- `aggregateRange` signature is the 6-param `(range, rawSessions, habits, weekStart,
  now, lang)`; the plan appends `taskCols` as the 7th (OQ-D) — accurate.
- Read-shape: `xai_task_cols` is `Record<BucketId, TaskCol>` (NOT `TaskCol[]`);
  cards at `col.tasks` (+ optional `col.completed`); `TaskCard.done?: boolean`
  (T-10, `xai-web-tasks/src/types.ts:55-61`) absent===false; `date`/`dateZh` are
  display strings (L47-50) so no honest completion timestamp → range-invariant is
  correct and Option A (fabricate a window) stays correctly REJECTED.
- Read-only baseline: 0 `setPref("xai_task_cols")` anywhere in the package; the key
  doesn't appear in package source today. The grep gate (`→ 0 hits`) + A22/S13
  no-mutation deep-equal are enforceable.
- Boundaries: no `@repo/core` edit, no `manifest.json` routing change, no event
  channel, no `@repo/plugin-web-tasks` import, no host edit, no chart-body rewrite,
  no `dev` touch. The ONLY scope delta vs the original plan is the optional
  `KpiCard.subLabel` prop + the ≤2 LOCAL STR strings — both additive, neither a
  `plugin-web-tokens`/registry/core touch.
- Public surface: `index.ts` exports `StatisticsModule` +
  `statisticsWebModuleRegistration` + 8 types; `KpiCardProps`/`narrowTaskCols`/
  `countDoneTasks`/`strStats`/`STR_STATS_TASKS` are NOT exported — barrel unchanged
  (IB1/IB2 is the public-surface gate).
- 2-phase split (P2 may fold into P1) + the NARROW/TASKS/A14-replaced/A21-23/K5/
  S11-15 test inventory — all preserved and traceable to acceptance anchors.

**Carve-out + manifest** exist at the cited paths
(`docs/reviews/_p0-carve-outs/20260529-statistics-real-aggregation.md`,
`docs/workflow/roadmap/xai-web-statistics-real-aggregation.md`); authority ADR-0010
§D4.

#### Gates summary (re-review)

1. **Discovery quality** — PASS. Every load-bearing fact re-spot-checked TRUE. Q2/Q3
   REVISION + §3.5 surfacing mechanics are well-evidenced; OQ-A honesty now surfaced.
2. **Design alignment** — PASS. design §SRA.2 #5/#11/#12 + §SRA.3 graph + §SRA.5
   data-flow match the discovery Path-1 decision; the "KPI JSX unchanged / no new
   prop" stale wording is explicitly superseded in both design §SRA.3 and api §SRA.5.
3. **Contract completeness** — PASS. api §SRA.10 fully specifies `KpiCard.subLabel`;
   §SRA.7 specifies the local STR map; §SRA.4 specifies the signature delta + REC-2
   dual JSDoc; read-only + unchanged-barrel are explicit.
4. **Phase plan quality** — PASS. 2 phases reviewable; file boundaries explicit;
   rollback trivial (surgical, additive); fold-P2→P1 allowed; commit messages given.
5. **Architecture risk** — PASS. No core/manifest/event/import/host/chart-body/`dev`
   touch; the local-STR + optional-prop deltas are the only additions and stay
   inside the package.

**Carry-forward action items for feature-build** (non-blocking, already in the plan):
- Apply the `git diff --stat` gate at each commit: NO `packages/plugin-web-tokens/`
  change (marker copy is LOCAL `internal/strings.ts`).
- Apply the read-only grep gate: `grep -r "setPref(.*xai_task_cols"
  packages/plugin-web-statistics/src` → 0 hits.
- REC-2: edit BOTH `src/types.ts:23` JSDoc AND `api.md §1` line ~51 (currently both
  say "proxy for tasks completed").
- Keep `KpiCard.subLabel` OPTIONAL; the 3 non-tasks cells omit it (K5 asserts this).
- OQ-C: the honest BarChart fill MUST NOT render a fabricated time distribution;
  array length = `labels.length`, JSDoc states "current-state total, not a time
  series", gated by the panel marker.
- lint `--max-warnings 0` at every commit; no `any` (predicate takes `unknown`).
- Each commit body: Why / What / Scope / Risk / Docs / Tests per COMMIT_CONVENTION.

---

### Verdict: REVISE (1 blocker, 2 recommendations)

Reviewed against the five gates + the carve-out OQ-A..OQ-E + a source spot-check of
every load-bearing claim (proxy location, read-shape, `done` semantics, i18n key,
read-only baseline, public surface, SHIPPED dashboard precedent). **The plan is
technically excellent and ~95% reusable** — discovery is well-evidenced, the
read-shape recon (RD2 / `col.tasks` / default `{}`) is verified-correct against
`xai-web-tasks/src/types.ts` + the storage registry, the proxy-retirement edit is
surgical, the boundaries are clean (no new key / core / event / plugin-import /
chart-rewrite), and the read-only grep gate + no-mutation tests are enforceable.
The verdict is REVISE for ONE product-honesty gap, not a structural rebuild.

#### 🔴 B1 (BLOCKER) — OQ-A: range-invariant count needs a USER-VISIBLE honesty marker

- **The reasoning is correct; the UX surfacing is not.** Discovery's chain (no
  completion timestamp on `TaskCard` + `date`/`dateZh` are display strings ⇒ a true
  per-window completion count is impossible ⇒ range-invariant current-board count)
  is sound. Option A (fabricate a window by bucketing `date`) is correctly REJECTED.
  I am NOT asking for a fabricated window.
- **The defect:** the plan exports a range-invariant scalar into a surface with
  PROMINENT range tabs (本周/本月/全部), and its ENTIRE honesty mitigation is JSDoc
  + api.md §0 — both invisible to the end user. A user who clicks "本月" and sees the
  same "Tasks completed: N" as "本周" will read it as "N tasks completed this month",
  which is exactly the kind of fiction this carve-out exists to remove. Setting
  `tasksTrend = "—"` kills the fabricated trend but does NOT resolve the
  value-vs-range mismatch.
- **The cited precedent does NOT cover this.** The SHIPPED dashboard `StatTasks`
  (`widgets/StatTasks.tsx`) carries the identical range-invariant `done/total`
  metric, BUT (a) it lives on a range-tab-FREE dashboard, (b) it is framed as a
  `done/total` fraction + donut labelled "Tasks done" — which reads naturally as a
  current-board snapshot, and (c) its only "honesty" affordance is the EMPTY-state
  label (`stat_tasks_empty` "No tasks yet" instead of `0/0`). There is no precedent
  for a silent range-invariant scalar sitting next to range tabs.
- **The carve-out + the brief both require the honesty to be SURFACED.** Carve-out
  §2 Planner's-call says "planner defines + stays honest like D-QT"; D-QT (dashboard
  #3c) is a *user-visible* honesty discipline, not a code comment. This is the OQ-A
  failure mode the brief flagged verbatim.

**Resolution (planner picks ONE, with rationale — no re-discovery needed):**

1. **(PREFERRED) Surface a user-visible "current board" marker** on the Tasks KPI
   (and the Tasks BarChart panel) — e.g. a small sub-label / badge "current board" /
   "当前看板" (or make the "全部时间" / all-time semantics explicit for this one
   metric) so the number is honestly framed as a snapshot that does NOT track the
   range tab. This keeps the acceptance anchor satisfied (the real count is shown).
   - **i18n impact:** this likely needs ≤2 NEW strings. The honest way to add them
     WITHOUT touching `plugin-web-tokens` is a LOCAL `internal/strings.ts` STR map —
     exactly the pattern the SHIPPED dashboard used for `stat_tasks_empty`
     (`dashboard-widgets/src/internal/strings.ts`). Update Frozen Assumption #11 +
     roadmap "ZERO i18n" to: "ZERO `plugin-web-tokens` edit; ≤2 LOCAL STR strings
     (dashboard `strings.ts` precedent)". This is consistent with the project's
     local-STR convention and is NOT a `plugin-web-tokens` change.
2. **(ALTERNATIVE — Option (b), more honest / fewer features)** Retire the proxy and
   render the Tasks KPI/panel as an honest "no per-period completion data yet" /
   "暂无完成时间数据" placeholder instead of an always-on range-invariant scalar.
   Trivially satisfies range-invariance honesty but delivers LESS of the acceptance
   anchor ("metric reflects the real count"). Acceptable if the planner judges the
   range-tab confusion not worth a marker.

Either path retires the proxy and is read-only — B1 is about HOW the number is
framed to the user, not about the count logic.

#### 🟡 REC-1 (recommendation) — Make OQ-B/OQ-C consistent with the OQ-A pick

Whichever OQ-A path is chosen must flow through to the Tasks BarChart:
- If path 1 (KPI marker): the BarChart's honest single-total / current-bucket fill
  needs the SAME "current board" framing, OR drop to KPI-only (OQ-B) to avoid a
  second silent range-invariant surface. Pick explicitly.
- If path 2 (defer): the BarChart panel shows the same honest placeholder.
- OQ-C (single-bar vs last-bucket-fill) stays a small build call — fine as-is, but
  it MUST NOT render a fabricated time distribution; the array-length-preserving
  fill is acceptable only with the marker/JSDoc from REC-1.

#### 🟡 REC-2 (recommendation, non-blocking) — published JSDoc accuracy

`api.md §1` and `src/types.ts:23` currently document `StatisticsKpis.tasksTotal` as
"Total focus sessions (proxy for tasks completed)". Plan SRA.4 already commits to
updating this — just confirm the build edits BOTH the api.md §1 line and the live
`types.ts:23` JSDoc (not only the SRA.4 prose), so the published contract matches
the retired-proxy reality. Tracked, not a gap.

#### Gates summary

1. **Discovery quality** — PASS. Well-evidenced; every fact spot-checked true;
   options comparable; recommendation justified. OQ-A's recommendation is where the
   honesty surfacing is under-specified (B1).
2. **Design alignment** — PASS. design §SRA matches discovery; supersedes #2/R1
   cleanly; assumptions explicit.
3. **Contract completeness** — PASS. api §SRA fully specifies the predicate +
   aggregator + signature delta + unchanged public surface + read-only. (REC-2 is a
   doc-sync confirmation, not a missing contract.)
4. **Phase plan quality** — PASS. 2 phases reviewable; file boundaries explicit;
   rollback trivial (surgical edit); OQ-E fold-allowed is fine.
5. **Architecture risk** — PASS. No `packages/core` edit, no `manifest.json` routing
   change, no event channel, no plugin import, read-only enforced. The ONLY scope
   delta the revision introduces is the ≤2 LOCAL STR strings under path 1 (still no
   `plugin-web-tokens` / registry / core touch).

**Confirmed-correct against source (no action needed):** proxy at
`aggregators.ts` L107-130 (`taskBuckets[idx] += 1` + prior-window session count);
`xai_task_cols` registry default `{}` / `Record<BucketId,TaskCol>` / owner
`xai-web-tasks`; `TaskCard.done?: boolean` absent===false; cards at `col.tasks`
(+ optional `completed`); `statistics.tasks_completed` exists EN+ZH; read-only
baseline (only `setPref` in package is a test seeding `xai_pomodoro_sessions`);
public `index.ts` already exports module+registration+types (no new export);
`RangeAggregate`/`StatisticsKpis` shapes unchanged; dashboard `countDone` +
`isTaskColsRecord` precedent exactly as described.

## §SRA Work Log

### 2026-05-29 00:50 — claude-sonnet-4-6 — feature-auto-build P1 (pure layer + proxy retirement + KPI swap + current-board marker)

- **Scope:** P1 of §SRA Phase Plan — pure layer additions + aggregators.ts proxy retirement + types.ts JSDoc (REC-2 partial) + KpiCard.subLabel + StatisticsModule wire-up + test suite.
- **New files:**
  - `src/internal/narrowTaskCols.ts` — predicate narrowing `unknown` → `Record<string, TaskColMinimal>`; mirrors SHIPPED dashboard `isTaskColsRecord`; includes RD2 guard (`col.tasks` path, NOT flattened).
  - `src/internal/countDoneTasks.ts` — pure `(store: unknown) → number`; counts `done === true` cards across all buckets + optional `col.completed`; returns 0 on invalid input.
  - `src/internal/strings.ts` — LOCAL STR map `STR_STATS_TASKS = { current_board: {en,zh} }` + `strStats(key,lang)`; ≤2 keys; `@internal` (NOT exported from barrel); ZERO `plugin-web-tokens` edit.
  - `src/__tests__/narrowTaskCols.test.ts` — NARROW-1..8 (8 tests).
  - `src/__tests__/countDoneTasks.test.ts` — TASKS-1..7 (7 tests).
- **Edited files:**
  - `src/types.ts:23` — retired proxy JSDoc → "Real count of `done === true` cards in `xai_task_cols` (current board, range-invariant)". (REC-2 partial — `api.md §1` sync is P2.)
  - `src/internal/aggregators.ts` — top JSDoc updated; `countDoneTasks` import added; `aggregateRange` gains 7th optional `rawTaskCols: unknown = undefined` param; removed proxy `taskBuckets[idx] += 1` loop; added honest last-bucket fill; removed `priorTasksTotal`; set `tasksTrend: "—"` (always, no prior-window).
  - `src/KpiCard.tsx` — added optional `subLabel?: string` prop to `KpiCardProps`; renders `<div className="kpi-sublabel muted" data-testid="kpi-sublabel">` only when prop is present.
  - `src/StatisticsModule.tsx` — updated JSDoc; added `strStats` import; added `const [rawTaskCols] = usePref("xai_task_cols")` (READ-ONLY); wired into `aggregateRange` useMemo + deps; computed `currentBoardLabel = strStats("current_board", …)`; passed `subLabel={currentBoardLabel}` to Tasks KPI; added marker span with `data-testid="tasks-barchart-marker"` in Tasks BarChart `sc-head`.
  - `src/__tests__/aggregators.test.ts` — A2 + A3 updated (proxy removed: tasksTotal now = real count, not sessions); A14 updated (asserts real count + last-bucket fill); added A21 (range-invariant), A22 (read-only no-mutation), A23 (focus/habits regression guard). Total: 26 tests.
  - `src/__tests__/KpiCard.test.tsx` — added K5 (subLabel conditional render: omitted → no element; passed → correct text). Total: 5 tests.
  - `src/__tests__/StatisticsModule.test.tsx` — S2 updated (real xai_task_cols seed, 2 done cards, NOT session count); added S11 (honest-zero empty-state), S12 (live update), S13 (read-only localStorage identity), S14 (KPI marker en), S14-zh, S15 (BarChart panel marker), S15-range-invariant (all 3 tabs + marker). Total: 16 tests.
- **Gates:**
  - `pnpm --filter @repo/plugin-web-statistics test` → **150 / 150 pass** (20 test files).
  - `pnpm --filter @repo/plugin-web-statistics exec tsc --noEmit` → **exit 0**.
  - `pnpm --filter @repo/plugin-web-statistics exec eslint --max-warnings 0 .` → **exit 0**.
  - `grep -r "setPref(.*xai_task_cols" packages/plugin-web-statistics/src` (excl tests) → **0 hits** (read-only gate).
  - `git diff --stat HEAD | grep plugin-web-tokens` → **0 hits** (zero tokens edit gate).
- **Commits:** (pending — commit follows this Work Log entry).
- **Next step:** P2 — BarChart honest consumption + panel "current board" marker (done inline in P1) + api.md §1 JSDoc sync (REC-2 second target) + docs §SRA sync + Status → READY_FOR_VERIFY.

### 2026-05-29 18:10 — Claude Opus 4.8 1M — feature-review (re-review — verdict: APPROVED)

- **Trigger:** re-review the B1 Path-1 revision (feature-plan REVISE 2026-05-29 17:40).
- **Method:** re-read all four-piece §SRA + discovery + carve-out + roadmap; fresh
  source spot-check of every claim the revision touches — `KpiCard.tsx` (no
  sub-label affordance today; confirmed render structure), `types.ts:23` (stale
  "proxy" JSDoc confirmed), dashboard `internal/strings.ts` (`STR_WIDGET_EMPTY` +
  `strEmpty` precedent confirmed), `aggregators.ts` L112-130 (proxy + signature),
  `StatisticsModule.tsx` L148-155/L204-214 (KPI + BarChart `sc-head` sites),
  `index.ts` (barrel unchanged), `isTaskColsRecord.ts`/`taskStats.ts`/
  `xai-web-tasks/src/types.ts` (read-shape + `done` semantics), grep gate (0
  `setPref("xai_task_cols")` in package).
- **Verdict: APPROVED — 0 blockers.** B1 RESOLVED via Path 1: user-visible "current
  board" / "当前看板" marker on BOTH the Tasks KPI (new optional `KpiCard.subLabel`,
  additive — 3 non-tasks cells omit it) AND the Tasks BarChart panel header
  (`sc-head`), copy from a LOCAL `src/internal/strings.ts` STR map — ZERO
  `plugin-web-tokens` edit (build-time `git diff --stat` gate). The marker renders on
  every range tab while the value stays range-invariant (S14/S15/S3/S4). REC-1
  (BarChart consistency) + REC-2 (dual `types.ts:23` + api §1 JSDoc sync) folded into
  the Phase Plan. Frozen Assumption #11/roadmap "ZERO i18n" → "ZERO
  `plugin-web-tokens` edit; ≤2 LOCAL STR" corrected.
- **Regression check:** confirmed the previously-APPROVED content was NOT broken —
  proxy-retirement edit (L110-130), read-shape (`Record<BucketId,TaskCol>`,
  `col.tasks`, RD2, absent `done`===false), read-only gate, boundaries (no
  core/manifest/event/import/host/chart-body/`dev`), 2-phase split, and the
  NARROW/TASKS/A21-23/S11-13 test inventory all preserved verbatim. The ONLY scope
  delta is the optional `KpiCard.subLabel` prop + ≤2 LOCAL STR strings (both additive,
  inside the package).
- All five gates PASS (re-review summary written above). Carry-forward build action
  items recorded (diff gate, grep gate, REC-2 dual edit, optional prop, OQ-C honest
  fill, lint --max-warnings 0, commit body).
- **Status Panel:** Current Phase = FEATURE_REVIEW, Status = APPROVED, Suggested
  Next = feature-build, Blockers = NONE.
- **Commits:** — (review writes docs only).
- **Next step:** `feature-build` — execute Phase P1 (pure layer + proxy retirement +
  KPI swap + KPI "current board" marker), then stop for confirmation. Or
  `feature-auto-build` / `feature-dev-loop` for the full pass.

### 2026-05-29 17:40 — Claude Opus 4.8 1M — feature-plan (REVISE — B1 resolved via Path 1)

- **Trigger:** feature-review verdict REVISE (1 blocker B1 + REC-1 + REC-2). Operator selected **Path 1** (surface a user-visible "current board" marker; show the real count) over Path 2 (defer the number).
- **B1 resolved (Path 1):** the range-invariant Tasks count now carries a USER-VISIBLE "current board" / "当前看板" marker on BOTH surfaces:
  - Tasks KPI — new OPTIONAL `KpiCard.subLabel?: string` prop (additive; the 3 non-tasks cells omit it → byte-identical). Verified against live `KpiCard.tsx` (no sub-label affordance today).
  - Tasks BarChart panel header (`sc-head` at `StatisticsModule.tsx:204-214`) — same marker span; the `BarChart` leaf body is NOT touched.
  - Copy via a NEW LOCAL `src/internal/strings.ts` STR map (`STR_STATS_TASKS` + `strStats`), ≤2 keys, mirroring the SHIPPED dashboard `STR_WIDGET_EMPTY`/`strEmpty` (`packages/xai-web-dashboard-widgets/src/internal/strings.ts`). **ZERO `plugin-web-tokens` edit.**
- **Frozen Assumption #11 + roadmap reworded:** "ZERO i18n" → "ZERO `plugin-web-tokens` edit; ≤2 LOCAL STR strings (dashboard `strings.ts` precedent)". (design §SRA.2 #11; roadmap R6 #11 + R7 i18n line.)
- **REC-1 applied:** OQ-B = keep the Tasks BarChart, framed with the SAME "current board" marker (consistent with the KPI); OQ-C honest fill gated by that marker (no fabricated time split). KPI-only kept as a blessed build fallback.
- **REC-2 applied:** Phase Plan now explicitly edits BOTH the live `src/types.ts:23` JSDoc (P1) AND the `api.md §1` line ~51 (P2) — currently both say "proxy for tasks completed". Confirmed both stale lines against source.
- **NOT changed (review-APPROVED, preserved verbatim):** proxy-retirement edit (`aggregators.ts` L110-130), read-shape (`Record<BucketId, TaskCol>`, `col.tasks`, RD2 guard, absent `done`===false), read-only `usePref` gate + grep gate, boundaries (no plugin import / no core / no event / no host edit / no chart-body rewrite / no `dev`), 2-phase split, and the NARROW/TASKS/A21-23/S11-13 test inventory.
- **Tests added by the revision:** K5 (`KpiCard.subLabel` conditional render) + S14 (KPI marker) + S15 (BarChart panel marker) + a build-time `git diff --stat` gate asserting NO `plugin-web-tokens` change.
- **Docs revised:** discovery review (Q2/Q3 REVISION + new §3.5 + §4 table + RA6/RA7/RA9 + §6.2 resolved + §5 + §7 evidence), design §SRA (#5/#11/#12 + component graph + data-flow + RA recap), api §SRA (SRA.4 REC-2 + SRA.5 wiring + SRA.7 local-STR + new SRA.10 `KpiCard.subLabel`), test §SRA (K5 + S14/S15 + acceptance rows), this dev_log §SRA (Status Panel + Decision Headline + P1/P2 + risks + OQs + this entry). SHIPPED row #20 content UNTOUCHED.
- **Commits:** — (planning produces docs only; first code commit at feature-build P1).
- **Status Panel:** Status = NEEDS_REVIEW; Suggested Next = feature-review; Blockers = B1 RESOLVED (awaiting re-review).
- **Handoff:** `feature-review` — re-review the B1 Path-1 fix (user-visible "current board" marker + ≤2 local STR) + REC-1 (BarChart consistency) + REC-2 (dual JSDoc); APPROVE or REVISE.

### 2026-05-29 17:05 — Claude Opus 4.8 1M — feature-review (verdict: REVISE)

- Read all four-piece §SRA + discovery + roadmap + carve-out; spot-checked EVERY
  load-bearing claim against source (`aggregators.ts`, `StatisticsModule.tsx`,
  `KpiCard.tsx`, dashboard `taskStats.ts`/`isTaskColsRecord.ts`/`StatTasks.tsx`,
  storage `registry.ts`, `xai-web-tasks/src/types.ts`, `plugin-web-tokens/i18n.ts`,
  statistics `index.ts`/`types.ts`). All facts verified TRUE.
- Verdict: **REVISE** — 1 blocker (B1: OQ-A range-invariant count needs a
  USER-VISIBLE honesty marker on a range-tab page; JSDoc/api.md are dev-only and the
  dashboard precedent is range-tab-FREE so it doesn't cover this surface) + 2
  recommendations (REC-1 make OQ-B/OQ-C consistent with the OQ-A pick; REC-2 confirm
  the published `types.ts:23` + api §1 JSDoc both get the retired-proxy update).
- The proxy-retirement logic, read-shape, boundaries, read-only gate, phase split,
  and test inventory are all APPROVED-quality — the revision is scoped to HOW the
  range-invariant number is framed to the user, not the count itself.
- Status Panel: Current Phase = FEATURE_PLAN, Status = NEEDS_REVIEW, Suggested Next =
  feature-plan, Blockers = B1. Review Notes written above.
- Commits: — (review writes docs only).
- Next step: `feature-plan` — apply B1 (pick path 1 marker / ≤2 local STR, or path 2
  defer) + REC-1/REC-2, then re-submit for review.

### 2026-05-29 16:20 — Claude Opus 4.8 1M — feature-plan (Fresh)

- **Goal:** plan the carve-out `xai-web-statistics-real-aggregation` (retire the pomodoro-as-tasks proxy; read real `done` count from `xai_task_cols`).
- **Done:**
  - Located the proxy precisely: `internal/aggregators.ts` JSDoc L14-19 + live logic L110-130 (`taskBuckets[idx] += 1` per focus session + prior-window session count → `tasksTotal`/`tasksTrend`).
  - Confirmed read-shape from the SOURCE OF TRUTH: `xai_task_cols` registry default `{}` (`Record<BucketId, TaskCol>`), cards at `col.tasks` (+ `col.completed`), `TaskCard.done?: boolean` (T-10, `xai-web-tasks/src/types.ts:55-61`). Corrected the brief's loose "TaskCol[]" → it is a keyed Record. RD2 guard: NOT flattened.
  - Confirmed the SHIPPED precedent for the EXACT metric/key: dashboard `countDone()` + `isTaskColsRecord()` + AC-RD-TASKS-1..5 — current-board count, no completion timestamp.
  - Resolved all 3 carve-out planner's-calls: Q1 calendar → DEFER (justified); Q2 window → range-invariant current-state count (D-QT honesty; no timestamp + `date` is display string); Q3 surfaces → KPI (real count, trend "—") + honest Tasks BarChart (no fake split). Added OQ-D/OQ-E.
  - Flagged the path discrepancy: code lives in `packages/plugin-web-statistics/` but the docs four-piece is at `packages/xai-web-statistics/docs/` (web convention) — wrote §SRA to the EXISTING docs (APPEND), NOT the brief's wrong `plugin-web-statistics/docs/` path.
  - Wrote discovery review + roadmap manifest; appended §SRA to design/api/test/dev_log (SHIPPED row #20 content untouched).
- **Commits:** — (planning produces docs only; first commit at feature-build P1).
- **Tests:** — (planned: NARROW-1..6, TASKS-1..7, updated A14/A1-3 + new A21-23, updated S2 + new S11-13; read-only grep gate).
- **Risks:** RA1..RA8 (table above). Main reviewer calls: OQ-A (window) + OQ-B (surface scope).
- **Handoff:** `feature-review` — validate the proxy-retirement plan + read-only guarantee + window-semantics honesty (OQ-A) + surface scope (OQ-B); APPROVE or REVISE. Status → NEEDS_REVIEW; Suggested Next → feature-review.
