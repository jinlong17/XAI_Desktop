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
} from "./types.js";
```

`src/internal/*` is private. Importing from `@repo/plugin-web-dashboard-grid/src/internal/...` is forbidden per CLAUDE.md Code Boundaries.

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

`DashboardSlotHost` is the host wrapper:

```tsx
function DashboardSlotHost() {
  const { lang } = useWebShell();
  const goTo = useCallback((moduleId: string) => {
    emitWebEvent("web:shell:module-change", { moduleId: moduleId as WebModuleId, source: "mini-cal" });
  }, []);
  // In v1, widgets=[]. Row #11's update will replace with
  // `dashboardWidgetRegistrations` imported from @repo/plugin-web-dashboard-widgets.
  return <DashboardModule lang={lang} widgets={[]} goTo={goTo} />;
}
```

The `lang` is read from `useWebShell()` (shipped in row #5). `goTo` is composed locally — it does not need to be passed through props from the host.

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

This is a brand-new package shipping for the first time. No migration. The `xai_dash_order` pref default is row #11's eventual widget set, so first-mount-with-row #10-alone-shipped results in an empty grid (since `widgets=[]`, sanitize drops all default ids). Once row #11 ships and `DashboardSlotHost` is updated to pass `widgets=dashboardWidgetRegistrations`, sanitize-on-mount re-appends them in registration order.

No version bump beyond `0.0.0` (semver-managed by Turborepo).

---

## S13. Error semantics

- `usePref` from `@repo/plugin-web-storage` handles `localStorage` errors internally (quota, disabled storage); the hook returns the default on read failure. Our row delegates to it.
- Duplicate ids in `widgets[]`: `console.warn` in dev only; production silently drops duplicates.
- Failed FLIP measure (`getBoundingClientRect` returns null on detached node): skip animation for that frame; refs are GC'd on unmount.
- Drag aborted by `pointercancel`: same as `pointerup` — drop the floating ghost, restore the dragged widget visibility.
- `goTo("unknown-module")`: emitted with `moduleId: "unknown-module"`; the shell silently ignores unknown ids per its own contract.

No thrown errors from any public API.
