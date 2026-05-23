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
