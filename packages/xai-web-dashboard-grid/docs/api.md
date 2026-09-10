# API Contract — @repo/plugin-web-dashboard-grid

> Companion to `design.md` + `test.md`. ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4.
> **Stability contract**: any breaking change to a `## Public` section below requires an ADR amendment (per ADR-0007 §S4 frozen-assumption 14).

---

## S1. Public exports

```ts
// from "@repo/plugin-web-dashboard-grid"
export { DashboardModule }            from "./DashboardModule.js";     // named + default
export { default }                    from "./DashboardModule.js";
export { dashboardGridSlotRegistration } from "./registration.js";
export type {
  WidgetRegistration,
  WidgetSpanClass,
  WidgetRenderContext,
  DashboardModuleProps,
  DashboardHeaderDepartureGuard,
  DashboardHeaderDepartureGuardRegistration,
} from "./types.js";
```

`src/internal/*` is private. Importing from `@repo/plugin-web-dashboard-grid/src/internal/...` is forbidden per CLAUDE.md Code Boundaries.

`DashboardModuleProps.registerDepartureGuard` is an optional host capability.
It receives a token-bound Header guard with current-owner `isCurrent`, actual
note/device draft `isBlocking`, and explicit export/discard actions. The
package remains standalone when it is omitted; the Web app supplies the shared
departure coordinator and owns route replay and sign-out arbitration.

`DashboardModuleProps.isDeparturePending` and
`DashboardModuleProps.isDepartureTarget` are optional app-owned callbacks for
the Header's blur boundary. The former reports that the host has already
reserved a departure; the latter identifies a pointer target that will request
one during its click turn. They are omitted by standalone callers.

---

## S2. `WidgetRegistration` — the slot contract

```ts
export interface WidgetRegistration {
  /**
   * Stable instance id. Used as key in `xai_dash_order`.
   * Caller-controlled — caller is responsible for uniqueness within the array.
   * For multi-instance widgets, supply distinct ids per instance
   * (e.g. "clock", "clock-shanghai", "clock-london").
   */
  id: string;

  /** Default grid span class. Determines initial CSS grid footprint. */
  span: WidgetSpanClass;

  /**
   * Render function — invoked once per render with the active context.
   * The grid passes lang + now + goTo and otherwise treats the
   * returned ReactNode as opaque.
   *
   * The returned node MUST mark any interactive children (buttons,
   * inputs, popovers, view-switchers) with `data-no-drag` to prevent
   * drag-start interference. See §S4 below.
   */
  render: (ctx: WidgetRenderContext) => ReactNode;

  /**
   * Optional bilingual aria-label for the widget-shell drag handle.
   * If omitted, no aria-label is set on the shell.
   */
  ariaLabel?: { en: string; zh: string };
}
```

### Caller invariants

- Ids in the array MUST be unique. The grid will detect duplicates at mount, drop the second occurrence, and `console.warn` in dev (`import.meta.env.DEV`).
- The `render` callback MUST be a pure function w.r.t. `ctx` (no closure over stale lang/now). It is invoked on every render.
- The `render` return value MAY contain hooks; the grid mounts it as a child of `<WidgetShell>`.

### Grid invariants

- The grid does NOT inspect the rendered children. It does NOT know widget internals.
- The grid does NOT mutate the supplied `widgets` array.
- The grid persists order by `id`. Changes to `span` or `render` do not affect persistence.
- The grid does NOT call `render` for ids absent from `widgets`.

---

## S3. `WidgetSpanClass` — supported grid footprints

```ts
export type WidgetSpanClass =
  | "w-clock"        // large
  | "w-stat"         // 1/3 column small stat card
  | "w-weather"      // 2/3 column
  | "w-mini-cal"     // medium square
  | "w-timezones"    // medium tall
  | "w-stickies"     // medium
  | "w-mail"         // 1/2 column
  | "w-upcoming";    // 1/2 column
```

These are the 8 span classes ported from `web design/module-dashboard.jsx:9-20`. Each is implemented by a CSS rule in `@repo/plugin-web-tokens/src/layout.css` (already shipped via row #2).

If row #11 (or any future row) needs a new span class, it MUST be added here first via this row's ADR amendment, and the corresponding CSS rule added to `layout.css` in row #2's repo. No silent additions.

---

## S4. Drag-exclude contract

To prevent drag-start from interfering with interactive widget UI:

The `WidgetShell` `pointerdown` handler invokes:

```ts
if (event.target.closest("button, input, textarea, [data-no-drag]")) return;
```

before initiating drag. Therefore:

- Buttons, inputs, textareas in widget bodies do NOT need any extra markup — the selector picks them up.
- ANY other interactive element (custom popover trigger, segmented control, view-switcher button group, etc.) MUST be wrapped in or marked with `[data-no-drag]`:

```tsx
<div className="tz-view-toggle" data-no-drag>
  {VIEWS.map(v => <button key={v} ... />)}
</div>
```

Examples from `module-dashboard.jsx` prototype (lines 318, 526, 559, 616, 623, 660, 671, 701, 710): timezone picker, calendar nav arrows, view-toggle buttons.

Row #11 widget authors MUST follow this convention. Tests in row #11 should assert each interactive control is properly excluded.

---

## S5. Persistence contract

### Read

```ts
import { usePref } from "@repo/plugin-web-storage";
const [order, setOrder] = usePref("xai_dash_order");
//      ^ DashWidgetId[]  (= string[])
```

The grid's `useDashOrder(widgets)` hook wraps this and applies sanitize-on-mount per §S6.

### Write

Drag-induced order changes call `setOrder(nextOrder)`. The underlying `setPref` writes to `localStorage` synchronously and notifies listeners (cross-tab BroadcastChannel per `@repo/plugin-web-storage` semantics).

### Registry ownership

- The `xai_dash_order` entry lives in `packages/plugin-web-storage/src/internal/registry.ts:242-249` (already shipped by row #3).
- Owner field: `"xai-web-dashboard-grid"`.
- Default: `["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]` — chosen by row #3's author to match row #11's eventual widget ids.
- This row does NOT modify the registry entry.

---

## S6. Sanitize-on-mount contract (F1 reconciliation)

```ts
function sanitizeOrder(
  persisted: DashWidgetId[],
  registered: WidgetRegistration[]
): DashWidgetId[] {
  const knownIds = new Set(registered.map(w => w.id));
  const seen = new Set<string>();
  const sanitized: string[] = [];

  // Pass 1: keep persisted ids that are registered AND not duplicates.
  for (const id of persisted) {
    if (knownIds.has(id) && !seen.has(id)) {
      sanitized.push(id);
      seen.add(id);
    }
  }

  // Pass 2: append newly-registered ids that weren't in persisted.
  for (const reg of registered) {
    if (!seen.has(reg.id)) {
      sanitized.push(reg.id);
      seen.add(reg.id);
    }
  }

  return sanitized;
}
```

### Invariants

- Output length equals `new Set(registered.map(w => w.id)).size` (i.e. all unique registered ids appear exactly once).
- Output contains no id not in `registered`.
- Output preserves persisted order for ids that survived; new ids are appended in registration order.
- If `sanitized !== persisted` (deep-equal), `useDashOrder` writes `sanitized` back to storage immediately.

### Edge cases

- Empty `persisted` (first visit): `sanitized === registered.map(w => w.id)`.
- Empty `registered` (row #10 ship time, no row #11 widgets): `sanitized === []`. The grid renders the empty state.
- `persisted === [id, id, id_unknown, id]`: dedupe + filter → `[id]`.

---

## S7. Greeting & date helpers

### `pickGreetingKey(now: Date): "dashboard.good_morning" | "dashboard.good_afternoon" | "dashboard.good_evening"`

```ts
const h = now.getHours();           // local timezone
if (h < 12) return "dashboard.good_morning";
if (h < 18) return "dashboard.good_afternoon";
return "dashboard.good_evening";
```

Pure. No side effects. Tested at boundaries 0, 11, 12, 17, 18, 23.

### `formatDashboardDate(now: Date, lang: Lang): string`

```ts
if (lang === "zh") {
  return `${now.getFullYear()} 年 ${now.getMonth()+1} 月 ${now.getDate()} 日 · ${
    ["周日","周一","周二","周三","周四","周五","周六"][now.getDay()]
  }`;
}
return now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
```

Pure. Tested per lang on a fixed `now` (e.g. `new Date(2026, 4, 23, 8, 0, 0)`).

---

## S8. Events emitted

### `web:dashboard:add-widget-clicked` (new — declaration in this row)

```ts
// EventMap delta in packages/core/src/types/events.ts
'web:dashboard:add-widget-clicked': {
  /** Where the click originated. */
  source: 'add-widget-button' | 'empty-state-cta';
};
```

Emitted by:
- The `<DashHeader>` Add-widget button on click — `source: 'add-widget-button'`.
- The `<EmptyState>` CTA button on click — `source: 'empty-state-cta'`.

Consumers: optional. Row #11 may listen and open a widget-picker UI. This row does NOT consume the event.

### `web:shell:module-change` (existing — emit-only via `goTo`)

When a widget calls `goTo(moduleId)` (e.g. MiniCal → calendar), the grid's `DashboardSlotHost` translates to:

```ts
emitWebEvent('web:shell:module-change', {
  moduleId,
  source: 'mini-cal',
});
```

The `'mini-cal'` literal is the agreed source for widget-initiated deep-links per `packages/core/src/types/events.ts:183`. (This is already a declared `'app-rail' | 'mini-cal' | 'shortcut' | 'restore' | 'programmatic'` enum.)

---

## S9. Events listened (none)

This row does not subscribe to any event. Row #11 widgets may subscribe to e.g. `web:shell:module-change` for their own reasons (out of scope here).

---

## S10. Slot registration shape

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

`DashboardSlotHost` is the host wrapper. After row #11 (`@repo/plugin-web-dashboard-widgets`) shipped on 2026-05-24, the wrapper imports `dashboardWidgetRegistrations` and forwards them directly. The `goTo` callback is guarded by a `KNOWN_MODULE_IDS` set so widget-supplied module ids that are not declared in `WebModuleId` are silently dropped before emit (defense-in-depth against typos at the widget boundary):

```tsx
const KNOWN_MODULE_IDS: ReadonlySet<WebModuleId> = new Set<WebModuleId>([
  "tasks", "habits", "pomodoro", "calendar", "matrix", "countdown",
  "settings", "board", "dashboard", "meditation", "statistics", "ai", "search",
]);

export function DashboardSlotHost() {
  const { lang } = useWebShell();

  const goTo = useCallback((moduleId: string) => {
    if (!KNOWN_MODULE_IDS.has(moduleId as WebModuleId)) return;
    emitWebEvent("web:shell:module-change", {
      moduleId: moduleId as WebModuleId,
      source: "mini-cal",
    });
  }, []);

  return <DashboardModule lang={lang} widgets={dashboardWidgetRegistrations} goTo={goTo} />;
}
```

The `lang` is read from `useWebShell()` (shipped in row #5). `goTo` is composed locally — it does not need to be passed through props from the host.

> **v1 history note**: Prior to row #11 (between this row's first ship 2026-05-23 and the row #11 integration 2026-05-24) `DashboardSlotHost` passed `widgets={[]}`, which caused `<DashboardModule>` to render the bilingual empty state. The slot contract (`WidgetRegistration[]`) is unchanged; only the host wiring switched from the empty default to row #11's registrations.

---

## S11. CSS contract

### Class names declared by this row's `src/styles.css`

| Class | Purpose |
|---|---|
| `.dash-empty` | Empty-state panel container |
| `.dash-empty__title` | Empty-state title |
| `.dash-empty__subtitle` | Empty-state subtitle |
| `.dash-empty__cta` | Empty-state CTA button wrapper |
| `.widget-ghost` | Floating dragged-widget layer |
| `.widget-shell.dragging` | Style applied to the source widget while it is being dragged |

### Class names re-used from `@repo/plugin-web-tokens/src/layout.css` (R1 verify-and-reuse)

| Class | Purpose |
|---|---|
| `.module .module-dashboard` | Module root |
| `.dash-head` | Header bar |
| `.dash-greeting` | Greeting headline |
| `.dash-date` | Date subline |
| `.dash-add` | Add-widget button |
| `.dash-grid` | The 12-col grid |
| `.dash-grid.is-dragging` | Grid-wide flag while dragging (cursor styling) |
| `.widget-shell` | Per-widget container |
| `.w-clock`, `.w-stat`, `.w-weather`, `.w-mini-cal`, `.w-timezones`, `.w-stickies`, `.w-mail`, `.w-upcoming` | Span classes |

If during P1/P2 a re-used class is found missing from `layout.css`, this row's `styles.css` declares it minimally. The dev_log §Work Log records each such addition.

### Side-effect CSS import order

`apps/web/src/main.tsx` imports `@repo/plugin-web-tokens` first, then plugin packages. Our `src/styles.css` is loaded via `sideEffects: ["./src/styles.css"]` in `package.json` and re-applies after tokens.

---

## S12. Backward compat / migration

This is a brand-new package, shipped in two integration phases:

1. **2026-05-23 (initial ship)** — `DashboardSlotHost` passed `widgets={[]}`. `sanitize-on-mount` filtered the registry default (`["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]`) against the empty registered set, yielding `[]`; the grid rendered the empty state.
2. **2026-05-24 (row #11 integration)** — `DashboardSlotHost` now passes `widgets={dashboardWidgetRegistrations}` from `@repo/plugin-web-dashboard-widgets`. `sanitize-on-mount` keeps any persisted ids that match row #11's widget set, appends any newly-registered ids in registration order, and writes back to `xai_dash_order` if the sanitized order differs from persisted. Users who interacted with the dashboard during phase 1 had no order entries to persist (empty grid had no draggable shells), so phase 2 first-mount returns the row #11 registration order.

No version bump beyond `0.0.0` (semver-managed by Turborepo). No public-surface change between phases — the contract (`WidgetRegistration[]` prop, `dashboardGridSlotRegistration`, the 4 exported type aliases) is identical.

---

## S13. Error semantics

- `usePref` from `@repo/plugin-web-storage` handles `localStorage` errors internally (quota, disabled storage); the hook returns the default on read failure. Our row delegates to it.
- Duplicate ids in `widgets[]`: `console.warn` in dev only; production silently drops duplicates.
- Failed FLIP measure (`getBoundingClientRect` returns null on detached node): skip animation for that frame; refs are GC'd on unmount.
- Drag aborted by `pointercancel`: same as `pointerup` — drop the floating ghost, restore the dragged widget visibility.
- `goTo("unknown-module")`: emitted with `moduleId: "unknown-module"`; the shell silently ignores unknown ids per its own contract.

No thrown errors from any public API.

---

## S14. 2026-05-25 Extension: Add Widget Picker (gap-closure row #5)

> APPEND-ONLY section. §S1..§S13 above describe the SHIPPED contract; this
> section adds the contract delta for the Add Widget picker per
> `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #5.

### S14.1 Public surface delta

**No change** to `src/index.ts` exports. `AddWidgetPicker` is INTERNAL to the package, mounted only by `DashboardModule`. Per design.md §E2 frozen-assumption #11, the component is not re-exported to keep iteration flexibility.

The four public type aliases (`WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext`, `DashboardModuleProps`) are UNCHANGED.

The slot registration (`dashboardGridSlotRegistration`) is UNCHANGED.

### S14.2 `AddWidgetPicker` props (internal, not exported)

```ts
// packages/xai-web-dashboard-grid/src/AddWidgetPicker.tsx
interface AddWidgetPickerProps {
  /** Whether the modal is currently open. Controlled by DashboardModule. */
  readonly open: boolean;
  /** Active language for bilingual strings. */
  readonly lang: Lang;
  /** Full widget catalog (typically dashboardWidgetRegistrations). */
  readonly widgets: WidgetRegistration[];
  /** Current order — used to filter out already-added ids. */
  readonly currentOrder: readonly string[];
  /** Called when the user picks a widget. DashboardModule calls addWidget + emits + closes. */
  readonly onAdd: (widgetId: string) => void;
  /** Called when the user cancels (ESC, backdrop click, Cancel button). */
  readonly onClose: () => void;
}
```

Invariants:
- `open` controls `dialog.showModal()` vs `dialog.close()` via a single `useEffect([open])`.
- The picker filters `widgets` by `!currentOrder.includes(reg.id)` before rendering cards.
- If the filtered list is empty, the picker renders the `.awp-empty` state instead of `.awp-grid`.
- The picker NEVER calls `onAdd` with an id already in `currentOrder` (UI hint; the source-of-truth dedupe is in `useDashOrder.addWidget`).
- The picker NEVER calls `onAdd` with an id not in `widgets[].id` (UI hint; same).

### S14.3 `useDashOrder` return-shape extension (internal)

Old shape (SHIPPED 2026-05-23):

```ts
function useDashOrder(widgets: WidgetRegistration[]): readonly [
  DashWidgetId[],
  (next: DashWidgetId[]) => void,
];
```

New shape (this extension):

```ts
function useDashOrder(widgets: WidgetRegistration[]): readonly [
  DashWidgetId[],
  (next: DashWidgetId[]) => void,
  (id: string) => void,   // addWidget — appends if not present + not unknown
];
```

`addWidget(id)` semantics:
- If `id` is already in `order`: no-op (returns silently).
- If `id` is not in `widgets.find(w => w.id === id)`: no-op (returns silently).
- Otherwise: calls `setOrder([...order, id])`, which triggers `setPref("xai_dash_order", ...)` synchronously.

This is INTERNAL — `internal/useDashOrder.ts` is not part of the public surface (S1) and may be refactored without an ADR. The tuple extension is non-breaking for the only caller (`DashboardModule.tsx`) because tuple-at-end destructuring (`const [order, setOrder] = ...`) is forward-compatible.

### S14.4 Persistence contract delta

No change to §S5. The picker writes through the SAME `xai_dash_order` registry entry via the SAME `usePref` codec. The new event channel is fire-and-forget metadata, NOT a state-sync mechanism.

### S14.5 Sanitize-on-mount delta

No change to §S6. After Add, the next render's `useFlipReorder` captures the position of the newly appended widget; the FLIP animation slides it in from its initial layout-zero rect. (Or, depending on browser, lastRects is undefined for the new id on first frame → no animation, which is acceptable.)

### S14.6 Events emitted (delta to §S8)

#### `web:dashboard:widget-added` (NEW — declaration + emit in this row)

```ts
// EventMap delta in packages/core/src/types/events.ts
'web:dashboard:widget-added': {
  /** The widget id that was just appended to xai_dash_order. */
  widgetId: string;
  /** Where the add originated. Closed union; v1 has only 'picker'. */
  source: 'picker';
};
```

Emitted by:
- `DashboardModule.handlePickerAdd(id)` immediately after `addWidget(id)` and before `setPickerOpen(false)`.

Consumers: optional. Future rows (statistics, sync, AI suggestion engine) may listen. This row does NOT consume the event.

`widgetId` is intentionally a `string` (NOT a union of the 10 SHIPPED ids) — see discovery review §6 R5. Consumers must defensively handle unknown ids.

`source` is closed union with v1 value `'picker'` — leaves room for future "drag-from-sidebar" or "AI suggestion" sources without a payload-shape break.

#### `web:dashboard:add-widget-clicked` (existing — semantics shift)

Still emitted by the Add Widget button and Empty State CTA on click. NEW: the click now ALSO opens the picker. The event remains a fire-and-forget signal for any listener; if no listener exists, the picker open is the only observable effect.

No payload change.

### S14.7 i18n delta

6 new keys × 2 langs under `dashboard.picker.*` added to `packages/plugin-web-tokens/src/i18n.ts`:

| Key | EN | ZH |
|---|---|---|
| `dashboard.picker.title` | Add a widget | 添加组件 |
| `dashboard.picker.cancel` | Cancel | 取消 |
| `dashboard.picker.all_added_title` | All widgets are on your dashboard | 所有组件已添加 |
| `dashboard.picker.all_added_subtitle` | Remove a widget first to add a different one. | 先移除一个组件后再添加其他组件。 |
| `dashboard.picker.add_button` | Add | 添加 |
| `dashboard.picker.aria_close` | Close picker | 关闭组件选择器 |

> Exact wording may be polished during build; the keys + slots above are stable.

### S14.8 CSS contract delta

New class names declared in `src/styles.css`:

| Class | Purpose |
|---|---|
| `.add-widget-picker` | The `<dialog>` element root |
| `.awp-inner` | Content wrapper inside the dialog |
| `.awp-title` | h2 heading |
| `.awp-grid` | CSS grid of widget cards (`auto-fit, minmax(180px, 1fr)`) |
| `.awp-card` | Per-widget card button |
| `.awp-card__icon` | SVG icon slot |
| `.awp-card__title` | Card title row |
| `.awp-card__desc` | Card description paragraph |
| `.awp-empty` | "All widgets added" empty state container |
| `.awp-empty__title` | Empty state title |
| `.awp-empty__subtitle` | Empty state subtitle |
| `.awp-actions` | Cancel button row |

No re-use of layout.css classes from `@repo/plugin-web-tokens` (the picker chrome is new). Side-effect CSS import order is unchanged.

### S14.9 Stability promise (this extension)

- `web:dashboard:widget-added` payload shape (widgetId: string, source: 'picker') is a STABLE contract. Adding new `source` literals is non-breaking; removing or renaming is breaking and requires an ADR amendment.
- `useDashOrder` return shape (3-element tuple) is INTERNAL — may be refactored without ADR.
- `AddWidgetPicker` props are INTERNAL — may be refactored without ADR.
- The 6 new `dashboard.picker.*` i18n keys are STABLE once shipped — removing/renaming requires migration of all consumers.

### S14.10 Error semantics (delta to §S13)

- `dialog.showModal()` may throw if the dialog is already open (browser-dependent). The picker `useEffect` wraps `showModal()` in `try/catch` per DeleteAccountConfirmModal precedent — already-open is treated as a no-op.
- `dialog.close()` is idempotent across browsers — no try/catch needed.
- `addWidget(id)` for an unknown id: silent no-op. Documented in S14.3.
- `addWidget(id)` for an already-present id: silent no-op. Documented in S14.3.
- Cross-tab race: see discovery review §6 R9. Picker dedupes optimistically; addWidget hook dedupes authoritatively; `xai_dash_order` cross-tab broadcast (SHIPPED via row #3) handles eventual consistency.

No thrown errors from the picker public path.
