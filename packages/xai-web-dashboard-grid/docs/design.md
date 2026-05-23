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
14. **No new top-level deps**. Workspace deps: `@repo/xai-web-shell`, `@repo/plugin-web-tokens`, `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`, `react`, `react-dom`.
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
│   - renders <DashboardModule lang={lang} widgets={widgets} goTo={goTo} /> │
│                                                                         │
│   Note: in v1 it passes widgets={[]}. After row #11 ships, it imports   │
│   dashboardWidgetRegistrations from @repo/plugin-web-dashboard-widgets  │
│   and forwards them. This row does not depend on row #11.              │
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

`DashboardSlotHost` (in `registration.tsx`) reads `useWebShell()` for `lang` and emits a `goTo` callback. In v1 it passes `widgets={[]}` (empty registrations because row #11 hasn't shipped); the row #11 update will swap that for `widgets={dashboardWidgetRegistrations}`.

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

- `@repo/xai-web-shell` (workspace:*) — `WebModuleSlotRegistration`, `useWebShell`
- `@repo/plugin-web-tokens` (workspace:*) — `useI18n`, `Lang` type, side-effect CSS
- `@repo/plugin-web-storage` (workspace:*) — `usePref`, `DashWidgetId` type
- `@repo/xai-web-event-bus` (workspace:*) — `emitWebEvent` (for add-widget + shell:module-change)
- `react` ^19.2.0 (peer), `react-dom` ^19.2.0 (peer)

### 5.2 Reverse deps

- `apps/web` — consumes `dashboardGridSlotRegistration` via `shellRegistrations.tsx`.
- `@repo/plugin-web-dashboard-widgets` (row #11, future) — consumes `WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext` types.

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
