# Dev Log — xai-web-dashboard-widgets

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | xai-web-dashboard-widgets |
| Title | Web Console — Dashboard widget pack (Clock 4 styles/12tz/analog 60+12+12 · MiniCal · WorldClocks · Weather · Stickies · Mail · Upcoming · 3 mini stats) |
| Current Phase | FEATURE_REVIEW |
| Status | APPROVED |
| Suggested Next | feature-auto-build |
| Verify Cross-vendor | yes (Codex primary / Cursor fallback — see test.md §6) |
| Automation Mode | A-Claude (xai-roadmap-loop W2e parallel-Agent mode; siblings: #8 board-views, #9 board-workspaces) |
| Executor | claude-opus-4-7 — feature-review |
| Updated | 2026-05-23 |
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
| P1 — Package skeleton + ClockWidget + 3 mini stats + i18n delta (clock + stat labels) + helpers (Donut/PomoDots/cityLibrary/Icon) | PENDING | — |
| P2 — MiniCalWidget + WorldClocks (TzClock) + WeatherWidget + StickiesWidget + fixtures + i18n delta (mini_cal + world_clocks + weather + stickies) | PENDING | — |
| P3 — MailWidget + UpcomingWidget + host wiring (registration.tsx swap + 2 package.json deps) + slotIntegration test + final polish → READY_FOR_VERIFY | PENDING | — |

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
