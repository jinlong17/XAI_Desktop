# Discovery Review — xai-web-dashboard-grid

> Roadmap row: `docs/workflow/roadmap/xai-web-console.md` row #10 (W2d Module — Dashboard grid container)
> Governing ADR: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map row `module-dashboard.jsx` → predeux split `plugin-web-dashboard-grid` + `plugin-web-dashboard-widgets`)
> Source: `web design/module-dashboard.jsx` lines 1–207 (grid + DnD wrapper section ONLY — widgets in lines 209+ ship in row #11)
> Source PRD: `web design/DESIGN.md` §4.4 + §11
> Authority: ADR-0007 + DESIGN.md SUPERSEDES prior PRDs (user override 2026-05-23)

---

## 1. Problem framing

DESIGN.md §4.4 specifies a Dashboard module composed of:

1. A **12-column responsive widget grid container** that hosts widgets of varying span (`w-clock`, `w-stat`, `w-weather`, `w-mini-cal`, `w-timezones`, `w-stickies`, `w-mail`, `w-upcoming`).
2. **macOS-Stage-Manager-style drag-to-reorder** with FLIP animation 380ms so that when a widget is dragged across another widget, the displaced widgets smoothly slide into their new grid positions.
3. **Widget order persisted to `xai_dash_order`** (already pre-registered in `@repo/plugin-web-storage` `PREF_REGISTRY` with `codec: "json"`, default `["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]`, schemaVersion 1, owner `xai-web-dashboard-grid`).
4. **Responsive breakpoints** per DESIGN.md §11: ≥1400 → 12 cols, 1100–1400 → wider single-col widgets, 760–1100 → 2-col-ish, <760 → single-col stack.

Per ADR-0007 §S4 the dashboard module is **pre-split into two rows**:

- **Row #10 — `xai-web-dashboard-grid` (THIS row)** owns the grid container, FLIP DnD, order persistence, widget-registration slot. It is the foundation for row #11.
- **Row #11 — `xai-web-dashboard-widgets`** (PENDING, depends on this row's API surface via `ready_to_ship`) ships the 8 widget bodies (Clock, MiniCal, WorldClocks, Weather, Stickies, Mail, Upcoming, 3× mini-stats).

This row's **central design problem** is the **widget-registration slot API**: how must the grid expose extension points so that row #11 (and any future widget contributor) can declare:

- a stable widget **id** (used as key in `xai_dash_order`)
- a default **grid footprint** (CSS span class name, e.g. `"w-clock"`, `"w-stat"`)
- a **render function** receiving cross-cutting context (active `lang`, `goTo(moduleId)` deep-link, current `Date` tick)

…without the grid having any knowledge of widget internals (constraint from the feature brief).

A secondary design problem is **order keyed by instance id, not type** (from the feature brief): the registration API must support multiple instances of the same widget type (e.g. two Clock instances pinned to different timezones) and persist their order independently. This requires the registration API to support an explicit instance id distinct from the widget type id.

This row does NOT ship widget bodies. Row #11 does that.

---

## 2. Reference prototype map

| Prototype line | Behaviour | Target file | Phase |
|---|---|---|---|
| `module-dashboard.jsx` 9–20 | `WIDGETS_CONFIG` array — id + span class per widget | `WidgetRegistry.ts` (in this row as the contract definition; row #11 fills with real widgets) | P1 |
| `module-dashboard.jsx` 22–28 | `DashboardModule` shell + greeting tick | `DashboardModule.tsx` | P1 |
| `module-dashboard.jsx` 30–44 | `xai_dash_order` state + persistence | `useDashOrder.ts` hook (calls `usePref("xai_dash_order")` from `@repo/plugin-web-storage`) | P1 |
| `module-dashboard.jsx` 46–68 | FLIP animation via `useLayoutEffect` + `getBoundingClientRect` | `useFlipReorder.ts` hook | P2 |
| `module-dashboard.jsx` 70–130 | Pointer-event drag state + swap-when-over-other-widget detection | `useGridDrag.ts` hook | P2 |
| `module-dashboard.jsx` 132–141 | Greeting + bilingual date string | inlined in `DashboardModule.tsx` (consumes `useI18n(lang)`) | P1 |
| `module-dashboard.jsx` 143–157 | `renderWidgetBody(id)` switch — directly imports widget components | **REPLACED** by slot-style registry lookup (`registry.find(r => r.id === id)?.render(ctx)`) | P1 |
| `module-dashboard.jsx` 159–207 | `<div className="dash-grid">` + per-widget `<div className="widget-shell w-<span> ...">` + ghost overlay | `DashboardGrid.tsx` + `WidgetShell.tsx` + `WidgetGhost.tsx` | P1+P2 |
| `module-dashboard.jsx` 209–776 | All widget bodies (Clock, MiniCal, WorldClocks, Weather, Stickies, Mail, Upcoming, StatTasks, StatStreak, StatPomos) | NOT in this row — row #11 (`xai-web-dashboard-widgets`) | row #11 |

**Layout CSS**: `web design/layout.css` carries the `.dash-grid`, `.widget-shell`, `.w-clock`, `.w-stat`, `.w-weather`, etc. rules. Row #2 (`xai-web-tokens-and-i18n`) already ported `layout.css` as a side-effect import. This row's grid container should be able to reuse those class names; we will verify (R3) that the relevant rules are present in the shipped `layout.css` and either reuse-as-is or add row-scoped overrides.

---

## 3. Decision axes

### Axis A — Widget registration API shape

The grid must expose a registration contract for row #11 to deliver widgets. Three options:

#### A1. Static array of `WidgetRegistration` passed as a prop ✓

```ts
interface WidgetRegistration {
  /** Unique instance id used as key in xai_dash_order. */
  id: string;
  /** Default grid span class (e.g. "w-clock" | "w-stat" | "w-weather" | ...). */
  span: WidgetSpanClass;
  /** Render function — receives lang + tick + goTo. */
  render: (ctx: WidgetRenderContext) => ReactNode;
  /** Optional aria-label for accessibility / drag handle title. */
  ariaLabel?: { en: string; zh: string };
}

<DashboardModule widgets={widgetRegistrations} lang={lang} />
```

- **Pros**: explicit; easy to test; row #11 just exports an array; instance ids are caller-controlled (multi-instance supported naturally — caller supplies `clock-shanghai`, `clock-london` with distinct ids); no global mutable registry.
- **Cons**: the host (`apps/web` shellRegistrations.tsx) must assemble the array. Row #11 will export a default `dashboardWidgetRegistrations: WidgetRegistration[]` ready to drop in.
- **Verdict**: SELECTED. Matches the slot pattern already used by `matrixSlotRegistration` and `calendarSlotRegistration` (row #13/#12) — each row owns its own export, host composes.

#### A2. Imperative `registerWidget(id, span, render)` global registry

- **Pros**: side-effect import like `@repo/plugin-web-shell` icons.
- **Cons**: order of import determines order in registry; testing is order-sensitive; multi-instance support requires a manual de-duplication policy in the registrar; React rendering order vs registration order can drift.
- **Verdict**: REJECTED — fights React's data-flow.

#### A3. React Context provider `<DashboardWidgetProvider>` containing children

- **Pros**: max composability.
- **Cons**: order persistence becomes tightly coupled to React tree structure; FLIP requires stable refs across re-orders which is harder with declarative children than with an array; the `xai_dash_order` register-by-id contract becomes implicit.
- **Verdict**: REJECTED — over-engineered for v1.

### Axis B — DnD technique

Feature-brief hard constraint: **FLIP technique (not HTML5 DnD position snap)**.

#### B1. Port the prototype's pointer-event + `useLayoutEffect` FLIP ✓

The prototype (lines 46–130 of `module-dashboard.jsx`) implements FLIP directly:

1. Each `<div className="widget-shell">` has a ref tracked in `itemRefs.current[id]`.
2. On every render (`useLayoutEffect`), measure current `getBoundingClientRect()` for each widget; compare to last frame's rect; if it moved, set `transition: none; transform: translate(dx,dy)`, force reflow, then set `transition: transform 380ms cubic-bezier(.34, 1.3, .42, 1); transform: ""` to slide the widget back from its inverse-translated start to its real position. This is the FLIP technique.
3. Drag detection is via `pointerdown` / `pointermove` / `pointerup` listeners on `window`; while dragging, position the dragged widget as a fixed-position "ghost" floating with the cursor and continually swap order when the cursor hovers over another widget's bbox.

- **Pros**: matches DESIGN.md §4.4 exactly (380ms cubic-bezier(.34, 1.3, .42, 1) Stage-Manager-style); already proven to work in the prototype; no new deps; visual quality is the explicit feature-brief requirement; ghost layer + `is-dragging` opacity class on the original give the iOS-style "lift" feel.
- **Cons**: a meaningful amount of custom logic (~80 lines) split into a clean `useFlipReorder` + `useGridDrag` pair.
- **Verdict**: SELECTED — mandatory per feature brief.

#### B2. Use a library like `@dnd-kit/sortable` for re-order + animate via library

- **Pros**: less custom code.
- **Cons**: brings new workspace dep; FLIP animation in `@dnd-kit` uses a different cubic-bezier and timing; the visual look is the explicit feature-brief acceptance signal — replacing it costs the look.
- **Verdict**: REJECTED — feature brief mandates FLIP.

#### B3. HTML5 DnD `draggable` + `dragover`

- **Pros**: zero JS work.
- **Cons**: feature brief explicitly forbids this ("not just HTML5 DnD position snap").
- **Verdict**: REJECTED.

### Axis C — Container responsive breakpoints

#### C1. Pure CSS grid + media-query span overrides ✓

The grid renders `display: grid; grid-template-columns: repeat(12, 1fr)` at ≥1400. Each `.widget-shell` carries `.w-<kind>` providing `grid-column: span N` for that kind. Media queries override `grid-template-columns` and individual `.w-*` spans at 1100/760 breakpoints.

- **Pros**: no JS for layout; SSR-friendly; consistent with the rest of the prototype's responsive strategy.
- **Cons**: nothing structural.
- **Verdict**: SELECTED — matches §11.

#### C2. JS-based ResizeObserver re-flow

- **Pros**: continuous re-flow.
- **Cons**: way more code for no visual gain vs CSS grid.
- **Verdict**: REJECTED.

### Axis D — `add widget` button behaviour in v1

Prototype line 166–169 has a `<button className="btn ghost dash-add">+ Add widget</button>`. The button must exist (it's in the design) but in v1 (this row), it has no widget-picker UI — that's a row #11 concern (the widget catalog).

#### D1. Render an inert button + emit `web:dashboard:add-widget-clicked` (new event), declared but not consumed in v1 ✓

- **Pros**: forward-compat; row #11 can listen and open a picker; pattern matches other rows' "declaration-now-consumption-later" approach (e.g. pomodoro session-finished).
- **Cons**: requires adding one EventMap entry to `@repo/core/types/events.ts`.
- **Verdict**: SELECTED.

#### D2. Render the button but with onClick a no-op + TODO comment

- **Pros**: smallest diff.
- **Cons**: leaves a no-op in production code; row #11 then has to wire it anyway.
- **Verdict**: REJECTED.

### Axis E — Multi-instance widget support

Feature-brief constraint: **order persistence keyed by widget INSTANCE id (not type)**.

#### E1. Caller-controlled stable instance ids ✓

The `WidgetRegistration[]` array uses each entry's `.id` as the canonical instance id. The caller (row #11) emits `{ id: "clock", ... }`, or for multi-instance, `{ id: "clock-shanghai", ... }` + `{ id: "clock-london", ... }`. The grid does not invent ids; it persists / reorders only the ids supplied.

- **Pros**: simple; satisfies the constraint; allows row #11 to author its own multi-instance widgets (Future World Clocks could be one widget per timezone instead of one super-widget).
- **Cons**: no automatic id de-duplication — caller must ensure unique ids. Tests will assert this with a dev warning + idempotent recovery (drop duplicate ids on init).
- **Verdict**: SELECTED.

#### E2. Auto-generated instance ids (`type-uuid`)

- **Pros**: cannot collide.
- **Cons**: instance ids become unstable across reloads (random uuid would not match persisted `xai_dash_order`); we'd need an extra mapping layer.
- **Verdict**: REJECTED.

### Axis F — Reconciliation when registered widgets ≠ persisted order

#### F1. Sanitize-on-mount with three rules ✓

1. **Drop unknown ids**: if `xai_dash_order` contains an id not present in `widgets`, drop it from the order.
2. **Append missing ids**: if `widgets` contains an id not in `xai_dash_order`, append it to the end (preserving registration order between newly-added widgets).
3. **De-duplicate**: if the persisted order has the same id twice, keep the first occurrence and drop the rest.

The result becomes the working order; if it differs from the persisted value, write the sanitized version back via `setPref` immediately. This is the same sanitization shape used by `xai-web-shell`'s `xai_rail_order` reconciliation.

- **Pros**: graceful migration when row #11 adds/removes widget types in future iterations.
- **Cons**: nothing.
- **Verdict**: SELECTED.

#### F2. Hard-reset to default on mismatch

- **Pros**: simpler.
- **Cons**: throws away user's customisation on the slightest registry change — terrible UX.
- **Verdict**: REJECTED.

### Axis G — Empty state

The grid must render gracefully when `widgets` is empty (true at row #10 ship time — row #11 hasn't shipped yet). The acceptance signal says "Dashboard route renders an empty grid, can host 3 dummy widget placeholders".

#### G1. Empty placeholder with bilingual call-to-action ✓

When `widgets.length === 0`, render `<div className="dash-empty">` with bilingual text "No widgets yet — install dashboard-widgets to get started" / "暂无组件 — 安装 dashboard-widgets 即可开始" and a copy of the `+ Add widget` button. The empty state IS the v1 visible product when this row ships solo before row #11.

- **Pros**: meets acceptance signal; gives row #11 a concrete render target; communicates state to user.
- **Cons**: requires 2 new i18n keys (verbatim list in §5).
- **Verdict**: SELECTED.

### Axis H — Drag handle vs whole-widget pointerdown

#### H1. Whole widget-shell is the drag handle, with selector-based excludes ✓

Match the prototype line 181–186: `onPointerDown` starts drag unless `e.target.closest("button, input, textarea, [data-no-drag]")`. Widget bodies that need internal interactivity (like the timezone picker, calendar nav arrows) carry `data-no-drag` on the relevant inner element.

- **Pros**: matches the prototype's UX; row #11 widgets need only mark their interactive bits.
- **Cons**: requires row #11 to be aware of the convention. Documented in §S4 of this row's `api.md`.
- **Verdict**: SELECTED.

#### H2. Explicit `.drag-handle` element required per widget

- **Pros**: explicit.
- **Cons**: bigger visual chrome; doesn't match the prototype; row #11 widget authors would have to add an extra dom element each.
- **Verdict**: REJECTED.

---

## 4. Recommendation

Implement a **3-phase port** of `module-dashboard.jsx`'s grid+DnD wrapper section as `@repo/plugin-web-dashboard-grid` at `packages/xai-web-dashboard-grid/`, using:

- **A1** typed `WidgetRegistration[]` slot API (caller supplies array → grid renders order)
- **B1** ported FLIP + pointer-event DnD with 380ms cubic-bezier(.34,1.3,.42,1) timing
- **C1** pure-CSS grid + media-query breakpoints
- **D1** declared `web:dashboard:add-widget-clicked` event (declaration-now-consumption-later)
- **E1** caller-controlled instance ids
- **F1** sanitize-on-mount reconciliation
- **G1** bilingual empty state when no widgets are registered
- **H1** whole-widget-shell pointerdown with `data-no-drag` exclude selector
- Persistence via existing `usePref("xai_dash_order")` (already registered in row #3)
- Slot registration as `dashboardGridSlotRegistration: WebModuleSlotRegistration` consumed by `apps/web/src/routes/modules/shellRegistrations.tsx` (replacing the existing `placeholder("dashboard", ...)` row at line 60)

**Public surface (frozen):**

```ts
// @repo/plugin-web-dashboard-grid
export { DashboardModule } from "./DashboardModule.js";          // default + named
export { dashboardGridSlotRegistration } from "./registration.js";

// API for row #11 (xai-web-dashboard-widgets) to consume:
export type {
  WidgetRegistration,         // { id, span, render, ariaLabel? }
  WidgetSpanClass,            // "w-clock" | "w-stat" | "w-weather" | "w-mini-cal" | "w-timezones" | "w-stickies" | "w-mail" | "w-upcoming"
  WidgetRenderContext,        // { lang, now, goTo }
  DashboardModuleProps,       // { lang; widgets: WidgetRegistration[]; goTo?: ... }
} from "./types.js";
```

The exported types are the **stable contract** that row #11 will consume. After this row ships, no breaking change to these names is permitted without an ADR.

---

## 5. Concrete deltas to land

### 5.1 `packages/xai-web-dashboard-grid/` (NEW package)

- `package.json` — name `@repo/plugin-web-dashboard-grid`, ESM, `"sideEffects": ["./src/styles.css"]`, peerDeps on React 19.
- `tsconfig.json` — extends `@repo/typescript-config/react-library.json`.
- `manifest.json` — module id `dashboard`, surface `web`.
- `src/types.ts` — `WidgetRegistration`, `WidgetSpanClass`, `WidgetRenderContext`, `DashboardModuleProps`, `WidgetGridDragState`.
- `src/DashboardModule.tsx` — module composition: header (greeting + add-widget button) + grid + ghost.
- `src/DashboardGrid.tsx` — the `<div className="dash-grid">` mapping ordered ids to `<WidgetShell>` instances.
- `src/WidgetShell.tsx` — per-widget `<div className="widget-shell w-<span>">` carrying ref + pointerdown handler + `is-dragging` class.
- `src/WidgetGhost.tsx` — the floating `<div className="widget-ghost">` that follows the cursor.
- `src/DashHeader.tsx` — greeting (`s("dashboard.good_morning"|…)`) + date string + `Add widget` button (emits `web:dashboard:add-widget-clicked`).
- `src/EmptyState.tsx` — bilingual "no widgets yet" panel.
- `src/internal/useDashOrder.ts` — wraps `usePref("xai_dash_order")` + sanitize-on-mount per F1.
- `src/internal/useFlipReorder.ts` — `useLayoutEffect` measuring + applying 380ms FLIP transforms.
- `src/internal/useGridDrag.ts` — pointer-event drag state + swap-when-over-other-widget detection.
- `src/internal/greeting.ts` — pure helpers: `pickGreetingKey(now)`, `formatDashboardDate(now, lang)`.
- `src/styles.css` — grid layout + widget-shell + ghost + responsive breakpoints (or stub if `layout.css` already covers everything — see R3).
- `src/registration.tsx` — `dashboardGridSlotRegistration: WebModuleSlotRegistration` + `DashboardSlotHost` wrapper reading `useWebShell()`.
- `src/index.ts` — public surface (types + components + registration).
- `src/__tests__/*` — Vitest suites per `test.md`.

### 5.2 `apps/web/src/routes/modules/shellRegistrations.tsx` (1 line swap + 1 import)

```diff
+ import { dashboardGridSlotRegistration } from "@repo/plugin-web-dashboard-grid";
...
-  placeholder("dashboard",  "Dashboard",  "layout",    4),
+  dashboardGridSlotRegistration,
```

### 5.3 `apps/web/package.json` (1 dep line — Edit, not Write)

```diff
+    "@repo/plugin-web-dashboard-grid": "workspace:*",
```

### 5.4 `packages/core/src/types/events.ts` (1 EventMap entry, declaration-only)

```ts
'web:dashboard:add-widget-clicked': {
  /** Where the click originated. */
  source: 'add-widget-button' | 'empty-state-cta';
};
```

### 5.5 `packages/plugin-web-tokens/src/i18n.ts` (4 keys × 2 langs additive — `dashboard.empty_title`, `dashboard.empty_subtitle`, `dashboard.empty_cta`, `dashboard.add_widget_aria`)

- `dashboard.empty_title`: EN "No widgets yet" / ZH "暂无组件"
- `dashboard.empty_subtitle`: EN "Install dashboard widgets to get started." / ZH "安装 dashboard-widgets 后即可开始。"
- `dashboard.empty_cta`: EN "Add widget" / ZH "添加组件" (re-uses existing `dashboard.add_widget` if identical — confirmed: identical, so this key is REDUNDANT and we will NOT add it. NET: 3 keys × 2 langs.)
- `dashboard.add_widget_aria`: EN "Add a new dashboard widget" / ZH "添加新的工作台组件"

After deduping with existing keys, **net new i18n: 3 keys × 2 langs = 6 string additions**.

### 5.6 NO change to `packages/plugin-web-storage` (already done)

`xai_dash_order` is already in `PREF_REGISTRY` (registry.ts line 242–249, owner `xai-web-dashboard-grid`). Default order is currently `["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]` — note this is row #11's eventual widget ids, set during row #3 by anticipation. Row #11 will register widgets matching these ids. This row only reads/writes the array — it does NOT redefine the default.

### 5.7 NO change to `packages/xai-web-shell` (already done)

The shell already exposes `WebModuleSlotRegistration` with `moduleId: "dashboard"` placeholder. We swap it out in `shellRegistrations.tsx` (5.2). The shell's `"layout"` icon is already in `WebShellIconName`.

---

## 6. Risks & mitigations

### R1. Cross-row layout.css duplication

The prototype's `layout.css` (already shipped via row #2 `@repo/plugin-web-tokens`) presumably contains `.dash-grid` + `.widget-shell` + `.w-clock` + ... rules. If those rules are already present, our `styles.css` should NOT duplicate them; we add only row-specific additions (e.g. `.widget-ghost` if not present, `.is-dragging` modifier, `data-no-drag` styling).

**Mitigation**: grep `layout.css` for the relevant class names during P1; if a rule is already present, comment in `styles.css` that we intentionally do not redeclare; if NOT present, declare it minimally. Verify side-effect ordering: ensure `@repo/plugin-web-tokens` (which imports `layout.css`) is imported before our `styles.css`, achievable because the host imports both via workspace deps.

### R2. FLIP animation jank on first paint

If the FLIP `useLayoutEffect` runs before refs are wired (first render, refs map is empty), the comparator can skip too many animations.

**Mitigation**: gate the FLIP logic on `lastRects.current[k]` being defined (which the prototype already does at line 54). First render seeds `lastRects` without animating — subsequent renders animate from the seeded baseline. Add a test that mounts the module then re-renders with a swapped order and asserts the inverse-translate-then-clear sequence.

### R3. Pointer-event drag broken on mobile / touch

The prototype uses `pointerdown` / `pointermove` / `pointerup` which is touch-compatible per spec. However:
- iOS Safari requires `touch-action: none` on the draggable element to disable native scroll capture.
- Mobile breakpoints (<760) collapse the grid to single-column, where re-ordering is less meaningful but still possible.

**Mitigation**: add `touch-action: none` to `.widget-shell` via CSS. Add a Vitest jsdom-friendly test that asserts the pointerdown handler is attached (since jsdom does not synthesize PointerEvents reliably, full drag simulation will live in the manual cross-vendor verify step rather than unit tests).

### R4. Order persistence race when sanitize-on-mount writes back to storage

If `usePref` returns the persisted value asynchronously, an early sanitize-on-mount could write the wrong value back.

**Mitigation**: `usePref` from `@repo/plugin-web-storage` is synchronous on read (reads localStorage in `useState` initializer). So no race. Test: `useDashOrder.test.ts` verifies that supplying a stale persisted order containing unknown ids correctly drops them on mount.

### R5. Multi-instance widget id collisions

Caller-supplied instance ids could collide (e.g. two widgets registered with `id: "clock"`).

**Mitigation**: at mount time, detect duplicate ids in the supplied `widgets` array → emit `console.warn` in dev (`if (import.meta.env.DEV)`) + drop the second occurrence + skip persistence write for the duplicates. Document this in `api.md` §S2 as "Caller invariant". Vitest test: registry with duplicate ids → de-dup behaviour + warn assertion.

### R6. `data-no-drag` selector forgotten in row #11 widgets

If row #11 ships widget bodies with buttons/inputs that lack the `data-no-drag` attribute (or are missed by the prototype's `closest("button, input, textarea, [data-no-drag]")` selector), starting drag on those interactive parts will prevent normal click/input.

**Mitigation**: row #11's `feature-plan` MUST reference this row's `api.md` §S4 ("Drag-exclude contract"). Document the exclude selector explicitly. Add to row #11's seed brief as a known constraint.

### R7. Empty grid rendering in v1 (no widgets in WidgetRegistration[])

When this row ships solo (before row #11), `dashboardGridSlotRegistration` is wired but the host doesn't yet have widget registrations. We must render the empty state, not break.

**Mitigation**: G1 already handles this. Test: `DashboardModule` with `widgets={[]}` renders the empty state, no console errors, no FLIP attempts.

### R8. Concurrency with sibling rows #7 (board-core) + #20 (statistics)

This row's `shellRegistrations.tsx` edit is on line 60 (swap `placeholder("dashboard", ...)`); board-core's edit is on line 58 (`placeholder("board", ...)`); statistics' edit is on line 71 (`placeholder("statistics", ...)`). Distinct anchors — Edit-tool replace should not conflict if each row uses unique surrounding context.

**Mitigation**: use the full anchor line `placeholder("dashboard",  "Dashboard",  "layout",    4),` as old_string for Edit (unique to this row). Use git lock retry per orchestrator policy (8-20s × 5). Each row's `apps/web/package.json` dep-line append uses a distinct package-name anchor.

### R9. Schema mismatch with row #3 pre-registered `xai_dash_order` codec

`xai_dash_order` is declared with `codec: "json"`, `default: ["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]`, schemaVersion 1. The default is **row #11's expected widget ids**, anticipated by row #3's author. This row reads/writes the array but does NOT redefine the registry default — that's row #3's responsibility.

**Mitigation**: this row does NOT touch `packages/plugin-web-storage/src/internal/registry.ts`. Read-only consumer of the pref. Document this in `api.md` §S5.

### R10. Greeting bands tied to local timezone

`pickGreetingKey(now)` uses `now.getHours()` (local timezone). Acceptable for v1 — DESIGN.md doesn't specify timezone for greeting band detection, and the alternative (UTC) would mis-greet most users.

**Mitigation**: documented. Test: `pickGreetingKey(new Date('2026-05-23T08:00:00'))` returns `'dashboard.good_morning'` in the test runner's local timezone (with a clamp test for hour boundaries 0/12/18/23).

---

## 7. Open questions

### Q1. Does row #11 (`xai-web-dashboard-widgets`) consume the slot API as a static `dashboardWidgetRegistrations: WidgetRegistration[]` array, or via a hook that depends on lang/now?

**A**: Per this row's recommendation (Axis A1), row #11 must export a static `dashboardWidgetRegistrations: WidgetRegistration[]` array. Each entry's `render` function receives the `WidgetRenderContext` containing `lang`, `now`, `goTo` — the render function itself can use those to derive locale-dependent output without needing a hook.

### Q2. Is `xai_dash_order` already mounted in `PREF_REGISTRY`, and if so, does its default match the eventual widget set?

**A**: Yes — already mounted with default `["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"]` (registry.ts line 242–249). 8 ids. This row treats those ids as opaque strings; row #11 will be responsible for registering widgets matching them.

### Q3. Should row #10 ship a `goTo(moduleId)` plumbing, or wait for row #11 (since the only consumer is the MiniCal widget's "open calendar" deep-link)?

**A**: row #10 must declare the `goTo` field in `WidgetRenderContext` so row #11 can use it. The wiring source (the actual function passed in) is `useWebShell()`'s navigation primitive — already shipped in row #5. `DashboardSlotHost` (in `registration.tsx`) reads `useWebShell()` and passes a `goTo` callback that emits `web:shell:module-change` per existing convention.

### Q4. What happens when the user reloads with a `xai_dash_order` containing an id that row #11 has NOT yet registered (e.g. row #10 ships now with empty widgets, the user touches nothing, persisted default `["clock",...,"stats"]` is in localStorage; row #11 ships later registering 8 widgets)?

**A**: F1 sanitize-on-mount + the default order already matching row #11's eventual ids handles this gracefully:
- On row #10 ship time alone: `widgets = []`, persisted order = the default `["clock",...,"stats"]` (or whatever the user landed last). After sanitize: all ids dropped (none in widgets), working order = `[]`, write back `[]` → empty grid renders.
- After row #11 ships: persisted order = `[]` (from above) OR initial default if never touched. `widgets` now contains 8 entries. After sanitize: 0 known existing in persisted + 8 new appended = order `["clock","minicalendar",...,"stats"]` (registration order). Grid renders.
- Migration is graceful in both directions.

### Q5. Is `add-widget` button persistence/state in scope?

**A**: No. The button emits an event. Row #11 will (eventually) consume it. v1 click just fires the event — no UI side-effect in this row.

---

## 8. Frozen Assumptions (lock for design.md §1.1)

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
15. **`@repo/plugin-web-storage` codec usage**: `usePref("xai_dash_order")` returns `[DashWidgetId[], (next: DashWidgetId[]) => void, PrefMeta]`. We do NOT alias `DashWidgetId = string` — it's already `type DashWidgetId = string` upstream.

---

## 9. External research

No external research required (no library selection — pure DOM + React + the workspace bus). All technique decisions ported from the existing prototype.

---

## 10. Sibling concurrency note

This row is one of three W2d parallel-dispatched feature loops (alongside row #7 `xai-web-board-core` + row #20 `xai-web-statistics`). Shared anchor edits:

- `apps/web/src/routes/modules/shellRegistrations.tsx` — distinct anchors per row (each `placeholder("<id>", ...)` line is unique).
- `apps/web/package.json` — distinct package-name anchors per row.
- `packages/core/src/types/events.ts` — board-core adds `web:board:*` channels; this row adds `web:dashboard:add-widget-clicked`; statistics is listen-only. No naming clash.
- `packages/plugin-web-tokens/src/i18n.ts` — board-core touches `nav.board.*` block; this row touches the existing `dashboard.*` block (additive keys); statistics touches `nav.statistics.*` + new `statistics.*` block. Different keys.

Concurrency policy: **Edit (not Write) for shared files; unique anchor; retry git lock 8-20s × 5 per dispatcher header**.
