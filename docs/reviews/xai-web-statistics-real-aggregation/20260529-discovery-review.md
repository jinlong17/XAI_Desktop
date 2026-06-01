# Discovery Review — xai-web-statistics-real-aggregation

- **Feature:** `xai-web-statistics-real-aggregation`
- **Owning package (code):** `packages/plugin-web-statistics/` (`@repo/plugin-web-statistics`, SHIPPED row #20, manifest `status: Stable`) — **EXTENSION** of the SHIPPED Statistics module.
- **Owning package (docs four-piece):** `packages/xai-web-statistics/docs/` (project web convention: code under `plugin-web-*`, docs under `xai-web-*`).
- **Authority:** ADR-0010 §D4 — P0 carve-out commit `1ba5902`. Carve-out doc: `docs/reviews/_p0-carve-outs/20260529-statistics-real-aggregation.md`.
- **Branch:** `web` (NOT `dev`).
- **Mode:** Fresh (2026-05-29) → **REVISE (2026-05-29, post-review B1)**. The first pass was reviewed REVISE for one product-honesty blocker (B1 — OQ-A range-invariant scalar needs a user-visible marker). This pass applies **Path 1** (user-visible "current board" marker + ≤2 local STR) + REC-1 (BarChart consistency) + REC-2 (dual JSDoc sync). All other content (proxy retirement, read-shape, boundaries, phases, tests) is review-APPROVED and unchanged.
- **Date:** 2026-05-29
- **Context:** item-3 local cluster #4 (after T-10 ✅ done-persistence, dashboard-real-data ✅, smart-list ✅ all SHIPPED). Subsequent: 3d-iii Weather/Mail → 3e AI (last). Cross-vendor smoke DEFERRED per ADR-0008 §S3.

---

## §0. Problem framing

The SHIPPED Statistics module (row #20, 2026-05-23) carries an explicit, documented proxy hack: it counts **pomodoro focus sessions as "tasks completed."** This was the honest call at build time because no task-completion signal existed to read.

Located at `packages/plugin-web-statistics/src/internal/aggregators.ts:14-19` (JSDoc) + the live logic at lines 110-130:

```ts
// L112-120 — the proxy: every in-range focus session increments taskBuckets by 1
for (const s of focusSessions) {
  ...
  taskBuckets[idx] = (taskBuckets[idx] ?? 0) + 1;   // ← "1 focus session = 1 task completed" (PROXY)
}
// L124  currentTasksTotal = taskBuckets.reduce(...)   // ← drives the "Tasks completed" KPI
// L128  priorTasksTotal  = focusSessions...+ 1        // ← prior-window proxy for trend
```

The JSDoc (L14-19) explicitly says: *"`aggregateTasksFromSessions` is currently a proxy ... because no `xai_tasks_completed_log` storage key exists today ... swap this proxy out at that time without touching any chart or KPI component."* This carve-out is that swap.

**T-10 (SHIPPED 2026-05-28)** changed the world: task completion now persists as `TaskCard.done?: boolean` inside `xai_task_cols` (confirmed `packages/xai-web-tasks/src/types.ts:55-61`). So Statistics can now read REAL completed-task data and retire the proxy.

**The goal:** read `xai_task_cols` to compute a REAL "tasks completed" metric (count of `done === true` cards), retire the pomodoro proxy, show honest zero when nothing is done, and **NEVER mutate `xai_task_cols`** (read-only — Statistics must never write tasks). pomodoro's own (real) focus/minutes/peak/heatmap metrics stay intact; habits aggregation stays intact (already real).

## §1. Feature classification (SOP_NEW_FEATURE §1.5)

- **Type:** Business-orchestration extension of a SHIPPED read-only aggregator. NOT a standard library-shaped feature; NOT a project-core capability (no macOS/Tauri/multi-window surface — this is the Web Console).
- **Web research required?** **NO.** This is an internal data-source swap on an existing module using an already-SHIPPED storage key and an already-proven in-repo read pattern. No external library, no technology selection, no open-source candidate evaluation. → *No external research required.*
- **Closest in-repo precedent:** `packages/xai-web-dashboard-widgets/src/internal/dataReads/{taskStats.ts,isTaskColsRecord.ts}` (SHIPPED dashboard-real-data #2, 2026-05-28) — reads the SAME `xai_task_cols` key for the SAME `done`/`total` metric via `usePref` + a local predicate, NO plugin import. This carve-out re-applies that exact law inside the Statistics package.

## §2. The cross-module read pattern — boundary confirmation

### §2.1 The law: `usePref(key)` + a LOCAL narrowing predicate, NEVER a cross-plugin import

`StatisticsModule.tsx` already reads three keys this way (`xai_pomodoro_sessions`, `xai_habits_state`, `xai_pref_week_start`) with local predicates (`internal/isPomodoroSession.ts`, `internal/isHabitsStateRecord.ts`). api.md §2 states the read keys explicitly; api.md §0 forbids `src/internal/*` external imports. Adding a fourth read key `xai_task_cols` + a local `narrowTaskCols` predicate is a faithful continuation — it does NOT import `@repo/plugin-web-tasks`. The cross-module contract is the **registry key string**, not a package import. (Same law as dashboard-real-data #2 + Cmd-K adapters.)

### §2.2 Is there an importable read helper? — NO; we add an in-package selector

`@repo/plugin-web-dashboard-widgets` has a working `countDone(store): {done,total}` selector, but it lives in `src/internal/dataReads/` — **un-importable** (red-line: `index.ts` is the only public surface; the dashboard barrel exports `dashboardWidgetRegistrations` only). We therefore **re-implement** the same tiny logic inside `plugin-web-statistics` as a new pure aggregator. This is a deliberate, justified duplication (the same divergence the dashboard accepted vs calendar's `expandRecurrence`): the alternative — promoting a shared `@repo/*` tasks-stats package — is out of scope, higher-risk, and not warranted for ~10 lines of counting logic. Recorded as Risk RA1.

### §2.3 The read-shape recon (load-bearing) — `xai_task_cols` is `Record<BucketId, TaskCol>`, NOT `TaskCol[]`

The carve-out brief loosely says "TaskCol[]". The **runtime registry shape is an OBJECT keyed by bucket id**, default `{}` (`packages/plugin-web-storage/src/internal/registry.ts:197-204`, `default: {} as TaskColsState`). The SHIPPED dashboard reader confirms: `isTaskColsRecord` narrows to `Record<string, { tasks: TaskCard[]; completed?: TaskCard[] }>` where `BucketId = "overdue" | "next7" | "later" | "nodate"` (`packages/xai-web-dashboard-widgets/src/internal/dataReads/isTaskColsRecord.ts:9`).

Three hard recon facts (mirroring dashboard discovery §3.1, RD2 guard):

1. **Cards live at `col.tasks` (+ optional `col.completed`), NOT at `col` directly.** Cmd-K's flattened `Record<string, unknown[]>` read is WRONG/stale — do NOT copy it.
2. **`TaskCard.done?: boolean`** — T-10 made this real (`packages/xai-web-tasks/src/types.ts:55-61`). **Absent/undefined === `false`** for all consumers (AC-RD-TASKS-4 guard).
3. **There is NO completion timestamp on `TaskCard`.** `done` reflects the board's CURRENT state only. There is no per-card "completedAt". This is the single most important fact for the window-semantics call (Q2 below).

## §3. Planner's calls (carve-out hands 3; resolved with rationale)

### Q1 — Also read `xai_calendar_events` for a calendar/event stat? → **DEFER (do not read in v1).** Justified.

The carve-out default is defer; this discovery confirms it.

- **Scope discipline:** v1's contract is precisely "retire the tasks proxy + surface a real task metric." Calendar stats are a separable, additive feature with their own read-shape + recurrence-expansion concern (the dashboard had to re-implement a minimal recurrence expander because calendar's `expandRecurrence` is `internal/`). Folding that in would double the recon surface and the test surface for no acceptance-anchor benefit.
- **The acceptance anchor** (carve-out §5) names only tasks: "completing tasks makes the Statistics 'tasks completed' metric reflect the real count." Calendar is not in the anchor.
- **Honest-zero principle is unchanged** without calendar: the existing Statistics surfaces (focus/habits/heatmap) are untouched; we add exactly one real metric.
- **Forward path:** a later row (sibling to 3d-iii) can add `xai_calendar_events` reads as a pure additive aggregator + new KPI/chart, exactly as the dashboard added MiniCal/Upcoming, without touching this row's logic. Recorded in design "Out-of-scope (deferred)".

### Q2 — "Tasks completed" window semantics (today / week / range tabs) → **current-state count, NOT windowed; honest D-QT approximation.** Justified.

This is the defining call. Because `TaskCard.done` has **no completion timestamp** (§2.3 fact 3), it is *impossible to honestly say "N tasks completed THIS WEEK / THIS MONTH."* `done` is a snapshot boolean of the board's present state.

Two candidate semantics:

- **Option A (REJECTED) — fabricate a window.** Bucket `done` cards into the range's time buckets using each card's `date` display string. **Rejected:** (a) `date`/`dateZh` are *display strings* ("7/31", "6 月 14 日"), not parseable ISO — the dashboard already established this (its Upcoming explicitly excludes task-due merge because "task `date` is a display string, not parseable ISO"). (b) Even if parseable, the card's *due date* is not its *completion date* — bucketing by due date would lie about WHEN it was completed. This would re-introduce exactly the kind of fiction this carve-out removes.
- **Option B (CHOSEN) — current-state total, range-invariant.** "Tasks completed" = `count(done === true across all buckets' tasks + completed)`, the board's CURRENT done count. This is **identical to the SHIPPED dashboard `StatTasks` semantics** (`taskStats.ts:8-12`: *"'Done' is NOT a today-filtered metric — there is no completion timestamp on TaskCard; the `done` boolean reflects the board's CURRENT state"*). The KPI shows the same number regardless of the week/month/all tab. The bar-chart series (if consumed — Q3) likewise cannot be honestly per-bucket, so it is NOT split across buckets.

**D-QT honesty discipline (from dashboard discovery, the "honest approximation" the carve-out cites):** we do not claim per-day precision we cannot back. The metric is documented (api.md §0 + the new aggregator JSDoc) as a **current-board count**, range-invariant. The trend %, which the proxy computed from prior-window focus sessions, is **retired for the tasks KPI** — there is no honest prior-window for a timestamp-less current-state count, so `tasksTrend` becomes the honest em-dash `"—"` (the existing `trendPercent` already returns `"—"` for the no-honest-baseline case; we set it explicitly). This is strictly MORE honest than the proxy's fabricated `+N%`.

> **Reviewer override hook (OQ-A):** if `feature-review` decides a window approximation is preferable to range-invariance, the alternative is "count `done` cards whose bucket is `overdue`/`next7`/`nodate` etc." — but discovery recommends AGAINST it for the timestamp reason above. Frozen as range-invariant pending review.

#### Q2 REVISION (2026-05-29, post-review B1 — Path 1 SELECTED)

`feature-review` (2026-05-29) **APPROVED** the range-invariant reasoning and confirmed Option A (fabricate a window) stays REJECTED, but raised **B1 (blocker)**: a range-invariant scalar placed on a page with PROMINENT range tabs (本周/本月/全部) is **misleading to the END USER** when its only honesty mitigation is JSDoc + api.md §0 (both dev-only, invisible at runtime). A user clicking "本月" and seeing the same "Tasks completed: N" as "本周" reads it as "N completed this month" — exactly the fiction this carve-out removes. The cited dashboard `StatTasks` precedent does NOT cover this: it lives on a range-tab-FREE dashboard and is framed as a `done/total` fraction, so its range-invariance is never ambiguous.

**Resolution: Path 1 (reviewer-PREFERRED + operator-SELECTED) — surface a USER-VISIBLE "current board" honesty marker.**

The tasks metric stays range-invariant (the logic call is unchanged and correct). What changes is that the number is now HONESTLY FRAMED at runtime so the user understands it is a current-board snapshot that does NOT track the range tab:

- **Tasks KPI:** render a small user-visible sub-label "current board" / "当前看板" under the KPI (a new optional `subLabel?: string` prop on `KpiCard`, additive — see §3.5).
- **Tasks BarChart panel:** the panel header (`sc-head` in `StatisticsModule.tsx:204-214`) carries the SAME "current board" framing (see Q3 REVISION / REC-1). The `BarChart` leaf component body is NOT touched — the marker lives in the panel `<div>`, not the chart.
- **Copy source:** ≤2 NEW bilingual strings via a LOCAL `src/internal/strings.ts` STR map + a `str(key, lang)` accessor — the EXACT pattern the SHIPPED dashboard used for `stat_tasks_empty` (`packages/xai-web-dashboard-widgets/src/internal/strings.ts` `STR_WIDGET_EMPTY` + `strEmpty`). **ZERO `plugin-web-tokens` edit.** This is the project's established local-STR convention (tasks `STR_TASK_COMPOSER`, calendar `STR_EVENT_COMPOSER`, dashboard `STR_WIDGET_EMPTY`), NOT an i18n-bundle change. Supersedes RA7's "zero i18n" → "zero `plugin-web-tokens` edit; ≤2 local STR".

Path 1 keeps the acceptance anchor satisfied (the REAL `done` count is shown) AND closes B1 (the number is now honestly framed). Read-only is unaffected — this is purely about HOW the number is presented.

**Path 2 (reviewer ALTERNATIVE, NOT selected):** render the Tasks KPI/panel as an honest "no per-period completion data yet" placeholder instead of an always-on scalar. Trivially honest but delivers LESS of the acceptance anchor. Operator selected Path 1 (show the real count + honest framing) over Path 2 (defer the number).

### Q3 — Which existing surfaces consume the new metric (minimal KPI-only vs also charts)? → **KPI + the existing Tasks BarChart, both fed from the real count; bar chart shows a single honest summary, NOT a fabricated per-bucket split.** Justified.

Today two surfaces consume `taskBuckets`/`tasksTotal` (both proxy-fed):
1. The **"Tasks completed" KPI card** (`StatisticsModule.tsx:148-155`, `value={agg.kpis.tasksTotal}`, `trend={agg.kpis.tasksTrend}`).
2. The **Tasks BarChart** panel (`StatisticsModule.tsx:204-214`, `data={agg.taskBuckets}` + header total `{agg.kpis.tasksTotal}`).

- **KPI:** MUST switch to the real `done` count (this is the acceptance anchor). `tasksTrend` → `"—"` (Q2).
- **BarChart:** the carve-out forbids rewriting chart components ("BarChart/LineChart/RingChart/Heatmap stay; only their data source for the tasks metric changes"). The honest problem: a per-bucket task series is impossible (no timestamp). Two sub-options:
  - **Option B1 (CHOSEN) — keep the BarChart rendering, feed it a `doneByBucket` array derived from the board's CURRENT bucket membership** (i.e. how many `done` cards currently sit in each task bucket: overdue/next7/later/nodate). The bar X-axis is then **task buckets, not time buckets** for the tasks panel — but this requires bucket labels that differ from the focus chart's time labels, which the SHIPPED `RangeAggregate.labels` is shared with the focus LineChart. To avoid a label-semantics clash, **B1 is downgraded:** see B2.
  - **Option B2 (CHOSEN, final) — the Tasks BarChart shows the real total as a single honest representation, and the per-bucket split is dropped to a flat/single-value series (or the panel header total only).** Concretely: `taskBuckets` is replaced by an array whose entries sum to the real `done` total but are NOT a fabricated time-distribution — the simplest honest fill is to put the whole real count in the final (current) bucket and zeros elsewhere, OR render the BarChart with a single bar. The exact rendering shape (single bar vs last-bucket) is a small build-time call flagged for reviewer (OQ-C); both are honest and neither rewrites the BarChart component. **Recommendation: single real total in the panel; if the BarChart must keep an array, fill the current/last bucket with the real count and zeros elsewhere, with a JSDoc stating it is a current-state total, not a time series.**

> **Reviewer override hook (OQ-B):** minimal-KPI-only (drop the Tasks BarChart panel to an honest empty/"current board" state and stop feeding it a fake distribution) is a clean alternative and arguably MORE honest than any bucket-fill. Discovery leans **KPI + honest single-total BarChart**, but flags KPI-only as an acceptable reviewer pick. This is the main open call for `feature-review`.

#### Q3 REVISION (2026-05-29, post-review REC-1 — BarChart consistent with Path 1)

`feature-review` REC-1 requires OQ-B/OQ-C to flow through CONSISTENTLY with the OQ-A Path-1 pick: whatever frames the KPI must also frame the BarChart, so there is no SECOND silent range-invariant surface.

**Resolution (operator-selected — keep the Tasks BarChart, add the SAME "current board" framing):**

- **OQ-B = KPI + honest single-total BarChart (kept).** The Tasks BarChart panel STAYS rendered (no drop to KPI-only). Its panel header (`sc-head`) gets the SAME user-visible "current board" / "当前看板" sub-label as the KPI (drawn from the same `src/internal/strings.ts` STR map — REC-1 consistency). This frames the panel honestly as a current-board snapshot.
- **OQ-C = honest fill, array-length preserved (final shape a small P2 build call).** `taskBuckets` is filled so its entries SUM to the real `done` total but are NOT a fabricated time distribution (the simplest honest fill: the whole real count in the current/last bucket, zeros elsewhere — OR a single-value series). The array length still equals `labels.length` so the `BarChart` component is NOT rewritten. A JSDoc on the fill states it is a current-state total, NOT a time series. **It MUST NOT render a fabricated per-day/per-week distribution** — the array-length-preserving honest fill is acceptable ONLY because the panel now carries the "current board" marker (REC-1).
- **KPI-only fallback (NOT selected):** if the honest BarChart fill proved awkward at build time, dropping the Tasks BarChart panel to an honest "current board" empty/total-only state (no array) is an acceptable reviewer-blessed fallback. Operator selected KEEP-the-BarChart-with-marker.

Net: both tasks surfaces (KPI + BarChart panel) carry the user-visible "current board" framing; neither renders a fabricated time distribution; neither chart component body is rewritten.

### §3.5 Path-1 surfacing mechanics (added 2026-05-29 post-review) — `KpiCard.subLabel` + local `strings.ts`

Path 1 (Q2/Q3 REVISION) introduces the ONLY two new code surfaces the revision adds beyond the original plan. Both are additive, read-only, and do NOT touch `plugin-web-tokens` / `packages/core` / any chart leaf / the public barrel:

1. **`KpiCard` gains an OPTIONAL `subLabel?: string` prop.** Verified against the live component (`packages/plugin-web-statistics/src/KpiCard.tsx`): today `KpiCardProps` = `{ cellId, colorVar, icon, label, value, unit?, trend }` — there is no sub-label affordance. Path 1 adds `subLabel?: string`, rendered as a small muted line under the value (e.g. inside `.kpi-head` or below `.kpi-row-val`). This is **additive, not a rewrite** — every existing call site (focus / habits / daily-avg KPIs) omits the prop and renders byte-identically; ONLY the tasks KPI passes it. A KPI cell is not a "chart", so this does not breach the carve-out's "no chart-component rewrite" red line (the BarChart/LineChart/RingChart/Heatmap bodies stay untouched). A tiny CSS rule for `.kpi-sublabel` (or reuse `.muted`) may be added to `src/styles.css`; no new design token.
   - **This SUPERSEDES the original SRA's "KPI JSX unchanged / no new prop" claim** (design §SRA.5, api §SRA.5). Those said the KPI JSX was unchanged; Path 1 makes the KPI JSX gain one optional prop + one sub-label render. Documented here so build does not re-freeze the stale "no new prop" wording.

2. **New `src/internal/strings.ts` LOCAL STR map (≤2 keys).** Mirrors the SHIPPED dashboard `packages/xai-web-dashboard-widgets/src/internal/strings.ts` (`STR_WIDGET_EMPTY = { stat_tasks_empty: { en, zh }, … }` + `strEmpty(key, lang)`). The statistics version holds the "current board" marker copy, e.g.:

   ```ts
   // src/internal/strings.ts  (@internal — NOT exported from index.ts)
   export const STR_STATS_TASKS = {
     current_board: { en: "current board", zh: "当前看板" },
   } as const;
   export function strStats(key: keyof typeof STR_STATS_TASKS, lang: "en" | "zh"): string {
     return STR_STATS_TASKS[key][lang];
   }
   ```

   Read in `StatisticsModule.tsx` via `strStats("current_board", lang === "zh" ? "zh" : "en")` and passed to the KPI `subLabel` + the BarChart panel header. **ZERO `plugin-web-tokens` edit.** Stays `internal/` (not exported from the barrel — `index-barrel.test.ts` still asserts the unchanged export set). At most 1-2 keys (a single "current board" string covers both surfaces; a second optional key only if a slightly different BarChart-panel phrasing is wanted).

These two surfaces are the full footprint of the B1 fix. Everything else in the plan (predicate, aggregator, proxy retirement, read-only gate, deps, boundaries) is unchanged.

## §4. Tradeoffs & key decisions (consolidated)

| Decision | Chosen | Rejected alternative | Why |
|---|---|---|---|
| Read pattern | `usePref("xai_task_cols")` + local `narrowTaskCols` predicate | Import `@repo/plugin-web-tasks` | Red-line: cross-module read = key string, not import (api.md §0, dashboard #2 law). |
| Selector reuse | Re-implement `countDoneTasks` in-package (pure) | Import dashboard's `countDone` | Dashboard's selector is `internal/` (un-importable); ~10 LOC; promoting a shared pkg is out of scope (RA1). |
| Read shape | `Record<BucketId, {tasks, completed?}>`; cards at `col.tasks` | Cmd-K flattened `Record<string,unknown[]>` | Registry default `{}`; SHIPPED dashboard predicate; RD2 guard. |
| Window semantics | Current-state count, range-invariant, **with a USER-VISIBLE "current board" marker** (Path 1) | Silent range-invariant scalar (orig); OR bucket by card `date` | No completion timestamp; `date` is a display string; bucketing fabricates WHEN. A silent scalar on a range-tab page misleads the user (B1) → marker added. |
| Tasks trend | `"—"` (honest no-baseline) | Keep proxy's prior-window `+N%` | No honest prior window for a timestamp-less count. |
| Surfaces | KPI (real count + "current board" sub-label) + Tasks BarChart (honest total, no fake split, SAME marker in panel header) | KPI-only; or also LineChart/Ring/Heatmap | KPI-only is an acceptable fallback; LineChart/Ring/Heatmap are focus/habit surfaces (out of tasks scope); carve-out forbids chart-body rewrites — the marker lives in the KPI prop + panel `<div>`, not the chart leaves. |
| "Current board" copy | LOCAL `internal/strings.ts` STR map (≤2 keys) + `strStats(key,lang)` | New `plugin-web-tokens` i18n key(s) | Dashboard `STR_WIDGET_EMPTY` precedent; project local-STR convention; ZERO `plugin-web-tokens` edit. |
| pomodoro metrics | Keep ALL real focus/minutes/peak/heatmap intact | Touch them | They are already real; only the tasks proxy is retired. |
| habits metrics | Keep intact (already real) | Touch them | Out of scope. |
| Mutation | READ-ONLY on `xai_task_cols` | Any write | Hard constraint; Statistics must never write tasks. |

## §5. Recommendation

**Proceed (REVISED post-review — Path 1).** Add a fourth read key + a local predicate + one pure aggregator; retire the proxy in `aggregateRange`; feed the KPI (and the Tasks BarChart per B2) from the real `done` count; set `tasksTrend = "—"`; honest zero when `total === 0`; never write. **Surface a USER-VISIBLE "current board" / "当前看板" marker on BOTH the Tasks KPI (new optional `KpiCard.subLabel`) and the Tasks BarChart panel header, drawn from a LOCAL `src/internal/strings.ts` STR map (≤2 keys, dashboard `STR_WIDGET_EMPTY` precedent — ZERO `plugin-web-tokens` edit)** so the range-invariant number is honestly framed on a range-tab page (closes B1). Keep pomodoro + habits aggregation untouched. Defer calendar stats. Two phases (P1 = pure layer + KPI swap + proxy retirement + the KPI marker; P2 = BarChart honest consumption + panel marker + zero-state polish + docs + verify; P2 MAY fold into P1) — see dev_log §SRA Phase Plan.

The change is low-risk: it is the documented swap the original JSDoc anticipated, on an already-SHIPPED key, with an already-SHIPPED precedent for the exact metric AND for the local-STR honesty marker. The B1 fix adds exactly two additive surfaces (an optional `KpiCard` prop + a local STR map) — no chart-body rewrite, no `plugin-web-tokens` / `packages/core` touch, read-only preserved.

## §6. Risks & open questions

### §6.1 Risks (→ dev_log §SRA Risks Snapshot)

| ID | Risk | Mitigation |
|---|---|---|
| RA1 | Logic duplication with dashboard `countDone` | Justified (un-importable internal); ~10 LOC; documented; identical AC-RD-TASKS semantics referenced. |
| RA2 | Read-shape mistake (flattened vs `col.tasks`) | Local `narrowTaskCols` mirrors SHIPPED `isTaskColsRecord`; tests assert `col.tasks` path + RD2 guard. |
| RA3 | Accidental mutation of `xai_task_cols` | Read-only via `usePref` getter only; NO `setPref("xai_task_cols", …)` anywhere; test asserts store identity unchanged after aggregation + grep gate (no setter call). |
| RA4 | Regressing pomodoro/habits KPIs while editing `aggregateRange` | Surgical edit to ONLY the `taskBuckets`/`currentTasksTotal`/`priorTasksTotal`/`tasksTrend` lines; existing A-family aggregator tests must stay green; new tests assert focus/habit KPIs unchanged for a fixed fixture. |
| RA5 | Window-semantics dishonesty (claiming per-day) | Range-invariant current-state count; JSDoc + api.md §0 state it; tasksTrend = "—". |
| RA6 | BarChart fed a fabricated distribution | B2: no fake time split; honest single-total fill (reviewer picks exact shape OQ-C) **+ a "current board" marker in the panel header (Path 1 / REC-1)** so the array-length-preserving fill is honestly framed. |
| RA7 | i18n / new copy needed? | **REVISED (post-review B1):** Path 1 adds ≤2 LOCAL bilingual "current board" strings via `src/internal/strings.ts` (dashboard `STR_WIDGET_EMPTY` precedent) + `strStats(key,lang)`. **ZERO `plugin-web-tokens` edit** (`statistics.tasks_completed` reused; the metric value stays numeric). Local-STR is the project convention, NOT an i18n-bundle change. |
| RA8 | Aggregator signature change ripples to tests | `aggregateRange` gains a `taskCols` param (or a sibling pure fn); existing callers (StatisticsModule + aggregators.test) updated in the same phase; barrel/public surface UNCHANGED. |
| RA9 | `KpiCard` prop addition could regress the 3 other KPI cells | `subLabel?` is OPTIONAL; the 3 non-tasks call sites omit it and render byte-identically; KpiCard test K1..K4 stays green + a new K5 asserts `subLabel` renders only when passed. Additive, not a rewrite. |

### §6.2 Open questions for `feature-review` — RESOLVED post-review (2026-05-29)

- **OQ-A (window semantics): RESOLVED → range-invariant current-state count + a USER-VISIBLE "current board" marker (Path 1).** `feature-review` B1 confirmed the range-invariant logic is correct but required the honesty to be SURFACED (not just JSDoc). Operator selected Path 1 (show the real count, framed honestly) over Path 2 (defer the number). See Q2 REVISION.
- **OQ-B (surface scope): RESOLVED → KPI + honest single-total BarChart, BOTH carrying the "current board" marker (REC-1).** KPI-only stays a blessed fallback if the honest fill proves awkward at build. See Q3 REVISION.
- **OQ-C (BarChart fill shape): small build-time call (single-bar vs last-bucket-fill) — both honest, both array-length-preserving, both gated by the panel marker.** MUST NOT render a fabricated time distribution.
- **OQ-D (aggregator shape):** extend `aggregateRange` signature with `taskCols` (chosen — keeps one entry point) vs a separate `aggregateTasksCompleted(taskCols)` pure fn composed in the module. Discovery leans extend-signature for a single useMemo; reviewer did not object. (Review PASS.)
- **OQ-E (phase count):** 2 phases (recommended) vs folding into 1. P2 may fold into P1 if BarChart consumption + zero-state + the "current board" marker land inline. (Review PASS — fold allowed.)

## §7. Evidence index (source files read end-to-end)

- `docs/reviews/_p0-carve-outs/20260529-statistics-real-aggregation.md` — carve-out doc (authority, scope, planner's calls).
- `packages/plugin-web-statistics/src/internal/aggregators.ts` — the proxy (JSDoc L14-19; live logic L110-130); window/boundary logic.
- `packages/plugin-web-statistics/src/StatisticsModule.tsx` — `usePref` ×3 read pattern; KPI + BarChart consumption sites (L76-95, L148-155, L204-214).
- `packages/plugin-web-statistics/src/internal/rangeWindow.ts` — window/bucket boundaries (week/month/all).
- `packages/plugin-web-statistics/src/types.ts` — `StatisticsKpis` (`tasksTotal`/`tasksTrend`), `RangeAggregate` (`taskBuckets`).
- `packages/xai-web-tasks/src/types.ts` — `TaskCard.done?: boolean` (T-10, L55-61); `TaskCol { tasks; completed? }` (L67-80); `BucketId` (L17).
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/taskStats.ts` — `countDone` precedent (same metric, same key, current-state semantics).
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/isTaskColsRecord.ts` — `isTaskColsRecord` predicate (read-shape law, RD2 guard).
- `packages/xai-web-dashboard-widgets/src/internal/dataReads/__tests__/taskStats.test.ts` — AC-RD-TASKS-1..5 (test precedent to mirror).
- `packages/plugin-web-storage/src/internal/registry.ts:197-204` — `xai_task_cols` registry entry (default `{}`, owner `xai-web-tasks`, read-only consumer).
- SHIPPED four-piece being extended: `packages/xai-web-statistics/docs/{design,api,test,dev_log}.md`.
- `docs/workflow/roadmap/xai-web-dashboard-real-data.md` — structural manifest template + cross-module-read law.
- **(revision)** `packages/plugin-web-statistics/src/KpiCard.tsx` — confirmed live `KpiCardProps` has NO sub-label affordance; Path 1 adds optional `subLabel?` (additive). Consumption site `StatisticsModule.tsx:148-155` (tasks KPI) + `:204-214` (Tasks BarChart panel header `sc-head`).
- **(revision)** `packages/xai-web-dashboard-widgets/src/internal/strings.ts` — the SHIPPED local-STR precedent (`STR_WIDGET_EMPTY` `stat_tasks_empty` + `strEmpty(key,lang)`) that Path 1's `src/internal/strings.ts` mirrors; ZERO `plugin-web-tokens` edit.
- **(revision)** `packages/plugin-web-statistics/src/types.ts:23` — the `StatisticsKpis.tasksTotal` JSDoc still says "proxy for tasks completed" (REC-2 dual-target with api.md §1 line 51).

---
