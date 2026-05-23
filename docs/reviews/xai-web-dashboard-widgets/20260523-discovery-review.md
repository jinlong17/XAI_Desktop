# Discovery Review — xai-web-dashboard-widgets

> Date: 2026-05-23
> Author: claude-opus-4-7 — feature-plan
> Wave: W2e (Parallel-Agent mode; siblings #8 board-views + #9 board-workspaces)
> Roadmap row: docs/workflow/roadmap/xai-web-console.md #11
> ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 (port-map row `module-dashboard.jsx` → predeux split `plugin-web-dashboard-grid` + `plugin-web-dashboard-widgets`)
> Seed brief: docs/reviews/xai-web-dashboard-widgets/20260523-roadmap-seed.md

## 1. Problem framing

`@repo/plugin-web-dashboard-grid` (row #10, READY_TO_SHIP) ships a typed slot API
(`WidgetRegistration[]`) but currently mounts the grid with `EMPTY_WIDGETS = []`
in `DashboardSlotHost`. The dashboard rail entry therefore renders the bilingual
empty-state, not any actual content.

Row #11 must:

1. Publish a new package `@repo/plugin-web-dashboard-widgets` (name
   `@repo/plugin-web-dashboard-widgets`, path `packages/xai-web-dashboard-widgets/`)
   that exports a `dashboardWidgetRegistrations: WidgetRegistration[]` constant
   matching every widget from `web design/module-dashboard.jsx`:
   - **ClockWidget** — 4 styles (Classic / Split / Minimal / Analog) + 12-city
     timezone picker + analog full 60-min minor ticks + 12-hour major ticks + 12
     numerals (per DESIGN.md §4.4 explicit constraint).
   - **MiniCalWidget** — mac-style month view, colored dots for daily events
     (max 3 per day), prev/next month navigation, "Open Calendar" link, navigate
     via event bus (`web:shell:module-change`, payload `{ moduleId: "calendar",
     source: "mini-cal" }`).
   - **WorldClocks** — list / analog / grid view + 12-city library +
     add/remove cities, persisted to `xai_zones`.
   - **WeatherWidget** — current temp + 5-day forecast (mock-fixture driven).
   - **StickiesWidget** — 3-card rotated note stack.
   - **MailWidget** — unread red dot + count badge.
   - **UpcomingWidget** — 4-event list.
   - **StatTasks / StatStreak / StatPomos** — three mini stats (donut, flame
     icon, pomodoro dot grid).
2. Wire that array into `DashboardSlotHost` (one shared-anchor edit on
   `packages/xai-web-dashboard-grid/src/registration.tsx`).
3. Register the package in `apps/web/package.json` deps.
4. Keep persistence keys exactly as DESIGN.md §9.2 requires: `xai_clock_style`,
   `xai_clock_tz`, `xai_zones` (storage registry already pre-registered all
   three in `@repo/plugin-web-storage` from row #3).
5. Add bilingual strings via `@repo/plugin-web-tokens` `useI18n`.

## 2. No external research required

The change is purely an internal widget port + slot consumption. No library
selection, no external HTTP service, no new transitive deps beyond what
dashboard-grid already pulls in. WebSearch is therefore skipped per
feature-plan §Fresh.4 escape clause ("if the feature is purely internal
business logic with no external dependency decisions, skip this step").

## 3. Decision axes

### A. Slot consumption shape

| Option | Verdict |
|---|---|
| **A1. Export a single `dashboardWidgetRegistrations: WidgetRegistration[]` constant** and Edit `DashboardSlotHost` to import + forward it. | **SELECTED.** Matches the stable API row #10 froze (api.md §S2). Minimal coupling: 1 import + 1 substitute on `registration.tsx`. |
| A2. Export per-widget registration arrays (10 named exports). | Rejected. Hard for the host to consume in one wire-up. |
| A3. Re-export an `applyDashboardWidgets()` mutator that the host calls. | Rejected. Couples the host to imperative API; breaks the pure data-flow the grid expects. |

### B. Per-widget id semantics

| Option | Verdict |
|---|---|
| **B1. Mirror the prototype's WIDGETS_CONFIG ids verbatim** — `clock`, `stat-tasks`, `stat-streak`, `stat-pomos`, `weather`, `mini-cal`, `timezones`, `stickies`, `mail`, `upcoming`. | **SELECTED.** These match the seed defaults already registered in `@repo/plugin-web-storage` `xai_dash_order` default. No registry edit needed. |
| B2. Re-number / re-key (e.g. UUIDs). | Rejected. Breaks the existing default order; would need a registry edit + migration. |

### C. Span class mapping

| Option | Verdict |
|---|---|
| **C1. Pure mapping per the prototype's WIDGETS_CONFIG** — clock=`w-clock`, stat-\*=`w-stat`, weather=`w-weather`, mini-cal=`w-mini-cal`, timezones=`w-timezones`, stickies=`w-stickies`, mail=`w-mail`, upcoming=`w-upcoming`. | **SELECTED.** All 8 span classes are already declared in `WidgetSpanClass` union (row #10 types.ts) and shipped in `layout.css` (row #2). |
| C2. Compute span dynamically. | Rejected. Adds runtime cost; the prototype hard-codes them per design intent. |

### D. CSS strategy

| Option | Verdict |
|---|---|
| **D1. Per-widget local CSS in `packages/xai-web-dashboard-widgets/src/styles.css` for widget-body internals** (e.g. `.clock-time`, `.clock-split`, `.tz-row`, `.mc-grid`, `.ww-now`, `.sticky-stack`, `.mail-list`, `.upc-list`, `.donut`, `.pomo-dots`) + reuse already-shipped `.dash-grid`, `.widget-shell`, `.w-*` rules from `layout.css`. | **SELECTED.** Honors the rail boundary: grid owns container CSS, widgets own body CSS. Matches the prototype's class scoping verbatim. |
| D2. Inline styles for every widget. | Rejected. Diverges from design fidelity; theming via CSS vars wouldn't work. |
| D3. CSS-in-JS via styled-components. | Rejected. New dep; not used elsewhere; tokens.css path is the project standard. |

### E. Mock data location

| Option | Verdict |
|---|---|
| **E1. Co-locate mock fixtures inside `packages/xai-web-dashboard-widgets/src/internal/fixtures.ts`** — weather / stickies / mails / upcoming / calEvents / city library. | **SELECTED.** Each widget owns its own visual content (read-only in v1, no live integration). Centralizes the mock surface for later replacement by real data sources (settings-features will toggle widgets; statistics will replace counts; etc.). |
| E2. Pull from a global MOCK like the prototype. | Rejected. There's no global MOCK in production code; the project never adopted one. |
| E3. Lift fixtures to a new `@repo/plugin-web-fixtures` package. | Rejected. Premature abstraction; v1 has a single consumer. |

### F. Clock timezone library

| Option | Verdict |
|---|---|
| **F1. Hard-coded 12-city library in `internal/cityLibrary.ts`** matching the prototype verbatim (Shanghai / London / New York / Tokyo / San Francisco / Paris / Sydney / Berlin / Dubai / Singapore / Hong Kong / Los Angeles + UTC offsets). | **SELECTED.** Matches DESIGN.md §4.4 ("12 timezones") + the prototype's `CITY_LIBRARY` array. Shared between ClockWidget timezone-picker + WorldClocks city library. |
| F2. Use a runtime IANA tz library (e.g. `date-fns-tz`). | Rejected. New dep; v1 needs only static UTC offsets; the prototype intentionally uses static offsets (no DST handling). |

### G. Mini-Cal goTo plumbing

| Option | Verdict |
|---|---|
| **G1. Use `ctx.goTo` provided by `WidgetRenderContext`** — DashboardSlotHost already injects the goTo callback that emits `web:shell:module-change`. | **SELECTED.** Matches api.md §S10 + the seed brief's hard constraint that nav uses the event bus, not direct import. |
| G2. Emit `web:shell:module-change` directly from MiniCal widget. | Rejected. Skips the architectural seam; would couple widget to event bus instead of grid's injected callback. |
| G3. Use `useNavigate` from React Router. | Rejected. Bypasses the event bus contract (R6 from row #10). |

### H. Drag-exclude discipline (R6 from row #10)

| Option | Verdict |
|---|---|
| **H1. Mark every interactive non-button/non-input widget child with `data-no-drag`** — ClockWidget toolbar, timezone popover, world-clocks view toggle, picker, mini-cal nav buttons (already `<button>` so auto-excluded but parent header should be `data-no-drag` for safety), sticky stack drag → no internal interactions in v1 so no marker needed. | **SELECTED.** Documented in row #10 api.md §S4 + design.md §1.1 frozen-assumption 10. |
| H2. Convert all interactive children to `<button>` to lean on auto-exclude. | Rejected. Some children (popover scrim, view toggles) are legitimately not buttons; spec requires the `data-no-drag` marker discipline. |

### I. Phase split

| Option | Verdict |
|---|---|
| **I1. Three commits, each adding ~3 widgets** with shared scaffolding in P1. | **SELECTED.** Keeps each commit reviewable, every phase ships independently testable widgets, and the shared host wiring lands in P1. |
| I2. Single mega-commit. | Rejected. Violates feature-build "one phase per run" rule + commit conventions ("each phase = one commit"). |
| I3. One commit per widget (10 commits). | Rejected. Excessive granularity; each widget body is small. |

### J. SVG vs HTML for analog clock

| Option | Verdict |
|---|---|
| **J1. SVG viewBox 0 0 100 100** matching the prototype verbatim — 60 minor ticks + 12 major ticks + 12 numerals + 3 hands + center dot. | **SELECTED.** Matches DESIGN.md §4.4 explicit constraint ("模拟时钟带完整 60 分钟细刻度 + 12 小时粗刻度 + 12 个数字") and the seed brief's hard constraint ("60 minor + 12 major + 12 numbers all aligned"). |
| J2. HTML/CSS rotated divs. | Rejected. Hard to align 60+12+12 elements precisely; SVG is the right tool. |

### K. Donut + PomoDots reuse

| Option | Verdict |
|---|---|
| **K1. Co-locate `Donut` + `PomoDots` helpers inside `packages/xai-web-dashboard-widgets/src/internal/`** as small SVG/JSX helpers. | **SELECTED.** Used only by the 3 stat widgets in this row; no need to publish to `packages/ui/`. Sizes ≤ 30 LOC each. |
| K2. Lift to `packages/ui`. | Rejected. Premature abstraction; would need an ADR for `@repo/ui` API shape. |

### L. Persistence

| Option | Verdict |
|---|---|
| **L1. Use `usePref()` from `@repo/plugin-web-storage`** for `xai_clock_style`, `xai_clock_tz`, `xai_zones`. Three keys already pre-registered (row #3). | **SELECTED.** Matches the project's persistence contract; no registry edit. |
| L2. Direct `localStorage.getItem`/`setItem`. | Rejected. Bypasses the registry; violates ADR-0007 §S8. |

## 4. Risks

| ID | Risk | Likelihood | Impact | Mitigation | Phase |
|---|---|---|---|---|---|
| R1 | Analog clock alignment drift (60 minor + 12 major + 12 numerals) on different fonts / scales | Med | Med | SVG viewBox 0 0 100 100 + same trig formulas as prototype + dedicated `analogClockTicks.test.ts` asserting tick count + numeral position math | P1 (clock) |
| R2 | Timezone offset math wrong vs DST | Med | Low | Static UTC offsets per F1; documented in api.md as "intentional v1 no-DST" | P1 (clock) |
| R3 | Mini-Cal click on day cell triggers grid drag | High | Med | `MiniCalWidget` wraps the body in a click handler that ALSO calls `goTo("calendar")` when target is a `mc-cell`; buttons in header/footer carry `data-no-drag`; the click path itself is on the widget body whose pointerdown is intercepted by `WidgetShell` but the wrapper opens click→goTo on completed click events (mouseup w/o drag — verified via prototype's `e.target.closest("[data-no-drag]")` guard) | P2 (mini-cal) |
| R4 | World-Clocks add-city picker leaks pointerdown into drag | High | Med | Picker `<div>` carries `data-no-drag`; remove buttons and view-toggle buttons too | P2 (timezones) |
| R5 | Clock timezone popover scrim blocks drag during open | Low | Low | Popover scrim sits above widget body — closes on outside click; carries `data-no-drag` so any miss-click won't initiate drag | P1 (clock) |
| R6 | Default `xai_dash_order` may include ids row #11 doesn't provide → unknown ids logged | High | Low | Match prototype's 10 ids verbatim (B1); sanitizeOrder in dashboard-grid will dev-warn + filter unknown but row #11's registrations cover ALL of them | P1 |
| R7 | Mock fixtures grow stale / break theming | Low | Low | Co-locate per E1 + reference DESIGN.md §4.4 in fixtures.ts header comment + bilingual data structure mirrors prototype | All |
| R8 | Sibling concurrency on shared anchors: `DashboardSlotHost` in `registration.tsx` (row #10 file) + `apps/web/package.json` + `i18n.ts` + `apps/web/src/routes/modules/shellRegistrations.tsx` (no edit needed — row #10 already wired `dashboardGridSlotRegistration`) | High | Med | Use Edit (not Write) with full-line unique anchors; retry git lock 8-20s × 5; concurrent rows #8 board-views + #9 board-workspaces touch different files | All phases |
| R9 | i18n key collision with row #10's existing dashboard.* block | Med | Low | All new strings live under `dashboard.widgets.*` sub-namespace; row #10 owns `dashboard.empty_*`/`add_widget`/`good_*`/`tasks_done`/`streak`/`pomos`/`weather`/`timezones`/`sticky_notes`/`mail`/`upcoming` (already shipped — REUSE; verified in i18n.ts:134-153 + 334-353) | P1 |
| R10 | usePref API mismatch (sync getter or async?) | Low | Low | Already verified in row #10's useDashOrder (sync get + setter); same pattern reused here | P1 |
| R11 | DashboardSlotHost change is in row #10's package — cross-package commit | High | Low | Single-line Edit; commit-scope label notes row #11 row in dashboard-grid file; coverage extended with new test in row #10 + row #11 | P1 |
| R12 | Vitest jsdom lacks `IntersectionObserver` / pointerEvents (widgets unlikely to need but possible) | Low | Low | Re-use row #10's `__tests__/setup.ts` polyfill pattern; widgets don't observe but useState/useEffect tested via `act` | All |

## 5. Files to write

### New package skeleton

- `packages/xai-web-dashboard-widgets/package.json` — name `@repo/plugin-web-dashboard-widgets`, deps `@repo/core` `@repo/plugin-web-dashboard-grid` `@repo/plugin-web-tokens` `@repo/plugin-web-storage` `@repo/xai-web-event-bus` (workspace:\*); peerDeps react/react-dom; devDeps mirroring dashboard-grid
- `packages/xai-web-dashboard-widgets/tsconfig.json` — extends `@repo/typescript-config/react-library.json`
- `packages/xai-web-dashboard-widgets/manifest.json` — name `@repo/plugin-web-dashboard-widgets`, slug `xai-web-dashboard-widgets`, status In-Dev, type ui, owner row #11, roadmap_row 11, wave W2, entry `./src/index.ts`
- `packages/xai-web-dashboard-widgets/eslint.config.js` — same as dashboard-grid (react-internal + no-explicit-any error)
- `packages/xai-web-dashboard-widgets/vitest.config.ts` — same as dashboard-grid (jsdom + setup.ts)
- `packages/xai-web-dashboard-widgets/src/__tests__/setup.ts` — re-use pointer-event polyfill from row #10 if needed (DnD already tested in row #10)
- `packages/xai-web-dashboard-widgets/src/index.ts` — public surface: `dashboardWidgetRegistrations`, types if any
- `packages/xai-web-dashboard-widgets/src/styles.css` — port `.clock-*`, `.cs-*`, `.cm-*`, `.ws-*`, `.donut`, `.pomo-dots`, `.ww-*`, `.wwf-*`, `.sticky-*`, `.mail-*`, `.upc-*`, `.mc-*`, `.tz-*`, `.popover-*` (widget-internal classes from `web design/layout.css`)

### Per-widget source files

P1 (foundations + 3 widgets):
- `packages/xai-web-dashboard-widgets/src/registrations.tsx` — assembles 10 `WidgetRegistration` entries
- `packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatTasks.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatStreak.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StatPomos.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/Donut.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/PomoDots.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/cityLibrary.ts`
- `packages/xai-web-dashboard-widgets/src/internal/Icon.tsx` — minimal inline SVG icons used by widgets (globe / chevD / clock / list / type / timer / pin / check2 / plus / close / grid4 / arrowL / arrowR / note / mail / calendar / flame / sun / cloud / rain)

P2 (4 widgets):
- `packages/xai-web-dashboard-widgets/src/widgets/MiniCalWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/WorldClocks.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/WeatherWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/StickiesWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/TzClock.tsx`
- `packages/xai-web-dashboard-widgets/src/internal/fixtures.ts` — weather / stickies / mails / upcoming / calEvents

P3 (3 widgets + host wiring):
- `packages/xai-web-dashboard-widgets/src/widgets/MailWidget.tsx`
- `packages/xai-web-dashboard-widgets/src/widgets/UpcomingWidget.tsx`
- **Edit** `packages/xai-web-dashboard-grid/src/registration.tsx` — swap `EMPTY_WIDGETS` for `import { dashboardWidgetRegistrations } from "@repo/plugin-web-dashboard-widgets"` (single-line Edit with unique anchor `const EMPTY_WIDGETS: WidgetRegistration[] = [];`)
- **Edit** `packages/xai-web-dashboard-grid/package.json` — add 1 dep line `"@repo/plugin-web-dashboard-widgets": "workspace:*"` (alphabetical near `@repo/plugin-web-tokens`)
- **Edit** `apps/web/package.json` — add 1 dep line `"@repo/plugin-web-dashboard-widgets": "workspace:*"` (alphabetical near `@repo/plugin-web-dashboard-grid`)
- **Edit** `packages/plugin-web-tokens/src/i18n.ts` — additive `dashboard.widgets.*` sub-block (P1+P2+P3 sub-keys per widget) — count: ~24 keys × 2 langs (clock.classic/split/minimal/analog labels + clock.local + clock.timezone_label, world_clocks.add_city / world_clocks.added_all / world_clocks.list / world_clocks.analog / world_clocks.grid / world_clocks.today / world_clocks.tomorrow / world_clocks.yesterday, weather.high / weather.low, stickies.empty, mail.unread, upcoming.empty, mini_cal.open, mini_cal.month_label_template_zh; see api.md §S6)
- **Edit** `packages/xai-web-dashboard-grid/src/__tests__/registration.test.tsx` — keep — no change needed; the new row #11 wire-up adds a NEW test in row #11 testing the import succeeds + length === 10

### Doc artifacts (this phase)

- `packages/xai-web-dashboard-widgets/docs/design.md`
- `packages/xai-web-dashboard-widgets/docs/api.md`
- `packages/xai-web-dashboard-widgets/docs/test.md`
- `packages/xai-web-dashboard-widgets/docs/dev_log.md`
- `docs/reviews/xai-web-dashboard-widgets/20260523-discovery-review.md` (this file)

## 6. Open questions

| # | Q | Resolution |
|---|---|---|
| Q1 | Does row #10 need the dashboardWidgetRegistrations registered through DashboardSlotHost edit, or via apps/web wiring layer? | row #10's `registration.tsx` owns `DashboardSlotHost` and currently hard-codes `EMPTY_WIDGETS`. Cleanest swap is a single-line Edit there, consuming row #11's package. apps/web layer does NOT touch widget registry — it only registers slots. **Resolved**: Edit `packages/xai-web-dashboard-grid/src/registration.tsx`. |
| Q2 | Should ClockWidget use the project's `useI18n` and emit no events? | Yes — clock styles + timezone are user prefs persisted to `usePref`; no event emission required by the seed brief. **Resolved**: no events from ClockWidget. |
| Q3 | Does MiniCal need to know about events from other plugins (e.g. tasks due dates)? | No in v1 — fixtures provide the dot data. Future: settings-features-panel may toggle widget on/off; statistics may consume MiniCal's date selection. Currently out of scope. **Resolved**: read-only mock fixtures. |
| Q4 | Where do the icon glyphs come from? | The prototype's `Icon` component is a tiny SVG library. We co-locate a minimal `internal/Icon.tsx` (one switch on name → JSX). Confirmed not provided by `@repo/plugin-web-tokens` or `packages/ui`. **Resolved**: co-locate. |
| Q5 | Default `xai_zones` value — match prototype? | Yes — `["shanghai", "london", "new_york", "tokyo"]`. Pre-registered in storage registry; sync confirmed. **Resolved**. |
| Q6 | What if user toggles row #11 OFF via settings-features-panel? | Out of scope here — settings-features-panel (W4 row #23) will read `pluginRegistry["@repo/plugin-web-dashboard-widgets"]` and gate the apps/web import. v1 always-on. **Resolved**: always-on. |

## 7. Recommendation

Proceed with:
- A1 + B1 + C1 + D1 + E1 + F1 + G1 + H1 + I1 + J1 + K1 + L1.
- 3-phase commit plan (P1 ClockWidget + 3 stats + scaffolding; P2 MiniCal + WorldClocks + Weather + Stickies; P3 Mail + Upcoming + host wiring + final polish).
- Sibling concurrency: Edit-not-Write on all shared anchors, retry git lock 8-20s × 5.

## 8. Frozen assumptions (15)

1. Package name: `@repo/plugin-web-dashboard-widgets` at `packages/xai-web-dashboard-widgets/`.
2. Public surface: `dashboardWidgetRegistrations: WidgetRegistration[]` (re-uses `WidgetRegistration` type imported from `@repo/plugin-web-dashboard-grid`).
3. 10 widget ids match the prototype: `clock`, `stat-tasks`, `stat-streak`, `stat-pomos`, `weather`, `mini-cal`, `timezones`, `stickies`, `mail`, `upcoming`.
4. Span classes match the prototype: `w-clock`/`w-stat`/`w-weather`/`w-mini-cal`/`w-timezones`/`w-stickies`/`w-mail`/`w-upcoming`.
5. Persistence: `xai_clock_style` (clock), `xai_clock_tz` (clock), `xai_zones` (world clocks) — three keys already pre-registered in `@repo/plugin-web-storage` row #3 PREF_REGISTRY.
6. Clock styles: 4 — `classic`, `split`, `minimal`, `analog`.
7. Analog clock: SVG viewBox 0 0 100 100 with 60 minor ticks + 12 major ticks + 12 numerals + 3 hands + center dot (matches the prototype line 281-313 verbatim).
8. Clock timezone library: 12 cities (Shanghai / London / New York / Tokyo / SF / Paris / Sydney / Berlin / Dubai / Singapore / HK / LA) with static UTC offsets — no DST.
9. World clocks views: 3 — `list`, `analog`, `grid` — same 12-city library; default zones `["shanghai", "london", "new_york", "tokyo"]`.
10. MiniCal: starts on Monday in en/zh; navigates via `ctx.goTo("calendar")`; up to 3 colored dots per day; mock event map from fixtures.
11. Mock fixtures: co-located in `internal/fixtures.ts` (weather / stickies / mails / upcoming / calEvents).
12. Bilingual via `useI18n(lang)`; all new strings live under `dashboard.widgets.*` sub-namespace (no collision with row #10's `dashboard.*` keys).
13. Drag-exclude: `data-no-drag` on Clock toolbar + toolbar popover + WorldClocks view toggle + picker + remove buttons + MiniCal nav header/footer.
14. 3-commit phase plan: P1 (clock + 3 stats + scaffolding), P2 (mini-cal + world-clocks + weather + stickies), P3 (mail + upcoming + host wire-up + polish).
15. No new external dependencies beyond `@repo/plugin-web-dashboard-grid` `@repo/plugin-web-tokens` `@repo/plugin-web-storage` `@repo/xai-web-event-bus` `@repo/core`.
