# Roadmap Manifest — xai-web-statistics-real-aggregation

- Roadmap Source: `docs/reviews/_p0-carve-outs/20260529-statistics-real-aggregation.md` (P0 carve-out, commit `1ba5902`) + `docs/reviews/xai-web-statistics-real-aggregation/20260529-discovery-review.md`
- Source Code Reference: `packages/plugin-web-statistics/` (SHIPPED row #20 baseline 2026-05-23, manifest `status: Stable`) — **EXTENSION only**. Adds a 4th read key `xai_task_cols` (PRE-EXISTING registry key, read-only) + a local `narrowTaskCols` predicate + a `countDoneTasks` pure aggregator; **retires** the pomodoro-as-tasks-completed proxy in `internal/aggregators.ts`. **ZERO new registry key.** `packages/core/` untouched (NO event channel; NO `packages/core/src/types/events.ts` edit). `@repo/plugin-web-tokens` (i18n bundle) NOT edited (existing `statistics.tasks_completed` label reused; metric numeric). **Post-review B1 / Path 1:** a user-visible "current board" marker is added on the KPI + BarChart panel, copy from a LOCAL `src/internal/strings.ts` STR map (≤2 keys; dashboard `STR_WIDGET_EMPTY` precedent) — still ZERO `plugin-web-tokens` edit. NO other plugin package imported (cross-module read is `usePref("xai_task_cols")` + key string + LOCAL predicate — the Statistics + Cmd-K + dashboard-#2 law). **READ-ONLY on `xai_task_cols` — Statistics MUST NEVER write tasks.**
- Docs Four-Piece Location: `packages/xai-web-statistics/docs/{design,api,test,dev_log}.md` (project web convention: code under `plugin-web-*`, docs under `xai-web-*`). **APPEND extension sections (§SRA / §E-style); do NOT overwrite the SHIPPED row #20 content.**
- Closest Precedent (same key, same metric, same law): `packages/xai-web-dashboard-widgets/src/internal/dataReads/{taskStats.countDone,isTaskColsRecord}` (SHIPPED dashboard-real-data #2, 2026-05-28) — reads `xai_task_cols` for `done`/`total` via `usePref` + a LOCAL predicate, NO plugin import; documents the metric as a CURRENT-board count (no completion timestamp). This feature re-applies that exact pattern inside the Statistics package and additionally RETIRES a proxy.
- In-package precedent: `packages/plugin-web-statistics/src/StatisticsModule.tsx` already reads 3 keys via `usePref` + local predicates (`isPomodoroSession`, `isHabitsStateRecord`); api.md §0 states "the only allowed import path is `@repo/plugin-web-statistics`" and §2 lists read keys. This row adds a 4th read key in the same shape.
- Authority Anchor: **ADR-0010 Accepted 2026-05-26 §D4** ("new feature plans require an explicit P0 carve-out commit citing this ADR's D1") — carve-out commit `1ba5902` (2026-05-29).
- Init Path: `single-feature` (no decomposition; one feature row spans 2 internal phases).
- Generated: 2026-05-29
- Default Automation Mode: **A-Claude** (inherited from sibling item-3 cluster + Web carve-outs; can be picked at feature-build dispatch time).
- Default Dependency Semantics: N/A (single row, no internal deps).
- Default Verify Cross-vendor: **DEFERRED 24h per ADR-0008 §S3** (no new visual surface — the Tasks KPI is a number swap and the Tasks BarChart keeps its SHIPPED rendering; the only visual delta is the rendered value/empty-state). Same-vendor (Claude/Vitest) unit + barrel gates are the build-phase gate; a Codex/Cursor cold-read MAY be queued at ship per the cluster default but is NOT a build-phase blocker. Deferral recorded in `dev_log.md` §SRA verify section.
- BG Direct Verified: unreliable-for-feature-loops (inherited; use serial / emit dispatch for any auto-loop chains).
- Manifest Review: REQUIRED (init stops here; `feature-review` must APPROVE before `feature-build` starts).
- Authority Override: this manifest **does NOT supersede** the SHIPPED `xai-web-statistics` row #20 FEATURE_DEV lineage, the SHIPPED `xai-web-console.md` / gap-closure archives, the SHIPPED dashboard-real-data / smart-list / T-10 lineages, nor any ADR. It adds **one extension** (§SRA lineage) on top of the SHIPPED Statistics module.
- Interop with PLUGIN_MAP.md: row `@repo/plugin-web-statistics` status STAYS `Stable`. Ship appends a feature note to the row's description column (NOT a status change). Registry-owning row `@repo/plugin-web-storage` UNCHANGED (read-only consumer — no key, no parity-array edit). `@repo/plugin-web-tasks` UNCHANGED (we read its key, never its package).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-statistics-real-aggregation | docs/reviews/_p0-carve-outs/20260529-statistics-real-aggregation.md | — | — | NEEDS_REVIEW (B1 revised → re-review) | A-Claude (default) | DEFERRED 24h per ADR-0008 §S3 (no new visual surface; same-vendor unit+barrel is the build gate; optional Codex cold-read at ship) | 2026-05-29 (feature-plan REVISE) | Single-row read-only real-data swap (item-3 local cluster #4; after T-10 ✅ + dashboard-real-data ✅ + smart-list ✅). **Post-review B1 (Path 1):** user-visible "current board" marker on KPI + BarChart panel via LOCAL `internal/strings.ts` STR (ZERO `plugin-web-tokens` edit); REC-1 (BarChart consistency) + REC-2 (dual JSDoc) folded in. Awaiting re-review. **RETIRES the SHIPPED pomodoro-as-tasks-completed proxy** (`internal/aggregators.ts:14-19` JSDoc + L110-130 logic) and replaces it with a REAL `done`-count read of `xai_task_cols` (the SHIPPED key T-10 made carry `TaskCard.done?: boolean`). New code = (1) a LOCAL `internal/narrowTaskCols.ts` predicate mirroring the SHIPPED dashboard `isTaskColsRecord` (cards at `col.tasks`/`col.completed`, NOT flattened — RD2 guard; absent `done` === false); (2) a pure `countDoneTasks(taskCols): number` aggregator (all-bucket `done===true` count; identical semantics to dashboard `countDone().done`); (3) a surgical edit to `aggregateRange` to feed the Tasks KPI from the real count + set `tasksTrend = "—"` (no honest prior-window for a timestamp-less current-state count). **Window semantics (discovery Q2):** CURRENT-board count, RANGE-INVARIANT — `TaskCard` has NO completion timestamp + `date` is a display string, so per-day/per-window completion CANNOT be honestly claimed (D-QT discipline; same as SHIPPED dashboard StatTasks). The KPI shows the same number on week/month/all. **Surfaces (discovery Q3 + post-review B1/Path 1):** "Tasks completed" KPI (real count, trend "—") + the existing Tasks BarChart fed an HONEST representation (single real total / current-bucket fill — NO fabricated time split; BarChart component NOT rewritten). **BOTH surfaces carry a USER-VISIBLE "current board" / "当前看板" marker** (KPI via a new optional `KpiCard.subLabel` prop; BarChart via a muted span in the panel `sc-head`) so the range-invariant number is honestly framed on the range-tab page — copy from a LOCAL `src/internal/strings.ts` STR map (ZERO `plugin-web-tokens` edit; dashboard `STR_WIDGET_EMPTY` precedent). **Calendar stat (discovery Q1):** DEFERRED — v1 only retires the tasks proxy + adds the real task metric; calendar reads are a later additive row. **Honest empty (carve-out In-scope):** when `done` total === 0 the KPI shows `0` (honest), no fabricated number. **pomodoro metrics UNTOUCHED** (focus minutes / daily-avg / peak-hour / hour-distribution / heatmap / focus LineChart all stay derived from real `xai_pomodoro_sessions` — only the tasks proxy is removed). **habits aggregation UNTOUCHED** (already real). 2-phase build (P1 = predicate + aggregator + proxy retirement + KPI swap; P2 = BarChart honest consumption + zero-state + docs + verify; P2 MAY fold into P1). Public surface UNCHANGED (`src/index.ts` exports unchanged — predicate + aggregator stay `internal/`; index-barrel test asserts no new export). **NO new registry key, NO new npm dep, NO Supabase, NO IndexedDB, NO auth change, NO `packages/core/` edit, NO `packages/core/src/types/events.ts` event channel, NO `@repo/plugin-web-tokens` (i18n-bundle) edit — the Path-1 marker copy is ≤2 LOCAL STR in `src/internal/strings.ts`, NO host-shell registration edit, NO chart-component BODY rewrite (the additive optional `KpiCard.subLabel` prop on the KPI cell is Path 1, not a chart rewrite; the BarChart marker is in the panel `<div>`, not the chart leaf), NO write to `xai_task_cols` (or any store), NO SHIPPED-archive/ADR edit, NO `dev` branch.** |

## Decomposition Rationale

### R1. Init path: single-feature

The carve-out is a single coherent extension (read 1 existing store → swap the tasks KPI source → retire the proxy → honest zero). No PRD-to-rows decomposition. The feature is internally phased (2 phases), and each phase is a single `feature-build` run per CLAUDE.md "feature-build does ONE phase per run."

### R2. Why a roadmap manifest for one feature

1. **P0 carve-out audit trail.** ADR-0010 §D4 requires an explicit P0 carve-out for new Web work; a roadmap manifest makes the authority chain (carve-out doc → roadmap → package dev_log §SRA) discoverable from `docs/workflow/roadmap/`.
2. **Workflow V2 default.** Identical shape to the sibling item-3 cluster manifests (`xai-web-dashboard-real-data.md`, `xai-web-tasks-smartlist-filter.md`) — avoids special-casing the 4th item-3 cluster feature.

### R3. Why 2 phases (not 3 like dashboard-real-data)

dashboard-real-data needed 3 phases because it rewired 5 widgets across 4 stores with a recurrence concern. This feature touches **1 store, 1 metric, 2 consumption sites** (KPI + one BarChart). The natural split:
- **P1** = the pure layer + the swap: `narrowTaskCols` predicate + `countDoneTasks` aggregator + retire the proxy in `aggregateRange` + feed the KPI from the real count (the acceptance-anchor-satisfying change). Highest-recon piece (read-shape) + the core retirement land together so the proxy is never half-removed.
- **P2** = the Tasks BarChart honest consumption (per Q3/OQ-B/OQ-C) + honest zero-state polish + docs four-piece §SRA sync + barrel-confirm + verify.
- **P2 MAY fold into P1** if the BarChart consumption + zero-state land cleanly inline and the barrel stays unchanged (likely) — flagged for reviewer (OQ-E).

### R4. AskUserQuestion ambiguity resolution

The carve-out hands the planner 3 named calls (Q1 calendar-defer, Q2 window-semantics, Q3 surface-scope). All 3 are resolved with rationale in discovery §3, plus 2 planner-added (OQ-D aggregator-shape, OQ-E phase-count). **No further AskUserQuestion is required by `feature-plan`.** `feature-review` may override any call before approving — see discovery §6.2 OQ-A..OQ-E (most notably OQ-A window semantics + OQ-B surface scope).

### R5. AutomationMode / Verify Cross-vendor defaults

- Default Automation Mode: `A-Claude` (inherited from the sibling item-3 cluster + Web carve-outs; no per-row picker fires at dispatch).
- Default Verify Cross-vendor: **DEFERRED 24h per ADR-0008 §S3** — no new visual surface (number swap + honest empty-state on already-SHIPPED chart/KPI components). Same-vendor Vitest unit + barrel + lint + typecheck are the build-phase gate. An optional Codex/Cursor cold-read may be queued at ship.
- Reviewer may override at `feature-review` time (e.g. require a same-vendor StatisticsModule render smoke if the BarChart consumption shape changes rendering).

### R6. Frozen assumptions + open uncertainties

**Frozen (from carve-out + discovery §0/§2/§3 + design §SRA — 12 items):**

1. Owning package (code) = `@repo/plugin-web-statistics` (EXTENSION; no new package). Manifest stays `Stable`. Docs four-piece = `packages/xai-web-statistics/docs/` (APPEND §SRA).
2. Read pattern = `usePref("xai_task_cols")` + LOCAL `narrowTaskCols` predicate, NEVER cross-plugin import.
3. Source key (PRE-EXISTING, read-only) = `xai_task_cols`. ZERO new key. Registry default `{}` (`Record<BucketId, TaskCol>`).
4. Read shape = cards at `col.tasks` (+ optional `col.completed`), NOT flattened (RD2 guard). `TaskCard.done?: boolean`; absent === `false`.
5. New code = LOCAL `internal/narrowTaskCols.ts` predicate + a pure `countDoneTasks(taskCols): number` aggregator (Statistics `internal/` pattern); injected via `aggregateRange` (OQ-D: extend signature vs separate fn — reviewer call).
6. "Tasks completed" metric = all-bucket `done===true` count, **CURRENT-board, RANGE-INVARIANT** (no completion timestamp; D-QT honesty).
7. `tasksTrend` = `"—"` (no honest prior window for a timestamp-less count). Retires the proxy's fabricated `+N%`.
8. Surfaces = "Tasks completed" KPI (real count) + Tasks BarChart (HONEST single-total / current-bucket fill, NO fabricated time split). OQ-B reviewer may pick KPI-only.
9. Honest empty = KPI shows `0` when `done` total === 0 (no fabricated number).
10. pomodoro metrics (focus minutes / daily-avg / peak / hour-dist / heatmap / focus LineChart) UNTOUCHED — only the tasks proxy retired. habits aggregation UNTOUCHED.
11. **(REVISED post-review B1 / Path 1)** copy / i18n = **ZERO `plugin-web-tokens` edit; ≤2 NEW LOCAL bilingual STR strings** in `src/internal/strings.ts` (the "current board" / "当前看板" marker), mirroring the SHIPPED dashboard `STR_WIDGET_EMPTY` (`stat_tasks_empty`) + `strEmpty` precedent. `statistics.tasks_completed` reused unchanged; metric VALUE numeric. Local-STR is the project convention (tasks/calendar/dashboard) — NOT an i18n-bundle change.
12. READ-ONLY on `xai_task_cols` — NO `setPref("xai_task_cols", …)` anywhere. Public surface UNCHANGED (`index.ts` exports unchanged; `narrowTaskCols` + `countDoneTasks` + `internal/strings.ts` stay internal). NO `packages/core` edit, NO event channel, NO host edit, NO chart-**body** rewrite (the `KpiCard.subLabel` prop is additive on the KPI cell — Path 1), NO `dev` branch.

**Frozen guesses (recorded for reviewer override — discovery §6.2 OQ-A..OQ-E):**

1. OQ-A window semantics: RANGE-INVARIANT current-state count (recommended; no timestamp) vs a bucketed approximation.
2. OQ-B surface scope: KPI + honest single-total BarChart (recommended) vs KPI-only.
3. OQ-C BarChart fill shape: single-bar vs last-bucket-fill (both honest; small build call).
4. OQ-D aggregator shape: extend `aggregateRange(taskCols)` (recommended, one useMemo) vs a separate `aggregateTasksCompleted` pure fn.
5. OQ-E phase count: 2 phases (recommended) vs folding P2→P1.

### R7. Cycle expectations

- Total estimated effort: **0.5-1 day** of build + verify (smaller than dashboard-real-data — 1 store, 1 metric, 2 consumption sites; no recurrence; no widget cluster).
- Total estimated commits: **2-3** (1 phase commit each + optional docs sync).
- Test additions: **~17-21 new/updated tests** (~6-8 pure `narrowTaskCols`+`countDoneTasks` units mirroring AC-RD-TASKS-1..5 + ~4-6 updated `aggregators.test.ts` cases for the tasks-KPI swap + tasksTrend "—" + a read-only/no-mutation assertion + ~4-6 updated `StatisticsModule.test.tsx` for the real-count KPI + honest zero + the KPI/BarChart "current board" markers S14/S15 + 1 new `KpiCard.test.tsx` K5 for the `subLabel` prop).
- SHIPPED tests stay green: ALL pomodoro/habits/heatmap/insight/component tests no regression; the tasks-specific assertions in `aggregators.test.ts` (A14 "tasksTotal === sessions count") + `StatisticsModule.test.tsx` (S2 tasksTotal) are **UPDATED** (old proxy assertions replaced, not multiplied) since the metric source changes.
- New registry entries: **0** (read-only).
- New CSS rules: **0-1** (optional `.kpi-sublabel` muted rule for the Path-1 marker, or reuse `.muted`; chart rendering unchanged; no new design token).
- New i18n keys via `plugin-web-tokens`: **0**. (Post-review B1: the "current board" marker copy is ≤2 LOCAL STR strings in `src/internal/strings.ts` — dashboard `STR_WIDGET_EMPTY` precedent — NOT a `plugin-web-tokens` edit.)
- New `packages/core/` event channels: **0**.
- New host-shell registration edits: **0**.
- Storage / web suites: UNCHANGED (no registry, no host edit).

### R8. Phase exit criteria summary

| Phase | Exits when | Cross-vendor required? |
|---|---|---|
| P1 | `internal/narrowTaskCols.ts` predicate + `countDoneTasks` aggregator + `internal/strings.ts` STR map land; `aggregateRange` reads `taskCols` and feeds the Tasks KPI from the REAL `done` count; proxy logic (L110-130 task-increment + prior-window task count) RETIRED; `tasksTrend = "—"`; `types.ts:23` JSDoc de-proxied (REC-2); `KpiCard` gains optional `subLabel` + the tasks KPI renders the "current board" marker (Path 1 / B1); `StatisticsModule` passes `usePref("xai_task_cols")` + `subLabel` ; AC-SRA-TASKS-* + K5 + S14 + read-only/no-mutation assertion green; SHIPPED pomodoro/habits/heatmap/insight tests still green; updated A14/S2 green; `eslint --max-warnings 0` + typecheck clean; NO change to index.ts/registration.tsx/storage/core; `git diff --stat` shows NO `plugin-web-tokens/` change; NO `setPref("xai_task_cols")` (grep gate = 0) | no (same-vendor Vitest) |
| P2 | Tasks BarChart consumes the honest representation (per OQ-B/OQ-C) — NO fabricated time split, BarChart component NOT rewritten; **the Tasks BarChart panel header carries the SAME "current board" marker (REC-1)**; honest zero-state confirmed (`total===0` → KPI `0` + marker, BarChart honest empty); `api.md §1` JSDoc synced to `types.ts:23` (REC-2 dual target closed); docs four-piece §SRA synced (design/api/test/dev_log); index-barrel test still green (single/unchanged export set; no `strStats` leak); S15 + full `@repo/plugin-web-statistics` suite + lint + typecheck green; `pnpm -w build` green; storage + web suites UNCHANGED; XVENDOR DEFERRED per ADR-0008 §S3 (recorded in dev_log §SRA) OR optional Codex cold-read; PLUGIN_MAP note appended at ship | DEFERRED (optional Codex cold-read at ship) |

### R9. Status legend

- `NEEDS_REVIEW` — plan written, awaiting `feature-review`.
- `APPROVED` — `feature-review` PASSED; next is `feature-build` (P1).
- `READY_FOR_VERIFY` — all phases built; awaiting `feature-verify`.
- `READY_TO_SHIP` — verify passed; awaiting `ship`.
- `SHIPPED` — `ship` pushed to `origin/web`.
- `BLOCKED` — any agent set this with a reason; next step usually `feature-plan` (revise) or `feature-build` (fix).

### R10. Run instructions (operator)

After `feature-review` APPROVES:

**Manual mode** (one phase per run, recommended for first run after a feature-plan):

```text
Start the feature-build agent for xai-web-statistics-real-aggregation.   # Phase P1 only
# review the diff + commit, then:
Start the feature-build agent for xai-web-statistics-real-aggregation.   # Phase P2 only
```

**Auto mode** (cycle build + verify after APPROVED):

```text
Start the feature-dev-loop agent for xai-web-statistics-real-aggregation.   # auto-runs both phases + verify
# then:
Start the ship agent for xai-web-statistics-real-aggregation.
```

### R11. References

- Discovery review: `docs/reviews/xai-web-statistics-real-aggregation/20260529-discovery-review.md`
- P0 carve-out doc: `docs/reviews/_p0-carve-outs/20260529-statistics-real-aggregation.md` (commit `1ba5902`)
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Audit trigger: `docs/reviews/_web-noop-audit/20260528-usability-recheck.md` ("Statistics ... tasks-completed is faked")
- Closest precedent (same key, same metric): `packages/xai-web-dashboard-widgets/src/internal/dataReads/{taskStats,isTaskColsRecord}.ts` + `__tests__/taskStats.test.ts` (AC-RD-TASKS-1..5)
- The proxy being retired: `packages/plugin-web-statistics/src/internal/aggregators.ts` (JSDoc L14-19; logic L110-130)
- Owner canonical types (read-shape source of truth): `packages/xai-web-tasks/src/types.ts` (`TaskCard.done` L55-61; `TaskCol` L67-80; `BucketId` L17)
- Registry (source key, read-only): `packages/plugin-web-storage/src/internal/registry.ts:197-204` (`xai_task_cols` default `{}`, owner `xai-web-tasks`)
- SHIPPED baseline being extended: `packages/xai-web-statistics/docs/{design,api,test,dev_log}.md` (row #20) + `packages/plugin-web-statistics/src/{StatisticsModule.tsx,internal/aggregators.ts}`
- Sibling item-3 cluster manifests: `docs/workflow/roadmap/xai-web-dashboard-real-data.md`, `docs/workflow/roadmap/xai-web-tasks-smartlist-filter.md`
- Workflow refs: `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0007 (web build form): `docs/adr/0007-xai-web-console-build-form.md`
- ADR-0008 §S3 cross-vendor carve-out precedent: `docs/adr/0008-cloudflare-pages-deploy-recipe.md`

## Open Operator Decisions (none blocking)

- **RESOLVED (2026-05-29, post-review):** OQ-A (window semantics) + OQ-B (surface scope) were the review's focus. `feature-review` raised B1 (the range-invariant count needs a user-visible honesty marker on the range-tab page); operator selected **Path 1** — show the real count + a "current board" marker on KPI + BarChart panel (≤2 LOCAL STR, ZERO `plugin-web-tokens` edit). OQ-C/OQ-D/OQ-E passed review. Re-review pending. This is item-3 local cluster #4; subsequent item-3 work per carve-out context: 3d-iii Weather/Mail → 3e AI (last).
