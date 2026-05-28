# Dev Log — xai-web-dashboard-widgets

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-dashboard-widgets |
| Title | Web Console — Dashboard widget pack (Clock 4 styles/12tz/analog 60+12+12 · MiniCal · WorldClocks · Weather · Stickies · Mail · Upcoming · 3 mini stats) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Verify Cross-vendor | yes (Codex primary / Cursor fallback — see test.md §6) |
| Automation Mode | A-Claude (xai-roadmap-loop W2e parallel-Agent mode; siblings: #8 board-views, #9 board-workspaces) |
| Executor | claude-sonnet-4-6 — ship |
| Updated | 2026-05-23 18:58 |
| Dispatched By | xai-roadmap-loop (W2e parallel dispatch, manifest row #11) |
| Roadmap Row | docs/workflow/roadmap/xai-web-console.md row #11 |
| ADR Anchor | docs/adr/0007-xai-web-console-build-form.md §S4 (port-map row `module-dashboard.jsx` → predeux split: dashboard-grid + dashboard-widgets) + §S5 (TSX rules) + §S7 (event bus via ctx.goTo) + §S8 (persistence registry already pre-registered in row #3) |
| Concurrent Siblings | #8 xai-web-board-views · #9 xai-web-board-workspaces — file writes scoped to `packages/xai-web-dashboard-widgets/` + `docs/reviews/xai-web-dashboard-widgets/` + shared-anchor Edits on `packages/xai-web-dashboard-grid/src/registration.tsx` + `packages/xai-web-dashboard-grid/package.json` + `apps/web/package.json` + `packages/plugin-web-tokens/src/i18n.ts` only — see design.md §7 |
| Write Scope (plan) | `packages/xai-web-dashboard-widgets/docs/` + `docs/reviews/xai-web-dashboard-widgets/` |
| Write Scope (build) | will extend to: `packages/xai-web-dashboard-widgets/src/**` (new), `packages/plugin-web-tokens/src/i18n.ts` (~11 keys × 2 langs additive in `dashboard.widgets.*` sub-block, P1+P2), `packages/xai-web-dashboard-grid/src/registration.tsx` (1-line swap + 1 import, P3), `packages/xai-web-dashboard-grid/package.json` (1 dep line, P3), `apps/web/package.json` (1 dep line, P3) — all per design.md §7 |

## Artifacts Index

- Seed brief: `docs/reviews/xai-web-dashboard-widgets/20260523-roadmap-seed.md`
- Discovery review: `docs/reviews/xai-web-dashboard-widgets/20260523-discovery-review.md`
- Design snapshot: `packages/xai-web-dashboard-widgets/docs/design.md`
- API contract: `packages/xai-web-dashboard-widgets/docs/api.md`
- Test strategy: `packages/xai-web-dashboard-widgets/docs/test.md`

## Decision Headline

Selected **single-export `dashboardWidgetRegistrations: WidgetRegistration[]` constant** at `packages/xai-web-dashboard-widgets/` named `@repo/plugin-web-dashboard-widgets` (sibling W2 convention) with:

- **A1** single-array export consumed by row #10's `DashboardSlotHost` via a 1-line Edit.
- **B1** 10 widget ids match the prototype WIDGETS_CONFIG verbatim → no `xai_dash_order` registry edit needed.
- **C1** span classes match WidgetSpanClass union from row #10.
- **D1** widget-body CSS at `src/styles.css`; `.widget/.widget-shell/.dash-grid` left to row #10 + row #2.
- **E1** mock fixtures co-located at `internal/fixtures.ts`.
- **F1** 12-city library hard-coded at `internal/cityLibrary.ts`, shared by ClockWidget timezone picker + WorldClocks.
- **G1** MiniCal navigation via `ctx.goTo("calendar")` — row #10's DashboardSlotHost already wires the event-bus emit.
- **H1** `data-no-drag` markers on ClockWidget toolbar + WorldClocks header/picker + MiniCal head/foot per row #10's api.md §S4.
- **I1** 3-commit phase plan (P1 clock+stats / P2 cal+tz+weather+stickies / P3 mail+upcoming+host wire-up).
- **J1** Analog clock = SVG viewBox 0 0 100 100 with 60 minor + 12 major + 12 numerals per DESIGN.md §4.4.
- **K1** Donut + PomoDots helpers co-located in `internal/`.
- **L1** Persistence via `usePref()` only — three keys already pre-registered.
- **Stable public surface**: 1 named export `dashboardWidgetRegistrations` of length 10; ids/spans frozen per design.md §1.1.

## Phase Progress

| Phase | Status | Commit |
|---|---|---|
| P1 — Package skeleton + ClockWidget + 3 mini stats + i18n delta (clock + stat labels) + helpers (Donut/PomoDots/cityLibrary/Icon) + ClockStyle widening + default→"classic" | DONE | 9a78d17 |
| P2 — MiniCalWidget + WorldClocks (TzClock) + WeatherWidget + StickiesWidget + fixtures + i18n delta (mini_cal + world_clocks) | DONE | b4bcf22 |
| P3 — MailWidget + UpcomingWidget + host wiring (registration.tsx swap + dashboard-grid/package.json dep + apps/web/package.json dep) + slotIntegration test + dashboard-grid registration test updated → READY_FOR_VERIFY | DONE | (this commit) |

## Phase Plan (3 phases)

> Each phase is a single `feature-build` run. After each phase, `feature-build` stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run". Phases ordered to keep diff small and reviewable.

### Phase P1 — Scaffolding + ClockWidget + 3 mini stats

**Goal**: Package compiles and tests green for ClockWidget (4 styles + 12-tz + analog 60+12+12) + StatTasks/StatStreak/StatPomos. Other widgets stub out as `() => null` placeholders inside `registrations.tsx` to keep the array shape intact for downstream tests.

**Files written**:
- `packages/xai-web-dashboard-widgets/package.json` (name `@repo/plugin-web-dashboard-widgets`, deps mirror dashboard-grid)
- `packages/xai-web-dashboard-widgets/tsconfig.json`
- `packages/xai-web-dashboard-widgets/manifest.json`
- `packages/xai-web-dashboard-widgets/eslint.config.js`
- `packages/xai-web-dashboard-widgets/vitest.config.ts`
- `packages/xai-web-dashboard-widgets/src/index.ts`
- `packages/xai-web-dashboard-widgets/src/registrations.tsx`
- `packages/xai-web-dashboard-widgets/src/styles.css` (clock-* + cs-* + cm-* + ws-* + donut + pomo-dots blocks)
- `packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatTasks.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatStreak.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatPomos.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/Icon.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/Donut.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/PomoDots.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/cityLibrary.ts`
- `packages/xai-web-dashboard-widgets/src/__tests__/setup.ts`
- `packages/xai-web-dashboard-widgets/src/__tests__/index-barrel.test.ts`
- `packages/xai-web-dashboard-widgets/src/__tests__/registrations.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/ClockWidget.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/analogClockTicks.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/StatTasks.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/StatStreak.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/StatPomos.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/Donut.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/PomoDots.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/cityLibrary.test.ts`
- **Edit** `packages/plugin-web-tokens/src/i18n.ts` — additive keys under existing `dashboard:` block: `widgets.clock.{classic,split,minimal,analog,local_time,timezone}` × 2 langs (12 string adds total, P1)

**Sibling concurrency policy applied**: Edit (not Write) on `i18n.ts`; unique anchor `hidden: "Hidden",` (last property of en `dashboard:` block) + `hidden: "已隐藏",` (last property of zh `dashboard:` block); retry git lock 8-20s × 5 if collision.

**Acceptance**:
- `pnpm --filter @repo/plugin-web-dashboard-widgets lint` clean
- `pnpm --filter @repo/plugin-web-dashboard-widgets check-types` clean
- `pnpm --filter @repo/plugin-web-dashboard-widgets test` green (AC-PKG + AC-REG-1..3 + AC-CLOCK + AC-ANALOG + AC-STATS + AC-CITYLIB)
- `pnpm --filter @repo/plugin-web-tokens check-types` clean (i18n delta)

**Commit**: `feat(plugin-web-dashboard-widgets): P1 — scaffolding + ClockWidget + 3 mini stats (W2e row #11)` with Why/What/Scope/Risk/Docs/Tests body.

### Phase P2 — MiniCal + WorldClocks + Weather + Stickies

**Goal**: 4 more widgets, with full registrations.tsx render functions (no placeholders for these). Mock fixtures live in `internal/fixtures.ts`.

**Files written**:
- `packages/xai-web-dashboard-widgets/src/widgets/MiniCalWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/WorldClocks.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/WeatherWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StickiesWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/TzClock.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/fixtures.ts`
- **Edit** `packages/xai-web-dashboard-widgets/src/styles.css` — append mc-* + tz-* + ww-* + wwf-* + sticky-* blocks
- **Edit** `packages/xai-web-dashboard-widgets/src/registrations.tsx` — substitute P1 placeholders for these 4 widgets
- `packages/xai-web-dashboard-widgets/src/__tests__/MiniCalWidget.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/WorldClocks.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/TzClock.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/WeatherWidget.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/StickiesWidget.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/fixtures.test.ts`
- **Edit** `packages/plugin-web-tokens/src/i18n.ts` — additive keys: `widgets.mini_cal.{open}`, `widgets.world_clocks.{add_city,all_added,list,analog,grid,today,tomorrow,yesterday,remove}`, `widgets.weather.{city}` × 2 langs (~22 string adds, P2)

**Acceptance**:
- All P2 ACs green (AC-MINICAL + AC-WORLDCLOCKS + AC-WEATHER + AC-STICKIES + AC-FIXTURES + AC-CITYLIB sanity)
- Cumulative test count: P1 + P2 ≥ 80 tests; lint + check-types clean.

**Commit**: `feat(plugin-web-dashboard-widgets): P2 — MiniCal + WorldClocks + Weather + Stickies (W2e row #11)`.

### Phase P3 — Mail + Upcoming + Host wiring + Polish

**Goal**: All 10 widgets done; row #10's `DashboardSlotHost` switched from `EMPTY_WIDGETS` to `dashboardWidgetRegistrations`; apps/web depends on row #11; dev_log to READY_FOR_VERIFY.

**Files written**:
- `packages/xai-web-dashboard-widgets/src/widgets/MailWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/UpcomingWidget.tsx`
- **Edit** `packages/xai-web-dashboard-widgets/src/styles.css` — append mail-* + upc-* blocks
- **Edit** `packages/xai-web-dashboard-widgets/src/registrations.tsx` — final array with mail + upcoming render funcs
- **Edit** `packages/xai-web-dashboard-grid/src/registration.tsx` — substitute `EMPTY_WIDGETS` → import + use `dashboardWidgetRegistrations` (single-line)
- **Edit** `packages/xai-web-dashboard-grid/package.json` — add 1 dep line `"@repo/plugin-web-dashboard-widgets": "workspace:*"`
- **Edit** `apps/web/package.json` — add 1 dep line `"@repo/plugin-web-dashboard-widgets": "workspace:*"`
- `packages/xai-web-dashboard-widgets/src/__tests__/MailWidget.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/UpcomingWidget.test.tsx`
- `packages/xai-web-dashboard-widgets/src/__tests__/slotIntegration.test.tsx`
- **Edit** `packages/xai-web-dashboard-grid/src/__tests__/registration.test.tsx` — update existing assertions to reflect dashboardWidgetRegistrations usage (if assertions check EMPTY_WIDGETS, they need updating; otherwise the test should already pass post-Edit) — confirm during P3 build

**Acceptance**:
- All P3 ACs green (AC-MAIL + AC-UPCOMING + AC-HOST-1..3)
- All cumulative tests green (P1+P2+P3 ≥ 95 tests).
- `pnpm --filter @repo/plugin-web-dashboard-grid test` green (host wiring change doesn't break row #10 tests).
- `pnpm --filter @repo/web test` green.
- `pnpm -w build` green.
- Lint + check-types clean across all touched packages.
- Set dev_log.md `Status: READY_FOR_VERIFY`, `Suggested Next: feature-verify`.

**Commit**: `feat(plugin-web-dashboard-widgets): P3 — Mail + Upcoming + host wiring + READY_FOR_VERIFY (W2e row #11)`.

## Risks Snapshot

| ID | Risk | Mitigation | Phase |
|---|---|---|---|
| R1 | Analog 60+12+12 alignment drift | SVG viewBox 0 0 100 100 + dedicated test | P1 |
| R2 | Static UTC offset ≠ DST | Documented intentional v1 | P1 |
| R3 | MiniCal day click triggers drag | data-no-drag on .mc-head/.mc-foot; mc-grid click handler ignores data-no-drag children | P2 |
| R4 | WorldClocks picker drag leak | data-no-drag on .tz-view-toggle + .tz-picker | P2 |
| R5 | Clock popover scrim drag-block | data-no-drag on popover | P1 |
| R6 | Default xai_dash_order mismatch | Verified — 10 ids match | P1 |
| R7 | Mock fixtures stale | Reference DESIGN.md in fixtures header comment | P2 |
| R8 | Sibling concurrency on shared anchors | Edit not Write + unique anchor + git lock retry 8-20s × 5 | All |
| R9 | i18n key collision | All new keys under `dashboard.widgets.*` sub-namespace | P1+P2 |
| R10 | usePref API mismatch | Reuse row #10 pattern | P1 |
| R11 | Cross-package commit on row #10 file | Single-line Edit + coverage extends in row #11 + AC-HOST-2 verifies | P3 |
| R12 | jsdom limitations (PointerEvent, etc.) | Reuse row #10 setup.ts polyfills if needed | All |

## Review Notes (2026-05-23, claude-opus-4-7 — feature-review)

**Verdict: APPROVED** — 0 blockers, 1 sub-finding resolved during review.

Gate checks:
1. **Discovery quality**: 12 decision axes (A–L) with 2–3 alternatives each + justified verdicts; 12 risks with concrete mitigations; 6 open questions all resolved. ✅
2. **Design alignment**: design.md §1.1 (15 frozen assumptions) matches discovery §8 verbatim. §2 arch diagram correctly traces row #10's `WidgetRegistration[]` slot consumption. §3 file layout enumerates all 10 widgets + helpers + tests. §6 3-phase plan respects ADR-0007 §S4/§S5. ✅
3. **Contract completeness**: api.md §S1 single-export confirmed; §S3 10-entry per-id spec; §S4 drag-exclude per row #10 §S4; §S5 persistence keys match registry (verified `xai_clock_style`/`xai_clock_tz`/`xai_zones` pre-registered in row #3 registry.ts:251+); §S6 ~11 i18n keys × 2 langs in `dashboard.widgets.*` sub-namespace (no collision verified: existing dashboard.* block at i18n.ts:134-153/334-353 owns `tasks_done`/`streak`/`pomos`/`weather`/`timezones`/`sticky_notes`/`mail`/`upcoming`/`good_*`/`empty_*`/`add_widget` — `widgets.*` sub-key is greenfield). ✅
4. **Phase plan quality**: 3 phases with clear file boundaries; P1 ships the riskiest piece first (ClockWidget — analog 60+12+12 constraint); P2 ships 4 widgets including MiniCal goTo; P3 ships final 2 widgets + cross-package host wiring. Each phase = one commit. ✅
5. **Architecture risk**: cross-package commit on row #10's `registration.tsx` is a 1-line Edit only; coverage extends in row #11 + AC-HOST-2 verifies. Sibling concurrency on `apps/web/package.json` + `i18n.ts` uses unique anchors disjoint from siblings #8 board-views + #9 board-workspaces (board-views/workspaces own `board.*` i18n keys + `plugin-web-board-*` deps). ✅

**Sub-finding (resolved during review)**: `DEFAULT_DASH_ORDER` in row #3's storage registry (registry.ts:121-130) was seeded with 8 placeholder ids (`["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]`) that don't match row #11's 10 prototype ids. **Resolution**: row #10's `sanitizeOrder()` is purpose-built for this case — drops unknown persisted ids + appends missing registered ids in registration order; `useDashOrder` then writes the sanitized 10-id order back to storage on first mount. No registry edit needed. Documented in design.md §5 + api.md §S5 as intentional reconciliation pathway. Covered by AC-REG-2 + slotIntegration test.

Cross-row contract: row #11 consumes row #10's stable `WidgetRegistration`/`WidgetSpanClass`/`WidgetRenderContext` types (frozen per row #10 api.md §S2 + ADR-0007 §S4 frozen-assumption 14). No breakage.

Sanity-checked: row #10 source code (types.ts, index.ts, registration.tsx) read end-to-end; widget rendering happens via `widget.render(ctx)` with `ctx = { lang, now, goTo }`; tests in `DashboardModule.render.test.tsx` confirm the 1Hz tick + lang plumbing. Row #11's render functions receive this ctx unchanged.

## Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-23 | claude-opus-4-7 — feature-plan | Fresh planning artifacts: discovery review + design.md + api.md + test.md + dev_log.md created. 15 frozen assumptions. 3-phase plan. 12 risks with mitigations. Sibling W2e concurrency policy applied (Edit-not-Write on 4 shared anchors). | — | feature-review |
| 2026-05-23 | claude-opus-4-7 — feature-review | APPROVED. All 5 review gates PASS (discovery/design/contract/phase/arch-risk). 0 blockers. Sub-finding on DEFAULT_DASH_ORDER 8-vs-10 id mismatch resolved as intended sanitizeOrder reconciliation pathway — no registry edit. Updated design.md §5 + api.md §S5 with explicit reconciliation note. | — | feature-auto-build |
| 2026-05-23 | claude-opus-4-7 — feature-auto-build | P1: package skeleton + ClockWidget (4 styles + 12-tz + analog SVG 48 minor + 12 major + 12 numerals) + 3 mini stats + helpers (Donut/PomoDots/Icon/cityLibrary) + i18n delta clock+timezone keys. 46 tests green. ClockStyle widened in storage registry from 3 to 4 (owner edit). Default flipped from "analog" to "classic". | 9a78d17 | feature-build (P2) |
| 2026-05-23 | claude-opus-4-7 — feature-auto-build | P2: MiniCalWidget (Monday-first month, goTo via ctx, data-no-drag head/foot, mc-grid click navigates) + WorldClocks (list/analog/grid + 12-city library + add/remove/persistence + last-zone guard + unknown-id filter) + WeatherWidget (fixture-driven current + 5-day forecast) + StickiesWidget (3-note rotated stack) + TzClock helper + fixtures (WEATHER/STICKIES/MAILS/UPCOMING/CAL_EVENTS) + i18n delta mini_cal + world_clocks keys. 37 new tests (83 total). | b4bcf22 | feature-build (P3) |
| 2026-05-23 | claude-opus-4-7 — feature-auto-build | P3: MailWidget (unread red dot + count badge) + UpcomingWidget (4-event list) + host wiring (Edit `packages/xai-web-dashboard-grid/src/registration.tsx` swapping EMPTY_WIDGETS → dashboardWidgetRegistrations + `packages/xai-web-dashboard-grid/package.json` adding workspace dep + `apps/web/package.json` adding workspace dep) + slotIntegration test + updated row #10's registration.test.tsx to assert 10 widget shells render instead of empty state. 10 new tests (93 total widgets pkg + 104 total dashboard-grid pkg). apps/web 54/54 + vite build 721 modules green. dev_log flipped to READY_FOR_VERIFY. | 95bbdc8 | feature-verify |
| 2026-05-23 | claude-opus-4-7 — feature-verify | **PASS** — 15/15 verify gates clean. 93/93 widgets pkg + 104/104 dashboard-grid pkg + 70/70 storage pkg + 54/54 web tests + vite build 721 modules / 83.69KB css / 905KB main green. All 15 frozen assumptions honored (§1.1 design.md). All 10 widget ACs covered in 19 test files. Cross-package host wiring (registration.tsx + dashboard-grid/package.json + apps/web/package.json) confirmed clean — sibling-concurrency safe (siblings #8/#9 work disjoint). ClockStyle widening kept storage tests green. Residual: visual FLIP timing + iOS touch + reload-persist round-trip queued for cross-vendor manual smoke (Codex primary / Cursor fallback). Pre-existing TokensSmokePage lint warnings noted as non-blockers (introduced by W1.P3 commit 6c556e6; documented in row #10 verify too). Status flipped to READY_TO_SHIP. | — | ship |
| 2026-05-23 18:58 | claude-sonnet-4-6 — ship | Shipping gate: 93/93 tests pass (pnpm --filter @repo/plugin-web-dashboard-widgets test). Commits 9a78d17/b4bcf22/95bbdc8/e9891de confirmed on remote main. dev_log flipped to SHIPPED. manifest.json status → Stable. PLUGIN_MAP.md row #11 added at Stable. | chore commit (this run) | — |

## Verify Report (2026-05-23)

**Verdict**: PASS (15/15 gates) — READY_TO_SHIP.

### Gate-by-gate

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Commits scoped per-phase, single intent | PASS | 3 commits (9a78d17 / b4bcf22 / 95bbdc8) — each commits exactly the files documented in its dev_log Files-written list; no foreign content (siblings #8/#9 confirmed unstaged in each commit's diff). |
| 2 | Commit messages per docs/conventions/COMMIT_CONVENTION.md | PASS | All 3 carry `type(scope): summary` + Why / What / Scope / Risk / Docs / Tests sections. |
| 3 | design.md §1.1 frozen assumptions (15 items) | PASS | All 15 honored: pkg name (#1), single-export surface (#2), 10 prototype ids (#3), span mapping (#4), 3 persistence keys (#5), 4 clock styles (#6), analog SVG 60+12+12 (#7), 12-city library no-DST (#8), 3 world-clocks views + 4 default zones (#9), MiniCal goTo (#10), co-located fixtures (#11), dashboard.widgets.* i18n sub-namespace (#12), data-no-drag markers (#13), 3-commit plan (#14), zero new external deps (#15). |
| 4 | Public surface matches api.md §S1 | PASS | src/index.ts re-exports only `dashboardWidgetRegistrations`; AC-PKG-4 (index-barrel.test.ts) asserts `Object.keys(Barrel).sort()` equals `["dashboardWidgetRegistrations"]`. |
| 5 | 10-widget shape per §S3 | PASS | AC-REG-1..5 green; ids in `[clock, stat-tasks, stat-streak, stat-pomos, weather, mini-cal, timezones, stickies, mail, upcoming]`; spans in `[w-clock, w-stat×3, w-weather, w-mini-cal, w-timezones, w-stickies, w-mail, w-upcoming]`; each has bilingual ariaLabel; each render returns ReactNode without throwing. |
| 6 | Analog clock 60+12+12 alignment (DESIGN.md §4.4 hard constraint) | PASS | AC-ANALOG-1..5 green — viewBox `0 0 100 100`, 48 minor ticks (60 minus 12 multiples of 5), 12 major ticks, 12 numerals `[12,1..11]` rendered as `<text data-numeral>`. Hour hand rotation verified at 03:00:00. |
| 7 | ClockWidget 4 styles + 12-tz + persistence | PASS | AC-CLOCK-1..8 green — classic/split/minimal/analog all render distinct trees; `xai_clock_style` round-trips; popover lists Local + 12 cities; Shanghai +8 UTC math correct; invalid stored style falls back to "classic"; scrim close path. |
| 8 | MiniCal goTo via event bus (hard constraint) | PASS | AC-MINICAL-6/7 — clicking body or footer link calls `ctx.goTo("calendar")`; AC-MINICAL-8 — clicking prev/next nav does NOT call goTo (data-no-drag + stopPropagation); row #10's DashboardSlotHost (registration.tsx) translates ctx.goTo to `emitWebEvent("web:shell:module-change", { moduleId: "calendar", source: "mini-cal" })` — no direct event bus import from any widget. |
| 9 | WorldClocks 3 views + 12-city + persistence + last-zone guard | PASS | AC-WORLDCLOCKS-1..9 green — default 4 zones, view toggle works, picker shows 8 unselected cities, add/remove updates `xai_zones`, removing last zone blocked, unknown ids filtered. |
| 10 | Drag-exclude discipline per api.md §S4 | PASS | AC-CLOCK-6 (clock-toolbar), AC-MINICAL-9 (mc-head + mc-foot), AC-WORLDCLOCKS-6 (tz-view-toggle + tz-picker) all carry data-no-drag; remove buttons are native `<button>` (auto-excluded). |
| 11 | i18n delta scoped to dashboard.widgets.* | PASS | New keys live under existing dashboard: block at i18n.ts en lines 170-189 / zh lines 380-399 — sub-namespace `widgets.{clock, mini_cal, world_clocks}`. No collision with existing dashboard.* keys (good_morning / tasks_done / streak / pomos / weather / timezones / sticky_notes / mail / upcoming / etc.); `pnpm --filter @repo/plugin-web-tokens check-types` clean. |
| 12 | ClockStyle widening + storage tests still green | PASS | registry.ts line 79: `ClockStyle = "classic" \| "split" \| "minimal" \| "analog"` (was 3 styles). Default switched to "classic". Storage owner string already says `xai-web-dashboard-widgets` → row #11 IS the authorized owner. `pnpm --filter @repo/plugin-web-storage test` 70/70 green (including AC-TYPE-3 which asserts `usePref('xai_clock_style')` returns `[ClockStyle, ...]`). |
| 13 | Cross-package host wiring (P3) | PASS | `packages/xai-web-dashboard-grid/src/registration.tsx` swaps `widgets={EMPTY_WIDGETS}` → `widgets={dashboardWidgetRegistrations}`; row #10's `registration.test.tsx` updated to assert `.dash-empty == null` AND `.widget-shell` count === 10; `pnpm --filter @repo/plugin-web-dashboard-grid test` 104/104 green. |
| 14 | apps/web build green | PASS | `pnpm --filter @repo/web build` → 721 modules transformed (was 715 in row #10's verify), 83.69KB css (was 64KB; +19.69KB from widget styles), 905.69KB main, 2.48s. No new bundler warnings introduced by row #11. |
| 15 | Sibling concurrency safe | PASS | My 3 commits' file lists confirmed disjoint from siblings #8 (board-views) + #9 (board-workspaces). Shared anchors used: (a) `packages/plugin-web-tokens/src/i18n.ts` — additive sub-block under existing dashboard: block; (b) `packages/plugin-web-storage/src/internal/registry.ts` — single-line ClockStyle widening + default flip; (c) `apps/web/package.json` — single line dep insert; (d) `packages/xai-web-dashboard-grid/{src/registration.tsx,src/__tests__/registration.test.tsx,package.json}` — cross-package owner edits. All landed cleanly without git-lock collision (no retry triggered). |

### Test totals

- @repo/plugin-web-dashboard-widgets: **93 / 93** (19 test files)
- @repo/plugin-web-dashboard-grid (unchanged scope + 1 updated test): **104 / 104** (13 test files)
- @repo/plugin-web-storage (after ClockStyle widening): **70 / 70** (8 test files)
- @repo/plugin-web-tokens check-types: clean
- @repo/web: **54 / 54** (14 test files)
- @repo/web build: 721 modules, 2.48s
- All lints green (PRE-EXISTING TokensSmokePage warnings noted in §16 — not introduced by row #11; same as row #10 verify gate 12).

### Residual risks (acceptable at ship-time, queued for cross-vendor manual smoke)

| ID | Risk | Mitigation status |
|---|---|---|
| R1 | Analog clock alignment drift on different fonts/scales | Unit test asserts 48 + 12 + 12 + viewBox; visual confirmation deferred to cross-vendor §6 smoke. |
| R2 | Static UTC offsets vs DST | Documented intentional v1 limitation in api.md §S10; cross-vendor smoke will surface any DST surprise visually. |
| R3 | MiniCal click-vs-drag (mc-grid click intercepted by row #10's pointerdown) | Unit tested via 4 ACs (AC-MINICAL-6/7/8/9); visual confirmation in Safari/Chrome/Firefox in §6.4 cross-vendor smoke. |
| R4 | WorldClocks picker pointer event leaking to drag | Unit tested AC-WORLDCLOCKS-6; visual confirm in §6.5. |
| R7 | Mock fixtures stale | Documented in fixtures.ts header comment + DESIGN.md anchor. |
| R8 | Sibling concurrency safe — confirmed clean at ship-time | All 3 commits inspected; sibling files unstaged in each. |
| R11 | Cross-package commit on row #10 — confirmed clean | P3 commit includes only the single-line registration.tsx swap + 1 dep line + 1 updated test assertion; row #10's 104/104 still green. |

### Cross-vendor verify scope (queued, manifest header says Codex primary / Cursor fallback)

Per test.md §6: open `/app/dashboard` in Safari 17+ / Chrome / Firefox and visually verify:
1. All 10 widgets render (no empty state)
2. ClockWidget 4 styles + 12-tz picker + reload-persists
3. Analog clock visual alignment (60 + 12 + 12 cleanly rendered)
4. MiniCal day-click navigates to `/app/calendar`; prev/next month nav local-only
5. WorldClocks toggle list/analog/grid; add/remove; reload-persists
6. Stat widgets show donut/flame/dots
7. Drag-to-reorder works via row #10's FLIP; `xai_dash_order` round-trips with the sanitize-on-mount 8→10 reconciliation
8. Light/Dark theme inversion on widget bodies
9. iOS touch drag (Safari)
10. DevTools Application tab shows `xai_clock_style`, `xai_clock_tz`, `xai_zones`, `xai_dash_order` keys after interaction.

### §16 Lint exclusion footnote

`pnpm --filter @repo/web lint` reports 3 PRE-EXISTING warnings in `apps/web/src/pages/TokensSmokePage.tsx` (lines 71 + 73 — turbo undeclared `DEV` env var + react-hooks/rules-of-hooks conditional `useState`). These were introduced in W1.P3 commit `6c556e6` and are NOT my changes (`git diff HEAD apps/web/src/pages/TokensSmokePage.tsx` returns empty). Row #10's verify (gate 12) documented the same status. Treating as pre-existing technical debt, NOT a row #11 blocker — would be cleaned up by a dedicated TokensSmokePage refactor commit outside this row's scope.

- 
- 2026-05-28 00:31:58
  Executor: bugfix-full-loop
  Action: Phase 0 INTAKE PASS — fresh-start bugfix for Audit Top-10 #9 (D-06, missing WidgetShell remove UI). Bug not previously SHIPPED (git log search returns 0 commits for Top-10 #9 / D-06 / widget remove; widgets dev_log Status=SHIPPED for prior FEATURE_DEV lineage; grid dev_log Status=SHIPPED for prior BUGFIX lineage). Automation Mode=A-Claude (provided in invocation, no picker fire). Verify Cross-vendor=yes (provided). Dispatching bug-diagnose next.

- 2026-05-28 00:32:20
  Executor: bugfix-full-loop
  Action: STOP with BLOCKED — orchestrator cannot dispatch sub-agents from current runtime (only Read+Bash tools exposed; Agent/Task tool not available in this invocation context). User should invoke bug-diagnose / bug-fix / bug-verify directly via their CLI subagent runner, OR re-invoke bugfix-full-loop through the standard Claude Code subagent dispatcher that grants the Agent tool. No code or docs modified beyond this Work Log entry.

- 2026-05-28
  Executor: claude-opus-4-7 (1M context) — bug-diagnose
  Action: Phase 0+1+2+3+4+5+6 of fresh BUGFIX (Audit Top-10 #9 / D-06 — Widget remove affordance missing) complete. Primary target = sibling package `@repo/plugin-web-dashboard-grid` (owns `WidgetShell.tsx` + `DashboardGrid.tsx` + `useDashOrder.ts` + `xai_dash_order` write path). This package (`@repo/plugin-web-dashboard-widgets`) is a COLLABORATOR — no source change planned because widgets are pure render functions inside `WidgetRenderContext`; the remove control lives on the shell that wraps them, not on the widget bodies themselves. Drag-exclude markers (`data-no-drag`) already documented and applied where needed inside this package (api.md §S4 + dev_log line 224 verify gate 10). No edit required to manifest.json, package.json, or src/. The fresh BUGFIX Status Panel and full diagnose narrative (Bug Card + Phases 1-6 + 11 risks + 7 new test plan) live in `packages/xai-web-dashboard-grid/docs/dev_log.md` BUGFIX Lineage block (appended 2026-05-28). Suggested Next for this package = monitor only; bug-fix will write code in dashboard-grid, not here. If bug-fix discovers a widget-body interactive child that newly requires `data-no-drag` (e.g. a remove button were ever to land on a widget body — NOT planned for v1), this dev_log gets another entry then.
  Next: monitor — bug-fix targets dashboard-grid; no source change in dashboard-widgets.

- 2026-05-28 13:15
  Executor: claude-sonnet-4-6 — bug-auto-fix (collaborator Work Log only)
  Action: Audit Top-10 #9 (D-06) bug-auto-fix DONE. All 4 sub-fixes implemented in primary target `@repo/plugin-web-dashboard-grid`: (1) WidgetShell remove button + local STR table + styles.css (48acd92); (2) useDashOrder removeWidget 4-tuple extension (60aabb3); (3) DashboardGrid/DashboardModule wire-up + removedInSession filter + 7 new AC-RM tests (e6b483a). No source change in `@repo/plugin-web-dashboard-widgets` — confirmed as expected (widgets are pure render functions; the remove affordance is on the WidgetShell wrapper, not the widget bodies; no new data-no-drag markers needed). 168/168 dashboard-grid tests PASS. 128/128 web regression PASS. Status in dashboard-grid dev_log flipped FIX_IN_PROGRESS → FIX_READY_FOR_VERIFY.
  Next: bug-verify targets dashboard-grid. No further action in this package.

---

# §E — Extension Lineage: xai-web-dashboard-stickies-create (FEATURE_DEV, opened 2026-05-28)

> **APPEND extension — does NOT supersede the SHIPPED row #11 lineage above (FEATURE_DEV) or the Top-10 #9 collaborator BUGFIX entries.** This block is the authoritative workflow state for the stickies create+delete feature. The SHIPPED Status Panel at the top of this file remains the historical record for the original 10-widget pack.

## §E Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-dashboard-stickies-create |
| Title | Web Console — Dashboard Stickies create + delete (store-from-scratch + xai_dashboard_stickies key + StickyComposer native dialog) |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — (workflow complete) |
| Level | feature (store-from-scratch; Realistic v1) |
| Verify Cross-vendor | DEFERRED per ADR-0008 §S3 (Codex `gpt-5.5-thinking effort=medium` primary / Cursor fallback — see test.md §E.5; joins accumulated Web smoke batch before next xai-web-deploy-cloudflare ship) |
| Automation Mode | A-Claude (default; pickable at feature-build dispatch) |
| Executor | claude-sonnet-4-6 — ship |
| Updated | 2026-05-28 |
| Roadmap Manifest | docs/workflow/roadmap/xai-web-dashboard-stickies-create.md (row #1, NEEDS_REVIEW) |
| Authority Anchor | ADR-0010 §D4 — P0 carve-out `docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md` (commit `baaf3e1`) |
| Audit Trigger | docs/reviews/_web-noop-audit/20260527-button-action-inventory.md Top-10 #6 (D-21) — LAST Top-10 item |
| Closest Precedent | xai-web-calendar-event-create (store-from-scratch; commits `e108607` → `90ca6d8`) |
| Branch | web (NOT dev) |
| Write Scope (plan) | `docs/reviews/xai-web-dashboard-stickies-create/` + `docs/workflow/roadmap/xai-web-dashboard-stickies-create.md` + `packages/xai-web-dashboard-widgets/docs/` (§E appends) |
| Write Scope (build) | will extend to: `packages/xai-web-dashboard-widgets/src/StickyComposer.tsx` (new), `src/internal/stickiesStore/{types,ids,stickiesStore,useStickies}.ts` (new), `src/internal/strings.ts` (new), `src/widgets/StickiesWidget.tsx` (EXTEND), `src/styles.css` (EXTEND), `src/__tests__/**` (new + extend), `packages/plugin-web-storage/src/internal/registry.ts` (1 additive key — AUTHORIZED), `packages/plugin-web-storage/src/__tests__/{registry,parity-design-md}.test.ts` (parity arrays + new ACs) — all per design.md §E.3 |

## §E Artifacts Index

- P0 carve-out: `docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md` (commit `baaf3e1`)
- Discovery review: `docs/reviews/xai-web-dashboard-stickies-create/20260528-discovery-review.md`
- Roadmap manifest: `docs/workflow/roadmap/xai-web-dashboard-stickies-create.md`
- Design snapshot (extension): `packages/xai-web-dashboard-widgets/docs/design.md` §E
- API contract (extension): `packages/xai-web-dashboard-widgets/docs/api.md` §E
- Test strategy (extension): `packages/xai-web-dashboard-widgets/docs/test.md` §E

## §E Decision Headline

Build a **from-scratch sticky store** (mirroring SHIPPED `xai-web-calendar-event-create`, NOT Tasks/Matrix wire-to-existing) inside the SHIPPED `@repo/plugin-web-dashboard-widgets` package + a **new authorized registry key `xai_dashboard_stickies`** + a **native `<dialog>` StickyComposer**. 5 planner's-calls resolved (discovery §6):

- **Q1 — CREATE + DELETE** (delete IN scope; per-sticky `×`; DIVERGES from Matrix — sticky value collapses without delete + delete is a 4-line key-omit).
- **Q2 — native `<dialog>` modal** (over inline-add; widget body is a drag surface, modal renders in the top layer).
- **Q3 — local `internal/strings.ts` STR table** (NO `plugin-web-tokens` edit; 0 new token keys — strictly lower churn than the authorized tokens exception; existing `dashboard.sticky_notes` REUSED).
- **Q4 — fixture as sample-until-first-user-sticky** (empty store → 3 read-only samples + create hint; non-empty → user only; fixtures never persist; mirrors Calendar Q9/Q10).
- **Q5 — single-string text** (`text: string`, not bilingual; bilingual reserved for the canned fixture).

Plus: composer + `useStickies` state live INSIDE `StickiesWidget` (H1 — NO `WidgetRenderContext`/`packages/core`/module edit); persistence via `usePref` (no `web:*` channel); public surface UNCHANGED (`dashboardWidgetRegistrations`-only).

## §E Phase Plan (4 phases — store-from-scratch cadence)

> Each phase is a single `feature-build` run; after each, build STOPS for human confirmation (CLAUDE.md "feature-build does ONE phase per run"). Cadence borrowed from `xai-web-calendar-event-create` (which split data-layer into its own commit). SP4 MAY fold into SP3 if the barrel stays single-export (reviewer OQ4).

### Phase SP1 — Data layer + registry key

**Goal**: from-scratch pure store + hook + id helper + the new authorized registry key, all green, before any UI.

**Files written**:
- `packages/xai-web-dashboard-widgets/src/internal/stickiesStore/types.ts` (`UserSticky`, `StickyColor`, `NewStickyDraft`, `STICKY_COLORS`)
- `.../stickiesStore/ids.ts` (`createStickyId()`)
- `.../stickiesStore/stickiesStore.ts` (pure `createSticky` / `deleteSticky` / `listStickies`)
- `.../stickiesStore/useStickies.ts` (`useStickies()` over `usePref`)
- `.../stickiesStore/__tests__/stickiesStore.test.ts` (AC-STORE-1..7)
- `.../stickiesStore/__tests__/ids.test.ts` (AC-IDS-1..3)
- **Edit** `packages/plugin-web-storage/src/internal/registry.ts` — add `xai_dashboard_stickies` (additive; after `xai_calendar_events` block; AUTHORIZED carve-out §2)
- **Edit** `packages/plugin-web-storage/src/__tests__/registry.test.ts` — add to `OWNER_ROW_ADDITIONS` (line ~230) + new `AC-REGISTRY-STICKIES-1/2`
- **Edit** `packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts` — add to exclusion list (line ~165)

**Acceptance**: AC-STORE-1..7 + AC-IDS-1..3 green; AC-REGISTRY-STICKIES-1/2 green; AC-REG-8 count auto-derives green; `pnpm --filter @repo/plugin-web-storage test` green; `pnpm --filter @repo/plugin-web-dashboard-widgets check-types`+lint clean; SHIPPED 93 widget tests still green.

**Commit**: `feat(xai-web-dashboard-widgets): SP1 stickies store + xai_dashboard_stickies key (xai-web-dashboard-stickies-create)`.

### Phase SP2 — StickyComposer (native dialog) + local STR

**Goal**: the create dialog, fully tested, before wiring.

**Files written**:
- `packages/xai-web-dashboard-widgets/src/StickyComposer.tsx` (native `<dialog>`; textarea + 5-preset color radiogroup + Save/Cancel; ESC/backdrop/autofocus/a11y)
- `.../src/internal/strings.ts` (`STR_STICKY_COMPOSER` + empty hint + add/delete aria — local STR)
- **Edit** `.../src/styles.css` — append `.sticky-composer*` blocks
- `.../src/__tests__/StickyComposer.test.tsx` (AC-COMPOSER-1..9)

**Acceptance**: AC-COMPOSER-1..9 green (incl. bilingual STR parity); lint + check-types clean.

**Commit**: `feat(xai-web-dashboard-widgets): SP2 StickyComposer dialog + local STR (xai-web-dashboard-stickies-create)`.

### Phase SP3 — Wire `+` + render user stickies + delete + persistence

**Goal**: end-to-end create + delete + persist, with fixture-as-sample disposition.

**Files written**:
- **Edit** `.../src/widgets/StickiesWidget.tsx` — wire `+` onClick → composer; `useStickies`; empty-store fixture-sample branch + user-sticky branch (single-string text + preset color) + per-sticky `×` delete; mount `<StickyComposer>`
- **Edit** `.../src/styles.css` — append `.sticky-del` + `.sticky--sample`
- `.../src/__tests__/useStickies.test.tsx` (AC-HOOK-1..4)
- **Edit** `.../src/__tests__/StickiesWidget.test.tsx` — re-home SHIPPED AC-STICKIES-1..3 under empty-store branch + add AC-STICKIES-CREATE-1..8

**Acceptance**: AC-HOOK-1..4 + AC-STICKIES-CREATE-1..8 green; SHIPPED AC-STICKIES-1..3 still green (re-homed); create→persist→refresh + delete→persist→refresh integration green; lint + check-types clean.

**Commit**: `feat(xai-web-dashboard-widgets): SP3 wire + + render user stickies + delete + persist (xai-web-dashboard-stickies-create)`.

### Phase SP4 — Docs + barrel + cross-vendor → READY_FOR_VERIFY

**Goal**: full suite green, public surface confirmed unchanged, verify gate prepared.

**Files written**:
- `.../src/__tests__/index-barrel.test.ts` (EXISTING — confirm still asserts single `dashboardWidgetRegistrations` export; no edit expected)
- Final docs sync: design.md §E / api.md §E / test.md §E + this dev_log §E
- `pnpm --filter @repo/plugin-web-dashboard-widgets test` + storage + `pnpm --filter @repo/web test` + `pnpm -w build` all green
- Cross-vendor XVENDOR-STICKY matrix + Codex cold-read (test.md §E.5) OR formal ADR-0008 §S3 deferral recorded here
- Flip §E Status → `READY_FOR_VERIFY`, `Suggested Next: feature-verify`

**Acceptance**: all cumulative tests green; barrel unchanged; build green; cross-vendor done or formally deferred.

**Commit**: `feat(xai-web-dashboard-widgets): SP4 docs + barrel + READY_FOR_VERIFY (xai-web-dashboard-stickies-create)`.

## §E Risks Snapshot

| ID | Risk | Mitigation | Phase |
|---|---|---|---|
| RS1 | Registry parity fails — new key not in BOTH enumerated arrays | SP1 adds to `registry.test.ts:230` + `parity-design-md.test.ts:165`; AC-REG-8 auto-derives | SP1 |
| RS2 | `parity-design-md` expects key in DESIGN.md §9.2 | Follow `xai_calendar_events` precedent — exclusion-list only, NO §9.2 edit (reviewer confirm OQ3) | SP1 |
| RS3 | Inline textarea vs drag (only if reviewer overrides to inline) | Default modal `<dialog>` (top layer, no drag surface) | SP2 |
| RS4 | User-sticky render crashes on string text (`s.text[lang]`) | Explicit `if (list.length === 0)` branch; types enforce `UserSticky.text: string`; AC-STICKIES-CREATE-4 | SP3 |
| RS5 | Composer state lost on grid `render(ctx)` tick | Widget is a stable component (like ClockWidget); AC-STICKIES-CREATE-8 (`rerender` with new `now`) | SP3 |
| RS6 | Delete button on fixture sample (samples read-only) | Samples have no `.sticky-del`; AC-STICKIES-CREATE-2/5 | SP3 |
| RS7 | `xai_dashboard_stickies` cleared by chassis `resetAllPrefs()` | Intended (same as `xai_calendar_events`); documented, not a bug | SP1 |
| RS8 | CSS class collision in `styles.css` | Namespace `.sticky-composer*`/`.sticky-del`/`.sticky--sample`; keep base `.sticky`; grep no-redefinition | SP2/SP3 |

## §E Open Questions for feature-review

- OQ1 (Q1): confirm CREATE + DELETE for v1 (plan recommends include-delete; could narrow to create-only).
- OQ2 (Q2): confirm native `<dialog>` over inline-add (carve-out invited inline for stickies).
- OQ3 (RS2): confirm exclusion-list-only registry parity (no DESIGN.md §9.2 edit), per calendar precedent.
- OQ4 (SP3/SP4): confirm 4 phases vs folding SP4→SP3 (if barrel unchanged).
- OQ5 (barrel): confirm public surface stays `dashboardWidgetRegistrations`-only (no `UserSticky` export).

## §E Review Notes (2026-05-28, claude-opus-4-8 — feature-review)

**Verdict: APPROVED** — 0 blockers, 2 non-blocking build-time confirmations. The plan is executable as written.

### Gate checks (5/5 PASS)

1. **Discovery quality — PASS.** 8 decision axes (A-H), each with 2-3 comparable alternatives + justified verdict. Blueprint comparison table (Calendar vs Tasks/Matrix) correctly identifies the structural divergence: Calendar is a full route module that lifts state; Stickies is a widget render-fn, so `useStickies` + composer state live INSIDE `StickiesWidget` (H1) — verified against `registrations.tsx` render-fn contract + ClockWidget's stable-component-across-ticks precedent. 5 planner's-calls resolved with rationale; 8 risks with concrete mitigations.
2. **Design alignment — PASS.** design.md §E (15 frozen assumptions) matches discovery §0/§6 verbatim; api.md §E contracts trace to discovery; dev_log §E Phase Plan matches. No drift.
3. **Contract completeness — PASS.** Verified byte-parallel to the SHIPPED Calendar precedent: `createSticky`/`deleteSticky`/`listStickies` mirror `createEvent`/`deleteEvent`/`listEvents` (`xai-web-calendar/src/internal/eventStore/eventStore.ts` read end-to-end — deleteSticky no-op-same-ref + listStickies `[]`-on-`{}` + createdAt-ASC/id-tiebreak all match); `createStickyId` mirrors `createEventId` (`evt-`→`sticky-` prefix swap); the `xai_dashboard_stickies` registry entry is byte-parallel to `xai_calendar_events` (registry.ts:943-950, incl. correctly OMITTING the `proposed` field per the live precedent).
4. **Phase plan quality — PASS.** 4 phases, clear file boundaries, one commit each, explicit exit criteria (R8). SP1 correctly isolates the cross-package data-layer + registry (mirrors Calendar's data-layer-own-commit; folding it would make one commit touch 2 packages). SP4-fold-into-SP3 offered as reviewer option (OQ4).
5. **Architecture risk — PASS (all within carve-out §2).** `packages/core/` NOT touched (H1 React-state-in-widget, no event channel). `manifest.json` row #11 stays Stable (slot SHIPPED). No cross-feature coupling (registry stays plugin-dep-free). Exactly ONE additive registry key + its 2 parity arrays + new AC. `plugin-web-tokens` NOT edited (`dashboard.sticky_notes` REUSE — verified key exists at i18n.ts en:190/zh:466). `dev` branch / SHIPPED archives / ADR untouched.

### OQ adjudication (planner's-calls 1-5 + the flagged OQ6)

- **OQ1 (CREATE + DELETE) — AFFIRM.** Sticky value collapses without delete; `deleteSticky` is a verbatim 4-line key-omit. Matrix-divergence is sound (Matrix card had join-semantics; sticky `×` is trivial). Delete path is plan + test covered (AC-STORE delete + AC-STICKIES-CREATE-2/5 + delete→persist→refresh integration).
- **OQ2 (modal vs inline) — AFFIRM modal.** NOT blind template-copy: the load-bearing argument is domain-specific — the widget body is a drag surface, an inline `<textarea>` is the R3/R4 pointer-event-vs-drag bug class the SHIPPED widgets already fought; native `<dialog>` renders in the top layer OUTSIDE the grid pointer tree. Consistency with 3 SHIPPED composers is a secondary (not the primary) justification.
- **OQ3 (exclusion-list-only registry parity, no DESIGN.md §9.2) — AFFIRM.** Verified `xai_calendar_events` is the LAST entry in BOTH `OWNER_ROW_ADDITIONS` (registry.test.ts:230-231) and `OWNER_ROW_EXEMPT_KEYS` (parity-design-md.test.ts:165, the `OWNER_ROW_EXEMPT_KEYS` Set at line 180), and the calendar extension did NOT touch DESIGN.md §9.2. Exact precedent; AC-REG-8 count auto-derives from `OWNER_ROW_ADDITIONS.length`.
- **OQ4 (4 vs 3 phase) — AFFIRM 4.** Store-from-scratch warrants a dedicated SP1 data+registry phase. SP4→SP3 fold is a defensible builder option if the barrel truly stays single-export (likely).
- **OQ5 (barrel single-export) — AFFIRM.** Verified `index.ts` exports only `dashboardWidgetRegistrations`; no consumer needs `UserSticky`. Keep internal.
- **OQ6 (single-string text vs fixture-bilingual) — RESOLVED (the flagged real-risk point).** The plan does NOT naively reuse the bilingual indexer on user stickies. §E.6 + RS4 specify a type-discriminated branch: `list.length === 0` → fixtures with `n.text[lang]` (bilingual) + `n.color` (raw hex literal); `list.length > 0` → user stickies with `s.text` (string) + `STICKY_COLORS[s.color]` (token→hex). Types enforce the split (`StickyFixture.text: {en,zh}` vs `UserSticky.text: string`). SHIPPED AC-STICKIES-1..3 (assert fixture render) re-home cleanly under the empty-store branch because G1 renders fixtures-as-samples when the store is empty — confirmed against the actual test file (`.sticky`×3 + `n.text[lang]`). RS6 covers samples having no `.sticky-del`.

### Non-blocking build-time confirmations (for feature-build, NOT plan defects)

1. **Fixture color vs token resolution** — fixtures store RAW HEX (`#fff7c0`, fixtures.ts:58-81); user stickies store a TOKEN resolved via `STICKY_COLORS[s.color]`. The SP3 empty-state sample render MUST keep `n.color` (raw hex literal) and MUST NOT route fixture hex through `STICKY_COLORS` (which would key-miss). Discovery §5 pseudo-code is already correct (`n.color` for samples); flagged so the builder does not "harmonize" the two color paths.
2. **`STICKY_COLORS` token vocabulary vs `xai_pref_sticky_color`** — F1 aligns the 5-token vocabulary `{sun,mint,peach,sky,lilac}` with the existing Settings pref `xai_pref_sticky_color` (default `"sun"`, registry.ts:811) but explicitly DEFERS reading that pref (v1 hard-codes `sun`). Optional one-line note at SP1 that the chosen tokens are compatible with that pref's accepted values, so a future "read-pref-as-default" increment does not hit a token mismatch. Pure deferral hygiene; not required for v1.

Sanity-checked against source: `StickiesWidget.tsx` (no-op `+`, `data-no-drag`, `n.text[lang]`), `fixtures.ts` (`StickyFixture.color: string` raw hex), `index.ts` (single export), `StickiesWidget.test.tsx` (SHIPPED AC-STICKIES-1..3), `eventStore.ts` + `ids.ts` (verbatim-port source), `registry.ts:920-951` (`xai_calendar_events` precedent), both parity arrays, `i18n.ts` (`sticky_notes` exists). Carve-out §2 In/Out scope matches the plan's In/Out exactly. **Final scope: CREATE + DELETE, native `<dialog>`, local STR, fixture-as-sample (G1), single-string text, 4 phases (SP1-SP4), single-export barrel.**

## §E Work Log

| Timestamp | Executor | Action | Commits | Next Step |
|---|---|---|---|---|
| 2026-05-28 | claude-opus-4-8 — feature-plan | Fresh planning artifacts for the stickies create+delete extension (LAST Audit Top-10 item, #6 / D-21). Created discovery review (store-from-scratch analysis vs Calendar precedent + 5 planner's-calls resolved + 8 risks) + single-row roadmap manifest. Appended §E extension blocks to design.md / api.md / test.md / dev_log.md (SHIPPED row #11 content preserved). Frozen 15 assumptions. 4-phase plan (SP1 data+registry / SP2 composer / SP3 wire+delete+persist / SP4 docs+verify). NO implementation code written. Status → NEEDS_REVIEW. | — | feature-review |
| 2026-05-28 | claude-opus-4-8 — feature-review | **APPROVED** — 0 blockers, 2 non-blocking build-time confirmations. All 5 gates PASS. Adjudicated OQ1-OQ5 (AFFIRM all planner's-calls: CREATE+DELETE / modal / exclusion-list parity / 4-phase / single-export barrel) + the flagged OQ6 (single-string-vs-fixture-bilingual render RESOLVED via type-discriminated empty/non-empty branch — verified §E.6 + RS4 + SHIPPED AC-STICKIES re-home). Verified plan against source: Calendar `eventStore.ts`/`ids.ts` verbatim-port shape, `xai_calendar_events` registry parallel (registry.ts:943-950), both parity arrays (registry.test.ts:230 + parity-design-md.test.ts:165), `dashboard.sticky_notes` token reuse (i18n.ts:190/466), `StickyFixture.color` raw-hex vs token split. Carve-out §2 In/Out matches plan. Build-time notes: (1) keep fixture-sample render on `n.color` raw hex (don't route through `STICKY_COLORS`); (2) optional SP1 token-vs-`xai_pref_sticky_color` compatibility note. Status → APPROVED, Suggested Next → feature-build (SP1). | — | feature-build |
| 2026-05-28 14:05 | claude-sonnet-4-6 — feature-auto-build | **SP1**: Pure stickies store from scratch (types/ids/stickiesStore/useStickies) + xai_dashboard_stickies additive registry key + 2 parity test arrays updated + AC-REGISTRY-STICKIES-1/2. 11 new tests. @repo/plugin-web-dashboard-widgets 104/104 green. @repo/plugin-web-storage 96/96 green. Token-pref compatibility note recorded in types.ts. | 5b1a8e9 | SP2 |
| 2026-05-28 14:10 | claude-sonnet-4-6 — feature-auto-build | **SP2**: StickyComposer native `<dialog>` (textarea + 5-preset radiogroup + Save/Cancel; ESC/backdrop/autofocus/aria-modal/aria-labelledby/aria-checked) + local STR table (14 bilingual keys, 0 plugin-web-tokens edit) + styles.css .sticky-composer* + .sticky-del + .sticky--sample blocks + AC-COMPOSER-1..9 (10 tests). 114/114 green. | a1f8ce9 | SP3 |
| 2026-05-28 14:15 | claude-sonnet-4-6 — feature-auto-build | **SP3**: Wire StickiesWidget + button → StickyComposer → useStickies; type-discriminated render (empty-store: fixture samples n.text[lang]+n.color raw hex; user-sticky: s.text+STICKY_COLORS[s.color]); per-sticky × delete (.sticky-del+data-no-drag); fixture samples carry data-sample=true + no .sticky-del (RS4/RS6 covered). AC-STICKIES-1..3 re-homed under empty-store branch + AC-STICKIES-CREATE-1..8 + AC-HOOK-1..4. 126/126 green. @repo/web 128/128 green. build green (138.67KB css, 5.29s). | 4f2bf24 | SP4 |
| 2026-05-28 14:20 | claude-sonnet-4-6 — feature-auto-build | **SP4**: Docs sync (dev_log §E Status Panel → READY_FOR_VERIFY + Work Log entries). Barrel confirmed unchanged (dashboardWidgetRegistrations only; index-barrel.test.ts 2/2 still asserts single export). All cumulative quality gates pass: 126/126 widget tests, 96/96 storage tests, 128/128 web tests, build green, tsc clean, eslint --max-warnings 0 clean. ADR-0008 §S3 cross-vendor deferral applies (Codex primary / Cursor fallback; smoke deferred up to 24h). Status → READY_FOR_VERIFY. | (this doc commit) | feature-verify |
| 2026-05-28 14:35 | claude-opus-4-8 — feature-verify | **PASS** — 16/16 verify gates clean. Commit lineage linear + per-phase (`baaf3e1` carve-out → `5b1a8e9` SP1 → `a1f8ce9` SP2 → `4f2bf24` SP3 → `103d06b` SP4 docs → `74e69b4` docs); NO Matrix-style detour. Tests re-run independently: widgets **126/126** (23 files), storage **96/96** (incl. 4 AC-REGISTRY-STICKIES), web **128/128**, web build green (880 modules / 138.67KB css), tsc clean (widgets+storage), eslint --max-warnings 0 clean. Carve-out §5 acceptance anchor (create+persist+delete+delete-persist) covered by AC-STICKIES-CREATE-1/2/3/4/6/7 + AC-HOOK-1..4. OQ6 type-discriminated render verified at source: fixture path `n.color` raw hex + `n.text[lang]`; user path `STICKY_COLORS[s.color]` + `s.text` single-string (explicit code comments). RS6 fixture-read-only (3 data-sample, 0 .sticky-del) + RS4 string-not-bilingual + RS5 composer-survives-tick + RS8 CSS-namespace all covered. Boundary守约: 0 packages/core, 0 plugin-web-tokens edit (local STR only), 0 other-plugin src (tasks/matrix/calendar), 0 supabase, 0 ADR/archive, 0 dev branch. Registry: exactly 1 additive key + 2 parity arrays + AC; DESIGN.md §9.2 untouched (exclusion-list-only per calendar precedent). Barrel single-export (AC-PKG-4). §S9 CSS guard 0 `.widget*` redefinition. Manifest correctly stays Stable (extension to SHIPPED row #11 slot). 4 non-blocking residuals (R-1 CREATE-7 spec-label drift / R-2 composer inline-error hard-coded / R-3 SP4 commit-msg manifest imprecision / R-4 cross-vendor deferred). Status → READY_TO_SHIP. | — | ship |
| 2026-05-28 | claude-sonnet-4-6 — ship | **SHIPPED** — Shipping gate PASS. Status READY_TO_SHIP confirmed. Commit audit: 6 commits ahead of origin/web (`baaf3e1` carve-out + `5b1a8e9` SP1 + `a1f8ce9` SP2 + `4f2bf24` SP3 + `103d06b` SP4 + `74e69b4` docs). R-3 cosmetic (SP4 msg says "manifest + barrel"; only dev_log.md changed — manifest correctly stays Stable). Verify report (feature-verify content) committed in this ship-flip commit. git push origin web confirmed. Top-10 10/10 SHIPPED (Audit Top-10 #6 = LAST). R-4 cross-vendor smoke joins accumulated Web smoke batch. R-1 + R-2 recorded as cosmetic fast-follow candidates. dev_log §E Status → SHIPPED / Suggested Next → — (workflow complete). | this commit | — |

## §E Verify Report (2026-05-28, claude-opus-4-8 — feature-verify)

**Verdict**: PASS (16/16 gates) — READY_TO_SHIP. Independent re-run; commit lineage cross-checked against `git log` (linear, NOT the Matrix-style detour the brief warned about).

### Gate-by-gate

| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Commit lineage per-phase, single intent | PASS | `baaf3e1`(carve-out) → `5b1a8e9`(SP1) → `a1f8ce9`(SP2) → `4f2bf24`(SP3) → `103d06b`(SP4 docs) → `74e69b4`(docs). Each commit's file-set matches its phase plan; no foreign content. |
| 2 | Commit messages per COMMIT_CONVENTION.md | PASS | All carry `type(scope): summary` + Why/What/Scope/Risk/Docs/Tests. (R-3: SP4 msg mentions "manifest + barrel" but only dev_log.md changed — cosmetic, manifest correctly unchanged.) |
| 3 | Carve-out §5 acceptance — CREATE chain | PASS | AC-STICKIES-CREATE-1: click `+` → fill textarea → Save → samples gone + user sticky with text. |
| 4 | Carve-out §5 acceptance — persist on refresh | PASS | AC-STICKIES-CREATE-7 (create→rerender same localStorage→sticky shows) + AC-HOOK-3 (real `xai_dashboard_stickies` key written). |
| 5 | Carve-out §5 acceptance — DELETE + delete-persist | PASS | AC-STICKIES-CREATE-3 (.sticky-del present) + CREATE-6 (delete→fixture-revert) + AC-HOOK-2/4 (remove + key reverts to `{}` via same usePref write path). |
| 6 | OQ6 type-discriminated render (flagged risk) | PASS | StickiesWidget.tsx: `hasUserStickies` branch → `STICKY_COLORS[s.color]` + `s.text`; else branch → `n.color` raw hex (commented "NOT STICKY_COLORS") + `n.text[lang]`. AC-CREATE-4 asserts user text renders raw at `lang="zh"`. |
| 7 | Fixture samples read-only (RS6) | PASS | AC-CREATE-2: 3 `[data-sample='true']`, 0 `.sticky-del`. |
| 8 | Composer dialog + a11y (AC-COMPOSER-1..9) | PASS | open/close, Cancel→onClose, empty-text validation, trimmed Save, radiogroup default sun + 5 chips aria-checked toggle, aria-modal + aria-labelledby, reset-on-reopen, bilingual STR parity. |
| 9 | SP1 store purity (AC-STORE-1..7) | PASS | createSticky immutable spread; deleteSticky same-ref on miss; listStickies createdAt-ASC + id-tiebreak + `[]` on `{}`. |
| 10 | createStickyId (AC-IDS-1..3) | PASS | crypto.randomUUID + `sticky-` fallback; 100 unique. |
| 11 | Registry: 1 additive key + 2 parity arrays | PASS | `xai_dashboard_stickies` byte-parallel to `xai_calendar_events` (codec json/default `{}`/owner xai-web-dashboard-widgets/category module/schemaVersion 1/no `proposed`); added to OWNER_ROW_ADDITIONS + OWNER_ROW_EXEMPT_KEYS; AC-REGISTRY-STICKIES-1/2 + AC-REG-8 auto-derive. DESIGN.md §9.2 untouched. |
| 12 | Barrel single-export (AC-PKG-4) | PASS | `Object.keys(Barrel).sort() === ["dashboardWidgetRegistrations"]`; StickyComposer/useStickies/UserSticky stay internal. |
| 13 | §S9 CSS guard + RS8 namespace | PASS | 0 `.widget`/`.widget-shell`/`.widget-content` redefinition; new classes namespaced `.sticky-composer*`/`.sticky--sample`/`.sticky-del`; base `.sticky`/`.sticky-stack` preserved. |
| 14 | Boundary discipline | PASS | Full file-set grep: 0 packages/core, 0 plugin-web-tokens edit, 0 other-plugin src (tasks/matrix/calendar), 0 supabase, 0 ADR/archive, 0 dev branch. |
| 15 | Regression — SHIPPED widgets + web | PASS | widgets 126/126 (SHIPPED 93 + AC-STICKIES re-homed under empty-store branch, no loss); web 128/128 (shellRegistrations.integration 8/8 = AC-HOST-3). |
| 16 | Build + tsc + lint | PASS | web build green (880 modules / 138.67KB css); tsc clean widgets+storage; eslint --max-warnings 0 clean (widgets). |

### Test totals (independently re-run 2026-05-28 14:21–14:23)

- @repo/plugin-web-dashboard-widgets: **126 / 126** (23 test files)
- @repo/plugin-web-storage: **96 / 96** (9 test files; incl. AC-REGISTRY-STICKIES-1/2)
- @repo/web: **128 / 128** (24 test files)
- @repo/web build: 880 modules, 138.67KB css, 2.63s
- tsc: clean (widgets + storage); ESLint --max-warnings 0: clean (widgets)

### Residual risks (acceptable at ship-time, non-blocking)

| ID | Risk | Status |
|---|---|---|
| R-1 | AC-STICKIES-CREATE-7 implements create-persist; test.md §E.2 labels CREATE-7 as delete-persist. Delete-persist covered structurally (AC-HOOK-2/4 + CREATE-6 + same usePref write path) but no single delete→remount→still-deleted assertion. | Cosmetic spec-label drift; functional guarantee sound. Optional follow-up: add explicit delete-persist integration test. |
| R-2 | Composer inline-error text ("Note cannot be empty"/"内容不能为空") hard-coded in JSX, not in STR_STICKY_COMPOSER. | Still bilingual + works; minor consistency nit. |
| R-3 | SP4 commit `103d06b` message says "manifest + barrel"; only dev_log.md changed (manifest correctly stays Stable; barrel confirmed-unchanged, not edited). | Cosmetic commit-message imprecision. |
| R-4 | Cross-vendor manual smoke (Chrome/Safari/Firefox) deferred per ADR-0008 §S3. | Recorded; joins accumulated Web smoke batch before next xai-web-deploy-cloudflare ship. Non-blocking. |

### Security note

Local-only sticky notes (text + color preset persisted to localStorage via `usePref`). No auth/payment/secrets/external-input surface; no new external dependency; no network/Supabase. `security-skills-claude-code` trigger does not apply.
