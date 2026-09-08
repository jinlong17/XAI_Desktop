# Roadmap Manifest — xai-web-dashboard-real-data

- Roadmap Source: `docs/reviews/_p0-carve-outs/20260528-dashboard-real-data.md` (P0 carve-out, commit `217170c`) + `docs/reviews/xai-web-dashboard-real-data/20260528-discovery-review.md`
- Source Code Reference: `packages/xai-web-dashboard-widgets/` (SHIPPED row #11 baseline 2026-05-23 + SHIPPED §E stickies extension 2026-05-28, manifest `status: Stable`) — EXTENSION only. Reads 4 PRE-EXISTING `@repo/plugin-web-storage` keys read-only (`xai_task_cols` / `xai_pomodoro_sessions` / `xai_habits_state` / `xai_calendar_events`). **ZERO new registry key** (contrast §E stickies which added one). `packages/core/` read-only (NO event channel). `packages/plugin-web-tokens/` NOT edited (existing local `internal/strings.ts` extended — discovery Q-i18n). NO other plugin package imported (cross-module read is `usePref` + key string + local predicate — Statistics + Cmd-K law).
- Closest Precedent (cross-module read-only): `@repo/plugin-web-statistics` (SHIPPED, Stable) — reads `xai_pomodoro_sessions` + `xai_habits_state` via `usePref` + LOCAL narrowing predicates (`internal/isPomodoroSession.ts`, `internal/isHabitsStateRecord.ts`), NO plugin import; api.md §0 states "usePref only — NO direct imports of plugin-web-{tasks,pomodoro,habits} internals." In-package real-data precedent: the SHIPPED §E `StickiesWidget`/`useStickies` (a widget holds a `usePref`-backed hook + type-discriminated empty/non-empty branch). This feature is the READ-ONLY analog (no setter, no new key).
- Authority Anchor: **ADR-0010 Accepted 2026-05-26 §D4** ("new feature plans require an explicit P0 carve-out commit citing this ADR's D1") — carve-out commit `217170c` (2026-05-28).
- Init Path: `single-feature` (no decomposition; one feature row spans 3 internal phases — by widget group).
- Generated: 2026-05-28
- Default Automation Mode: **A-Claude** (inherited from sibling item-3 cluster `xai-web-dashboard-stickies-create.md` + Web carve-outs; can be picked at feature-build dispatch time).
- Default Dependency Semantics: N/A (single row, no internal deps).
- Default Verify Cross-vendor: **yes** (Codex `gpt-5.5-thinking effort=medium` primary; Cursor fallback). MAY DEFER 24h per ADR-0008 §S3 carve-out — deferral recorded in `dev_log.md` §F verify section.
  - Per-phase: F1 same-vendor smoke (pure selectors + 3 stat widgets); F2 smoke recommended (calendar reads + recurrence); **F3 full XVENDOR matrix + Codex cold-read** (or formally deferred per ADR-0008 §S3).
- BG Direct Verified: unreliable-for-feature-loops (inherited; use serial / emit dispatch for any auto-loop chains).
- Manifest Review: REQUIRED (init stops here; `feature-review` must APPROVE before `feature-build` starts).
- Authority Override: this manifest **does NOT supersede** `xai-web-console.md` / `xai-web-console-gap-closure.md` SHIPPED archives, nor the SHIPPED `xai-web-dashboard-widgets` row #11 FEATURE_DEV lineage, nor the SHIPPED dashboard-grid Top-10 #9 BUGFIX lineage, nor the SHIPPED §E `xai-web-dashboard-stickies-create` lineage. It adds **one new feature** (new §F lineage) on top of all of those.
- Interop with PLUGIN_MAP.md: row #11 `@repo/plugin-web-dashboard-widgets` status STAYS `Stable`. Ship appends a feature note to the row's description column (NOT a status change). Registry-owning row `@repo/plugin-web-storage` UNCHANGED (read-only consumer — no key, no parity-array edit).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-dashboard-real-data | docs/reviews/_p0-carve-outs/20260528-dashboard-real-data.md | — | — | NEEDS_REVIEW | A-Claude (default) | yes (MAY defer 24h per ADR-0008 §S3; XVENDOR matrix at F3 in dev_log §F.6) | 2026-05-28 | Single-row read-only real-data wiring (item-3 local cluster #2; consolidates carve-out 3d-i + 3d-ii). Rewires 5 of the SHIPPED 10 widgets — `StatTasks`/`StatStreak`/`StatPomos`/`UpcomingWidget`/`MiniCalWidget` — from hardcoded constants / fixtures to REAL local-store reads via `usePref(<key>)` + a LOCAL narrowing predicate (the SHIPPED Statistics + Cmd-K cross-module-read law: NO plugin import; only `@repo/plugin-web-storage` + the key string). **CRITICAL recon corrections (discovery §3):** pomodoro reads canonical `finishedAt`+`completed` (NOT Cmd-K's stale `completedAt`); tasks cards live at `col.tasks`/`col.completed` (NOT Cmd-K's flattened `Record<string,unknown[]>` read); date basis is PER source (pomodoro=LOCAL day / habits=UTC `YYYY-MM-DD` / calendar=LOCAL-clock ISO — NOT unified). New code = a thin in-package `src/internal/dataReads/` selector module (pure, store-in/value-out, injected clock; mirrors Statistics' `aggregators.ts` + predicates): `taskStats.countDone` → `{done,total}`; `pomoStats.countTodaysFocus`; `habitStreak.maxStreak` (local strict-consecutive, max over habits); `calUpcoming.upcomingEvents` + `calMonthDots.monthDots` (with a MINIMAL local recurrence expansion — non-recurring + daily + weekly — re-implemented because calendar's `expandRecurrence` is `internal/`, un-importable). **Metrics (discovery Q1):** StatTasks = all-bucket `done/total` (T-10 made `done` real); StatPomos = today's completed focus count; StatStreak = max per-habit strict-consecutive streak. **Empty states (carve-out In-scope):** honest "nothing yet" instead of fiction — StatTasks empty when `total===0`; StatStreak empty when no habits (streak-0-with-habits renders `0`); StatPomos `0` is honest (no special copy); Upcoming "no upcoming events"; MiniCal empty month = no dots. **Fixture disposition (discovery Q3):** KEEP `UPCOMING`/`CAL_EVENTS` exports (back-compat + `fixtures.test.ts` stays green) but the live path stops importing them; REMOVE the inline `STAT_TASKS_*`/`STAT_STREAK_DAYS`/`STAT_POMOS_*` consts. Calendar-backed widgets get PLAIN honest empty states, NOT stickies-style fake samples (deliberate DIVERGENCE from §E Q4 — calendar-empty is an honest view; fake events re-introduce the fiction this carve-out removes). **Upcoming = calendar events ONLY** (discovery Q5 — NO task-due merge; task `date` is a display string, not parseable ISO). **i18n = LOCAL STR** (discovery Q-i18n — extend the EXISTING `internal/strings.ts` created by §E with empty-state keys; ZERO `plugin-web-tokens` edit; existing `dashboard.tasks_done`/`streak`/`pomos`/`upcoming` labels stay from `useI18n`). 3-phase build (F1 stats + selectors / F2 upcoming+minical + calendar selectors / F3 polish+docs+verify). Public surface UNCHANGED (`src/index.ts` exports `dashboardWidgetRegistrations` only — selectors/predicates stay internal; index-barrel test asserts single export). The other 5 widgets (Clock/WorldClocks/Weather/Stickies/Mail) UNTOUCHED. **NO new registry key, NO new npm dep, NO Supabase, NO IndexedDB, NO auth change, NO `packages/core/` edit, NO `packages/core/src/types/events.ts` event channel, NO `plugin-web-tokens` edit, NO host-shell registration edit, NO `WidgetRenderContext` field, NO write to any store, NO `dev` branch.** |

## Decomposition Rationale

### R1. Init path: single-feature

The carve-out is a single coherent feature (read 4 existing stores → project into 5 existing widgets → honest empty states). No PRD-to-rows decomposition. The feature is internally phased (3 phases — grouped by store-backed widget cluster), and each phase is a single `feature-build` run per CLAUDE.md "feature-build does ONE phase per run."

### R2. Why a roadmap manifest for one feature

1. **P0 carve-out audit trail.** ADR-0010 §D4 requires an explicit P0 carve-out for new Web work; a roadmap manifest makes the authority chain (carve-out doc → roadmap → per-package dev_log §F) discoverable from `docs/workflow/roadmap/`.
2. **Workflow V2 default.** Identical shape to the sibling item-3 cluster manifest `xai-web-dashboard-stickies-create.md` — avoids special-casing the 2nd item-3 cluster feature.

### R3. Why 3 phases (not 4 like the §E stickies store-from-scratch)

Stickies (§E) needed 4 phases because it built a store + a new registry key FROM SCRATCH (SP1 was a dedicated data-layer + registry phase). This feature builds **no store and adds no key** — it READS existing keys. So there is no data-layer/registry phase. The natural split is by widget cluster sharing a store-read concern:
- **F1** = the 3 Stat widgets (3 different keys, 3 small selectors, the highest-recon-risk pieces — pomodoro field + tasks shape + habit streak).
- **F2** = Upcoming + MiniCal (BOTH read the same `xai_calendar_events`, share the recurrence concern + calendar predicate — keeping them in one phase keeps the recurrence logic in one diff).
- **F3** = polish + docs + barrel-confirm + verify.
F3 MAY fold into F2 if empty states land inline + the barrel stays single-export (likely) — flagged for reviewer (OQ7).

### R4. AskUserQuestion ambiguity resolution

The carve-out hands the planner 4 named calls (Q1 metrics, Q2 read-shape, Q3 fixture-disposition, Q4 selector-abstraction). All 4 are resolved with rationale in discovery §4, plus 3 planner-added calls (Q5 task-due-merge, Q-i18n, recurrence-scope). **No further AskUserQuestion is required by `feature-plan`.** `feature-review` may override any call before approving — see discovery §7.2 OQ1-OQ7 (most notably OQ1 metrics, OQ3 empty-vs-sample, OQ6 recurrence-scope).

### R5. AutomationMode / Verify Cross-vendor defaults

- Default Automation Mode: `A-Claude` (inherited from the sibling item-3 cluster + Web carve-outs; no per-row picker fires at dispatch).
- Default Verify Cross-vendor: `yes` (Codex cold-read at F3; may defer 24h per ADR-0008 §S3).
- Reviewer may override at `feature-review` time.

### R6. Frozen assumptions + open uncertainties

**Frozen (from carve-out + discovery review §0/§3/§4 + design §F.1 — 14 items):**

1. Owning package = `@repo/plugin-web-dashboard-widgets` (EXTENSION; no new package). Manifest stays `Stable`.
2. In-scope widgets (5): StatTasks / StatStreak / StatPomos / UpcomingWidget / MiniCalWidget. OUT: Clock / WorldClocks / Weather / Stickies / Mail (UNCHANGED).
3. Read pattern = `usePref(<key>)` + LOCAL narrowing predicate, NEVER cross-plugin import. No owner-module `internal/` helper is importable.
4. Source keys (PRE-EXISTING, read-only): `xai_task_cols`, `xai_pomodoro_sessions`, `xai_habits_state`, `xai_calendar_events`. ZERO new key.
5. New code = in-package `src/internal/dataReads/` pure selectors + local predicates (Statistics pattern); injected `now`/`todayKey`.
6. StatTasks = all-bucket `done`/`total` (donut `value=done/total`).
7. StatPomos = today's completed focus (owner `countTodaysFocus` semantics) + 8-dot grid; field `finishedAt`+`completed`.
8. StatStreak = max per-habit strict-consecutive streak (UTC day keys).
9. Date basis PER source (pomo local / habits UTC / calendar local-clock).
10. MiniCal dots from `xai_calendar_events` keyed by viewed-month day-of-month; `colorPreset` → `.mc-dot-<color>` (rose may need additive class).
11. Upcoming = next ≤4 events `startISO>=now`, sorted; calendar events ONLY (no task-due merge).
12. Recurrence = minimal local expansion (non-recurring + daily + weekly).
13. Empty-state copy = LOCAL STR (extend existing `internal/strings.ts`); 0 `plugin-web-tokens` keys; existing labels stay from `useI18n`.
14. Public surface UNCHANGED — `index.ts` exports `dashboardWidgetRegistrations` only; selectors stay internal. NO `packages/core` edit, NO event channel, NO host edit, NO `dev` branch.

**Frozen guesses (recorded for reviewer override — discovery §7.2 OQ1-OQ7):**

1. Q1 metrics: StatTasks done/total · StatPomos today-focus · StatStreak max-habit-streak (reviewer may re-pick).
2. Q3 fixture disposition: calendar-backed widgets get PLAIN honest empty states, NOT fixture-samples — DIVERGES from §E stickies (justified by domain).
3. Q5: Upcoming = calendar events ONLY (no task-due merge).
4. Recurrence: minimal daily+weekly vs deferring to non-recurring-only (OQ6).
5. 3 phases (OQ7) vs folding F3→F2.

### R7. Cycle expectations

- Total estimated effort: **1-2 days** of build + verify (smaller than §E stickies — no store/composer/registry; just selectors + 5 widget rewires).
- Total estimated commits: **3-5** (1 phase commit + optional docs sync per phase).
- Test additions: **~50-55 new/rewritten tests** (~26-31 pure selector units + ~24 rewritten widget tests).
- SHIPPED tests stay green: SHIPPED non-Stat widget tests + §E stickies tests + `fixtures.test.ts` + `index-barrel.test.ts` no regression; the SHIPPED Stat/Upcoming/MiniCal test files are REWRITTEN (RD8) — old magic-number assertions deleted, not multiplied.
- New registry entries: **0** (read-only).
- New CSS rules: ~3-5 (additive `.mc-dot-rose` if needed + empty-hint classes; base `.widget*`/`.mc-*`/`.upc-*`/`.ws-*` untouched).
- New i18n keys via `plugin-web-tokens`: **0** (local STR only — discovery Q-i18n).
- New `packages/core/` event channels: **0**.
- New host-shell registration edits: **0**.
- New `WidgetRenderContext` fields: **0** (Upcoming's `now` is an additive WIDGET prop threaded from the existing `ctx.now`, NOT a render-context type change).
- Storage / web suites: UNCHANGED (no registry, no host edit).

### R8. Phase exit criteria summary

| Phase | Exits when | Cross-vendor required? |
|---|---|---|
| F1 | `dataReads/{taskStats,pomoStats,habitStreak}` + their predicates land; StatTasks/StatStreak/StatPomos rewired to `usePref`+selector+honest-empty; `STAT_*` consts removed (no external importer); `internal/strings.ts` empty keys added; AC-RD-TASKS/POMO/HABIT + AC-STATS-REAL-* green; SHIPPED non-Stat + §E tests still green; typecheck + `eslint --max-warnings 0` clean; NO change to index.ts/registrations.tsx/storage/tokens | no (same-vendor smoke) |
| F2 | `dataReads/{calUpcoming,calMonthDots}` + calendar predicate + minimal recurrence land; UpcomingWidget + MiniCalWidget read `xai_calendar_events` with honest empty states; SHIPPED MiniCal nav/goTo/data-no-drag preserved; `UPCOMING`/`CAL_EVENTS` no longer imported on live path but exports + `fixtures.test.ts` kept green; additive CSS only (§S9 `.widget*` grep = 0); AC-RD-UPC/CAL + AC-UPCOMING-REAL + AC-MINICAL-REAL green | smoke recommended |
| F3 | index-barrel test still green (single export unchanged); full widgets + web suites green; `pnpm -w build` green; storage + web suites UNCHANGED; XVENDOR matrix + Codex cold-read pass OR formally deferred per ADR-0008 §S3; dev_log §F verify section written; PLUGIN_MAP note appended at ship | **Codex cold-read mandatory (or formal defer)** |

### R9. Status legend

- `NEEDS_REVIEW` — plan written, awaiting `feature-review`.
- `APPROVED` — `feature-review` PASSED; next is `feature-build` (F1).
- `READY_FOR_VERIFY` — all 3 phases built; awaiting `feature-verify`.
- `READY_TO_SHIP` — verify passed; awaiting `ship`.
- `SHIPPED` — `ship` pushed to `origin/web`.
- `BLOCKED` — any agent set this with a reason; next step usually `feature-plan` (revise) or `feature-build` (fix).

### R10. Run instructions (operator)

After `feature-review` APPROVES:

**Manual mode** (one phase per run, recommended for first run after a feature-plan):

```text
Start the feature-build agent for xai-web-dashboard-real-data.   # Phase F1 only
# review the diff + commit, then:
Start the feature-build agent for xai-web-dashboard-real-data.   # Phase F2 only
# ...
```

**Auto mode** (cycle build + verify after APPROVED):

```text
Start the feature-dev-loop agent for xai-web-dashboard-real-data.   # auto-runs all 3 phases + verify
# then:
Start the ship agent for xai-web-dashboard-real-data.
```

### R11. References

- Discovery review: `docs/reviews/xai-web-dashboard-real-data/20260528-discovery-review.md`
- P0 carve-out doc: `docs/reviews/_p0-carve-outs/20260528-dashboard-real-data.md` (commit `217170c`)
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Audit trigger: `docs/reviews/_web-noop-audit/20260528-usability-recheck.md`
- Closest precedent (cross-module read-only): `packages/plugin-web-statistics/src/internal/{aggregators,isPomodoroSession,isHabitsStateRecord}.ts` + its api.md §0 ("usePref only")
- In-package real-data precedent: `packages/xai-web-dashboard-widgets/src/widgets/StickiesWidget.tsx` + `src/internal/stickiesStore/useStickies.ts` + `src/internal/strings.ts` (§E SHIPPED)
- Owner canonical types (read-shape source of truth): `packages/xai-web-tasks/src/types.ts` (`TaskCard.done`), `packages/plugin-web-pomodoro/src/types.ts` + `src/internal/derivedCounters.ts` (`countTodaysPomos`), `packages/xai-web-habits/src/types.ts` + `src/internal/computeStreak.ts`, `packages/xai-web-calendar/src/internal/eventStore/{types,expandRecurrence}.ts`
- Registry (4 source keys, read-only): `packages/plugin-web-storage/src/internal/registry.ts` (`xai_task_cols`:197, `xai_pomodoro_sessions`:348, `xai_habits_state`:383, `xai_calendar_events`:943)
- SHIPPED baseline being extended: `packages/xai-web-dashboard-widgets/docs/{design,api,test,dev_log}.md` + `src/widgets/{StatTasks,StatStreak,StatPomos,UpcomingWidget,MiniCalWidget}.tsx` + `src/internal/fixtures.ts`
- Sibling item-3 cluster manifest: `docs/workflow/roadmap/xai-web-dashboard-stickies-create.md`
- Workflow refs: `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0007 (web build form): `docs/adr/0007-xai-web-console-build-form.md`
- ADR-0008 §S3 cross-vendor carve-out precedent: `docs/adr/0008-cloudflare-pages-deploy-recipe.md`

## Open Operator Decisions (none blocking)

- None at manifest authoring time. The 4 planner's-call items (discovery §4 Q1-Q4) + 3 planner-added (Q5 / Q-i18n / recurrence) carry planner picks and are flagged for `feature-review` override (discovery §7.2 OQ1-OQ7) — most notably OQ1 (stat metrics), OQ3 (honest-empty vs fixture-sample; DIVERGES from §E stickies), and OQ6 (recurrence scope). This is item-3 local cluster #2 (after `xai-web-dashboard-stickies-create` SHIPPED); subsequent item-3 work per carve-out context: 3c smart-list → 3b Statistics → 3d-iii Weather/Mail → 3e AI.
