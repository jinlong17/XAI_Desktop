# Roadmap Manifest — xai-web-dashboard-weather-mail

- Roadmap Source: `docs/reviews/_p0-carve-outs/20260529-dashboard-weather-mail.md` (P0 carve-out, commit `43ba6f8`) + `docs/reviews/xai-web-dashboard-weather-mail/20260529-discovery-review.md` + `docs/reviews/xai-web-dashboard-weather-mail/20260529-feature-brief.md`
- Source Code Reference: `packages/xai-web-dashboard-widgets/` (SHIPPED row #11 baseline 2026-05-23 + SHIPPED §E stickies 2026-05-28 + SHIPPED §F real-data 2026-05-28, manifest `status: Stable`) — EXTENSION only (§G). **Phase A (Weather)** adds ONE authorized registry key `xai_dashboard_weather` (codec json, default `null`, owner `xai-web-dashboard-widgets`, schemaVersion 1) + a from-scratch SINGLETON store + native `<dialog>` editor. **Phase B (Mail)** reads 2 PRE-EXISTING keys read-only (`xai_task_cols` + `xai_calendar_events`) — **ZERO new key for Mail**. `packages/core/` untouched (NO event channel). `packages/plugin-web-tokens/` NOT edited (existing local `internal/strings.ts` extended with 2 new dedicated tables — discovery Q3). NO other plugin package imported (cross-module read = `usePref` + key string + local predicate — Statistics + §F law).
- Closest Precedents:
  - Weather (Phase A) ≈ SHIPPED §E `xai-web-dashboard-stickies-create` — in-package store (`internal/stickiesStore/`) + `useStickies` hook over `usePref` + a native `<dialog>` composer + a NEW authorized registry key + local STR. **Singleton-ified** (Weather is ONE current-conditions object `UserWeather | null`, NOT a `Record<id, …>` of many).
  - Mail (Phase B) ≈ SHIPPED §F `xai-web-dashboard-real-data` — read-only cross-module aggregation via `usePref(<key>)` + LOCAL narrowing predicate (`internal/dataReads/`), NO plugin import, NO write, honest empty state. **REUSES §F's `listValidCalEvents` + recurrence semantics** for the today's-events source.
- Authority Anchor: **ADR-0010 Accepted 2026-05-26 §D4** ("new feature plans require an explicit P0 carve-out commit citing this ADR's D1") — carve-out commit `43ba6f8` (2026-05-29).
- Init Path: `single-feature` (no decomposition; one feature row spans 2 internal phases — 2 independent widget transforms).
- Generated: 2026-05-29
- Default Automation Mode: **A-Claude** (inherited from sibling item-3 cluster `xai-web-dashboard-stickies-create.md` + `xai-web-dashboard-real-data.md` + Web carve-outs; can be picked at feature-build dispatch time).
- Default Dependency Semantics: N/A (single row, no internal deps). Phase A and Phase B are independent (share no code/store) and may build in either order, though A-then-B is documented.
- Default Verify Cross-vendor: **yes** (Codex `gpt-5.5-thinking effort=medium` primary; Cursor fallback). MAY DEFER 24h per ADR-0008 §S3 carve-out — deferral recorded in `dev_log.md` §G verify section.
  - Per-phase: Phase A same-vendor smoke (store + editor + new key); **Phase B full XVENDOR matrix + Codex cold-read** (or formally deferred per ADR-0008 §S3) — Phase B is the last phase and ends READY_FOR_VERIFY.
- BG Direct Verified: unreliable-for-feature-loops (inherited; use serial / emit dispatch for any auto-loop chains).
- Manifest Review: REQUIRED (init stops here; `feature-review` must APPROVE before `feature-build` starts).
- Authority Override: this manifest **does NOT supersede** `xai-web-console.md` / `xai-web-console-gap-closure.md` SHIPPED archives, nor the SHIPPED `xai-web-dashboard-widgets` row #11 FEATURE_DEV lineage, nor the SHIPPED dashboard-grid Top-10 #9 BUGFIX lineage, nor the SHIPPED §E `xai-web-dashboard-stickies-create` lineage, nor the SHIPPED §F `xai-web-dashboard-real-data` lineage. It adds **one new feature** (new §G lineage) on top of all of those.
- Interop with PLUGIN_MAP.md: row #11 `@repo/plugin-web-dashboard-widgets` status STAYS `Stable`. Ship appends a feature note to the row's description column (NOT a status change). Registry-owning row `@repo/plugin-web-storage` gets ONE additive key `xai_dashboard_weather` (Phase A — owner-row addition; status UNCHANGED). Phase B is read-only (no key, no parity edit).

## Features

| # | Slug | Source | Depends On | Dep Semantics | Status | Automation Mode | Verify Cross-vendor | Last Run | Note |
|---|------|--------|------------|---------------|--------|-----------------|---------------------|----------|------|
| 1 | xai-web-dashboard-weather-mail | docs/reviews/_p0-carve-outs/20260529-dashboard-weather-mail.md | — | — | NEEDS_REVIEW | A-Claude (default) | yes (MAY defer 24h per ADR-0008 §S3; XVENDOR matrix at Phase B in dev_log §G.7) | 2026-05-29 | Single-row, 2-phase widget-transform feature (item-3 local cluster #5; 4 of the cluster already SHIPPED — stickies §E / real-data §F / smart-list / statistics-real-aggregation; after #5 only 3e AI remains). Repurposes 2 of the SHIPPED 10 widgets from mock fiction to REAL local widgets. **Phase A — Weather → manual-entry (WRITE):** a from-scratch SINGLETON store `UserWeather \| null` (`{city; temp; condition: "sunny"\|"cloudy"\|"rainy"; hi?; lo?; updatedAt}`) under a NEW AUTHORIZED registry key `xai_dashboard_weather` (codec json, default `null`, owner `xai-web-dashboard-widgets`, schemaVersion 1, category module — byte-parallel to §E `xai_dashboard_stickies` but `default: null` not `{}`) + `useWeather` hook + a native `<dialog>` `WeatherEditor` (city `<input>` + temp number + 3-preset condition `role=radiogroup` mapped to the existing `sun`/`cloud`/`rain` icons via a typed `Record<WeatherCondition,IconName>` — **zero `Icon.tsx` edit** — + optional hi/lo). `WeatherWidget` renders CURRENT CONDITIONS ONLY (5-day forecast DROPPED on the live path — not hand-maintainable; the `WEATHER` fixture export is KEPT for back-compat + `fixtures.test.ts`, §F RD9 precedent) with an honest "Set your weather" empty state when the store is `null`. Mirrors §E stickies, singleton-ified. **Phase B — Mail → Notifications digest (READ-ONLY):** repurpose the `MailWidget` body into a read-only aggregation of REAL local signals while KEEPING the FROZEN `mail` widget id (no rename → no ADR amendment, no `xai_dash_order` layout migration; only the body data source + `ariaLabel` + display label change). Sources (v1): (a) overdue tasks = `xai_task_cols["overdue"].tasks`(+`.completed?`) with `done !== true`, label `title[lang]`; (b) today's calendar events = `xai_calendar_events` filtered to today's LOCAL date-prefix WITH recurrence expansion — **REUSES §F's `listValidCalEvents` + the proven advance-date-prefix/keep-HH:MM/UTC-noon-window recurrence semantics** (no new recurrence math invented). Each row = `NotificationSignal {id; sourceType: "task-overdue"\|"calendar-today"; label; time?; sortKey}` (source-additive — a future `"countdown-expiring"` slots in); badge = signal count; honest "All clear / 暂无通知" empty state (NOT a fixture row — §F OQ3 honest-empty divergence). **READ-ONLY — NEVER writes `xai_task_cols`/`xai_calendar_events`** (no `usePref` setter call; no plugin import — Statistics + §F law); a dedicated **AC-MAIL-READONLY** asserts both stores are byte-unchanged after render. Mail's `now` is threaded from `ctx.now` via a 1-line additive `registrations.tsx` edit (like §F's Upcoming — NOT a `WidgetRenderContext` change). **Countdowns DEFERRED** (the `xai_countdowns` store exists but its registry type is opaque `unknown` → non-trivial recon; the 2 named sources satisfy the carve-out §5 anchor; flagged OQ-Mail-2). **i18n = LOCAL STR** (discovery Q3 — 2 NEW dedicated tables `STR_WEATHER` + `STR_NOTIFICATIONS` in the existing `internal/strings.ts`; NOT stuffed into the §E/§F tables — §F N2; titles reuse existing `dashboard.weather`/`dashboard.mail` token keys via `useI18n`; ZERO `plugin-web-tokens` edit). 2-phase build (Phase A Weather store+editor+key / Phase B Mail read-only notifications + docs → READY_FOR_VERIFY). Public surface UNCHANGED (`src/index.ts` exports `dashboardWidgetRegistrations` only — store/editor/selectors stay internal; `index-barrel.test.ts` asserts single export). The other 8 widgets (Clock/Stat×3/MiniCal/WorldClocks/Stickies/Upcoming) UNTOUCHED. **ONE new registry key `xai_dashboard_weather` (Phase A, authorized), NO new npm dep, NO Supabase, NO IndexedDB, NO auth change, NO `packages/core/` edit, NO `packages/core/src/types/events.ts` event channel, NO `plugin-web-tokens` edit, NO host-shell registration edit, NO `WidgetRenderContext` field, NO write to any foreign store, NO `dev` branch.** |

## Decomposition Rationale

### R1. Init path: single-feature

The carve-out is a single coherent feature (repurpose 2 mock widgets → real local widgets), explicitly scoped as "2 independent widget transforms" (carve-out §2). No PRD-to-rows decomposition. The feature is internally phased (2 phases — one per widget transform), and each phase is a single `feature-build` run per CLAUDE.md "feature-build does ONE phase per run."

### R2. Why a roadmap manifest for one feature

1. **P0 carve-out audit trail.** ADR-0010 §D4 requires an explicit P0 carve-out for new Web work; a roadmap manifest makes the authority chain (carve-out doc → roadmap → per-package dev_log §G) discoverable from `docs/workflow/roadmap/`.
2. **Workflow V2 default.** Identical shape to the sibling item-3 cluster manifests `xai-web-dashboard-stickies-create.md` + `xai-web-dashboard-real-data.md` — avoids special-casing the 5th item-3 cluster feature.

### R3. Why 2 phases (not 3 like §F, not 4 like §E)

- §E stickies needed 4 phases (store + new registry key + composer + wire, store-from-scratch).
- §F real-data needed 3 phases (grouped by store-backed widget cluster; read-only, no new key).
- **This feature = 2 INDEPENDENT widget transforms that share NO code or store.** Weather (Phase A) is a self-contained WRITE feature (its own new key + store + editor); Mail (Phase B) is a self-contained READ-ONLY aggregation (2 foreign keys, no new key). The natural split is one phase per widget — each phase ends in a self-consistent, independently-reviewable state:
  - **Phase A** = Weather store + editor + the `xai_dashboard_weather` key + parity + rewired widget + tests. (The only registry/parity touch is here.)
  - **Phase B** = Mail notifications selector + rewired widget + `now`-thread + docs sync → READY_FOR_VERIFY. (Read-only; no registry touch.)
- Docs sync folds into Phase B (the last phase), per the §F precedent where the polish/docs phase folded cleanly.

### R4. AskUserQuestion ambiguity resolution

The carve-out hands the planner 4 named calls (Q1 Weather editor, Q2 Mail rename + countdowns + max-rows, Q3 i18n, Q4 Mail signal shape). All are resolved with rationale in discovery §4, plus planner-added calls (Q-Mail-rename, Q-Mail-source, Q-Mail-countdown, Q-Mail-readonly). **No further AskUserQuestion is required by `feature-plan`.** `feature-review` may override any call before approving — see discovery §8 OQ-Weather-1..3 + OQ-Mail-1..4 + OQ-Phase (most notably OQ-Mail-2 countdowns-defer, OQ-Mail-1 display-label, OQ-Weather-1 condition-enum-size).

### R5. AutomationMode / Verify Cross-vendor defaults

- Default Automation Mode: `A-Claude` (inherited from the sibling item-3 cluster + Web carve-outs; no per-row picker fires at dispatch).
- Default Verify Cross-vendor: `yes` (Codex cold-read at Phase B; may defer 24h per ADR-0008 §S3).
- Reviewer may override at `feature-review` time.

### R6. Frozen assumptions + open uncertainties

**Frozen (from carve-out + discovery review §0/§3/§4 + design §G.1 — 16 items):**

1. Owning package = `@repo/plugin-web-dashboard-widgets` (EXTENSION; no new package). Manifest stays `Stable`.
2. Two independent widget transforms → 2 phases (A Weather / B Mail).
3. Phase A Weather = WRITE on its OWN new key; Phase B Mail = READ-ONLY aggregation of 2 foreign keys (NO new key).
4. NEW authorized registry key `xai_dashboard_weather` (codec json, default `null`, owner this package, category module, schemaVersion 1, proposed false) + `OWNER_ROW_ADDITIONS` + parity exclusion + AC-REGISTRY-WEATHER-1/2. Mail adds NO key.
5. Weather store = SINGLETON `UserWeather | null` (not a record).
6. `UserWeather = {city; temp; condition: WeatherCondition; hi?; lo?; updatedAt}`; `WeatherCondition = "sunny"|"cloudy"|"rainy"`.
7. `WeatherCondition` → existing Icon map (`sunny→sun`, `cloudy→cloud`, `rainy→rain`); no `Icon.tsx` edit; typed `Record<WeatherCondition,IconName>` compile guard.
8. Weather editor = native `<dialog>` `WeatherEditor` (city/temp/condition-radiogroup/optional-hi/lo; a11y; ESC/backdrop/autofocus). SET-only.
9. `WeatherWidget` = current conditions only; forecast dropped on live path; `WEATHER` fixture export kept; honest "Set your weather" empty state.
10. Mail keeps widget id `mail` (frozen; persisted in `xai_dash_order`) — no rename/ADR/migration; only body+ariaLabel+label change; reuse `.mail-*` CSS.
11. Mail signal `NotificationSignal = {id; sourceType: "task-overdue"|"calendar-today"; label; time?; sortKey}`; badge = signals.length; source-additive.
12. Mail sources (v1): overdue tasks (`xai_task_cols["overdue"]`, `done!==true`, `title[lang]`) + today's events (`xai_calendar_events`, today local + recurrence); max 6 rows; countdowns DEFERRED.
13. Mail read pattern = `usePref` + local predicate, never plugin import, never setter; READ-ONLY; reuses §F `listValidCalEvents`; new `overdueTasks` reader.
14. Mail `now` threaded via 1-line additive `registrations.tsx` edit (not a `WidgetRenderContext` change).
15. i18n = LOCAL STR (2 new dedicated tables `STR_WEATHER`+`STR_NOTIFICATIONS`); titles reuse existing token keys; 0 `plugin-web-tokens` edit.
16. Public surface UNCHANGED — `index.ts` exports `dashboardWidgetRegistrations` only; store/editor/selectors stay internal. NO `packages/core` edit, NO event channel, NO host edit, NO `dev` branch.

**Frozen guesses (recorded for reviewer override — discovery §8):**

1. OQ-Weather-1: 3-preset condition enum (vs adding icons for a 4th/5th).
2. OQ-Weather-2: optional hi/lo kept.
3. OQ-Mail-1: shift display label to "Notifications" (keep `mail` id + `dashboard.mail` token available).
4. OQ-Mail-2: countdowns DEFERRED (opaque registry type → non-trivial; source-additive for a later increment).
5. OQ-Mail-3: max 6 rows.
6. OQ-Mail-4: overdue = `done!==true` cards in the overdue bucket (incl. its `completed?`).
7. OQ-Phase: 2 phases (A/B), docs synced in B.

### R7. Cycle expectations

- Total estimated effort: **2-3 days** of build + verify (Phase A is a store-from-scratch + editor + key, ~§E-scale; Phase B is a read-only aggregation reusing §F, ~§F-scale-minus-one-widget).
- Total estimated commits: **2-4** (1 phase commit per phase + optional docs sync in Phase B).
- Test additions: **~45-55 new/rewritten tests** (Phase A: ~6 store + 9 editor + 4 hook + 8 widget + 2 registry; Phase B: ~14 selector + ~6 widget).
- New registry entries: **1** (`xai_dashboard_weather`, Phase A only; read-only Phase B adds 0).
- New CSS rules: ~4-8 (additive `.ww-empty` + `.weather-editor*` (A); `.notif-empty` + source-dot (B); base `.widget*`/`.ww-*`/`.mail-*` untouched — §S9 guard).
- New i18n keys via `plugin-web-tokens`: **0** (local STR only).
- New `packages/core/` event channels: **0**.
- New host-shell registration edits: **0**.
- New `WidgetRenderContext` fields: **0** (Mail's `now` is an additive WIDGET prop threaded from existing `ctx.now`).
- SHIPPED tests stay green: SHIPPED non-Weather/Mail widget tests + §E stickies + §F real-data + `fixtures.test.ts` + `index-barrel.test.ts` + `registrations.test.tsx` no regression; the SHIPPED `WeatherWidget.test.tsx` + `MailWidget.test.tsx` are REWRITTEN (old fixture assertions deleted, not multiplied — §F RD8 precedent).
- Web suite: UNCHANGED (no host edit). Storage suite: +2 ACs + 2 parity-array entries (Phase A).

### R8. Phase exit criteria summary

| Phase | Exits when | Cross-vendor required? |
|---|---|---|
| A (Weather) | `xai_dashboard_weather` key + parity + AC-REGISTRY-WEATHER land; `internal/weatherStore/` (singleton store + `useWeather`) + `WeatherEditor` `<dialog>` + `STR_WEATHER` land; `WeatherWidget` rewired (user values + honest empty + Edit button; forecast dropped on live path; fixture export kept); AC-WSTORE/WEDITOR/WHOOK/WEATHER-REAL green; SHIPPED non-Weather + §E + §F + `fixtures.test.ts` + barrel green; storage suite green (+AC-REGISTRY-WEATHER); typecheck + `eslint --max-warnings 0` clean (both packages); §S9 `.widget*` grep = 0; NO change to index.ts/tokens/core/host | no (same-vendor smoke) |
| B (Mail) | `internal/dataReads/notifications.ts` (overdueTasks + todaysEvents + buildNotifications, REUSE §F `listValidCalEvents`) + `STR_NOTIFICATIONS` land; `MailWidget` rewired (read-only signals + honest "all clear" + badge=count + `now` prop); 1-line `now`-thread + ariaLabel/label shift in `registrations.tsx` (`mail` id KEPT); AC-RD-OVERDUE/TODAY/COMBINE + AC-MAIL-REAL/EMPTY/**READONLY** green; SHIPPED MiniCal/stat/§E/§F + `fixtures.test.ts` + barrel + `registrations.test.tsx` (mail id/span byte-stable) green; web suite UNCHANGED; `pnpm -w build` green; additive CSS only (§S9 = 0); docs §G synced; XVENDOR matrix + Codex cold-read pass OR formally deferred per ADR-0008 §S3; dev_log §G verify section written; PLUGIN_MAP note appended at ship | **Codex cold-read mandatory (or formal defer)** |

### R9. Status legend

- `NEEDS_REVIEW` — plan written, awaiting `feature-review`.
- `APPROVED` — `feature-review` PASSED; next is `feature-build` (Phase A).
- `READY_FOR_VERIFY` — both phases built; awaiting `feature-verify`.
- `READY_TO_SHIP` — verify passed; awaiting `ship`.
- `SHIPPED` — `ship` pushed to `origin/web`.
- `BLOCKED` — any agent set this with a reason; next step usually `feature-plan` (revise) or `feature-build` (fix).

### R10. Run instructions (operator)

After `feature-review` APPROVES:

**Manual mode** (one phase per run, recommended for first run after a feature-plan):

```text
Start the feature-build agent for xai-web-dashboard-weather-mail.   # Phase A (Weather) only
# review the diff + commit, then:
Start the feature-build agent for xai-web-dashboard-weather-mail.   # Phase B (Mail) only
```

**Auto mode** (cycle build + verify after APPROVED):

```text
Start the feature-dev-loop agent for xai-web-dashboard-weather-mail.   # auto-runs both phases + verify
# then:
Start the ship agent for xai-web-dashboard-weather-mail.
```

### R11. References

- Discovery review: `docs/reviews/xai-web-dashboard-weather-mail/20260529-discovery-review.md`
- Feature brief (Step 0 mirror): `docs/reviews/xai-web-dashboard-weather-mail/20260529-feature-brief.md`
- P0 carve-out doc: `docs/reviews/_p0-carve-outs/20260529-dashboard-weather-mail.md` (commit `43ba6f8`)
- Authority: `docs/adr/0010-p1-desktop-resume-plan.md` §D4
- Closest precedent (store-from-scratch + new key): `packages/xai-web-dashboard-widgets/src/internal/stickiesStore/{types,useStickies,stickiesStore}.ts` + `src/StickyComposer.tsx` + `src/internal/strings.ts` (§E SHIPPED) + `docs/workflow/roadmap/xai-web-dashboard-stickies-create.md`
- Closest precedent (read-only cross-module aggregation): `packages/xai-web-dashboard-widgets/src/internal/dataReads/{isUserCalEventMap,calUpcoming,calMonthDots,isTaskColsRecord,taskStats}.ts` (§F SHIPPED) + `docs/workflow/roadmap/xai-web-dashboard-real-data.md`
- Owner canonical types (Mail read-shape source of truth): `packages/xai-web-tasks/src/types.ts` (`BucketId`:17, `TaskCard`:38-61 incl. `title`/`done`, `TaskCol`:67-80), `packages/xai-web-calendar/src/internal/eventStore/types.ts` (`UserCalEvent.startISO` local-clock)
- Registry (new key template + Mail's 2 read sources): `packages/plugin-web-storage/src/internal/registry.ts` (`xai_task_cols`:197, `xai_countdowns`:358 [DEFERRED source], `xai_calendar_events`:943, `xai_dashboard_stickies`:959 [new-key template])
- Registry parity tests (dual-array to extend in Phase A): `packages/plugin-web-storage/src/__tests__/registry.test.ts` (`OWNER_ROW_ADDITIONS`:162, AC-REGISTRY-STICKIES:301-340 [template], AC-REG-8:235) + `parity-design-md.test.ts` (exclusion list :167)
- Icon library (3 weather glyphs sun/cloud/rain): `packages/xai-web-dashboard-widgets/src/internal/Icon.tsx` (IconName union :10-30)
- SHIPPED four-pack lineage being extended: `packages/xai-web-dashboard-widgets/docs/{design,api,test,dev_log}.md` (row #11 + §E stickies + §F real-data — all SHIPPED) + `src/widgets/{WeatherWidget,MailWidget}.tsx` + `src/registrations.tsx` + `src/internal/fixtures.ts`
- Sibling item-3 cluster manifests: `docs/workflow/roadmap/xai-web-dashboard-stickies-create.md` + `docs/workflow/roadmap/xai-web-dashboard-real-data.md`
- Workflow refs: `docs/workflow/SUBAGENT_WORKFLOW_V2.md`, `docs/workflow/SOP_NEW_FEATURE.md`
- Commit convention: `docs/conventions/COMMIT_CONVENTION.md`
- ADR-0007 (web build form): `docs/adr/0007-xai-web-console-build-form.md`
- ADR-0008 §S3 cross-vendor carve-out precedent: `docs/adr/0008-cloudflare-pages-deploy-recipe.md`

## Open Operator Decisions (none blocking)

- None at manifest authoring time. The 4 carve-out planner's-call items (discovery §4) + the planner-added calls (Q-Mail-rename / Q-Mail-source / Q-Mail-countdown / Q-Mail-readonly) carry planner picks and are flagged for `feature-review` override (discovery §8 OQ-Weather-1..3 + OQ-Mail-1..4 + OQ-Phase) — most notably OQ-Mail-2 (DEFER countdowns), OQ-Mail-1 (display label "Mail" vs "Notifications"), and OQ-Weather-1 (3-preset condition enum vs adding icons). This is item-3 local cluster #5 (after stickies §E + real-data §F + smart-list + statistics-real-aggregation SHIPPED); the only remaining item-3 work per carve-out context is **3e AI** (last, largest). Cross-vendor smoke DEFERRED per ADR-0008 §S3.
