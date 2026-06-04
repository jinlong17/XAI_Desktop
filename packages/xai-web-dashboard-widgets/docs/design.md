# Design — xai-web-dashboard-widgets (@repo/plugin-web-dashboard-widgets)

> Selected Option: A1 + B1 + C1 + D1 + E1 + F1 + G1 + H1 + I1 + J1 + K1 + L1.
> Review Doc: docs/reviews/xai-web-dashboard-widgets/20260523-discovery-review.md
> Review Date: 2026-05-23
> ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
> Roadmap row: docs/workflow/roadmap/xai-web-console.md #11
> Source: web design/module-dashboard.jsx (lines 209–775)
> Dep contract: packages/xai-web-dashboard-grid/docs/api.md §S1, §S2

## 1.1 Frozen assumptions (15)

1. Package name `@repo/plugin-web-dashboard-widgets` at path `packages/xai-web-dashboard-widgets/`.
2. Public surface = single export `dashboardWidgetRegistrations: WidgetRegistration[]` from `./src/index.ts`. Type imported from `@repo/plugin-web-dashboard-grid`.
3. 10 widget ids match the prototype `WIDGETS_CONFIG` (jsx line 9-20): `clock`, `stat-tasks`, `stat-streak`, `stat-pomos`, `weather`, `mini-cal`, `timezones`, `stickies`, `mail`, `upcoming`.
4. Span class per widget id: clock=`w-clock`, stat-\*=`w-stat`, weather=`w-weather`, mini-cal=`w-mini-cal`, timezones=`w-timezones`, stickies=`w-stickies`, mail=`w-mail`, upcoming=`w-upcoming` — all from `WidgetSpanClass` union (row #10 types.ts).
5. Persistence keys: `xai_clock_style` / `xai_clock_tz` / `xai_zones` — three pre-registered in `@repo/plugin-web-storage` PREF_REGISTRY (row #3, owner xai-web-dashboard-widgets); read+write via `usePref()` only.
6. ClockWidget styles: `classic` (HH:MM:SS mono), `split` (HH:MM:SS with dimmed seconds), `minimal` (h12:MM ampm), `analog` (SVG); persisted to `xai_clock_style` (default `classic`).
7. ClockWidget analog: SVG viewBox `0 0 100 100`; 60 minor ticks (skip multiples of 5 to avoid overlap with major); 12 major ticks at every 30°; 12 numerals at every 30° starting at 12 top; 3 hands (h/m/s) + center dot — math verbatim per jsx line 281-312.
8. ClockWidget timezone library: 12 cities — Shanghai (UTC+8), London (UTC+1), New York (UTC-4), Tokyo (UTC+9), San Francisco (UTC-7), Paris (UTC+2), Sydney (UTC+11), Berlin (UTC+2), Dubai (UTC+4), Singapore (UTC+8), Hong Kong (UTC+8), Los Angeles (UTC-7). Static offsets, no DST.
9. WorldClocks views: `list`, `analog`, `grid` (default `list`); same 12-city library; default zones `["shanghai", "london", "new_york", "tokyo"]`; persisted to `xai_zones`.
10. MiniCal: Monday-first week; up to 3 colored dots per day from mock `calEvents` fixture; clicking the body area outside `[data-no-drag]` calls `ctx.goTo("calendar")`; header has month label + today highlight + prev/next month buttons; footer has "Open Calendar" link.
11. Mock fixtures: `internal/fixtures.ts` exports `WEATHER`, `STICKIES`, `MAILS`, `UPCOMING`, `CAL_EVENTS` with bilingual structure mirroring the prototype's MOCK shape.
12. Bilingual via `useI18n(lang)`. New strings live under `dashboard.widgets.*` sub-namespace; existing `dashboard.tasks_done` / `dashboard.streak` / `dashboard.pomos` / `dashboard.weather` / `dashboard.timezones` / `dashboard.sticky_notes` / `dashboard.mail` / `dashboard.upcoming` are REUSED (no collision).
13. Drag-exclude (`data-no-drag` markers) applied to: ClockWidget toolbar + clock timezone popover; WorldClocks header (view toggle + add button) + picker + per-row remove buttons; MiniCal header (prev/next buttons) + footer ("Open Calendar" link). Mail/Upcoming/Stickies/Stats have no interactive children → no markers needed.
14. 3-commit phase plan (one commit per phase):
    - P1: package skeleton + i18n delta + ClockWidget + StatTasks + StatStreak + StatPomos + helpers (Donut, PomoDots, cityLibrary, Icon).
    - P2: MiniCalWidget + WorldClocks (with TzClock) + WeatherWidget + StickiesWidget + fixtures.
    - P3: MailWidget + UpcomingWidget + host wiring (Edit registration.tsx + Edit dashboard-grid/package.json + Edit apps/web/package.json) + final polish + dev_log to READY_FOR_VERIFY.
15. Zero new external deps beyond workspace ones (`@repo/core`, `@repo/plugin-web-dashboard-grid`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`).

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ apps/web/src/routes/modules/shellRegistrations.tsx                  │
│   imports dashboardGridSlotRegistration (already wired in row #10)  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ packages/xai-web-dashboard-grid/src/registration.tsx                │
│   DashboardSlotHost — Edit (row #11 P3):                            │
│     -import { dashboardWidgetRegistrations } from "@repo/...widgets"│
│     -widgets={EMPTY_WIDGETS}  →  widgets={dashboardWidgetRegistrations}
│   (single-line Edit; row #10 contract preserved)                    │
└─────────────────────────────────────────────────────────────────────┘
                              │ ctx={ lang, now, goTo }
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ packages/xai-web-dashboard-grid/src/DashboardModule.tsx             │
│   (row #10, READY_TO_SHIP)                                          │
│   maps order → <WidgetShell key=id>{ widget.render(ctx) }</...>     │
└─────────────────────────────────────────────────────────────────────┘
                              │ ctx={ lang, now, goTo }
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ packages/xai-web-dashboard-widgets/src/index.ts                     │
│   exports dashboardWidgetRegistrations: WidgetRegistration[]        │
└─────────────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
  ClockWidget          WorldClocks            MiniCalWidget
  (usePref ×2)         (usePref ×1)           (ctx.goTo)
                              │
                              ▼
                  internal/cityLibrary.ts  (shared by both)

  StatTasks / StatStreak / StatPomos   →  Donut + PomoDots
  WeatherWidget                        →  fixtures.WEATHER
  StickiesWidget                       →  fixtures.STICKIES
  MailWidget                           →  fixtures.MAILS
  UpcomingWidget                       →  fixtures.UPCOMING
  MiniCalWidget                        →  fixtures.CAL_EVENTS
```

## 3. File layout

```
packages/xai-web-dashboard-widgets/
├── package.json                      # @repo/plugin-web-dashboard-widgets
├── tsconfig.json
├── manifest.json
├── eslint.config.js
├── vitest.config.ts
├── docs/
│   ├── design.md
│   ├── api.md
│   ├── test.md
│   └── dev_log.md
└── src/
    ├── index.ts                      # public surface (re-exports dashboardWidgetRegistrations)
    ├── registrations.tsx             # the 10-entry WidgetRegistration[] array
    ├── styles.css                    # widget-body CSS (clock-*, ws-*, ww-*, etc.)
    ├── widgets/
    │   ├── ClockWidget.tsx           # P1
    │   ├── StatTasks.tsx             # P1
    │   ├── StatStreak.tsx            # P1
    │   ├── StatPomos.tsx             # P1
    │   ├── MiniCalWidget.tsx         # P2
    │   ├── WorldClocks.tsx           # P2
    │   ├── WeatherWidget.tsx         # P2
    │   ├── StickiesWidget.tsx        # P2
    │   ├── MailWidget.tsx            # P3
    │   └── UpcomingWidget.tsx        # P3
    ├── internal/
    │   ├── Icon.tsx                  # P1 — minimal SVG icon library
    │   ├── Donut.tsx                 # P1
    │   ├── PomoDots.tsx              # P1
    │   ├── cityLibrary.ts            # P1
    │   ├── TzClock.tsx               # P2
    │   └── fixtures.ts               # P2 — weather/stickies/mails/upcoming/calEvents
    └── __tests__/
        ├── setup.ts
        ├── index-barrel.test.ts      # P1
        ├── registrations.test.tsx    # P1
        ├── ClockWidget.test.tsx      # P1 (4 styles + tz picker + persistence)
        ├── analogClockTicks.test.tsx # P1 (60 + 12 + 12 alignment)
        ├── StatTasks.test.tsx        # P1
        ├── StatStreak.test.tsx       # P1
        ├── StatPomos.test.tsx        # P1
        ├── Donut.test.tsx            # P1
        ├── PomoDots.test.tsx         # P1
        ├── cityLibrary.test.ts       # P1
        ├── MiniCalWidget.test.tsx    # P2 (nav + dots + goTo)
        ├── WorldClocks.test.tsx      # P2 (add/remove/views + persistence)
        ├── TzClock.test.tsx          # P2
        ├── WeatherWidget.test.tsx    # P2
        ├── StickiesWidget.test.tsx   # P2
        ├── fixtures.test.ts          # P2
        ├── MailWidget.test.tsx       # P3
        ├── UpcomingWidget.test.tsx   # P3
        └── slotIntegration.test.tsx  # P3 (host wiring: import row #10 DashboardSlotHost, assert 10 widgets render)
```

## 4. Render context contract (from row #10 api.md §S2)

Each widget's `render(ctx: WidgetRenderContext)` receives:

| Field | Type | Use |
|---|---|---|
| `ctx.lang` | `"en" \| "zh"` | bilingual strings via `useI18n(ctx.lang)` |
| `ctx.now` | `Date` | tick-driven UI (1Hz refresh from grid) |
| `ctx.goTo` | `(moduleId: string) => void` | MiniCal `goTo("calendar")` |

`render` is **pure w.r.t. ctx**; the grid calls it on every parent render. Widgets carry their own React state via `useState` + `usePref` for persisted prefs.

## 5. Persistence rules

| Key | Owner | Default | Codec | Use |
|---|---|---|---|---|
| `xai_clock_style` | row #11 (this row) | `"classic"` | string | ClockWidget style |
| `xai_clock_tz` | row #11 | `"local"` | string | ClockWidget timezone (`local` or 12 city ids) |
| `xai_zones` | row #11 | `["shanghai", "london", "new_york", "tokyo"]` | json | WorldClocks list (string[]) |
| `xai_dash_order` | row #10 (consumer here) | (registry default — 8 placeholder ids) | json | Read-only — row #10's `useDashOrder` consumes |

All three row-#11 keys are pre-registered in `@repo/plugin-web-storage` PREF_REGISTRY from row #3. This row reads + writes them via `usePref()` only.

**Note on `xai_dash_order` mismatch (intentional)**: Row #3's `DEFAULT_DASH_ORDER` (registry.ts line 121-130) was seeded as a placeholder `["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]` (8 ids, names diverging from prototype). Row #11's 10 widget ids (`clock`, `stat-tasks`, `stat-streak`, `stat-pomos`, `weather`, `mini-cal`, `timezones`, `stickies`, `mail`, `upcoming`) do not match these placeholders. **Resolution**: row #10's `sanitizeOrder()` is purpose-built for this exact case — on first mount it drops unknown persisted ids and appends missing registered ids in registration order. `useDashOrder` then writes the sanitized order back to storage. Net behavior: first paint shows 10 widgets in registration order; subsequent reloads see the sanitized 10-id order in storage. **No registry edit needed** — sanitize-on-mount IS the reconciliation mechanism (row #10's design intent). Documented as expected behavior in row #11 verify; covered by AC-REG-2 + slotIntegration test.

## 6. Phase plan

### Phase P1 — Scaffolding + ClockWidget + 3 mini stats

- Package skeleton (`package.json`, `tsconfig.json`, `manifest.json`, `eslint.config.js`, `vitest.config.ts`).
- `src/index.ts` (public surface), `src/registrations.tsx` (10-entry array; widgets P2/P3 placeholder render returning empty div until those phases land).
- `src/styles.css` — port all clock-* / ws-* / pomo-dots / donut classes.
- `src/widgets/ClockWidget.tsx` — 4 styles + 12-tz picker + analog SVG + `usePref` × 2.
- `src/widgets/StatTasks.tsx`, `StatStreak.tsx`, `StatPomos.tsx` — mock values (14/22, 27d, 6/8) per the prototype.
- `src/internal/Icon.tsx`, `Donut.tsx`, `PomoDots.tsx`, `cityLibrary.ts`.
- i18n delta — Edit `packages/plugin-web-tokens/src/i18n.ts` adding `dashboard.widgets.*` keys for clock styles, timezone picker labels, "Local time", clock sub-label, etc.
- Tests: barrel + registrations + ClockWidget + analogClockTicks + StatTasks + StatStreak + StatPomos + Donut + PomoDots + cityLibrary.
- Lint clean, check-types clean, vitest green.
- Commit: `feat(plugin-web-dashboard-widgets): P1 — scaffolding + ClockWidget + 3 mini stats (W2e row #11)`.

### Phase P2 — MiniCal + WorldClocks + Weather + Stickies

- `src/internal/TzClock.tsx`, `fixtures.ts`.
- `src/widgets/MiniCalWidget.tsx`, `WorldClocks.tsx`, `WeatherWidget.tsx`, `StickiesWidget.tsx`.
- Update `src/registrations.tsx` swapping the P1 placeholder render functions for these widgets.
- Update `src/styles.css` — port mc-* / tz-* / ww-* / wwf-* / sticky-* classes.
- i18n delta — Edit `i18n.ts` adding `dashboard.widgets.world_clocks.*`, `dashboard.widgets.mini_cal.*`, `dashboard.widgets.weather.*`, `dashboard.widgets.stickies.*` keys.
- Tests: MiniCalWidget + WorldClocks + TzClock + WeatherWidget + StickiesWidget + fixtures.
- Lint, check-types, vitest green.
- Commit: `feat(plugin-web-dashboard-widgets): P2 — MiniCal + WorldClocks + Weather + Stickies (W2e row #11)`.

### Phase P3 — Mail + Upcoming + Host wiring + Polish

- `src/widgets/MailWidget.tsx`, `UpcomingWidget.tsx`.
- Update `src/registrations.tsx` final array.
- Update `src/styles.css` — port mail-* / upc-* classes.
- i18n delta — Edit `i18n.ts` for mail / upcoming keys.
- **Edit** `packages/xai-web-dashboard-grid/src/registration.tsx` — substitute `EMPTY_WIDGETS` → `dashboardWidgetRegistrations`.
- **Edit** `packages/xai-web-dashboard-grid/package.json` — add `@repo/plugin-web-dashboard-widgets: workspace:*` dep.
- **Edit** `apps/web/package.json` — add `@repo/plugin-web-dashboard-widgets: workspace:*` dep.
- Tests: MailWidget + UpcomingWidget + slotIntegration (mount `DashboardSlotHost` and assert all 10 widget ids render).
- Update dashboard-grid registration.test.tsx if needed (re-check EMPTY_WIDGETS dropped, dashboardWidgetRegistrations imported).
- Final docs sync (this row + manifest.json status).
- dev_log.md → `Status = READY_FOR_VERIFY`, `Suggested Next = feature-verify`.
- Commit: `feat(plugin-web-dashboard-widgets): P3 — Mail + Upcoming + host wiring + READY_FOR_VERIFY (W2e row #11)`.

## 7. Sibling concurrency policy (W2e)

Siblings dispatched at 2026-05-23: #8 `xai-web-board-views`, #9 `xai-web-board-workspaces`, #11 (this row).

Shared anchors this row will touch:

| File | Anchor | Sibling overlap | Mitigation |
|---|---|---|---|
| `packages/xai-web-dashboard-grid/src/registration.tsx` | `const EMPTY_WIDGETS: WidgetRegistration[] = [];` + the `<DashboardModule ... widgets={EMPTY_WIDGETS}>` line | None — siblings #8/#9 own `plugin-web-board-views`/`plugin-web-board-workspaces`, not dashboard-grid | Edit (not Write) with unique anchor; retry git lock 8-20s × 5 |
| `packages/xai-web-dashboard-grid/package.json` | `"@repo/plugin-web-tokens": "workspace:*"` (alphabetical neighbor) | None | Edit with alphabetical insertion |
| `apps/web/package.json` | `"@repo/plugin-web-dashboard-grid": "workspace:*"` | Siblings #8/#9 also touch apps/web/package.json (board-views + board-workspaces deps) | Edit with full-line anchor + alphabetical position; retry git lock 8-20s × 5 |
| `packages/plugin-web-tokens/src/i18n.ts` | `dashboard:` block at en line 134 + zh line 334 | Possibly — board-views/workspaces may add their own keys to `tasks:` / `board:` blocks (not dashboard) | New keys under `dashboard.widgets.*` sub-namespace (NEW property in `dashboard:` block); use unique anchor (e.g. existing `hidden: "Hidden",` end-of-dashboard-block); retry git lock |
| `packages/core/src/types/events.ts` | (NOT needed) | Siblings may touch | Skip — this row emits no new events; reuses row #10's `web:shell:module-change` |

All edits use Edit not Write, unique anchors verified before commit, git lock retry 8-20s × 5.

## 8. Dependencies overview

- Hard run-time deps: `@repo/plugin-web-dashboard-grid` (types), `@repo/plugin-web-tokens` (i18n + Lang), `@repo/plugin-web-storage` (usePref), `@repo/xai-web-event-bus` (ctx.goTo emits `web:shell:module-change`, but only via the goTo callback row #10 already provides — this row doesn't import `emitWebEvent` directly), `@repo/core` (peer for types where needed).
- Peer deps: `react@^19`, `react-dom@^19`.
- Dev deps: `@repo/eslint-config`, `@repo/typescript-config`, `@testing-library/react`, `vitest`, `jsdom`, `@types/react`, `@types/react-dom`, `typescript`.
- No new external libraries (date-fns-tz, framer-motion, etc.).

## 9. Open risks (re-stated, monitored)

R1 (analog alignment), R3 (mini-cal click-vs-drag), R4 (world-clocks picker drag leak), R8 (sibling concurrency on apps/web/package.json), R11 (cross-package commit on registration.tsx).

All have mitigations documented in §3 of the discovery review.

---

## §E — Extension: Stickies create + delete (xai-web-dashboard-stickies-create, 2026-05-28)

> **APPEND extension — does NOT supersede the SHIPPED row #11 design above.** Adds a from-scratch sticky-note store + create/delete UI to `StickiesWidget`.
> Selected Options: A1 + B1 + C1 + D1 + E1 + F1 + G1 + H1 (discovery §3).
> Review Doc: `docs/reviews/xai-web-dashboard-stickies-create/20260528-discovery-review.md`
> Review Date: 2026-05-28
> Authority: ADR-0010 §D4 — carve-out `docs/reviews/_p0-carve-outs/20260528-dashboard-stickies-create.md` (commit `baaf3e1`)
> Closest precedent: `xai-web-calendar-event-create` (store-from-scratch; commits `e108607` → `90ca6d8`)
> Roadmap manifest: `docs/workflow/roadmap/xai-web-dashboard-stickies-create.md`

### §E.1 Decision snapshot (frozen assumptions, 15)

1. Owning package = `@repo/plugin-web-dashboard-widgets` (EXTENSION; no new package).
2. New files: `src/internal/stickiesStore/{types.ts, ids.ts, stickiesStore.ts, useStickies.ts}`, `src/internal/strings.ts`, `src/StickyComposer.tsx`.
3. New registry key `xai_dashboard_stickies` in `@repo/plugin-web-storage` (codec json, default `{}`, owner `xai-web-dashboard-widgets`, category module, schemaVersion 1, proposed false) — AUTHORIZED additive edit (carve-out §2) + 2 parity arrays + `AC-REGISTRY-STICKIES-1/2` test. Byte-parallel to `xai_calendar_events` (registry.ts:943-950).
4. Sticky model: `UserSticky = { id: string; text: string; color: StickyColor; createdAt: string }`. `StickyColor = "sun" | "mint" | "peach" | "sky" | "lilac"`. `NewStickyDraft = { text: string; color: StickyColor }`. `STICKY_COLORS: Record<StickyColor, string>` resolves token → hex; default token `sun`.
5. Pure CRUD (`internal/stickiesStore/stickiesStore.ts`): `createSticky(store, draft) → { next, created }`; `deleteSticky(store, id) → next` (no-op same-ref when missing); `listStickies(store) → UserSticky[]` sorted createdAt ASC, id tiebreak. NO `updateSticky` (edit deferred). Verbatim port of calendar `eventStore.ts` shape.
6. `useStickies()` (`internal/stickiesStore/useStickies.ts`) returns `{ stickies, list, create, remove }` wrapping `usePref("xai_dashboard_stickies")`; stable identities via `useCallback`/`useMemo`.
7. `createStickyId()` (`internal/stickiesStore/ids.ts`): `crypto.randomUUID()` when present, else `sticky-<base36ts>-<rnd>`. Verbatim port of `createEventId`.
8. Persistence = `xai_dashboard_stickies` (default `{}`). NO new `web:*` channel; create/delete emit nothing.
9. Composer = native `<dialog>` `StickyComposer` (B-text `<textarea>` + 5-preset color `role="radiogroup"` + Save/Cancel; ESC/backdrop/autofocus/`aria-modal`/`aria-labelledby`) per `EventComposer`/`TaskComposer`/`MatrixComposer` + local `STR_STICKY_COMPOSER`.
10. i18n = local `internal/strings.ts` STR table; 0 new `plugin-web-tokens` keys; existing `dashboard.sticky_notes` REUSED for the widget title.
11. Fixture disposition = sample-until-first-user-sticky (G1): empty store → 3 read-only fixture samples (`data-sample="true"`, no delete button) + create hint; non-empty → user stickies only; fixtures never persisted. `internal/fixtures.ts` `STICKIES` unchanged.
12. Scope = CREATE + DELETE. Per-sticky `×` delete (native `<button>` + `data-no-drag`, immediate remove). Edit / reorder / pin / rich-text / reminders DEFERRED.
13. Composer + `useStickies` state live INSIDE `StickiesWidget` (H1) — NO `WidgetRenderContext` field added, NO `packages/core/` edit, NO module, NO state lift. Widget is a stable React component across grid re-renders (like ClockWidget's `usePref`).
14. Public surface UNCHANGED: `src/index.ts` exports `dashboardWidgetRegistrations` only; `StickyComposer`/`useStickies`/`UserSticky` stay internal; `index-barrel.test.ts` still asserts the single export.
15. 4-phase build (SP1 data layer + registry / SP2 composer / SP3 wire+render+persist+delete / SP4 docs+barrel+verify). Cross-vendor at SP4 (Codex cold-read) or formal ADR-0008 §S3 defer.

### §E.2 Architecture delta

```
StickiesWidget (src/widgets/StickiesWidget.tsx — EXTENDED, not rewritten)
  ├─ useStickies()                       → internal/stickiesStore/useStickies.ts
  │     └─ usePref("xai_dashboard_stickies")  → @repo/plugin-web-storage
  │           └─ createSticky / deleteSticky / listStickies  (pure, internal/stickiesStore/stickiesStore.ts)
  │                 └─ createStickyId()  (internal/stickiesStore/ids.ts)
  ├─ useState(composerOpen)
  ├─ header + button  →  onClick: open composer   (wires StickiesWidget.tsx:24-27 no-op)
  ├─ body:
  │     list.length === 0 → 3 FIXTURE samples (internal/fixtures.STICKIES, read-only, n.text[lang], n.color)
  │     list.length  > 0  → user stickies (s.text string, STICKY_COLORS[s.color]) + per-sticky × delete
  └─ <StickyComposer open lang onSave={create} onClose />   (src/StickyComposer.tsx + internal/strings.ts)
```

No edge into `packages/core/`, no edit to `registrations.tsx` render-context (the entry still calls `render: (ctx) => <StickiesWidget lang={ctx.lang} />`), no host-shell edit, no `plugin-web-tokens` edit. The only cross-package edit is the **additive** `xai_dashboard_stickies` registry key + its parity tests in `@repo/plugin-web-storage` (authorized).

### §E.3 File layout delta

```
packages/xai-web-dashboard-widgets/src/
├── StickyComposer.tsx                       # NEW (SP2) — native <dialog>
├── widgets/StickiesWidget.tsx               # EXTENDED (SP3) — wire + + render user + delete + sample disposition
├── styles.css                               # EXTENDED (SP2/SP3) — .sticky-composer* + .sticky-del + .sticky--sample
└── internal/
    ├── strings.ts                           # NEW (SP2) — STR_STICKY_COMPOSER + empty hint + delete label (local STR)
    └── stickiesStore/                       # NEW (SP1) — verbatim port of calendar eventStore/
        ├── types.ts                         # UserSticky, StickyColor, NewStickyDraft, STICKY_COLORS
        ├── ids.ts                           # createStickyId()
        ├── stickiesStore.ts                 # pure createSticky / deleteSticky / listStickies
        └── useStickies.ts                   # useStickies() hook over usePref

packages/plugin-web-storage/src/internal/registry.ts   # EXTENDED (SP1) — +xai_dashboard_stickies (additive, authorized)
packages/plugin-web-storage/src/__tests__/registry.test.ts          # EXTENDED (SP1) — OWNER_ROW_ADDITIONS + AC-REGISTRY-STICKIES-1/2
packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts  # EXTENDED (SP1) — exclusion list +xai_dashboard_stickies
```

### §E.4 Persistence rule (new key)

| Key | Owner | Default | Codec | Category | Use |
|---|---|---|---|---|---|
| `xai_dashboard_stickies` | `xai-web-dashboard-widgets` (this extension) | `{}` | json | module | `Record<string, UserSticky>` of user-created stickies; mutated by create/delete via `usePref`; caught by chassis `resetAllPrefs()` `xai_` filter (intended — RS7). |

### §E.5 Phase plan (4 phases — store-from-scratch cadence)

See `dev_log.md` §E Phase Plan for the authoritative per-phase file lists + exit criteria. Summary: SP1 data layer + registry; SP2 StickyComposer; SP3 wire `+` + render user stickies + delete + fixture-as-sample + persistence; SP4 docs + barrel + cross-vendor.

### §E.6 Open risks (extension)

RS1 (registry parity dual-array), RS2 (DESIGN.md §9.2 — follow calendar exclusion-list precedent), RS4 (fixture-vs-user render branch — bilingual indexer on string), RS5 (composer state survives grid tick), RS6 (no delete button on fixture samples), RS8 (CSS class collision — namespace `.sticky-composer*`/`.sticky-del`/`.sticky--sample`, keep base `.sticky`). Full table: discovery §8.

---

## §F — Extension: Real-data wiring for 5 widgets (xai-web-dashboard-real-data, 2026-05-28)

> **APPEND extension — does NOT supersede the SHIPPED row #11 design (§1-§9) or the SHIPPED §E stickies design.** Rewires StatTasks / StatStreak / StatPomos / UpcomingWidget / MiniCalWidget from hardcoded constants / fixtures to REAL local-store reads, with honest empty states. **Pure local read-only wiring — no new registry key, no new dep, no external API, no CSP change, no write to any store.**
> Selected Options: A (in-package `dataReads/` selectors) + Q1 metrics (done/total · today-focus · max-habit-streak) + Q3 honest-empty-states + Q5 calendar-only-Upcoming + Q-i18n local-STR.
> Review Doc: `docs/reviews/xai-web-dashboard-real-data/20260528-discovery-review.md`
> Review Date: 2026-05-28
> Authority: ADR-0010 §D4 — carve-out `docs/reviews/_p0-carve-outs/20260528-dashboard-real-data.md` (commit `217170c`)
> Closest precedent (cross-module read): `@repo/plugin-web-statistics` (`usePref` + LOCAL narrowing predicates, no plugin import) + the in-package §E `StickiesWidget`/`useStickies` (widget reads `usePref`, type-discriminated empty/non-empty branch).
> Roadmap manifest: `docs/workflow/roadmap/xai-web-dashboard-real-data.md`

### §F.1 Decision snapshot (frozen assumptions, 14)

1. Owning package = `@repo/plugin-web-dashboard-widgets` (EXTENSION; no new package). Manifest stays `status: Stable`.
2. In-scope widgets (5): `StatTasks`, `StatStreak`, `StatPomos`, `UpcomingWidget`, `MiniCalWidget`. OUT: `ClockWidget`, `WorldClocks`, `WeatherWidget`, `StickiesWidget`, `MailWidget` — UNCHANGED.
3. Read pattern = `usePref(<key>)` + a LOCAL narrowing predicate, NEVER a cross-plugin import (Statistics + Cmd-K law; §2 discovery). No owner-module `internal/` helper is importable.
4. Source keys (all PRE-EXISTING, read-only): `xai_task_cols` (StatTasks), `xai_pomodoro_sessions` (StatPomos), `xai_habits_state` (StatStreak), `xai_calendar_events` (Upcoming + MiniCal). **ZERO new registry key.**
5. New code = a thin in-package `src/internal/dataReads/` module: pure selectors + local predicates (mirrors Statistics' `aggregators.ts` + `isPomodoroSession.ts` + `isHabitsStateRecord.ts`). Each selector is PURE (store-in/value-out) and takes an injected `now`/`todayKey` for testability.
6. **StatTasks metric = all-bucket `done`/`total`** (`TaskCard.done === true` summed over every `TaskCol.tasks` + `.completed?`; total = all cards). Renders the SHIPPED donut shape `value = done/total`. T-10 made `done` real.
7. **StatPomos metric = today's completed focus sessions** (count) — mirrors owner `countTodaysPomos`: `mode==="focus" && completed && localDay(finishedAt)===todayLocal`. Renders the single number + 8-dot grid (dots cap at 8, number is true). **Field = `finishedAt`+`completed` (canonical) — NOT Cmd-K's stale `completedAt`.**
8. **StatStreak metric = max per-habit strict-consecutive streak (days)** across all habits — re-implements habits' C1 strict-consecutive (today-anchored, **UTC** day keys) locally; takes the max. Renders the number + flame.
9. **Date basis PER source** (do NOT unify): pomodoro = LOCAL day; habits = UTC `YYYY-MM-DD`; calendar = LOCAL-clock ISO (`startISO` "YYYY-MM-DDTHH:MM", no TZ).
10. **MiniCalWidget** reads `xai_calendar_events` → dots keyed by day-of-month for the currently-VIEWED month (honors the widget's own prev/next `offset`). `colorPreset` (`mint|amber|blue|violet|rose`) maps onto `.mc-dot-<color>` CSS classes; `rose` may need an additive `.mc-dot-rose` class (RD4). Empty month = no dots (honest; the grid IS the empty state).
11. **UpcomingWidget** reads `xai_calendar_events` → next ≤4 events with `startISO >= now`, sorted ascending; renders date/month/title/time from `startISO`+`title`. **Calendar events ONLY — NO task-due merge** (task dates are display strings, not ISO; Q5). Empty = honest "no upcoming events" label (NOT a fixture sample — divergence from stickies, justified §F note).
12. **Recurrence** = a MINIMAL local expansion (non-recurring + daily + weekly within a bounded window; HH:MM preserved, date advances) re-implemented in `dataReads/` because calendar's `expandRecurrence` is `internal/` (un-importable). (Reviewer OQ6 may narrow to non-recurring-only.)
13. **Empty-state copy = LOCAL STR** — extend the EXISTING `src/internal/strings.ts` (created by §E); ZERO `plugin-web-tokens` edit. Existing labels (`dashboard.tasks_done`/`streak`/`pomos`/`upcoming`) stay from `useI18n` (already imported).
14. **Public surface UNCHANGED** — `src/index.ts` exports `dashboardWidgetRegistrations` only; selectors/predicates stay `internal/`; `index-barrel.test.ts` (AC-PKG-4) keeps asserting the single export. NO `packages/core` edit, NO event channel, NO host edit, NO `dev` branch.

### §F.2 Architecture delta

```
DashboardModule (row #10) — render(ctx={lang,now,goTo}) — UNCHANGED
   │
   ▼  (5 of 10 widgets rewired; other 5 untouched)
StatTasks(lang)          → usePref("xai_task_cols")        → dataReads/taskStats.countDone(store)        → { done, total }
StatStreak(lang)         → usePref("xai_habits_state")     → dataReads/habitStreak.maxStreak(state, utcToday)
StatPomos(lang)          → usePref("xai_pomodoro_sessions")→ dataReads/pomoStats.countTodaysFocus(sessions, localToday)
UpcomingWidget(lang,now) → usePref("xai_calendar_events")  → dataReads/calUpcoming.upcomingEvents(map, now, days, 4)
MiniCalWidget(lang,now,  → usePref("xai_calendar_events")  → dataReads/calMonthDots.monthDots(map, viewY, viewM)
             goTo)

   src/internal/dataReads/   (NEW — pure, testable without RTL)
     ├─ isTaskColsRecord.ts / taskStats.ts
     ├─ isPomodoroSession.ts / pomoStats.ts      (predicate mirrors Statistics)
     ├─ isHabitsState.ts / habitStreak.ts        (predicate mirrors Statistics + local strict-consecutive)
     └─ isUserCalEventMap.ts / calUpcoming.ts / calMonthDots.ts  (+ minimal local recurrence)

   src/internal/strings.ts   (EXTENDED — empty-state copy added to the §E-created local STR)
```

No edge into `packages/core/`; no `registrations.tsx` render-context change (entries still call `render: (ctx) => <StatTasks lang={ctx.lang} />` etc., with `now`/`goTo` already passed to Upcoming/MiniCal); no host-shell edit; no `plugin-web-tokens` edit; **no registry edit at all** (read-only on pre-existing keys — this is the key contrast with §E stickies, which added a key).

### §F.3 File layout delta

```
packages/xai-web-dashboard-widgets/src/
├── widgets/StatTasks.tsx        # REWIRED (F1) — usePref + taskStats + empty state; drop STAT_TASKS_* consts
├── widgets/StatStreak.tsx       # REWIRED (F1) — usePref + habitStreak + empty state; drop STAT_STREAK_DAYS
├── widgets/StatPomos.tsx        # REWIRED (F1) — usePref + pomoStats; drop STAT_POMOS_* consts
├── widgets/UpcomingWidget.tsx   # REWIRED (F2) — usePref + calUpcoming + empty state; stop importing UPCOMING on live path
├── widgets/MiniCalWidget.tsx    # REWIRED (F2) — usePref + calMonthDots; stop importing CAL_EVENTS on live path
├── internal/
│   ├── strings.ts               # EXTENDED (F1/F2) — empty-state keys (local STR)
│   ├── fixtures.ts              # UNCHANGED exports kept (UPCOMING/CAL_EVENTS stay for back-compat + fixtures.test.ts); live path no longer imports them
│   └── dataReads/               # NEW (F1/F2) — pure selectors + local predicates
│       ├── isTaskColsRecord.ts / taskStats.ts            # F1
│       ├── isPomodoroSession.ts / pomoStats.ts           # F1
│       ├── isHabitsState.ts / habitStreak.ts             # F1
│       └── isUserCalEventMap.ts / calUpcoming.ts / calMonthDots.ts  # F2
├── styles.css                   # MAYBE EXTENDED (F2) — additive .mc-dot-rose + .*-empty hint classes only (no .widget* redefinition)
└── __tests__/
    ├── StatTasks.test.tsx / StatStreak.test.tsx / StatPomos.test.tsx  # REWRITTEN (F1) — seed usePref, assert real + empty
    ├── UpcomingWidget.test.tsx / MiniCalWidget.test.tsx               # REWRITTEN (F2) — seed events, assert real + empty
    └── dataReads/*.test.ts                                            # NEW (F1/F2) — pure selector units
```

**Names are indicative** (build may consolidate predicate+selector into one file per store). **No file is deleted.** `registrations.tsx`, `index.ts` UNCHANGED.

### §F.4 Persistence rule — READ-ONLY on 4 pre-existing keys (NO new key)

| Key | Owner (foreign) | Read shape narrowed toward | Written here? |
|---|---|---|---|
| `xai_task_cols` | `xai-web-tasks` | `Record<BucketId,{tasks:TaskCard[];completed?:TaskCard[]}>` | **NO** (read-only) |
| `xai_pomodoro_sessions` | `xai-web-pomodoro` | `{mode;completed;finishedAt;...}[]` | **NO** |
| `xai_habits_state` | `xai-web-habits` | `{habits:[];checkIns:Record<id,Record<utcDateKey,true>>}` | **NO** |
| `xai_calendar_events` | `xai-web-calendar` | `Record<id,UserCalEvent>` | **NO** |

`usePref` is used for its REACTIVITY (cross-tab + same-tab) — when the owning module writes, our widget re-reads + re-renders. We never call the `setValue` setter. **NO registry edit, NO parity-array change** (contrast §E which added `xai_dashboard_stickies`).

### §F.5 Phase plan (3 phases — by widget group)

See `dev_log.md` §F Phase Plan for authoritative per-phase file lists + exit criteria. Summary:
- **F1** — 3 Stat widgets + their `dataReads/` selectors + local-STR empty keys + rewritten Stat tests.
- **F2** — Upcoming + MiniCal + calendar `dataReads/` selectors (incl. minimal recurrence) + additive CSS (`.mc-dot-rose` if needed) + rewritten Upcoming/MiniCal tests.
- **F3** — empty-state polish + docs sync (this §F across the four-pack) + barrel-unchanged confirm + cross-vendor (or formal ADR-0008 §S3 defer) → READY_FOR_VERIFY.

### §F.6 Open risks (extension)

RD1 (pomodoro `finishedAt` not `completedAt`), RD2 (tasks `col.tasks` not flattened), RD3 (date-basis per source), RD4 (`.mc-dot-rose` CSS), RD5 (local recurrence drift), RD6 (widget survives grid tick), RD7 (removing `STAT_*` consts), RD8 (SHIPPED Stat tests assert magic numbers — must be rewritten), RD9 (fixture exports kept for `fixtures.test.ts`), RD10 (hydrate flash = honest empty), RD11 (barrel single-export), RD12 (defensive predicates degrade to empty, never crash). Full table: discovery §7.1.

### §F.7 Divergences from §E stickies (intentional, justified)

| Topic | §E stickies | §F real-data | Why divergent |
|---|---|---|---|
| Registry | added `xai_dashboard_stickies` | **NO new key** (read-only) | This feature only reads pre-existing keys |
| Direction | create/delete (write) | **read-only** | Widgets are views of other modules' data |
| Fixture-empty | fixture-as-sample (G1) | **honest empty state** (no fake samples) for calendar widgets | Calendar-empty is an honest view; fake events re-introduce the fiction this carve-out removes |
| New files | store + composer + key | **`dataReads/` selectors only** | No data-layer ownership; just projection |

---

## §G — Extension: Weather manual-entry + Mail → Notifications digest (xai-web-dashboard-weather-mail, 2026-05-29)

> **APPEND extension — does NOT supersede the SHIPPED row #11 design (§1-§9), the SHIPPED §E stickies design, or the SHIPPED §F real-data design.** Two independent widget transforms: **Phase A** rewires `WeatherWidget` from the `WEATHER` fixture to a user-managed manual-entry store (WRITE — adds ONE authorized registry key + an editor); **Phase B** rewires `MailWidget` from the `MAILS` fixture to a read-only local **notifications digest** (READ-ONLY aggregation of overdue tasks + today's calendar events — NO new key, NO write, keeps the `mail` widget id).
> Selected Options: Q1 native-`<dialog>`-editor + current-conditions-only(+optional hi/lo) · Q2 3-preset condition enum → existing icons · Q3 local-STR · Q4 unified `NotificationSignal` · Q-Mail-rename keep-`mail`-id · Q-Mail-source reuse-§F-calendar + new-overdue-reader · Q-Mail-countdown DEFER (discovery §4).
> Review Doc: `docs/reviews/xai-web-dashboard-weather-mail/20260529-discovery-review.md`
> Review Date: 2026-05-29
> Authority: ADR-0010 §D4 — carve-out `docs/reviews/_p0-carve-outs/20260529-dashboard-weather-mail.md` (commit `43ba6f8`)
> Closest precedents: Weather store ≈ §E stickies (`internal/stickiesStore/` + `useStickies` + `StickyComposer`, singleton-ified); Mail aggregation ≈ §F real-data (`internal/dataReads/` over `usePref` keys, read-only, honest empty).
> Roadmap manifest: `docs/workflow/roadmap/xai-web-dashboard-weather-mail.md`

### §G.1 Decision snapshot (frozen assumptions, 16)

1. Owning package = `@repo/plugin-web-dashboard-widgets` (EXTENSION; no new package). Manifest stays `status: Stable`.
2. Two independent widget transforms → **2 phases** (Phase A Weather manual-entry / Phase B Mail notifications digest).
3. **Phase A — Weather** is a WRITE feature on its OWN new key; **Phase B — Mail** is a READ-ONLY aggregation of 2 foreign keys (NO new key for Mail).
4. **New authorized registry key `xai_dashboard_weather`** (codec json, default `null`, owner `xai-web-dashboard-widgets`, category module, schemaVersion 1, proposed false) — byte-parallel to §E `xai_dashboard_stickies` (registry.ts:959). + `OWNER_ROW_ADDITIONS` entry + parity exclusion-list entry + `AC-REGISTRY-WEATHER-1/2`. **Mail adds NO key.**
5. Weather store = a SINGLETON object (`UserWeather | null`), NOT a record (contrast stickies' `Record<id, …>`). `null` = honest empty state.
6. Weather model: `UserWeather = { city: string; temp: number; condition: WeatherCondition; hi?: number; lo?: number; updatedAt: string }`. `WeatherCondition = "sunny" | "cloudy" | "rainy"`. `NewWeatherDraft = { city; temp; condition; hi?; lo? }`.
7. `WeatherCondition` → existing `Icon` name map: `sunny→"sun"`, `cloudy→"cloud"`, `rainy→"rain"`. **No `Icon.tsx` edit** (3 presets, 3 existing glyphs). Typed `Record<WeatherCondition, IconName>` makes a bad map a compile error.
8. Weather editor = native `<dialog>` `WeatherEditor` (city `<input>` + temp number `<input>` + condition `role="radiogroup"` 3 chips + optional hi/lo number `<input>`s + Save/Cancel; ESC/backdrop/autofocus/`aria-modal`/`aria-labelledby`) per §E `StickyComposer`. WRITE-only (no edit-mode/delete in v1; Save overwrites the singleton; the body Edit button re-opens it pre-filled).
9. `WeatherWidget` renders current conditions ONLY (city + temp + condition icon/label + optional hi/lo). 5-day forecast DROPPED on the live path; `WEATHER` fixture export KEPT (back-compat + `fixtures.test.ts` green — §F RD9 precedent). Honest empty state ("Set your weather" + edit affordance) when the store is `null`.
10. **Mail keeps widget id `mail`** (frozen per api.md §S2; persisted in `xai_dash_order`) — NO rename, NO ADR amendment, NO layout migration. Only the body data source + `ariaLabel` + title label change. Reuses `.mail-*` CSS.
11. Mail signal shape: `NotificationSignal = { id; sourceType: "task-overdue" | "calendar-today"; label; time?; sortKey }`. Badge = `signals.length`. Source-additive (future `"countdown-expiring"` slots in without reshape).
12. Mail sources (v1): (a) overdue tasks = `xai_task_cols["overdue"].tasks`(+`.completed?`) with `done !== true`, label `title[lang]`; (b) today's events = `xai_calendar_events` filtered to today's LOCAL date-prefix WITH recurrence expansion. **Max 6 rows** (overdue-first, then today-by-time). **Countdowns DEFERRED** (Q-Mail-countdown; OQ-Mail-2).
13. Mail read pattern = `usePref(<key>)` + LOCAL predicate, NEVER a plugin import, NEVER the `usePref` setter. **READ-ONLY — never writes `xai_task_cols`/`xai_calendar_events`.** Reuses §F's `listValidCalEvents`; adds a new `overdueTasks` task reader (widens §F's card-narrow to include `title`).
14. Mail entry threads `now`: `registrations.tsx` `mail` entry gains `now={ctx.now}` (1-line additive, like §F's Upcoming) so "today"/"overdue" compute against `ctx.now`. NOT a `WidgetRenderContext` change (row #10's type stays frozen).
15. i18n = LOCAL STR only. 2 new dedicated tables in `internal/strings.ts`: `STR_WEATHER` + `STR_NOTIFICATIONS` (NOT stuffed into `STR_STICKY_COMPOSER`/`STR_WIDGET_EMPTY` — §F N2). Titles reuse existing `dashboard.weather`/`dashboard.mail` token keys via `useI18n`. **0 `plugin-web-tokens` keys.**
16. Public surface UNCHANGED — `src/index.ts` exports `dashboardWidgetRegistrations` only; store/editor/selectors stay `internal/`; `index-barrel.test.ts` (AC-PKG-4) stays green. NO `packages/core` edit, NO `packages/core/src/types/events.ts` event channel, NO host edit, NO `dev` branch, NO SHIPPED-archive/ADR edit.

### §G.2 Architecture delta

```
DashboardModule (row #10) — render(ctx={lang,now,goTo}) — UNCHANGED
   │
   ▼  (2 of 10 widgets transformed; other 8 untouched)

── Phase A: Weather (WRITE — new key, like §E stickies but SINGLETON) ──────────
WeatherWidget(lang)
  ├─ useWeather()                          → internal/weatherStore/useWeather.ts
  │     └─ usePref("xai_dashboard_weather")    → @repo/plugin-web-storage  (NEW key)
  │           └─ getWeather / setWeather / clearWeather  (pure, internal/weatherStore/weatherStore.ts)
  ├─ useState(editorOpen)
  ├─ body:
  │     weather === null → honest "Set your weather" empty state + Edit button (data-no-drag)
  │     weather != null  → city + {temp}° + <Icon name={CONDITION_ICON[condition]}/> + condition label + optional {hi}°/{lo}°  + Edit button
  └─ <WeatherEditor open lang initial={weather} onSave={set} onClose />   (src/WeatherEditor.tsx + STR_WEATHER)

── Phase B: Mail → Notifications (READ-ONLY aggregation, like §F real-data) ────
MailWidget(lang, now)   ← now threaded from registrations.tsx (1-line additive)
  ├─ usePref("xai_task_cols")        → dataReads/notifications.overdueTasks(store, lang)     → NotificationSignal[]  (READ-ONLY)
  ├─ usePref("xai_calendar_events")  → dataReads/notifications.todaysEvents(store, now)       → NotificationSignal[]  (READ-ONLY; REUSES §F listValidCalEvents + recurrence)
  ├─ signals = [...overdue, ...today]  (overdue-first, then today-by-time, cap 6)
  ├─ badge = signals.length            (replaces fixture unreadCount)
  └─ body:
        signals.length === 0 → honest "All clear / 暂无通知" (STR_NOTIFICATIONS)
        signals.length  > 0  → .mail-row per signal (source dot/icon + label + time)   [.mail-* CSS reused]

   src/internal/weatherStore/   (NEW — Phase A; mirrors §E stickiesStore, singleton-ified)
     ├─ types.ts          # UserWeather, WeatherCondition, NewWeatherDraft, CONDITION_ICON: Record<WeatherCondition, IconName>
     ├─ weatherStore.ts   # pure getWeather / setWeather / clearWeather  (singleton, not record)
     └─ useWeather.ts     # useWeather() over usePref("xai_dashboard_weather")
   src/WeatherEditor.tsx  (NEW — Phase A; native <dialog>, like StickyComposer)

   src/internal/dataReads/notifications.ts  (NEW — Phase B; pure; REUSES isUserCalEventMap/listValidCalEvents)
   src/internal/strings.ts  (EXTENDED — +STR_WEATHER (A) +STR_NOTIFICATIONS (B); new dedicated tables)
```

No edge into `packages/core/`; no `WidgetRenderContext` change (Mail's `now` is an additive WIDGET prop threaded from existing `ctx.now`); no host-shell edit; no `plugin-web-tokens` edit. Phase A's ONLY cross-package edit is the **additive** `xai_dashboard_weather` registry key + its parity tests in `@repo/plugin-web-storage` (authorized). Phase B has **NO** cross-package edit (read-only on pre-existing keys — the key contrast with Phase A; same as §F vs §E).

### §G.3 File layout delta

```
packages/xai-web-dashboard-widgets/src/
├── WeatherEditor.tsx                        # NEW (A) — native <dialog>
├── widgets/WeatherWidget.tsx                # REWIRED (A) — useWeather + editor + honest empty + Edit btn; drop forecast on live path
├── widgets/MailWidget.tsx                   # REWIRED (B) — usePref ×2 + notifications selector + honest "all clear"; add `now` prop
├── registrations.tsx                        # EDITED (B) — 1-line `now={ctx.now}` to the `mail` entry (additive; id/span/ariaLabel-label stay; ariaLabel may shift Inbox→Notifications)
├── styles.css                               # MAYBE EXTENDED — additive only (.ww-empty / .weather-editor* (A); .notif-* / source-dot (B) if needed); NO .widget* redefinition (§S9 guard)
└── internal/
    ├── strings.ts                           # EXTENDED (A/B) — +STR_WEATHER +STR_NOTIFICATIONS (new dedicated tables + accessors)
    ├── fixtures.ts                          # UNCHANGED exports kept (WEATHER/MAILS stay for back-compat + fixtures.test.ts); live path no longer imports them
    ├── weatherStore/                        # NEW (A) — singleton store
    │   ├── types.ts                         # UserWeather, WeatherCondition, NewWeatherDraft, CONDITION_ICON
    │   ├── weatherStore.ts                  # pure getWeather / setWeather / clearWeather
    │   └── useWeather.ts                    # useWeather() hook over usePref
    └── dataReads/
        └── notifications.ts                 # NEW (B) — overdueTasks + todaysEvents → NotificationSignal[] (REUSES isUserCalEventMap)

packages/plugin-web-storage/src/internal/registry.ts                 # EXTENDED (A) — +xai_dashboard_weather (additive, authorized)
packages/plugin-web-storage/src/__tests__/registry.test.ts           # EXTENDED (A) — OWNER_ROW_ADDITIONS + AC-REGISTRY-WEATHER-1/2 (+ AC-REG-8 auto)
packages/plugin-web-storage/src/__tests__/parity-design-md.test.ts   # EXTENDED (A) — exclusion list +xai_dashboard_weather
```

**Names are indicative.** **No file is deleted.** `index.ts` UNCHANGED (barrel single-export). The Mail `overdueTasks` reader may widen §F's `isTaskColsRecord` card-narrow (to include `title`) in a NEW file rather than editing the §F file (build's call — additive either way).

### §G.4 Persistence rules

**Phase A — NEW key (WRITE, owned by this package):**

| Key | Owner | Default | Codec | Category | Use |
|---|---|---|---|---|---|
| `xai_dashboard_weather` | `xai-web-dashboard-widgets` (this extension) | `null` | json | module | `UserWeather \| null` singleton; mutated by `setWeather`/`clearWeather` via `usePref`; caught by chassis `resetAllPrefs()` `xai_` filter (intended). |

Additive (authorized by carve-out §2). Byte-parallel to `xai_dashboard_stickies` (registry.ts:959) EXCEPT default is `null` (singleton, "unset") vs stickies' `{}` (empty record). MUST be added to BOTH parity arrays (`registry.test.ts` `OWNER_ROW_ADDITIONS` + `parity-design-md.test.ts` exclusion list); `AC-REG-8` count auto-derives. Value shape `UserWeather | null` documented at the registry comment; `UserWeather` type lives in `@repo/plugin-web-dashboard-widgets` (registry stays plugin-dep-free; consumer cast at `useWeather`).

**Phase B — READ-ONLY on 2 pre-existing keys (NO new key, NO setter):**

| Key | Owner (foreign) | Read shape narrowed toward | Written here? |
|---|---|---|---|
| `xai_task_cols` | `xai-web-tasks` | `Record<BucketId,{tasks:TaskCard[];completed?:TaskCard[]}>` (overdue bucket + `title` + `done`) | **NO** (read-only) |
| `xai_calendar_events` | `xai-web-calendar` | `Record<id,UserCalEvent>` (today's local date-prefix + recurrence) | **NO** (read-only) |

`usePref` is used for its REACTIVITY (owning module writes → Mail re-reads + re-renders). The `setValue` tuple member is NEVER called. **NO registry edit, NO parity-array change for Phase B** (contrast Phase A which adds a key).

### §G.5 Phase plan (2 phases — 2 independent widget transforms)

See `dev_log.md` §G Phase Plan for the authoritative per-phase file lists + exit criteria. Summary:
- **Phase A — Weather manual-entry:** `xai_dashboard_weather` registry key + parity + AC-REGISTRY-WEATHER; `internal/weatherStore/` (singleton store + `useWeather`); `WeatherEditor` native `<dialog>`; `STR_WEATHER` local STR; rewire `WeatherWidget` (user values + honest empty + Edit button; drop forecast on live path); additive CSS; AC-WSTORE + AC-WEDITOR + AC-WEATHER-REAL tests; SHIPPED non-Weather + §E + §F tests + `fixtures.test.ts` stay green.
- **Phase B — Mail → Notifications digest:** `internal/dataReads/notifications.ts` (overdueTasks + todaysEvents → `NotificationSignal[]`, REUSE §F `listValidCalEvents`); `STR_NOTIFICATIONS` local STR; rewire `MailWidget` (read-only signals + honest "all clear" + badge=count; add `now` prop); 1-line `now` thread + ariaLabel/label shift in `registrations.tsx` (keep `mail` id); additive CSS; AC-RD-OVERDUE + AC-RD-TODAY + AC-MAIL-REAL + AC-MAIL-EMPTY + AC-MAIL-READONLY tests; docs sync (this §G across the four-pack) + barrel-unchanged confirm + cross-vendor (or formal ADR-0008 §S3 defer) → READY_FOR_VERIFY.

### §G.6 Open risks (extension)

RW1 (weather singleton not record), RW2 (editor drag-surface), RW3 (condition→icon map), RW4 (forecast drop vs fixtures.test.ts), RW5 (registry parity dual-array), RW6 (editor state survives grid tick); RM1 (Mail read-only never mutates), RM2 (overdue bucket-specific + title), RM3 (today's events recurrence + local date), RM4 (keep `mail` id), RM5 (`now` thread not a context change), RM6 (honest "all clear"); RG1 (dedicated STR tables), RG2 (barrel single-export), RG3 (defensive foreign read). Full table: discovery §7.

### §G.7 Divergences from §E stickies + §F real-data (intentional)

| Topic | §E stickies | §F real-data | §G-A Weather | §G-B Mail |
|---|---|---|---|---|
| Registry | added `xai_dashboard_stickies` ({}) | NO new key | **added `xai_dashboard_weather` (null)** | **NO new key** |
| Store shape | `Record<id, UserSticky>` (many) | n/a (read-only) | **singleton `UserWeather \| null`** | n/a (read-only) |
| Direction | write (create/delete) | read-only | **write (set/clear)** | **read-only aggregation** |
| Empty state | fixture-as-sample (G1) | honest empty (no samples) | **honest "Set your weather"** | **honest "All clear"** (no fake rows) |
| New UI | composer `<dialog>` | none | **editor `<dialog>`** | none (renders signals) |
| Cross-module read | none | `usePref` + predicate | none | **`usePref` ×2 + predicate (REUSE §F calendar layer)** |
| Widget id | `stickies` (unchanged) | 5 ids unchanged | `weather` (unchanged) | **`mail` KEPT** (no rename — frozen id) |
