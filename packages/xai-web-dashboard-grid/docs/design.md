# Design Snapshot — xai-web-dashboard-grid

> Companion to: `docs/reviews/xai-web-dashboard-grid/20260523-discovery-review.md`
> Governing ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map row `module-dashboard.jsx` → predeux split `plugin-web-dashboard-grid` + `plugin-web-dashboard-widgets`) + §S5 (JSX→TSX) + §S7 (event bus) + §S8 (`xai_dash_order` pref)
> Roadmap row: `docs/workflow/roadmap/xai-web-console.md` row #10 (W2d Module — Dashboard grid container)

---

## 1. Decision snapshot

| Field | Value |
|---|---|
| Selected Option | A1 + B1 + C1 + D1 + E1 + F1 + G1 + H1 — Vite+TS package at `packages/xai-web-dashboard-grid/` (per ADR-0007 §S4); typed `WidgetRegistration[]` slot API; ported FLIP DnD with 380ms cubic-bezier(.34,1.3,.42,1); pure-CSS grid + media-query breakpoints; declared `web:dashboard:add-widget-clicked`; caller-controlled instance ids; sanitize-on-mount reconciliation; bilingual empty state; whole-widget-shell pointerdown with `data-no-drag` exclude. |
| Review Doc | `docs/reviews/xai-web-dashboard-grid/20260523-discovery-review.md` |
| Review Date | 2026-05-23 |
| Frozen Assumptions | See `discovery-review.md` §8 (15 items) — copied below by reference. |
| Package directory | `packages/xai-web-dashboard-grid/` |
| Package name | `@repo/plugin-web-dashboard-grid` |
| Module id (rail) | `"dashboard"` — already a `WebModuleId` literal. |
| Rail order | 4 (already placeholder-mounted at `apps/web/src/routes/modules/shellRegistrations.tsx:60`). |
| Rail icon | `"layout"` (already in `WebShellIconName`). |
| Storage key | `xai_dash_order` (already pre-registered in `@repo/plugin-web-storage` at `registry.ts:242-249`, owner `xai-web-dashboard-grid`, codec `"json"`, default `["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]`, schemaVersion 1). **This row is a read-only consumer; no registry edits.** |
| New EventMap entry | `web:dashboard:add-widget-clicked` (declaration-only; row #11 may consume). |
| i18n delta | 3 keys × 2 langs (6 string additions) — `dashboard.empty_title`, `dashboard.empty_subtitle`, `dashboard.add_widget_aria`. |
| Status (dev_log) | PLAN_DRAFT → NEEDS_REVIEW |
| Post-ship doc sync | **2026-05-24** — row #11 (`@repo/plugin-web-dashboard-widgets`) shipped and integrated. `DashboardSlotHost` now imports `dashboardWidgetRegistrations` from row #11 and forwards them to `<DashboardModule widgets={dashboardWidgetRegistrations} ... />` (see `src/registration.tsx`). Row #10's `package.json` adds a workspace dep on `@repo/plugin-web-dashboard-widgets`. The slot contract surface (`WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext`, `DashboardModuleProps`) is unchanged — row #11 consumes it. |

### 1.1 Frozen assumptions (verbatim from discovery §8)

1. **Package directory & name**: `packages/xai-web-dashboard-grid/` published as `@repo/plugin-web-dashboard-grid`.
2. **Public surface**: `DashboardModule` (default + named), `dashboardGridSlotRegistration`, and the type aliases `WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext`, `DashboardModuleProps`.
3. **Persistence**: read-only consumer of the pre-registered `xai_dash_order` pref. No registry edits in this row.
4. **DnD technique**: ported FLIP (pointer events + `useLayoutEffect`-driven inverse-translate + 380ms cubic-bezier(.34, 1.3, .42, 1) transition).
5. **Widget slot API**: caller supplies typed `WidgetRegistration[]` via the `widgets` prop. Each registration has `{ id, span, render, ariaLabel? }`. Instance ids are caller-controlled; multi-instance supported.
6. **Reconciliation**: sanitize-on-mount (drop unknown, append missing, dedupe).
7. **Responsive layout**: pure CSS grid + media queries at 1400/1100/760.
8. **Empty state**: bilingual placeholder when `widgets.length === 0`.
9. **Add-widget button**: renders + emits `web:dashboard:add-widget-clicked`; no widget-picker UI in this row.
10. **Drag-exclude**: `e.target.closest("button, input, textarea, [data-no-drag]")` aborts drag start. Row #11 widgets MUST mark interactive children with `data-no-drag`.
11. **EventMap delta**: 1 new EventMap entry `web:dashboard:add-widget-clicked` (declaration-only in this row, optionally consumed in row #11).
12. **i18n delta**: 3 new keys × 2 langs (6 string additions) in `packages/plugin-web-tokens/src/i18n.ts` — `dashboard.empty_title`, `dashboard.empty_subtitle`, `dashboard.add_widget_aria`. `dashboard.add_widget`, `dashboard.good_morning`, `dashboard.good_afternoon`, `dashboard.good_evening` already exist (i18n.ts:137-150 / 333-346).
13. **Slot icon**: `"layout"` (already in `WebShellIconName`). Rail order 4 (already used by the existing placeholder).
14. **No new top-level deps**. Workspace deps (v1 frozen): `@repo/xai-web-shell`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`, `react`, `react-dom`.
    > **Post-ship update (2026-05-24)**: After row #11 (`@repo/plugin-web-dashboard-widgets`) shipped, `package.json` was extended with one additional workspace dep — `@repo/plugin-web-dashboard-widgets` (workspace:*) — so `DashboardSlotHost` can import `dashboardWidgetRegistrations` directly. This is a deliberate, ADR-tracked integration of the sibling plugin per `docs/adr/0007-xai-web-console-build-form.md` §S4 port-map row, NOT a violation of frozen-assumption #14: the frozen v1 list was the deps at first ship; row #11 was always the planned consumer. `@repo/core` is also present as a workspace dep (provides the `WebModuleId` type used in the goTo guard) — already implicit via the transitive surface, made explicit in `package.json`.
15. **`@repo/plugin-web-storage` codec usage**: `usePref("xai_dash_order")` returns `[DashWidgetId[], (next: DashWidgetId[]) => void, PrefMeta]`. `type DashWidgetId = string` upstream.

---

## 2. Architecture overview

```
┌────────────────────────────────────────────────────────────────────────┐
│ apps/web/src/routes/modules/shellRegistrations.tsx                     │
│  - imports dashboardGridSlotRegistration from @repo/plugin-web-dashboard-grid │
│  - replaces placeholder("dashboard", ...) row at line 60               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ WebShellProvider wires the registration into AppRail
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ DashboardSlotHost  (registration.tsx)                                  │
│   - reads useWebShell() → { lang, … }                                  │
│   - composes a goTo(moduleId) by emitting web:shell:module-change      │
│     (guarded by KNOWN_MODULE_IDS — unknown ids are dropped silently)   │
│   - imports dashboardWidgetRegistrations from                          │
│     @repo/plugin-web-dashboard-widgets (row #11 — shipped 2026-05-24)  │
│   - renders <DashboardModule lang={lang}                               │
│       widgets={dashboardWidgetRegistrations}                           │
│       goTo={goTo} />                                                   │
│                                                                         │
│   v1 history: pre-row-#11 the host passed widgets={[]} and rendered    │
│   the empty state. The current production wiring forwards row #11's    │
│   10-entry array. EMPTY_WIDGETS is retained as a typed const (unused). │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ DashboardModule                                                        │
│   ├── DashHeader   (greeting + bilingual date + Add-widget button)     │
│   │     - greeting via pickGreetingKey(now) → useI18n s(key)           │
│   │     - date via formatDashboardDate(now, lang)                      │
│   │     - button emits web:dashboard:add-widget-clicked                │
│   ├── DashboardGrid (when widgets.length > 0)                          │
│   │     ├── useDashOrder(widgets)  → [order, setOrder]                 │
│   │     │     - usePref("xai_dash_order")                              │
│   │     │     - sanitize-on-mount: drop unknown, append missing, dedupe│
│   │     │     - write back sanitized order if it differs               │
│   │     ├── useFlipReorder(order, itemRefs)                            │
│   │     │     - useLayoutEffect: measure rects, apply inverse-translate│
│   │     │     - 380ms cubic-bezier(.34,1.3,.42,1) transition           │
│   │     ├── useGridDrag(order, itemRefs, setOrder)                     │
│   │     │     - pointerdown / pointermove / pointerup on window        │
│   │     │     - over-other-widget detection → setOrder swap            │
│   │     │     - ghost layer state                                      │
│   │     ├── order.map(id => <WidgetShell key={id} ... />)              │
│   │     └── {drag && <WidgetGhost drag={drag} renderBody={...} />}     │
│   └── EmptyState  (when widgets.length === 0)                          │
│         - bilingual "no widgets yet" panel + CTA button                │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Widget rendering pipeline

```
order: DashWidgetId[]   ──┐
widgets: WidgetRegistration[]  ──► for each id in order:
                                     reg = widgets.find(w => w.id === id)
                                     <WidgetShell id={id} span={reg.span}>
                                       {reg.render({ lang, now, goTo })}
                                     </WidgetShell>
```

The grid does NOT know widget internals. The `reg.render(ctx)` call is the entire vocabulary — widgets are opaque ReactNode producers.

### 2.2 FLIP animation flow (`useFlipReorder`)

```
render N:
  for each id in itemRefs:
    rect_curr = el.getBoundingClientRect()
    rect_prev = lastRects[id]
    if rect_prev && (|dx| > 1 || |dy| > 1):
      el.style.transition = "none"
      el.style.transform  = `translate(${dx}px, ${dy}px)`
      force reflow (void el.offsetWidth)
      el.style.transition = "transform 380ms cubic-bezier(.34,1.3,.42,1)"
      el.style.transform  = ""
    lastRects[id] = rect_curr
```

This runs every render. When `order` mutates (via drag-induced setState), the DOM repaints to the new positions; then this effect captures the visual delta and inverse-translates each moved widget, then animates the inverse-translate away. Result: widgets appear to slide smoothly into new positions instead of snap-jumping.

### 2.3 Drag flow (`useGridDrag`)

```
1. pointerdown on widget-shell N:
   (skip if e.target.closest("button, input, textarea, [data-no-drag]"))
   measure rect of N → set drag = { id: N, offsetX, offsetY, x, y, w, h }
   widget-shell N gets className "dragging" (CSS: opacity 0.18, pointer-events none, transition: none)
   ghost layer renders <WidgetGhost> at fixed (x, y) following the cursor

2. window.pointermove e:
   drag.x = e.clientX - drag.offsetX
   drag.y = e.clientY - drag.offsetY
   for each other widget-shell M:
     if e.clientX in [M.left, M.right] && e.clientY in [M.top, M.bottom]:
       swap order: move drag.id to M's index → re-render → FLIP animation kicks in

3. window.pointerup / pointercancel:
   setDrag(null)
   ghost layer unmounts
   widget-shell N loses "dragging" class
   FLIP effect captures the ghost-to-rest delta and animates if any
```

---

## 3. Public surface

### 3.1 Components

```ts
// index.ts (additive — full surface)
export { DashboardModule, default } from "./DashboardModule.js";
export { dashboardGridSlotRegistration } from "./registration.js";
```

### 3.2 Type aliases (stable contract for row #11)

```ts
export type WidgetSpanClass =
  | "w-clock"
  | "w-stat"
  | "w-weather"
  | "w-mini-cal"
  | "w-timezones"
  | "w-stickies"
  | "w-mail"
  | "w-upcoming";

export interface WidgetRenderContext {
  /** Active language for bilingual rendering. */
  lang: Lang;
  /** Current tick — refreshed every second by DashboardModule. */
  now: Date;
  /**
   * Deep-link to another module via the shell (emits web:shell:module-change).
   * Used by MiniCal widget (row #11) to jump to Calendar on click.
   */
  goTo: (moduleId: string) => void;
}

export interface WidgetRegistration {
  /** Stable instance id used as key in xai_dash_order. Caller-controlled. */
  id: string;
  /** Default grid span class (e.g. "w-clock", "w-stat"). */
  span: WidgetSpanClass;
  /** Render function — receives runtime context. */
  render: (ctx: WidgetRenderContext) => ReactNode;
  /** Optional aria-label for the widget-shell drag handle. */
  ariaLabel?: { en: string; zh: string };
}

export interface DashboardModuleProps {
  /** Active language. */
  lang: Lang;
  /** Widget registrations supplied by host (typically dashboardWidgetRegistrations from row #11). */
  widgets: WidgetRegistration[];
  /** Optional deep-link callback. Defaults to emitting web:shell:module-change. */
  goTo?: (moduleId: string) => void;
}
```

### 3.3 Slot registration

```ts
export const dashboardGridSlotRegistration: WebModuleSlotRegistration = {
  moduleId: "dashboard",
  label: "Dashboard",
  defaultChildPath: "",
  children: [
    { path: "", render: DashboardSlotHost },
    { path: "*", render: DashboardSlotHost },
  ],
  icon: "layout",
  railOrder: 4,
  i18nKey: "nav.dashboard",
  showInRail: true,
};
```

`DashboardSlotHost` (in `registration.tsx`) reads `useWebShell()` for `lang` and emits a `goTo` callback (guarded against unknown module ids by `KNOWN_MODULE_IDS`). It forwards `widgets={dashboardWidgetRegistrations}` imported from `@repo/plugin-web-dashboard-widgets` (row #11 — shipped 2026-05-24).

> **v1 history note**: Prior to row #11, the host passed `widgets={[]}` and the grid rendered the bilingual empty state. The current production wiring forwards row #11's registration array; the slot contract (`WidgetRegistration[]` shape) is unchanged between the two phases. See §1.1 frozen-assumption #14 post-ship update and api.md §S12 for the full migration narrative.

---

## 4. File layout

```
packages/xai-web-dashboard-grid/
├── package.json          name=@repo/plugin-web-dashboard-grid, sideEffects=[./src/styles.css]
├── tsconfig.json         extends @repo/typescript-config/react-library.json
├── manifest.json         moduleId=dashboard, surface=web
├── docs/
│   ├── design.md         (this file)
│   ├── api.md            (sibling)
│   ├── test.md           (sibling)
│   └── dev_log.md        (state machine)
└── src/
    ├── index.ts                            public surface (re-exports only)
    ├── DashboardModule.tsx                 module composition
    ├── DashboardGrid.tsx                   the .dash-grid container
    ├── DashHeader.tsx                      greeting + date + Add-widget button
    ├── WidgetShell.tsx                     per-widget container w/ pointerdown
    ├── WidgetGhost.tsx                     dragged-widget floating layer
    ├── EmptyState.tsx                      no-widgets bilingual placeholder
    ├── registration.tsx                    dashboardGridSlotRegistration + DashboardSlotHost
    ├── types.ts                            WidgetRegistration / WidgetSpanClass / WidgetRenderContext / DashboardModuleProps
    ├── styles.css                          .dash-grid responsive + .widget-ghost overrides (verify §6 R1)
    ├── internal/
    │   ├── useDashOrder.ts                 wraps usePref + sanitize-on-mount (F1)
    │   ├── useFlipReorder.ts               useLayoutEffect-driven FLIP
    │   ├── useGridDrag.ts                  pointer-event drag state machine
    │   ├── sanitizeOrder.ts                pure helper for F1 reconciliation
    │   └── greeting.ts                     pickGreetingKey + formatDashboardDate
    └── __tests__/
        ├── sanitizeOrder.test.ts
        ├── greeting.test.ts
        ├── useDashOrder.test.tsx
        ├── DashHeader.test.tsx
        ├── EmptyState.test.tsx
        ├── WidgetShell.test.tsx
        ├── DashboardModule.render.test.tsx
        ├── DashboardModule.lang.test.tsx
        ├── DashboardModule.persist.test.tsx
        ├── DashboardModule.events.test.tsx
        ├── registration.test.tsx
        ├── types.test-d.ts
        └── index-barrel.test.ts
```

---

## 5. Dependency overview

### 5.1 Direct deps

- `@repo/core` (workspace:*) — `WebModuleId` type (used by `DashboardSlotHost` to type-narrow `goTo`'s `moduleId` against `KNOWN_MODULE_IDS`)
- `@repo/plugin-web-dashboard-widgets` (workspace:*) — `dashboardWidgetRegistrations` array consumed by `DashboardSlotHost` (post-row-#11 integration; see §1.1 frozen-assumption #14 post-ship update)
- `@repo/xai-web-shell` (workspace:*) — `WebModuleSlotRegistration`, `useWebShell`
- `@repo/plugin-web-tokens` (workspace:*) — `useI18n`, `Lang` type, side-effect CSS
- `@repo/plugin-web-storage` (workspace:*) — `usePref`, `DashWidgetId` type
- `@repo/xai-web-event-bus` (workspace:*) — `emitWebEvent` (for add-widget + shell:module-change)
- `react` ^19.2.0 (peer), `react-dom` ^19.2.0 (peer)

### 5.2 Reverse deps

- `apps/web` — consumes `dashboardGridSlotRegistration` via `shellRegistrations.tsx`.
- `@repo/plugin-web-dashboard-widgets` (row #11, shipped 2026-05-24) — consumes `WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext` types via its `dashboardWidgetRegistrations` export. This row also takes a direct workspace dep on row #11 so `DashboardSlotHost` can import that array — see §5.1.

### 5.3 Sibling row interaction (W2d)

| Sibling | Files we share | Conflict surface |
|---|---|---|
| #7 xai-web-board-core | `shellRegistrations.tsx` (line 58 vs our line 60), `apps/web/package.json` (different deps), `i18n.ts` (different keys), `core/src/types/events.ts` (we add 1, board-core adds many) | None — anchors are unique, keys are different. |
| #20 xai-web-statistics | `shellRegistrations.tsx` (line 71 vs our line 60), `apps/web/package.json` (different dep), `i18n.ts` (different keys) | None — anchors are unique. |

Concurrency policy: Edit (not Write) for shared files; unique anchor; retry git lock 8-20s × 5 per dispatcher header.

---

## 6. Phase plan (3 phases)

> Each phase = one commit. After each phase, `feature-build` stops for human confirmation per CLAUDE.md.

### Phase P1 — Package skeleton + DashboardModule render + EmptyState + DashHeader + i18n delta + shell wiring

**Goal**: visible at `/app/dashboard` with the empty state rendered (since v1 widgets=[]) AND with the greeting / Add-widget button working. Lint clean.

**Files written**:
- `packages/xai-web-dashboard-grid/package.json`, `tsconfig.json`, `manifest.json`, `src/index.ts`, `src/types.ts`, `src/DashboardModule.tsx`, `src/DashHeader.tsx`, `src/EmptyState.tsx`, `src/registration.tsx`, `src/styles.css`, `src/internal/greeting.ts`
- `packages/xai-web-dashboard-grid/src/__tests__/greeting.test.ts`, `DashHeader.test.tsx`, `EmptyState.test.tsx`, `DashboardModule.render.test.tsx`, `DashboardModule.lang.test.tsx`, `registration.test.tsx`, `types.test-d.ts`, `index-barrel.test.ts`
- `packages/plugin-web-tokens/src/i18n.ts` — Edit, 3 keys × 2 langs (additive)
- `apps/web/src/routes/modules/shellRegistrations.tsx` — Edit, 1 line swap + 1 import
- `apps/web/package.json` — Edit, 1 dep line
- `packages/core/src/types/events.ts` — Edit, 1 EventMap entry
- `packages/xai-web-dashboard-grid/docs/design.md|api.md|test.md|dev_log.md`

**Acceptance**: `pnpm --filter @repo/plugin-web-dashboard-grid test` green; `pnpm --filter @repo/web check-types` green; `pnpm --filter @repo/web lint` clean; manual nav to `/app/dashboard` shows the greeting + empty state.

### Phase P2 — FLIP DnD: WidgetShell + DashboardGrid + WidgetGhost + useFlipReorder + useGridDrag + useDashOrder + sanitizeOrder

**Goal**: when caller supplies `widgets={[...]}` the grid renders them ordered, drag-to-reorder works with FLIP animation, order persists.

**Files written**:
- `packages/xai-web-dashboard-grid/src/WidgetShell.tsx`, `WidgetGhost.tsx`, `DashboardGrid.tsx`, `internal/useFlipReorder.ts`, `internal/useGridDrag.ts`, `internal/useDashOrder.ts`, `internal/sanitizeOrder.ts`
- `packages/xai-web-dashboard-grid/src/__tests__/sanitizeOrder.test.ts`, `useDashOrder.test.tsx`, `WidgetShell.test.tsx`, `DashboardModule.persist.test.tsx`
- Edit `DashboardModule.tsx` to conditionally render `DashboardGrid` when widgets non-empty
- Edit `styles.css` to add `.widget-shell.dragging`, `.widget-ghost`, `is-dragging` overlays + `touch-action: none` per R3

**Acceptance**: full test suite green; sanitize-on-mount tests cover F1; persisted order writes back on drag completion; FLIP effect captures rect movement.

### Phase P3 — Event emission + add-widget button wiring + cross-row contract docs + final polish

**Goal**: `Add widget` button emits `web:dashboard:add-widget-clicked`; empty-state CTA emits same; documentation finalized; cross-vendor smoke list in test.md §6.

**Files written**:
- Edit `DashHeader.tsx` + `EmptyState.tsx` to wire `emitWebEvent("web:dashboard:add-widget-clicked", { source: ... })`
- `packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.events.test.tsx`
- Final docs sync (`design.md`, `api.md`, `test.md`, `dev_log.md`)

**Acceptance**: `pnpm test` green across affected packages; emit assertions pass; `dev_log.md` set to `READY_FOR_VERIFY`.

---

## 7. Risks & mitigations (delta from discovery §6)

See discovery review §6 — R1..R10 ported here verbatim. Additional risk:

### R11. CSS specificity collision with `layout.css` rules from `@repo/plugin-web-tokens`

If our `styles.css` re-declares e.g. `.widget-shell { ... }` that already exists in `layout.css`, the later import wins. Order in `apps/web` should put `@repo/plugin-web-tokens` first (it already does, via `@repo/web-auth-device-session` then `@repo/plugin-web-tokens`).

**Mitigation**: scope our styles.css strictly to row-specific additions: `.widget-ghost`, `.widget-shell.dragging`, `.dash-empty`, `[data-no-drag]` cursor. Add `:where()` wrappers if specificity becomes a concern.

---

## 8. Open questions resolved

All Q1..Q5 from discovery §7 are resolved. See discovery review §7 for answers.

---

## 9. Cross-vendor verify scope

Per manifest header: ship-time cross-vendor verify uses Codex (primary) / Cursor (fallback). This row's verify must include:

- **Visual**: Safari 17+ / Chrome / Firefox — grid renders, drag-to-reorder animates with 380ms cubic-bezier(.34,1.3,.42,1) timing, no jank on first FLIP frame.
- **Functional**: order persists across reload; sanitize-on-mount drops unknown ids; empty state renders with bilingual text; Add-widget button emits the event.
- **Touch**: iOS Safari pointerdown drag works with `touch-action: none`.
- **Lang switch**: greeting updates on lang switch; date string locale-correct.
- **A11y**: `aria-label` on Add-widget button matches lang.

---

## 2026-05-25 Extension: Add Widget Picker (gap-closure row #5)

> APPEND-ONLY section. The §1..§9 above describe the SHIPPED 2026-05-23 baseline +
> 2026-05-24 row #11 integration. This extension layer adds the Add Widget picker
> per `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #5 (W1 — LAST).

### E1. Decision header (this extension)

| Field | Value |
|---|---|
| Selected Option | **A1 + B1 + C1 + D1 + E1 + F1** — picker inside `xai-web-dashboard-grid` as `AddWidgetPicker.tsx`; native `<dialog>` + `showModal()`; hide already-added widgets; no category filter in v1; `useDashOrder` extended with `addWidget(id)`; new typed event `web:dashboard:widget-added` |
| Review Doc | `docs/reviews/xai-web-dashboard-add-widget-picker/20260525-discovery-review.md` |
| Review Date | 2026-05-25 |
| Roadmap Row | `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #5 (W1 · LAST) |
| Source brief | `docs/reviews/xai-web-dashboard-add-widget-picker/20260524-roadmap-seed.md` |
| Parent ADR | ADR-0009 §D2-G3 (P0 gap-closure; ≥5/9 SHIPPED to unblock P1 Desktop launch) |
| Target packages | `packages/xai-web-dashboard-grid/src/{AddWidgetPicker.tsx, DashboardModule.tsx, internal/useDashOrder.ts, styles.css}` + `packages/core/src/types/events.ts` (+1 entry) + `packages/plugin-web-tokens/src/i18n.ts` (+6 keys × 2 langs) + `docs/PLUGIN_MAP.md` (note update) |
| Last Updated | 2026-05-25 |

### E2. Frozen assumptions (this extension; lock at plan acceptance)

> Mirrors discovery review §11. If anything below contradicts a §1.1 baseline
> assumption, treat the baseline as authoritative and re-open the discovery.

1. **Picker location.** `packages/xai-web-dashboard-grid/src/AddWidgetPicker.tsx` — inside the grid package, NOT a new package, NOT inside row #11.
2. **Modal mechanism.** Native `<dialog>` + `showModal()` per `DeleteAccountConfirmModal.tsx` precedent. No third-party modal library (HC10). No portal-based React modal.
3. **Duplicate prevention.** Hide already-added widgets from the picker list (HC5 / C1). When all 10 are added, show an "All widgets are on your dashboard" bilingual empty state + Cancel button only.
4. **Category filtering.** None in v1 — the SHIPPED catalog has no category metadata; adding one requires a row #11 co-edit + ADR amendment, out of scope for the smallest W1 row.
5. **Persistence.** Append id to existing `xai_dash_order` via a new internal helper `useDashOrder.addWidget(id)`. NO new storage keys (HC9). `xai_dash_order` registry entry unchanged.
6. **New event channel.** `web:dashboard:widget-added` declared in `@repo/core/types/events.ts` with payload `{ widgetId: string; source: 'picker' }`. Source is a closed union (only `'picker'` in v1) so future "drag-from-sidebar" or "AI suggestion" sources can be added without an EventMap-payload break.
7. **Legacy event preserved.** `web:dashboard:add-widget-clicked` STAYS. The Add Widget button and Empty State CTA still emit it on click (semantics shift slightly from "intent stub" to "picker opening"). This preserves backward compat for any listener that might appear in the future.
8. **Card content.** Per-card display has 3 visible elements: (a) inline SVG icon from a local `WIDGET_ICONS` map (10 entries), (b) bilingual title from a local `WIDGET_TITLES` map (10 × 2 entries) — DECOUPLED from `ariaLabel` to avoid R6 coupling — (c) bilingual description from a local `WIDGET_DESCRIPTIONS` map (10 × 2 entries). No live widget render preview (R3 v1 simplification).
9. **i18n delta.** 6 new keys × 2 langs in `packages/plugin-web-tokens/src/i18n.ts` under `dashboard.picker.*`:
   - `dashboard.picker.title` — modal heading
   - `dashboard.picker.cancel` — Cancel button label
   - `dashboard.picker.all_added_title` — empty state title (when all widgets added)
   - `dashboard.picker.all_added_subtitle` — empty state subtitle
   - `dashboard.picker.add_button` — per-card "Add" button label
   - `dashboard.picker.aria_close` — aria-label for the close affordance
10. **`useDashOrder` return shape.** Extends from 2-element `[order, setOrder]` to 3-element `[order, setOrder, addWidget]`. Internal-only — `internal/useDashOrder.ts` is NOT part of the public surface per §3 / api.md §S1.
11. **No public-surface export.** `AddWidgetPicker` is NOT re-exported from `@repo/plugin-web-dashboard-grid` index.ts. Component is internal to the package; mounted only by `DashboardModule`. Keeping it internal lets us iterate on its props without stability obligations.
12. **Phase plan.** 2 phases (collapsed P3 into P2 per dispatch brief recommendation — this is the smallest W1 row). See §E6.
13. **Cross-vendor verify.** Ship-time deferred-24h cold-read per ADR-0008 carve-out, consistent with rows #2/#3/#4 W1 precedent. Codex `gpt-5.5-thinking medium` primary verifier; Cursor fallback. See test.md §11.
14. **No prototype reference.** `web design/module-dashboard.jsx` has no gallery panel. Card-grid layout designed fresh; class names match existing dashboard tokens (`.btn`, `--border-1`, `--bg-panel-2`, etc.).
15. **No analytics / telemetry.** Zero outbound network beyond the event bus. No Sentry, no fetch.

### E3. Component graph (extension)

```
DashboardModule (extended)
├── DashHeader (unchanged shape; onAddWidget callback now opens picker)
├── DashboardGrid OR EmptyState (unchanged)
└── AddWidgetPicker (NEW)
    ├── <dialog ref={dialogRef} className="add-widget-picker">
    │   ├── .awp-inner
    │   │   ├── h2.awp-title          ← s("dashboard.picker.title")
    │   │   ├── .awp-grid              (or .awp-empty when all added)
    │   │   │   └── .awp-card × N      (one per missing widget)
    │   │   │       ├── .awp-card__icon  ← inline SVG from WIDGET_ICONS[id]
    │   │   │       ├── .awp-card__title ← WIDGET_TITLES[id][lang]
    │   │   │       └── .awp-card__desc  ← WIDGET_DESCRIPTIONS[id][lang]
    │   │   └── .awp-actions
    │   │       └── button.btn.ghost    ← Cancel
    │
    └── useEffect([open]) → dialog.showModal() or dialog.close()
```

Data flow:

```
DashboardModule:
  const [order, setOrder, addWidget] = useDashOrder(widgets);
  const [pickerOpen, setPickerOpen] = useState(false);

  handleAddFromHeader  = () => {
    emitWebEvent("web:dashboard:add-widget-clicked", { source: "add-widget-button" });
    setPickerOpen(true);
  };
  handleAddFromEmpty   = () => {
    emitWebEvent("web:dashboard:add-widget-clicked", { source: "empty-state-cta" });
    setPickerOpen(true);
  };

  return (
    <div ...>
      <DashHeader ... onAddWidget={handleAddFromHeader} />
      {widgets.length === 0 ? <EmptyState .../> : <DashboardGrid .../>}
      <AddWidgetPicker
        open={pickerOpen}
        lang={lang}
        widgets={widgets}                ← full catalog
        currentOrder={order}              ← used to filter already-added
        onAdd={(id) => {
          addWidget(id);
          emitWebEvent("web:dashboard:widget-added", { widgetId: id, source: "picker" });
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );

useDashOrder hook (extended):
  const addWidget = useCallback((id: string) => {
    if (order.includes(id)) return;        // R1 / R7 dedupe guard
    if (!widgets.find(w => w.id === id)) return; // unknown-id guard
    setOrder([...order, id]);              // setPref persists synchronously
  }, [order, setOrder, widgets]);

  return [order, setOrder, addWidget] as const;
```

### E4. File layout (extension delta over §4)

```
packages/xai-web-dashboard-grid/
└── src/
    ├── AddWidgetPicker.tsx                       NEW — native <dialog> picker (~150 LOC)
    ├── DashboardModule.tsx                       MODIFY — own pickerOpen state; mount picker; flip onAddWidget handlers
    ├── internal/useDashOrder.ts                  MODIFY — tuple-extend return with addWidget(id)
    ├── styles.css                                MODIFY — append .add-widget-picker + .awp-* rules
    └── __tests__/
        ├── AddWidgetPicker.test.tsx              NEW — ~15 cases
        ├── useDashOrder.addWidget.test.tsx       NEW — ~5 cases
        ├── DashboardModule.picker.test.tsx       NEW — ~6 cases
        ├── useDashOrder.test.tsx                 MODIFY — assert 3-element tuple shape (1-2 cases)
        └── DashboardModule.events.test.tsx       MODIFY — assert legacy event still emits + new event emits on Add

packages/core/
└── src/types/events.ts                           MODIFY — +1 EventMap entry web:dashboard:widget-added

packages/plugin-web-tokens/
└── src/i18n.ts                                   MODIFY — +6 keys × 2 langs under dashboard.picker.*

docs/
├── PLUGIN_MAP.md                                 MODIFY — append "(Extension 2026-05-25 — Add Widget picker)" to plugin-web-dashboard-grid row note
└── reviews/xai-web-dashboard-add-widget-picker/
    ├── 20260524-roadmap-seed.md                  (seed brief, already exists)
    └── 20260525-discovery-review.md              NEW (this run)
```

### E5. Dependency overview (extension)

No new workspace deps. No new external deps. The picker uses:

- `react` (`useEffect`, `useRef`, `useState`) — already a peerDep.
- `@repo/plugin-web-tokens` — `useI18n`, `Lang` — already a dep.
- `@repo/plugin-web-dashboard-widgets` — `WidgetRegistration[]` (already imported as the catalog) — already a dep.
- `@repo/xai-web-event-bus` — `emitWebEvent` — already a dep.

No `@repo/core` value imports (only the type `WebModuleId` already imported in registration.tsx; not used in picker).

### E6. Phase plan (2 phases)

> Each phase is a single `feature-build` run. After each phase, `feature-build`
> stops for human confirmation per CLAUDE.md "feature-build does ONE phase per run".

#### Phase P1 — `AddWidgetPicker.tsx` + EventMap + i18n delta + CSS + unit tests

**Files (new)**:
- `packages/xai-web-dashboard-grid/src/AddWidgetPicker.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/AddWidgetPicker.test.tsx`

**Files (edited)**:
- `packages/core/src/types/events.ts` — Edit, +1 entry `web:dashboard:widget-added`
- `packages/plugin-web-tokens/src/i18n.ts` — Edit, +6 keys × 2 langs under `dashboard.picker.*`
- `packages/xai-web-dashboard-grid/src/styles.css` — Edit, append `.add-widget-picker` + `.awp-*` rules

**Acceptance**:
- `pnpm --filter @repo/plugin-web-dashboard-grid lint` clean (`--max-warnings 0`)
- `pnpm --filter @repo/plugin-web-dashboard-grid check-types` clean
- `pnpm --filter @repo/plugin-web-dashboard-grid test` — baseline 104 + new 15 = 119 tests green
- `pnpm --filter @repo/core check-types` clean
- `pnpm --filter @repo/plugin-web-tokens check-types` clean

**Commit**: `feat(plugin-web-dashboard-grid): P1 — AddWidgetPicker component + web:dashboard:widget-added event + i18n delta (gap-closure row #5)`

#### Phase P2 — Wire-up + `useDashOrder.addWidget` + integration tests + PLUGIN_MAP note

**Files (new)**:
- `packages/xai-web-dashboard-grid/src/__tests__/useDashOrder.addWidget.test.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.picker.test.tsx`

**Files (edited)**:
- `packages/xai-web-dashboard-grid/src/DashboardModule.tsx` — Edit, own `pickerOpen` state, mount `<AddWidgetPicker />`, flip onAddWidget handlers to open picker
- `packages/xai-web-dashboard-grid/src/internal/useDashOrder.ts` — Edit, tuple-extend return with `addWidget(id)`
- `packages/xai-web-dashboard-grid/src/__tests__/useDashOrder.test.tsx` — Edit, extend with addWidget cases (1-2 backward-compat asserts)
- `packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.events.test.tsx` — Edit, assert legacy event still emits AND new event emits on picker add
- `docs/PLUGIN_MAP.md` — Edit, append `(Extension 2026-05-25 — Add Widget picker)` to plugin-web-dashboard-grid row note
- `packages/xai-web-dashboard-grid/docs/{design.md, api.md, test.md, dev_log.md}` — final sync

**Acceptance**:
- All tests green: grid 104 → ~130 (15 new picker + 5 new addWidget + 6 new picker integration); widgets 93 unchanged; web/core/tokens green
- `pnpm -w build` clean
- Set dev_log Status to `READY_FOR_VERIFY`

**Commit**: `feat(plugin-web-dashboard-grid): P2 — DashboardModule picker wire-up + useDashOrder.addWidget + PLUGIN_MAP (gap-closure row #5)`

### E7. Risks (this extension)

See discovery review §6 — R1..R10 ported here verbatim. Highest-residual risks:

- **R3** (100ms open budget if catalog grows): mitigated for v1 by NOT rendering live previews; v2 deferral noted.
- **R6** (ariaLabel-as-title coupling): eliminated by inline `WIDGET_TITLES` constant decoupled from `ariaLabel`.
- **R7** (useDashOrder return-shape extension): eliminated by tuple-at-end extension + single caller.

### E8. Cross-vendor verify scope (this extension)

Adds to §9 above:

- **Modal open/close**: picker `<dialog>` opens via `showModal()` within 100ms of click; ESC closes; backdrop click closes; native focus-trap keeps Tab inside dialog.
- **Keyboard**: Tab enters first card; Tab cycles cards then Cancel button then wraps; Shift+Tab cycles backward; Enter on focused card → adds + closes.
- **Duplicate hiding**: with all 10 widgets added, picker shows "All widgets are on your dashboard" empty state.
- **Persistence**: Add → reload → widget persists at end of grid.
- **Event emit**: `web:dashboard:widget-added` fires once per Add with `{ widgetId: <id>, source: 'picker' }`.
- **Legacy event still emits**: `web:dashboard:add-widget-clicked` STILL fires on Add Widget button click (now followed by picker open).
- **Bilingual**: lang toggle switches all picker copy.

Cross-vendor cold-read verifier (Codex `gpt-5.5-thinking medium` primary, Cursor fallback) inspects `AddWidgetPicker.tsx` for keyboard accessibility (Tab navigates cards, Enter selects, Esc closes). Report at `docs/reviews/xai-web-dashboard-add-widget-picker/<YYYYMMDD>-cross-vendor-verify.md`.
