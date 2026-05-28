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
