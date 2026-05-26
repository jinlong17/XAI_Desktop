# Test Strategy — @repo/plugin-web-dashboard-grid

> Mirrors `design.md` + `api.md`. AC IDs trace to seed brief acceptance signal and `discovery-review.md` §6 risks.

## 1. Test pyramid

| Layer | Tool | Files | Coverage target |
|---|---|---|---|
| Pure helpers | Vitest (jsdom) | `sanitizeOrder.test.ts`, `greeting.test.ts` | 100 % branches |
| Hooks | Vitest + RTL | `useDashOrder.test.tsx` | All sanitize paths + persist write-back |
| Components | Vitest + RTL | `DashHeader.test.tsx`, `EmptyState.test.tsx`, `WidgetShell.test.tsx`, `DashboardModule.render.test.tsx`, `DashboardModule.lang.test.tsx`, `DashboardModule.persist.test.tsx`, `DashboardModule.events.test.tsx` | ≥ 90 % statements / ≥ 85 % branches |
| Type-level | Vitest `expectTypeOf` | `types.test-d.ts` | All public types |
| Index barrel | Vitest | `index-barrel.test.ts` | All exports present |
| Slot registration | Vitest | `registration.test.tsx` | Slot shape + label/icon/i18nKey/railOrder |
| Host integration | extend existing | `apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts` (extend) | Dashboard slot is wired |

## 2. AC matrix

### 2.1 AC-RENDER — Module renders without widgets

| ID | Description | Phase | File |
|---|---|---|---|
| AC-RENDER-1 | `<DashboardModule lang="en" widgets={[]} />` renders without throwing | P1 | `DashboardModule.render.test.tsx` |
| AC-RENDER-2 | Header shows greeting + date + `+ Add widget` button | P1 | `DashHeader.test.tsx` |
| AC-RENDER-3 | When `widgets.length === 0`, `<EmptyState>` is rendered | P1 | `DashboardModule.render.test.tsx` |
| AC-RENDER-4 | Empty state has bilingual title, subtitle, CTA per active lang | P1 | `EmptyState.test.tsx` |
| AC-RENDER-5 | Greeting respects local hour: < 12 → good_morning, 12–17 → good_afternoon, ≥ 18 → good_evening | P1 | `greeting.test.ts` |
| AC-RENDER-6 | `formatDashboardDate(d, "en")` returns "<Weekday>, <Month> <Day>" | P1 | `greeting.test.ts` |
| AC-RENDER-7 | `formatDashboardDate(d, "zh")` returns "<Y> 年 <M> 月 <D> 日 · 周<W>" | P1 | `greeting.test.ts` |

### 2.2 AC-LANG — Bilingual switching

| ID | Description | Phase | File |
|---|---|---|---|
| AC-LANG-1 | `lang="zh"` greeting uses `dashboard.good_morning` ZH string | P1 | `DashboardModule.lang.test.tsx` |
| AC-LANG-2 | `lang="zh"` date string uses Chinese weekday and "年/月/日" | P1 | `DashboardModule.lang.test.tsx` |
| AC-LANG-3 | Add-widget button label matches lang (re-uses existing `dashboard.add_widget`) | P1 | `DashHeader.test.tsx` |
| AC-LANG-4 | Add-widget button `aria-label` uses `dashboard.add_widget_aria` per lang | P1 | `DashHeader.test.tsx` |
| AC-LANG-5 | Empty state strings update on lang toggle | P1 | `EmptyState.test.tsx` |

### 2.3 AC-SLOT — Widget registration slot

| ID | Description | Phase | File |
|---|---|---|---|
| AC-SLOT-1 | Given 3 widgets, the grid renders 3 `<WidgetShell>` containers in registration order | P2 | `DashboardModule.render.test.tsx` |
| AC-SLOT-2 | Each shell has class `widget-shell` + the span class from registration | P2 | `WidgetShell.test.tsx` |
| AC-SLOT-3 | `reg.render(ctx)` is called with `lang`, `now: Date`, `goTo: fn` | P2 | `DashboardModule.render.test.tsx` |
| AC-SLOT-4 | If `ariaLabel` is supplied, shell carries `aria-label` per lang | P2 | `WidgetShell.test.tsx` |
| AC-SLOT-5 | Empty state is NOT shown when at least 1 widget is registered | P2 | `DashboardModule.render.test.tsx` |

### 2.4 AC-PERSIST — Order persistence + sanitize

| ID | Description | Phase | File |
|---|---|---|---|
| AC-PERSIST-1 | First mount with no persisted order: returns registration order | P2 | `useDashOrder.test.tsx` |
| AC-PERSIST-2 | Persisted order matches widgets: returns persisted as-is, no write | P2 | `useDashOrder.test.tsx` |
| AC-PERSIST-3 | Persisted contains unknown id: dropped from working order + written back | P2 | `useDashOrder.test.tsx` |
| AC-PERSIST-4 | Persisted missing some widget ids: appended in registration order + written back | P2 | `useDashOrder.test.tsx` |
| AC-PERSIST-5 | Persisted contains duplicate id: deduped (first wins) + written back | P2 | `useDashOrder.test.tsx` |
| AC-PERSIST-6 | Empty widgets array: returns empty + writes empty back | P2 | `useDashOrder.test.tsx` |
| AC-PERSIST-7 | `sanitizeOrder` is pure: same input → same output | P2 | `sanitizeOrder.test.ts` |
| AC-PERSIST-8 | After `setOrder(next)`, the new order persists via setPref | P2 | `DashboardModule.persist.test.tsx` |

### 2.5 AC-DRAG — Pointer-event drag state

> Full FLIP visual verification requires real browser rendering; jsdom-friendly tests focus on state transitions.

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DRAG-1 | `pointerdown` on widget-shell starts drag (drag state set) | P2 | `WidgetShell.test.tsx` |
| AC-DRAG-2 | `pointerdown` on a `<button>` child does NOT start drag | P2 | `WidgetShell.test.tsx` |
| AC-DRAG-3 | `pointerdown` on `<input>` child does NOT start drag | P2 | `WidgetShell.test.tsx` |
| AC-DRAG-4 | `pointerdown` on element with `data-no-drag` does NOT start drag | P2 | `WidgetShell.test.tsx` |
| AC-DRAG-5 | While dragging, dragged shell carries `dragging` class | P2 | `WidgetShell.test.tsx` |
| AC-DRAG-6 | `pointerup` resets drag state | P2 | `WidgetShell.test.tsx` |
| AC-DRAG-7 | `pointercancel` resets drag state | P2 | `WidgetShell.test.tsx` |
| AC-DRAG-8 | Right-click (button !== 0) does NOT start drag | P2 | `WidgetShell.test.tsx` |

### 2.6 AC-EVENT — Event emission

| ID | Description | Phase | File |
|---|---|---|---|
| AC-EVENT-1 | Add-widget button click emits `web:dashboard:add-widget-clicked` with `source: 'add-widget-button'` | P3 | `DashboardModule.events.test.tsx` |
| AC-EVENT-2 | Empty-state CTA click emits same event with `source: 'empty-state-cta'` | P3 | `DashboardModule.events.test.tsx` |
| AC-EVENT-3 | `goTo("calendar")` emits `web:shell:module-change` with `{ moduleId: "calendar", source: "mini-cal" }` | P3 | `DashboardModule.events.test.tsx` |
| AC-EVENT-4 | No other web:* events are emitted | P3 | `DashboardModule.events.test.tsx` |

### 2.7 AC-REG — Slot registration

| ID | Description | Phase | File |
|---|---|---|---|
| AC-REG-1 | `dashboardGridSlotRegistration` has `moduleId === "dashboard"` | P1 | `registration.test.tsx` |
| AC-REG-2 | `icon === "layout"` | P1 | `registration.test.tsx` |
| AC-REG-3 | `i18nKey === "nav.dashboard"` | P1 | `registration.test.tsx` |
| AC-REG-4 | `railOrder === 4` | P1 | `registration.test.tsx` |
| AC-REG-5 | `showInRail === true` | P1 | `registration.test.tsx` |
| AC-REG-6 | `children[0].path === ""` and `children[1].path === "*"` | P1 | `registration.test.tsx` |
| AC-REG-7 | `DashboardSlotHost` reads lang from useWebShell() | P1 | `registration.test.tsx` |
| AC-REG-8 | `DashboardSlotHost` provides a `goTo` that emits `web:shell:module-change` | P3 | `registration.test.tsx` |

### 2.8 AC-TYPES — Type-level checks

| ID | Description | Phase | File |
|---|---|---|---|
| AC-TYPES-1 | `WidgetRegistration.id` is `string` | P1 | `types.test-d.ts` |
| AC-TYPES-2 | `WidgetRegistration.span` is `WidgetSpanClass` (the union of 8 literals) | P1 | `types.test-d.ts` |
| AC-TYPES-3 | `WidgetRegistration.render` is `(ctx: WidgetRenderContext) => ReactNode` | P1 | `types.test-d.ts` |
| AC-TYPES-4 | `WidgetRenderContext.lang` is `Lang` from `@repo/plugin-web-tokens` | P1 | `types.test-d.ts` |
| AC-TYPES-5 | `WidgetRenderContext.goTo` is `(moduleId: string) => void` | P1 | `types.test-d.ts` |
| AC-TYPES-6 | `DashboardModuleProps.widgets` is `WidgetRegistration[]` | P1 | `types.test-d.ts` |

### 2.9 AC-BARREL — Public surface

| ID | Description | Phase | File |
|---|---|---|---|
| AC-BARREL-1 | `index.ts` exports `DashboardModule` | P1 | `index-barrel.test.ts` |
| AC-BARREL-2 | `index.ts` exports `default` from `DashboardModule` | P1 | `index-barrel.test.ts` |
| AC-BARREL-3 | `index.ts` exports `dashboardGridSlotRegistration` | P1 | `index-barrel.test.ts` |
| AC-BARREL-4 | `index.ts` exports types `WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext`, `DashboardModuleProps` | P1 | `index-barrel.test.ts` |
| AC-BARREL-5 | `index.ts` exports nothing from `internal/` | P1 | `index-barrel.test.ts` |

### 2.10 AC-HOST — Host integration

| ID | Description | Phase | File |
|---|---|---|---|
| AC-HOST-1 | `webShellModuleRegistrations` in `shellRegistrations.tsx` contains exactly one entry with `moduleId === "dashboard"` (was placeholder, now real) | P1 | `apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts` (extend) |
| AC-HOST-2 | The dashboard entry uses `dashboardGridSlotRegistration`, not the placeholder factory | P1 | extend |
| AC-HOST-3 | The `placeholder("dashboard", ...)` call is removed | P1 | extend |
| AC-HOST-4 | Rail order remains 4 | P1 | extend |

## 3. Mock strategy

| Surface | Mock | Why |
|---|---|---|
| `usePref` (storage layer) | Use real `@repo/plugin-web-storage` with jsdom `localStorage` reset per test | Round-trip through real codec catches contract drift |
| `useI18n` from `@repo/plugin-web-tokens` | Use real (it's a pure hook reading the I18N constant) | Catches missing keys |
| `useWebShell` from `@repo/xai-web-shell` | Wrap tests in `<WebShellProvider modules={[]} lang={lang} railPos="left" pet={...} />` | Real provider |
| `emitWebEvent` from `@repo/xai-web-event-bus` | Use real with `onWebEvent` listener to spy on emits | Round-trip through bus catches event-shape drift |
| `getBoundingClientRect` | jsdom stub: `Element.prototype.getBoundingClientRect = () => ({ left:0,top:0,right:100,bottom:100,width:100,height:100, x:0,y:0,toJSON: () => ({}) })` (jsdom default returns zeros) | FLIP measure needs non-zero rects; full visual verification deferred to manual cross-vendor |
| Pointer events | `fireEvent.pointerDown(el, { clientX: 50, clientY: 50, button: 0 })` from RTL | jsdom synthesizes PointerEvents via @testing-library/user-event v14+ |

## 4. Test data fixtures

```ts
// src/__tests__/__fixtures__/widgets.ts
import type { WidgetRegistration } from "../../types.js";

export function makeFixture(id: string, span: WidgetRegistration["span"] = "w-stat"): WidgetRegistration {
  return {
    id,
    span,
    render: () => <div data-testid={`body-${id}`}>{id}</div>,
  };
}

export const THREE_WIDGETS: WidgetRegistration[] = [
  makeFixture("alpha", "w-clock"),
  makeFixture("bravo", "w-stat"),
  makeFixture("charlie", "w-weather"),
];

export const EMPTY: WidgetRegistration[] = [];
```

## 5. Acceptance signal (seed brief verbatim)

> Dashboard route renders an empty grid, can host 3 dummy widget placeholders, drag-to-reorder triggers FLIP animation, order survives reload, and responsive breakpoints collapse correctly.

Coverage mapping:
- **Renders empty grid**: AC-RENDER-1 + AC-RENDER-3 + AC-RENDER-4.
- **Can host 3 dummy widget placeholders**: AC-SLOT-1 + AC-SLOT-2 + AC-SLOT-3.
- **Drag-to-reorder triggers FLIP animation**: AC-DRAG-1..AC-DRAG-8 (state transitions). Visual FLIP verification in §6 manual cross-vendor.
- **Order survives reload**: AC-PERSIST-8 + AC-PERSIST-1..AC-PERSIST-7 (sanitize) + manual cross-vendor reload test.
- **Responsive breakpoints collapse correctly**: §6 manual cross-vendor verify (CSS-only; not unit-testable in jsdom).

## 6. Manual cross-vendor verify (queued for ship)

Per manifest header, cross-vendor verify uses Codex (primary) / Cursor (fallback). The verifier must:

1. **Setup**: `pnpm install && pnpm --filter @repo/web dev`. Open Safari 17+, Chrome, Firefox.
2. **Empty state**: navigate to `/app/dashboard`. Verify:
   - Greeting + date + Add-widget button visible.
   - Empty-state panel shows "No widgets yet" / "暂无组件" per the current lang toggle.
3. **Add-widget event**: open browser devtools → Console. Listen via `addEventListener("web:dashboard:add-widget-clicked", e => console.log(e))` (or via the `xai-web-event-bus` if exposed via window). Click Add-widget button → see event emitted with `source: 'add-widget-button'`. Click empty-state CTA → see `source: 'empty-state-cta'`.
4. **Lang switch**: toggle lang via Avatar menu (or whatever the shell provides). Verify greeting + date + empty-state strings change to ZH/EN immediately.
5. **3-widget smoke (manual)**: paste a temporary patch into `apps/web/src/routes/modules/shellRegistrations.tsx` swapping `dashboardGridSlotRegistration` for a wrapper that supplies `widgets={[{id:'alpha',span:'w-clock',render:() => <div>Alpha</div>},{id:'bravo',span:'w-stat',render:()=><div>Bravo</div>},{id:'charlie',span:'w-weather',render:()=><div>Charlie</div>}]}`. Restart `pnpm dev`. Navigate to `/app/dashboard`.
   - Verify 3 boxes render at the correct grid spans.
   - Drag Alpha over Bravo. **Visual check**: Bravo slides smoothly to where Alpha was (FLIP, 380ms cubic-bezier). NOT a snap-to-position.
   - Reload page. Order persists (Alpha is now at position 2, Bravo at position 1).
   - Drag Alpha out and release on Charlie. Now Charlie slides to the middle, Alpha is at end.
   - Revert the temporary patch when done.
6. **Touch / iOS**: open Safari iOS DevTools (or Safari → Develop → iPhone simulator). Touch-drag a widget. Verify drag works (no scroll capture interfering).
7. **Responsive**: resize the viewport across 1500 → 1300 → 900 → 600 px. Verify grid columns collapse at 1400 / 1100 / 760 boundaries.
8. **A11y**: tab through the header. Add-widget button receives focus + has aria-label per current lang.
9. **Light/Dark theme**: toggle theme via Avatar menu. Verify greeting / date / empty-state / widget chrome colors invert correctly.
10. **Storage round-trip**: open Application → Local Storage. Read `xai_dash_order`. After reorder, confirm JSON contents update. Manually delete the key and reload — order resets to registration order.

Report file: `docs/reviews/xai-web-dashboard-grid/<YYYYMMDD>-cross-vendor-verify.md`.

## 7. Lint/types/build expectations

- `pnpm --filter @repo/plugin-web-dashboard-grid lint` — zero warnings.
- `pnpm --filter @repo/plugin-web-dashboard-grid check-types` — clean.
- `pnpm --filter @repo/plugin-web-dashboard-grid test` — all green.
- `pnpm --filter @repo/web check-types` — clean (Edit changes to `shellRegistrations.tsx` + `package.json` ripple).
- `pnpm --filter @repo/web lint` — zero warnings.
- `pnpm --filter @repo/web test` — green (extended `shellRegistrations.test.ts`).
- `pnpm --filter @repo/core check-types` — clean (EventMap addition).
- `pnpm --filter @repo/plugin-web-tokens check-types` — clean (3 keys × 2 langs).
- `pnpm -w build` — green (full workspace builds).

## 8. Coverage gates

- Statements ≥ 90 %, branches ≥ 85 %, functions ≥ 90 %, lines ≥ 90 % (matches sibling rows #12/#13/#16).
- Helpers (`sanitizeOrder.ts`, `greeting.ts`): 100 % branches.

---

## 9. 2026-05-25 Extension: Add Widget Picker (gap-closure row #5)

> APPEND-ONLY section. §1..§8 above describe the SHIPPED 2026-05-23 baseline test
> strategy + 2026-05-24 row #11 integration locks. This section adds the test
> strategy for the Add Widget picker extension per
> `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #5.

### 9.1 Strategy summary (extension)

- **Unit + component tests** with `@testing-library/react` + Vitest 3 + jsdom 26 (same stack as §1).
- **Real `<dialog>` in jsdom**: jsdom 26 implements HTMLDialogElement (`showModal`, `close`, `cancel`, `open`). No polyfill needed. Verified in `DeleteAccountConfirmModal.test.tsx` precedent in `plugin-web-settings-rest`.
- **Real i18n bundle**: use the real `@repo/plugin-web-tokens` `useI18n` hook so missing-key gaps surface.
- **Real `usePref` + `localStorage` reset per test** (same as §3): catches contract drift in `addWidget` write-back.
- **Real event bus**: spy on `web:dashboard:widget-added` + `web:dashboard:add-widget-clicked` via `onWebEvent` listener.
- **Test data fixtures** (`__fixtures__/widgets.ts`) re-used per §4 — the picker tests need 0-, 3-, 10-widget catalogs and pre-populated `xai_dash_order` for filtering scenarios.

### 9.2 Test pyramid (extension)

| Layer | Tool | Files | Coverage target |
|---|---|---|---|
| Component — picker | Vitest + RTL | `AddWidgetPicker.test.tsx` (~15 cases) | ≥ 95 % statements / ≥ 90 % branches |
| Hook — extended useDashOrder | Vitest + RTL | `useDashOrder.addWidget.test.tsx` (~5 cases) + extend `useDashOrder.test.tsx` (1-2 cases for 3-element tuple) | 100 % addWidget paths |
| Integration — module + picker | Vitest + RTL | `DashboardModule.picker.test.tsx` (~6 cases) | All open/close/add/cancel paths |
| Event regression | Vitest + RTL | extend `DashboardModule.events.test.tsx` (~2 cases) | Legacy event STILL emits + new event emits |
| Type-level — EventMap | (covered in `@repo/core` test) | EventMap delta compiles | `web:dashboard:widget-added` payload shape |

### 9.3 AC matrix (extension)

#### 9.3.1 AC-AWP — `<AddWidgetPicker />` component

| ID | Description | Phase | File |
|---|---|---|---|
| AC-AWP-1 | When `open === false`, `<dialog>` is not displayed (closed) | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-2 | When `open === true`, `<dialog>` is open (showModal called); first focusable element is the first card | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-3 | Renders one card per widget NOT in `currentOrder` | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-4 | When all catalog ids are in `currentOrder`, renders `.awp-empty` instead of `.awp-grid` | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-5 | Empty state shows bilingual title + subtitle from `dashboard.picker.all_added_*` | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-6 | Click on a card calls `onAdd(widgetId)` with the correct id | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-7 | Click on a card does NOT call `onClose` (parent decides) | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-8 | Click on Cancel button calls `onClose` (NOT `onAdd`) | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-9 | Click on dialog backdrop (target === dialogRef) calls `onClose` | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-10 | ESC keypress fires native `cancel` event → calls `onClose` | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-11 | `lang="en"` renders English picker title (`Add a widget`) | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-12 | `lang="zh"` renders Chinese picker title (`添加组件`) | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-13 | Each card has bilingual title from local `WIDGET_TITLES` map (NOT `ariaLabel`) | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-14 | Each card has bilingual description from local `WIDGET_DESCRIPTIONS` map | P1 | `AddWidgetPicker.test.tsx` |
| AC-AWP-15 | Each card has an inline SVG icon from local `WIDGET_ICONS` map | P1 | `AddWidgetPicker.test.tsx` |

#### 9.3.2 AC-AWO — `useDashOrder.addWidget`

| ID | Description | Phase | File |
|---|---|---|---|
| AC-AWO-1 | `useDashOrder(...)` returns a 3-element tuple `[order, setOrder, addWidget]` | P2 | `useDashOrder.test.tsx` (extend) + `useDashOrder.addWidget.test.tsx` |
| AC-AWO-2 | `addWidget(newId)` appends `newId` to order + persists via `setPref` | P2 | `useDashOrder.addWidget.test.tsx` |
| AC-AWO-3 | `addWidget(existingId)` is a no-op (order unchanged; no setPref call) | P2 | `useDashOrder.addWidget.test.tsx` |
| AC-AWO-4 | `addWidget(unknownId)` (id not in `widgets[]`) is a no-op | P2 | `useDashOrder.addWidget.test.tsx` |
| AC-AWO-5 | After `addWidget(newId)`, next render's sanitize-on-mount keeps newId (id is in registered set after the widget exists) | P2 | `useDashOrder.addWidget.test.tsx` |

#### 9.3.3 AC-DMP — `DashboardModule` picker integration

| ID | Description | Phase | File |
|---|---|---|---|
| AC-DMP-1 | `pickerOpen` starts false; picker `<dialog>` is closed on first render | P2 | `DashboardModule.picker.test.tsx` |
| AC-DMP-2 | Click Add Widget button (from header) opens picker | P2 | `DashboardModule.picker.test.tsx` |
| AC-DMP-3 | Click Empty State CTA (when widgets is empty registration but rendered for empty state UX) opens picker | P2 | `DashboardModule.picker.test.tsx` |
| AC-DMP-4 | Picker card click → widget appended to order + picker closes + new event emitted | P2 | `DashboardModule.picker.test.tsx` |
| AC-DMP-5 | Picker Cancel click → picker closes, order unchanged, no new event emitted | P2 | `DashboardModule.picker.test.tsx` |
| AC-DMP-6 | Picker ESC → picker closes, order unchanged, no new event emitted | P2 | `DashboardModule.picker.test.tsx` |

#### 9.3.4 AC-EVT-EXT — Event regression (extends §2.6 AC-EVENT-*)

| ID | Description | Phase | File |
|---|---|---|---|
| AC-EVT-EXT-1 | Add Widget button click STILL emits `web:dashboard:add-widget-clicked` with `source: 'add-widget-button'` (legacy preserved) | P2 | `DashboardModule.events.test.tsx` (extend) |
| AC-EVT-EXT-2 | Empty State CTA click STILL emits `web:dashboard:add-widget-clicked` with `source: 'empty-state-cta'` (legacy preserved) | P2 | `DashboardModule.events.test.tsx` (extend) |
| AC-EVT-EXT-3 | Picker card click emits `web:dashboard:widget-added` with `{ widgetId: <id>, source: 'picker' }` | P2 | `DashboardModule.events.test.tsx` (extend) |
| AC-EVT-EXT-4 | Picker Cancel does NOT emit `web:dashboard:widget-added` | P2 | `DashboardModule.events.test.tsx` (extend) |

#### 9.3.5 AC-A11Y — Picker accessibility

| ID | Description | Phase | File |
|---|---|---|---|
| AC-A11Y-1 | `<dialog>` has `aria-labelledby` pointing to the title id | P1 | `AddWidgetPicker.test.tsx` |
| AC-A11Y-2 | Each card is a `<button type="button">` (auto-tabbable, Enter-activatable) | P1 | `AddWidgetPicker.test.tsx` |
| AC-A11Y-3 | Cards have an accessible name = `WIDGET_TITLES[id][lang]` (via button text content or aria-label) | P1 | `AddWidgetPicker.test.tsx` |
| AC-A11Y-4 | Cancel button has accessible name = `dashboard.picker.cancel` per lang | P1 | `AddWidgetPicker.test.tsx` |

### 9.4 Test data fixtures (extension)

```ts
// src/__tests__/__fixtures__/widgets.ts (extend the SHIPPED fixture file)

import type { WidgetRegistration } from "../../types.js";

// Existing fixtures (SHIPPED): makeFixture, THREE_WIDGETS, EMPTY

// New for picker tests — mirrors the row #11 SHIPPED catalog shape
export const TEN_WIDGETS: WidgetRegistration[] = [
  makeFixture("clock",       "w-clock"),
  makeFixture("stat-tasks",  "w-stat"),
  makeFixture("stat-streak", "w-stat"),
  makeFixture("stat-pomos",  "w-stat"),
  makeFixture("weather",     "w-weather"),
  makeFixture("mini-cal",    "w-mini-cal"),
  makeFixture("timezones",   "w-timezones"),
  makeFixture("stickies",    "w-stickies"),
  makeFixture("mail",        "w-mail"),
  makeFixture("upcoming",    "w-upcoming"),
];
```

### 9.5 Mock strategy (extension)

| Surface | Mock | Why |
|---|---|---|
| `<dialog>` HTMLDialogElement | Use real jsdom 26 implementation (no polyfill) | jsdom 26 ships native support — verified via DeleteAccountConfirmModal precedent |
| `dashboardWidgetRegistrations` | NOT used in picker unit tests — use fixture `TEN_WIDGETS` from §9.4 to keep tests independent of row #11 | Decouples picker tests from row #11 catalog shape |
| Wrapper `<WebShellProvider>` for `useWebShell` | NOT needed by picker (it's mounted inside DashboardModule which already receives `lang` as prop) | Picker takes `lang` as a prop, not from context |
| `emitWebEvent` | Real with `onWebEvent` listener spy | Round-trip through bus catches event-shape drift |
| `setPref` / `usePref` | Real with `localStorage.clear()` in beforeEach | Round-trip through codec |

### 9.6 Acceptance signal (this extension, from seed brief + session HC)

> User clicks "Add Widget" → native `<dialog>` picker opens within 100ms.
> Picker shows all SHIPPED widgets from xai-web-dashboard-widgets catalog (currently 10).
> Selecting a widget + Add → widget appears in dashboard at the end; `xai_dash_order` updated; `web:dashboard:widget-added` event emitted.
> Cancel button (or Esc) closes the picker without adding.
> Duplicate prevention: if widget is already on the dashboard, picker hides it.
> All 93 existing xai-web-dashboard-widgets tests + 104 xai-web-dashboard-grid tests still PASS.
> Verify Cross-vendor: Codex cold-read confirms picker keyboard accessibility (Tab navigates cards, Enter selects, Esc closes).

Coverage mapping:
- **Picker opens** → AC-AWP-1 + AC-AWP-2 + AC-DMP-2 + AC-DMP-3
- **Lists all SHIPPED widgets** → AC-AWP-3 (with `currentOrder=[]`)
- **Selecting + add → appended + persist + event** → AC-AWP-6 + AC-AWO-2 + AC-DMP-4 + AC-EVT-EXT-3
- **Cancel / Esc closes without add** → AC-AWP-8 + AC-AWP-10 + AC-DMP-5 + AC-DMP-6 + AC-EVT-EXT-4
- **Duplicate prevention (hide)** → AC-AWP-3 (with `currentOrder` containing some ids) + AC-AWP-4 (all added)
- **Existing tests still pass** → re-run `pnpm --filter @repo/plugin-web-dashboard-grid test` (target: 104 + 26 = 130) + `pnpm --filter @repo/plugin-web-dashboard-widgets test` (target: 93 unchanged)
- **Cross-vendor keyboard a11y** → AC-A11Y-1..AC-A11Y-4 + manual smoke per §11

### 9.7 Lint/types/build expectations (extension)

- `pnpm --filter @repo/plugin-web-dashboard-grid lint` — zero warnings (`--max-warnings 0`)
- `pnpm --filter @repo/plugin-web-dashboard-grid check-types` — clean
- `pnpm --filter @repo/plugin-web-dashboard-grid test` — ~130 tests green
- `pnpm --filter @repo/plugin-web-dashboard-widgets test` — 93 tests green (unchanged)
- `pnpm --filter @repo/core check-types` — clean (EventMap addition)
- `pnpm --filter @repo/plugin-web-tokens check-types` — clean (6 keys × 2 langs)
- `pnpm --filter @repo/web check-types` — clean (no edits to apps/web in this row)
- `pnpm -w build` — clean

### 9.8 Coverage gates (extension)

- `AddWidgetPicker.tsx`: ≥ 95 % statements / ≥ 90 % branches / 100 % functions
- `useDashOrder.ts` (after addWidget extension): keep at 100 % branches for the addWidget path
- `DashboardModule.tsx`: ≥ 90 % statements (overall) including the new picker wire-up

### 9.9 Performance budget

- Picker open: < 100ms from button click to `dialog.showModal()` call (acceptance signal). Measured via Performance API in cross-vendor manual smoke.
- Picker render: 10 cards + 1 cancel button + 1 title = ~12 React nodes; well under 16ms (one frame) in modern browsers.
- No JS-driven animation; CSS handles any transition.

### 9.10 Regression scenarios (this extension)

- **A**: User had drag-reordered widgets before this row shipped. After upgrade, sanitize-on-mount preserves the persisted order; Add Widget button now opens picker; persisted order unchanged.
- **B**: User had 10/10 widgets on dashboard. Add Widget click → picker shows "All widgets are on your dashboard" empty state.
- **C**: User clicks Add Widget, picker opens, user changes lang in another component, picker stays open with previous lang strings until next render (acceptable; lang flow is React state via prop, will rerender on parent rerender — but no special handling needed because `lang` flows through `DashboardModule` props to picker props).
- **D**: User clicks Add Widget, then Esc; clicks Add Widget again — picker reopens cleanly (no stale state in `<dialog>` element).
- **E**: User opens picker, refreshes page mid-modal — picker is closed on reload (pickerOpen is React state, not persisted). Add Widget button still works.

### 9.11 Cross-vendor manual smoke (queued for ship, deferred-24h per ADR-0008 carve-out)

Verifier matrix: Chrome (current) / Firefox (current) / Safari 17+ / Safari iOS — same browsers as §6.

Steps (extension):

1. **Picker open**: navigate `/app/dashboard` → click Add Widget. Verify modal renders within 100ms (subjective; if visible delay, run DevTools Performance to confirm < 100ms).
2. **Picker open from empty state**: clear `xai_dash_order` in DevTools → Application → Local Storage. Reload. Empty state shows. Click CTA → picker opens.
3. **Card click**: with at least one missing widget, click a card. Modal closes. Widget appears at end of grid. Reload page → widget persists.
4. **Cancel**: open picker, click Cancel. Modal closes. Order unchanged.
5. **Backdrop click**: open picker, click outside `.awp-inner` (the dialog backdrop). Modal closes. Order unchanged.
6. **ESC**: open picker, press Esc. Modal closes. Order unchanged.
7. **Tab navigation**: open picker. Tab key navigates first card → second card → ... → Cancel button → wraps to first card. Shift+Tab navigates backward.
8. **Enter on focused card**: open picker, Tab to a card, press Enter. Same effect as click — adds + closes.
9. **All-added empty state**: ensure all 10 widgets are in `xai_dash_order`. Click Add Widget → picker shows "All widgets are on your dashboard" + Cancel only.
10. **Bilingual**: toggle lang to ZH (via Avatar menu). Open picker. All copy is Chinese. Toggle back to EN. Reopen picker. All copy is English.
11. **Light/Dark theme**: toggle theme. Verify picker chrome (dialog background, card borders, text contrast) inverts correctly.
12. **Event listener**: in DevTools Console, listen via `onWebEvent("web:dashboard:widget-added", e => console.log(e))`. Add a widget via picker → see one log entry with `{ widgetId: <id>, source: "picker" }`.
13. **Legacy event still emits**: similarly listen on `web:dashboard:add-widget-clicked`. Click Add Widget button → see one log entry with `{ source: "add-widget-button" }` (modal opens too).

Cross-vendor cold-read (Codex `gpt-5.5-thinking medium` primary, Cursor fallback): inspect `AddWidgetPicker.tsx` source for keyboard accessibility — verify Tab navigates cards, Enter selects, Esc closes (Tab/Enter via native `<button>` semantics; Esc via dialog `cancel` event).

Report file: `docs/reviews/xai-web-dashboard-add-widget-picker/<YYYYMMDD>-cross-vendor-verify.md`.
