# Discovery Review — xai-web-dashboard-add-widget-picker

> Feature: `xai-web-dashboard-add-widget-picker`
> Roadmap row: `docs/workflow/roadmap/xai-web-console-gap-closure.md` row #5 (W1 — last row of wave 1)
> Seed brief: `docs/reviews/xai-web-dashboard-add-widget-picker/20260524-roadmap-seed.md`
> Parent ADR: ADR-0009 §D2-G3 (P0 gap-closure, 5/7-of-9 P1-launch gate)
> Target packages: `packages/xai-web-dashboard-grid/` + `packages/xai-web-dashboard-widgets/` (both SHIPPED, extend in place)
> Discovery date: 2026-05-25
> Executor: Claude Opus 4.7 (1M context) — feature-plan
> Dispatched by: xai-roadmap-loop SERIAL dispatch (LAST row of W1)

---

## 1. Problem framing

### 1.1 What's broken today

Row #10 (xai-web-dashboard-grid) shipped the `<DashHeader>` "Add widget" button + the `<EmptyState>` CTA button on 2026-05-23. Both buttons emit `web:dashboard:add-widget-clicked` with `source: 'add-widget-button'` or `source: 'empty-state-cta'` — and then **nothing happens**. No listener exists; no widget-picker UI is mounted. The event is a stub for downstream wire-up that never landed.

Row #11 (xai-web-dashboard-widgets) shipped the 10-entry `dashboardWidgetRegistrations` array on 2026-05-23 and was integrated into `DashboardSlotHost` on 2026-05-24. The grid currently mounts ALL 10 widgets on first visit (because `xai_dash_order` registry default seeds all 10 ids — see `packages/plugin-web-storage/src/internal/registry.ts:242-249`). Users have NO way to:

1. Remove a widget from the dashboard, and
2. Re-add a widget after they figure out a way to remove one (e.g. by editing `xai_dash_order` via DevTools).

Adding the picker is half of "user-customizable dashboard". A future row (out of scope here) will add a "Remove" affordance on each `<WidgetShell>`.

### 1.2 Why this row matters

Per ADR-0009 §D2-G3, the P1 Desktop launch gate requires ≥5 of the 7 known-gap categories to SHIP. Gap 5 (this row) is the **smallest** of the 7 gaps but blocks the gate count. Shipping it as wave-1's last row also completes the W1 ship batch (rows #2 / #3 / #4 already SHIPPED 2026-05-25; this row closes the wave so W2 can start planning).

### 1.3 In scope vs out of scope

| In | Out |
|---|---|
| Native `<dialog>` modal that opens on Add Widget click | Removing a widget from the dashboard |
| Lists all SHIPPED widgets from `dashboardWidgetRegistrations` | A "widget gallery" with categories / search |
| Appends widget id to `xai_dash_order` on selection | Custom widget instances (e.g. two clocks at different tzs) |
| Filters out already-added widgets (hide pattern) | Per-widget preview thumbnails that render the live widget |
| Emits new typed event `web:dashboard:widget-added` on success | Drag-from-picker-to-grid interaction |
| Keyboard accessibility: Tab/Enter/Esc | Mobile-specific picker layout (desktop-first; mobile inherits) |
| All 93 widgets + 104 grid tests stay green | Visual cross-vendor verify in 4 browsers (deferred-24h per ADR-0008) |

### 1.4 Constraints (locked in by seed brief HC1..HC10 + this session HC7-HC10)

1. **Native `<dialog>` modal** (HC1) — pattern from `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx` (uses `showModal()` + `close()` + ESC handler + backdrop click cancel).
2. **Reuse the widget catalog** (HC2) — import `dashboardWidgetRegistrations` from `@repo/plugin-web-dashboard-widgets`; do NOT introduce a parallel registry.
3. **Replace existing button click handler** (HC3) — the picker REPLACES the current emit-only handler in `<DashHeader>` + `<EmptyState>`. The legacy `web:dashboard:add-widget-clicked` event STAYS (declaration intact; the modal still emits it for backward compatibility with any listener that might appear later), but its NEW behavior is "open the picker".
4. **Persistence via existing `xai_dash_order`** (HC4) — append the selected id; do NOT introduce a new storage key. Persistence happens through the same `useDashOrder` path used by drag-reorder.
5. **Picker UI shape** (HC5) — grid of widget cards (icon + title + description), no category filter for v1 because **the current widget catalog has NO category metadata** (see §3.1 "What's reusable"). Cards are simple/flat; styling matches existing dashboard tokens.
6. **P0 work + cross-vendor verify mandatory** (HC6) — per ADR-0009 D4; deferred-24h cold-read OK per ADR-0008 carve-out.
7. **Append-only dev_log lineage** (HC7) — new "Bugfix-Extension Lineage — gap-closure row #5 (2026-05-25)" block appended to `packages/xai-web-dashboard-grid/docs/dev_log.md`; existing SHIPPED Status Panel preserved verbatim. Same pattern as rows #2 / #4.
8. **Do NOT skip Step 0** (HC8) — seed brief at `docs/reviews/xai-web-dashboard-add-widget-picker/20260524-roadmap-seed.md` is Step 0 input.
9. **NO new localStorage keys** (HC9) — `xai_dash_order` is the only storage surface this row touches.
10. **NO third-party modal library** (HC10) — native `<dialog>` only.

---

## 2. External research (gating decision)

**Verdict: no external research required.**

This row is a pure-internal UI assembly:

- The widget catalog is in-house (`dashboardWidgetRegistrations`).
- The modal element is web-native HTML (`<dialog>`).
- No third-party dependency is being added (HC10 forbids modal libraries).
- No CSP widening, no OAuth flow, no payment provider — none of the external-research triggers that the discovery-review SOP calls out.

The only "research" performed:

- Cross-checked DeleteAccountConfirmModal.tsx as the in-house native-`<dialog>` precedent (no need to invent the pattern).
- Verified `HTMLDialogElement.showModal` / `close` / `cancel` / `onClick(backdrop)` are baseline-supported across Chrome / Firefox / Safari / Edge — but since the seed brief already locks "native dialog modal (same pattern as Settings panes)" and `DeleteAccountConfirmModal` is already SHIPPED in production, no new compatibility evidence is needed.

---

## 3. Existing-code discovery

### 3.1 What's reusable

| Asset | Path | Why we re-use it |
|---|---|---|
| Native `<dialog>` pattern | `packages/plugin-web-settings-rest/src/internal/DeleteAccountConfirmModal.tsx` | `showModal()` / `close()` / backdrop-click cancel / aria-labelledby + aria-describedby template |
| Widget catalog | `packages/xai-web-dashboard-widgets/src/registrations.tsx` (export `dashboardWidgetRegistrations`) | 10 SHIPPED widgets with `id`, `span`, `render`, `ariaLabel: { en, zh }` |
| Type contract | `packages/xai-web-dashboard-grid/src/types.ts` — `WidgetRegistration` | Same shape the picker will iterate; no new type needed |
| Persistence path | `packages/xai-web-dashboard-grid/src/internal/useDashOrder.ts` | Already wraps `usePref("xai_dash_order")` + sanitize-on-mount; the picker just needs a `setOrder` callback |
| Event bus | `@repo/xai-web-event-bus` + `packages/core/src/types/events.ts` | `web:dashboard:add-widget-clicked` already declared; adding `web:dashboard:widget-added` is one EventMap entry |
| i18n bundle | `packages/plugin-web-tokens/src/i18n.ts` — `dashboard.*` namespace | Has `add_widget`, `add_widget_aria`, `empty_title`, `empty_subtitle`, `hello`, `good_morning|afternoon|evening`. New keys needed for picker UI |
| Bilingual ariaLabel on each widget | `dashboardWidgetRegistrations[i].ariaLabel = { en, zh }` | Already supplies the "title" string per lang — picker card title can reuse this |

### 3.2 What's missing / NEW

| Missing surface | Why | How to add |
|---|---|---|
| Widget **category** metadata | The catalog has no category field. HC5 suggested "filterable by category" but only IF widgets have categories. Verdict: NO category filter in v1 — show flat grid of all widgets. | Defer category metadata to a future row (would require co-edit on row #11 + an ADR amendment per row #11 api.md §S2 stability rule). |
| Widget **description** copy | Each catalog entry has `ariaLabel` (~3 words) but no longer description. The picker card design wants 1 short sentence per widget. | Add a 10-key × 2-lang bilingual map (`add_widget_picker.desc.<id>`) in `plugin-web-tokens/src/i18n.ts`. Alternatively, an inline `WIDGET_DESCRIPTIONS` constant in the picker file — discoverable change here only, no cross-row sync. **Decision (frozen below):** inline constant in the picker, NOT i18n bundle, to keep the change file-local. |
| Widget **icon** for the card | `ariaLabel` is text only; no icon glyph in the catalog | Use a small mapping `id → icon name` inside the picker file (PlusIcon-style inline SVGs), 10 icons total. Defer to a future row if we want to share icons with the actual rendered widget. |
| `<AddWidgetPicker />` component | New | New file `packages/xai-web-dashboard-grid/src/AddWidgetPicker.tsx` (whole-component public surface optional — see §6) |
| `web:dashboard:widget-added` event | New | One EventMap entry in `packages/core/src/types/events.ts` |
| Hook-up in `DashboardModule` | Existing `onAddWidget` callback already wired in P1 of row #10; needs to flip from `emitWebEvent(...)` to `setPickerOpen(true)` | Edit `DashboardModule.tsx` to own picker open state; pass open/onClose into `<AddWidgetPicker />` |

### 3.3 What's untouched

- The drag-to-reorder pipeline (`useFlipReorder`, `useGridDrag`, `useDashOrder`, `sanitizeOrder`) — picker doesn't change drag semantics.
- The slot registration (`dashboardGridSlotRegistration`) — picker mounts inside the existing `DashboardModule`; no rail / route change.
- Row #11 widget bodies — they keep their `render(ctx)` contract; picker only displays cards based on `id` / `span` / `ariaLabel`.
- The `web:dashboard:add-widget-clicked` event — kept as declaration-only legacy channel (still emitted by the picker open path for any listener that might subscribe, so we don't silently break that channel's contract).

---

## 4. Candidate options

For this small row, the genuine decision axes are: **(A)** where the picker lives, **(B)** how the picker is shown / hidden, **(C)** how it filters duplicates, **(D)** how categories are handled, **(E)** how the picker writes back to `xai_dash_order`, **(F)** how the new event is wired.

### 4.1 Axis A — Where does `<AddWidgetPicker />` live?

| Option | Pros | Cons |
|---|---|---|
| **A1: inside `xai-web-dashboard-grid`** (chosen) | Grid already deps on `xai-web-dashboard-widgets` (catalog source); grid already deps on `xai-web-event-bus` (new event); grid owns the persistence path; grid owns the buttons that open the modal | Adds a moderately-sized component to grid (~150 LOC). Grid is "container" semantically, not "picker", so there's a mild scope drift. |
| A2: inside `xai-web-dashboard-widgets` | Catalog ownership locality | Would require widgets to dep on `xai-web-event-bus` (it doesn't today) AND on `xai-web-dashboard-grid` (already a workspace dep); would introduce additional circular-export complexity (widgets exports the picker, grid imports the picker); modal-open state would need an event channel to traverse package boundary (overkill) |
| A3: new `packages/xai-web-dashboard-picker/` | Clean SRP | Adds package overhead (package.json, tsconfig, manifest, tests scaffolding) for one component; new PLUGIN_MAP entry; row #5 is supposed to be the smallest of the W1 batch — a new package contradicts that |

**Decision: A1.** Grid is already the owner of the Add-widget button + the persistence path. Co-locating the picker keeps the "open button → show modal → write order → close modal" loop in a single package. The component's footprint (~150 LOC) is small enough to not justify a new package.

### 4.2 Axis B — Modal show/hide mechanism

| Option | Pros | Cons |
|---|---|---|
| **B1: native `<dialog>` + `showModal()` + React state-driven `useEffect`** (chosen, per HC1) | Locked in by seed brief HC1 + this session HC10; matches DeleteAccountConfirmModal precedent; baseline browser support; native ESC handling + focus-trap + backdrop | None — locked by HC |
| B2: portal-based React modal (e.g. `createPortal` + custom focus-trap) | More layout flexibility | Reinvents what `<dialog>` provides natively; more code to test (focus-trap edge cases); HC10 forbids 3rd-party modal library so we'd have to roll our own |
| B3: inline overlay (non-modal) | Simplest | Not a modal — fails the seed brief's "modal Add-Widget picker" requirement; breaks focus/keyboard expectations |

**Decision: B1.** Locked by HC1+HC10. Pattern verbatim from DeleteAccountConfirmModal:
- `dialogRef.current.showModal()` when `open === true`
- `dialogRef.current.close()` when `open === false`
- Backdrop click (`e.target === dialogRef.current`) calls `onCancel`
- The native `<dialog>` handles ESC → fires `cancel` event → we map to `onClose`

### 4.3 Axis C — Duplicate prevention strategy

| Option | Pros | Cons |
|---|---|---|
| **C1: hide already-added widgets** (chosen, recommended by HC5) | Simplest UX; smallest code; no disabled-state styling needed | If the picker shows all 10 and 10 are already added, the picker shows "all widgets already added" empty state |
| C2: show all, disabled "Already added" state on duplicates | Discoverability — user sees the full catalog | More UI states (disabled card style); aria-disabled + tabindex management; more tests |
| C3: hide-but-show-count | Mix of both | Complex UX; unclear value |

**Decision: C1.** Recommended by the seed brief and HC5. When all widgets are added, the picker shows a bilingual "All widgets are on your dashboard" empty state with a Cancel button only.

### 4.4 Axis D — Category filtering

| Option | Pros | Cons |
|---|---|---|
| **D1: no category filter in v1** (chosen) | Catalog has no category metadata; adding categories requires co-edit on row #11 + ADR amendment; this row is supposed to be smallest of W1 | Picker is a flat grid; if catalog grows beyond ~15 widgets, scroll becomes long |
| D2: add `category` field to `WidgetRegistration` + 10 categorizations + filter UI | Discoverability scales | Co-changes row #10 type contract + row #11 catalog + ADR amendment; out of scope for "smallest gap-closure row" |
| D3: client-side text search box | Discoverability without categories | Adds complexity (input + match logic + a11y for combobox-like control); for 10 items it's overkill |

**Decision: D1.** Flat grid of 10 cards. If/when the catalog grows past ~15 widgets, a future row adds D2 + a search box.

### 4.5 Axis E — How the picker writes back to `xai_dash_order`

| Option | Pros | Cons |
|---|---|---|
| **E1: `useDashOrder` exposes `addWidget(id)` helper; picker calls it** (chosen) | Encapsulates the "append + sanitize + persist" logic in the hook that already owns it; picker stays UI-only | Requires extending `useDashOrder` return shape (`[order, setOrder, addWidget?]`) — internal-only change, no public surface impact |
| E2: picker reads `order` from prop + calls `setOrder([...order, id])` directly | Zero hook changes | Duplicates "append-after-sanitize" logic in two places; harder to test the contract |
| E3: picker emits event; `useDashOrder` listens | Loose coupling | Overkill for in-package interaction; introduces async race |

**Decision: E1.** Extend `useDashOrder` to also return an `addWidget(id: string) => void` helper. The helper is internal-only (not part of the public type surface). `DashboardModule` passes the helper into `<AddWidgetPicker onAdd={addWidget} />`.

### 4.6 Axis F — New event channel wiring

| Option | Pros | Cons |
|---|---|---|
| **F1: declare + emit `web:dashboard:widget-added`** (chosen, per HC4) | Symmetric with existing `web:dashboard:add-widget-clicked`; downstream rows (statistics, settings) can listen for analytics or sync | One EventMap entry in `@repo/core` (cross-package change) |
| F2: no new event; rely on `xai_dash_order` change broadcast (cross-tab) | Zero core change | The broadcast doesn't carry "what was just added" semantics; consumers would have to diff old vs new order |
| F3: emit existing `web:dashboard:add-widget-clicked` with extra `addedId` field | No new channel | Breaks the existing channel's payload contract (closed source union); makes the source field's semantics ambiguous |

**Decision: F1.** New channel `web:dashboard:widget-added` with payload `{ widgetId: string; source: 'picker' }` (source is closed union; v1 has only `'picker'` but the union shape leaves room for future "drag from sidebar" or "AI suggestion" sources without re-amending the contract).

---

## 5. Recommendation (frozen)

**A1 + B1 + C1 + D1 + E1 + F1.** Concretely:

1. Add `packages/xai-web-dashboard-grid/src/AddWidgetPicker.tsx` — native `<dialog>` modal listing the SHIPPED widgets that are NOT already on the dashboard. Selecting a card calls `onAdd(id)` and then closes the modal.
2. Extend `packages/xai-web-dashboard-grid/src/internal/useDashOrder.ts` — return signature changes from `[order, setOrder]` to `[order, setOrder, addWidget]` where `addWidget(id)` is `setOrder([...order, id])` (with idempotent guard against duplicates).
3. Edit `packages/xai-web-dashboard-grid/src/DashboardModule.tsx` — own `pickerOpen` state; pass `addWidget` from `useDashOrder` into the picker; flip `onAddWidget` handlers in `<DashHeader>` and `<EmptyState>` from "emit and forget" to "emit (legacy) + open picker".
4. Add `web:dashboard:widget-added` to `packages/core/src/types/events.ts` EventMap.
5. Add ~6 i18n keys × 2 langs to `packages/plugin-web-tokens/src/i18n.ts` under `dashboard.picker.*` (title, cancel button, all-added empty state, add button per card).
6. Add `WIDGET_DESCRIPTIONS` + `WIDGET_ICONS` constants inline in `AddWidgetPicker.tsx` (10 entries each; bilingual desc, monochrome inline SVG icons).
7. Add picker CSS to `packages/xai-web-dashboard-grid/src/styles.css` — `.add-widget-picker` (the `<dialog>`), `.awp-inner` (content wrapper), `.awp-title`, `.awp-grid` (cards container), `.awp-card`, `.awp-card__icon`, `.awp-card__title`, `.awp-card__desc`, `.awp-empty` (all-added state), `.awp-actions` (Cancel button row).
8. Update `packages/xai-web-dashboard-grid/docs/{design.md, api.md, test.md}` with the extension sections.
9. Append the Bugfix-Extension Lineage block to `packages/xai-web-dashboard-grid/docs/dev_log.md`.

### 5.1 Public surface impact

| Surface | Change |
|---|---|
| `@repo/plugin-web-dashboard-grid` index.ts | OPTIONAL re-export of `AddWidgetPicker` component for external use. **Decision: no export in v1** — the picker is owned by `DashboardModule`, not consumed by other packages. Keeping it internal lets us iterate on its props without surface-stability obligations. |
| `@repo/core/types` EventMap | +1 entry `web:dashboard:widget-added` |
| `@repo/plugin-web-tokens` i18n | +6 keys × 2 langs (12 string additions) under `dashboard.picker.*` |
| `useDashOrder` return shape | INTERNAL only (`internal/useDashOrder.ts` is not part of the public surface per `api.md` §S1). Extending tuple from 2 → 3 elements is non-breaking for the only caller (`DashboardModule.tsx`). |

### 5.2 Test impact

| Existing suite | Expected outcome |
|---|---|
| `pnpm --filter @repo/plugin-web-dashboard-grid test` (104 tests) | Stay green. The `DashboardModule.events.test.tsx` test asserting "Add Widget click emits `web:dashboard:add-widget-clicked`" stays valid because the picker open path STILL emits that legacy event for backward compat. |
| `pnpm --filter @repo/plugin-web-dashboard-widgets test` (93 tests) | Stay green. This row doesn't touch row #11 source. |
| `pnpm --filter @repo/web test` (per its current count) | Stay green. `shellRegistrations.test.ts` doesn't change. |
| `pnpm --filter @repo/core test` | Stay green. New EventMap entry is additive. |

| New tests | Where |
|---|---|
| `AddWidgetPicker.test.tsx` | ~15 cases — open/close, list filtering, duplicate prevention, card click → onAdd + close, Cancel button, ESC closes, backdrop click closes, all-added empty state, bilingual labels, focus on first card on open, aria-modal + aria-labelledby, no widgets rendered = no `<dialog>` open, source-emit asserts |
| `useDashOrder.addWidget.test.tsx` | ~5 cases — append at end, no-op on duplicate, persists via `setPref`, sanitize-on-mount still applies, addWidget for id not in catalog dropped on next mount |
| `DashboardModule.picker.test.tsx` | ~6 cases — pickerOpen starts false, Add Widget click opens picker, picker card click adds widget + closes picker, Cancel keeps order unchanged, ESC keeps order unchanged, empty-state CTA opens picker too |
| EventMap declaration test (extend existing) | `web:dashboard:widget-added` payload shape compiles |

Total new tests: ~26. Combined: 104 + 26 = 130 grid tests + 93 widgets unchanged = 223.

---

## 6. Risks and mitigations

### R1. Duplicate-prevention edge case if widget ids collide across re-renders

**Risk.** Picker filters `dashboardWidgetRegistrations` by `!order.includes(reg.id)`. If `order` is mutated between picker render and `onAdd` call, the user could double-add.

**Mitigation.** `useDashOrder.addWidget(id)` short-circuits if `order.includes(id)`. The picker filter is a UI hint; the hook is the source of truth.

**Severity / likelihood.** Low / Low. The window is one event-loop tick. No concurrent code path can mutate `xai_dash_order` from another tab synchronously fast enough to race the modal click handler. Even if it did, the addWidget guard catches it.

### R2. Native `<dialog>` focus management (Tab cycling, Esc handling, initial focus)

**Risk.** Native `<dialog>` provides ESC-to-cancel + backdrop-click-to-cancel + focus-trap (Tab cycling stays inside the dialog) only when opened via `showModal()` (not `show()`). Initial focus goes to the first focusable element; for our grid of cards this is the first card button — meets the acceptance signal "Tab navigates cards, Enter selects, Esc closes".

**Mitigation.**
- Use `showModal()` exclusively (per DeleteAccountConfirmModal precedent).
- Map ESC → `cancel` event → `onClose` callback. (Native dialog fires `cancel` on ESC; we add `onCancel` handler that calls `setPickerOpen(false)`.)
- Backdrop click via the same `e.target === dialogRef.current` pattern.
- Each card is a `<button type="button">` — auto-focusable, keyboard-activatable via Enter/Space.
- Card grid uses CSS grid (`grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`) — Tab follows DOM order (left-to-right, top-to-bottom).

**Severity / likelihood.** Low / Low. Pattern is proven by DeleteAccountConfirmModal in production.

### R3. 100ms open budget if catalog grows

**Risk.** Acceptance signal: "Add Widget click → modal opens within 100ms". Today the catalog has 10 entries; the picker renders 10 cards with 10 inline SVGs + 10 bilingual strings. Render time should be well under 1ms in jsdom; in real browsers, <16ms (one frame). Future growth past ~50 widgets could push past 100ms if each card eagerly renders a live preview thumbnail.

**Mitigation (now).** Cards render only `id`, `span`-derived CSS class, icon, title (from `ariaLabel`), description (from inline constant). NO live widget preview rendering in v1 (the seed brief HC5 didn't lock thumbnails; the older 20260524-roadmap-seed.md HC mentioned "Preview thumbnails" but the session's HC5 narrowed to "icon + title + description"). Document this in design.md as a v1 simplification with a v2 deferral note.

**Severity / likelihood.** Low / Low for v1; flagged for v2.

### R4. Native `<dialog>` browser compatibility baseline

**Risk.** `<dialog>` was Baseline-Available in March 2022 (Chrome 37, Edge 79, Firefox 98, Safari 15.4). The deploy target browsers (per ADR-0008) are evergreen Chrome / Firefox / Safari (current-2). All support `<dialog>`.

**Mitigation.** No polyfill needed. Document the baseline in design.md so future deploy-target audits can verify.

**Severity / likelihood.** Trivial / Trivial. Same precedent as DeleteAccountConfirmModal.

### R5. Event payload schema drift if widget catalog ids change

**Risk.** `web:dashboard:widget-added.widgetId` is a `string` (intentionally not a union of the 10 ids — because row #11 may add ids in the future, and we don't want every catalog edit to ripple through the EventMap). But this means consumers must defensively handle unknown ids.

**Mitigation.** Document in api.md §S8 (events emitted) that `widgetId` is a free-form string. The producer (this row) writes only ids it just read from `dashboardWidgetRegistrations`. Consumers are expected to either use the id as opaque or look it up in their own copy of the catalog.

**Severity / likelihood.** Low / Low. No consumer exists today.

### R6. ariaLabel-as-title coupling to row #11

**Risk.** The picker card uses `dashboardWidgetRegistrations[i].ariaLabel.en` as the visible card title (e.g. "Clock widget" / "时钟组件"). The `ariaLabel` field was designed for the widget shell's drag-handle aria-label, not for display. If row #11 changes an ariaLabel for accessibility reasons (e.g. "Clock widget showing local time"), the picker title gets longer.

**Mitigation.** Inline a `WIDGET_TITLES` bilingual constant in `AddWidgetPicker.tsx` (10 entries × 2 langs) DECOUPLED from `ariaLabel`. The titles are: Clock / Tasks / Streak / Pomodoros / Weather / Calendar / Time zones / Stickies / Inbox / Upcoming. Document in design.md that this is intentional decoupling.

**Severity / likelihood.** Medium / Low. Mitigation eliminates the coupling.

### R7. `useDashOrder` return-shape extension breaks existing consumers

**Risk.** Today `useDashOrder` returns `[order, setOrder]`. Extending to `[order, setOrder, addWidget]` could break destructuring if any test or code does `const [order] = useDashOrder(...)` and then re-destructures incorrectly elsewhere.

**Mitigation.** Search for all callers (`grep useDashOrder`). The only consumer is `DashboardGrid.tsx`. Tuple extension at the END is non-breaking for `const [order, setOrder]` destructuring (the third element is just ignored). Tests of `useDashOrder` will be extended to assert the third element type/behavior.

**Severity / likelihood.** Low / Low. Single caller; tuple-at-end extension.

### R8. Modal renders before `<dialog>` ref is bound on first mount

**Risk.** React mounts the `<dialog>` element + the `useEffect` runs in the same commit phase. If `open` starts true (which it doesn't — picker starts closed), the effect might fire before ref is bound on first paint. With `open` starting false, this is moot.

**Mitigation.** Picker `open` defaults to false. `DashboardModule` flips it to true on user click. By that point the dialog ref is bound (the `<dialog>` element has been in the DOM since first paint of `DashboardModule`).

**Severity / likelihood.** Trivial / Trivial.

### R9. Cross-tab race when two tabs both open the picker and add the same widget

**Risk.** Tab A opens picker, sees Clock is missing. Tab B opens picker, sees Clock is missing. Both click Add. Both call `addWidget("clock")`. The second call is a no-op (due to R1 mitigation), BUT both tabs emit `web:dashboard:widget-added` — a downstream listener could see two events for what is effectively one add.

**Mitigation.** Document in api.md §S8: `web:dashboard:widget-added` is a fire-and-forget intent signal, not a guaranteed "the order just changed" notification. The `xai_dash_order` `usePref` cross-tab BroadcastChannel handles the actual state-sync (already SHIPPED via row #3).

**Severity / likelihood.** Low / Low. Real users typically don't have two console tabs open simultaneously.

### R10. Sibling-row concurrency on shared anchors

**Risk.** This row edits:
- `packages/core/src/types/events.ts` (add one entry)
- `packages/plugin-web-tokens/src/i18n.ts` (add 6 keys × 2 langs)
- `packages/xai-web-dashboard-grid/src/{DashboardModule.tsx, internal/useDashOrder.ts, styles.css}`

The first two are cross-package shared files. This row is SERIAL-dispatched as LAST of W1 (after rows #2/#3/#4 SHIPPED), so no parallel sibling row is editing them right now. W2 hasn't started.

**Mitigation.** Use Edit (not Write) on the shared files with unique anchors. Retry git lock 8-20s × 5 if collision.

**Severity / likelihood.** Trivial / Trivial. SERIAL dispatch guarantees no concurrent W1 edits; W2 isn't dispatched until W1 finishes.

---

## 7. Open questions

### Q1. Should the picker offer "Reset to defaults" (re-add ALL missing widgets at once)?

**Answer.** No. Out of scope. Future row (paired with the Remove affordance) decides.

### Q2. Should the picker remember last-selected widget for power-user "Add another" UX?

**Answer.** No. Modal closes after one Add. Future row may add "Add and keep open" toggle.

### Q3. Should we add `category` metadata to row #11 catalog now, anticipating future picker growth?

**Answer.** No. Adding `category` requires:
1. Co-edit on row #11 (`WidgetRegistration` shape change OR a parallel `widgetCategories` map),
2. ADR amendment per row #11 api.md §S2 stability rule ("Adding/removing/renaming any [id] requires an ADR amendment" — adding a field is in the same spirit),
3. Decision on category vocabulary (Productivity / Time / Communication / etc.).

All three multiply the row's footprint. Defer to v2 when catalog grows.

### Q4. Should the picker block scroll on `<body>` when open?

**Answer.** Native `<dialog>` with `showModal()` already pushes the dialog to the top layer and prevents background interaction. We do NOT add a `body { overflow: hidden }` workaround.

### Q5. Should the picker animate in (fade / scale)?

**Answer.** v1: respect `prefers-reduced-motion`. No CSS animation in v1 — same as DeleteAccountConfirmModal. If product feedback demands one, add as a future polish.

---

## 8. Phase plan (recommended 2 phases — collapse P3 into P2 per seed brief recommendation)

Per the dispatch brief: "OR collapse P3 into P2 if scope is small (recommended — this is the smallest wave-1 row)". Going with 2 phases.

### Phase P1 — `<AddWidgetPicker />` component + EventMap + i18n + tests

**Files written (new)**:
- `packages/xai-web-dashboard-grid/src/AddWidgetPicker.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/AddWidgetPicker.test.tsx`

**Files written (edited)**:
- `packages/core/src/types/events.ts` — Edit, +1 EventMap entry `web:dashboard:widget-added`
- `packages/plugin-web-tokens/src/i18n.ts` — Edit, +6 keys × 2 langs under `dashboard.picker.*`
- `packages/xai-web-dashboard-grid/src/styles.css` — Edit, append `.add-widget-picker` + `.awp-*` rules

**Acceptance**:
- `pnpm --filter @repo/plugin-web-dashboard-grid lint` clean (`--max-warnings 0`)
- `pnpm --filter @repo/plugin-web-dashboard-grid check-types` clean
- `pnpm --filter @repo/plugin-web-dashboard-grid test` — 104 + 15 = 119 tests green
- `pnpm --filter @repo/core check-types` clean
- `pnpm --filter @repo/plugin-web-tokens check-types` clean

**Commit**: `feat(plugin-web-dashboard-grid): P1 — AddWidgetPicker component + EventMap web:dashboard:widget-added + i18n delta (gap-closure row #5)`

### Phase P2 — Wire-up in `DashboardModule` + `useDashOrder.addWidget` + integration tests + PLUGIN_MAP note + final polish

**Files written (new)**:
- `packages/xai-web-dashboard-grid/src/__tests__/useDashOrder.addWidget.test.tsx`
- `packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.picker.test.tsx`

**Files written (edited)**:
- `packages/xai-web-dashboard-grid/src/DashboardModule.tsx` — Edit, own `pickerOpen` state, mount `<AddWidgetPicker />`, flip onAddWidget handlers to open picker (still emits legacy `web:dashboard:add-widget-clicked` for back-compat)
- `packages/xai-web-dashboard-grid/src/internal/useDashOrder.ts` — Edit, tuple-extend to 3-element return with `addWidget(id)`
- `packages/xai-web-dashboard-grid/src/__tests__/useDashOrder.test.tsx` — Edit, extend with 5 new addWidget cases
- `packages/xai-web-dashboard-grid/src/__tests__/DashboardModule.events.test.tsx` — Edit, assert legacy event still emits + new event emits on picker add
- `docs/PLUGIN_MAP.md` — Edit, append `(Extension 2026-05-25 — Add Widget picker)` to plugin-web-dashboard-grid row note
- `packages/xai-web-dashboard-grid/docs/{design.md, api.md, test.md, dev_log.md}` — final sync

**Acceptance**:
- All tests green (`104 → 130` total grid tests; `93` widgets unchanged; `web` + `core` + `tokens` all green)
- `pnpm -w build` clean
- Set dev_log Status to `READY_FOR_VERIFY`

**Commit**: `feat(plugin-web-dashboard-grid): P2 — DashboardModule wire-up + useDashOrder.addWidget + PLUGIN_MAP (gap-closure row #5)`

---

## 9. Sibling concurrency policy (serial dispatch, last row of W1)

Per the roadmap manifest `Wave Concurrency Cap: 3` + this row dispatched SERIAL as the LAST row of W1 (rows #2/#3/#4 already SHIPPED 2026-05-25):

- No active concurrent W1 row. Safe to Edit shared anchors directly.
- W2 has NOT started. No risk of forward-collision.
- Use Edit (not Write) on `packages/core/src/types/events.ts` and `packages/plugin-web-tokens/src/i18n.ts` so future W2 edits to the same files don't conflict.

---

## 10. Cross-vendor verify scope (deferred per ADR-0008 carve-out, evidence locked here)

Per ADR-0009 §D4 cross-vendor verify is mandatory; per the W1 ship precedent (rows #2/#3/#4), the cold-read + manual smoke can defer 24h after ship per ADR-0008 carve-out, with the deferral documented in the verify-checklist artifact.

Verifier checklist for ship-time:

1. **Open** picker via Add Widget button click. Verify modal renders within 100ms (DevTools Performance, or eyeball — manual).
2. **Open** picker via Empty State CTA click (after manually clearing all 10 from xai_dash_order in DevTools → Application → Local Storage). Verify same.
3. **Keyboard**: Tab from outside the modal — focus enters first card. Tab cycles cards. Shift+Tab cycles backward. Tab from last card → wraps to Cancel button → wraps back to first card. Enter on a card → adds widget + closes. Esc → closes without add.
4. **Mouse**: Click card → adds + closes. Click Cancel → closes without add. Click backdrop (outside `.awp-inner`) → closes without add.
5. **Persistence**: After Add, reload page → widget persists at end of grid.
6. **Event emit**: DevTools Console listening on `web:dashboard:widget-added` → fires once per Add.
7. **Duplicate prevention**: With 10/10 already added, click Add Widget → picker opens showing the "All widgets are on your dashboard" empty state + Cancel button only.
8. **Bilingual**: Toggle lang to ZH → all picker copy switches.
9. **Theme**: Toggle light/dark → picker chrome inverts correctly.
10. **Cross-browser**: Chrome / Firefox / Safari 17+ — all of the above. (Deferred-24h per ADR-0008 carve-out.)

Cross-vendor cold-read verifier (Codex `gpt-5.5-thinking medium` primary, Cursor fallback): inspect picker keyboard accessibility — Tab navigates cards, Enter selects, Esc closes; assert via static read of `AddWidgetPicker.tsx` source.

Report file: `docs/reviews/xai-web-dashboard-add-widget-picker/<YYYYMMDD>-cross-vendor-verify.md`.

---

## 11. Frozen assumptions (lock at plan acceptance)

1. **Picker package location**: inside `packages/xai-web-dashboard-grid/src/` as `AddWidgetPicker.tsx`. NOT a new package.
2. **Modal mechanism**: native `<dialog>` + `showModal()` per DeleteAccountConfirmModal precedent.
3. **Duplicate prevention**: hide already-added widgets from the picker list.
4. **Category filtering**: none in v1 (catalog has no category metadata).
5. **Persistence**: append to existing `xai_dash_order` via `useDashOrder.addWidget(id)`. NO new storage keys.
6. **New event**: `web:dashboard:widget-added` with payload `{ widgetId: string; source: 'picker' }`. EventMap entry only in this row.
7. **Legacy event preserved**: `web:dashboard:add-widget-clicked` STAYS — still emitted on Add Widget / Empty State CTA click for backward compat (its semantics shift slightly from "intent stub" to "picker opening").
8. **Card content**: icon (inline SVG, internal `WIDGET_ICONS` map) + title (internal `WIDGET_TITLES` bilingual map, NOT `ariaLabel`) + description (internal `WIDGET_DESCRIPTIONS` bilingual map). No live widget render preview in v1.
9. **i18n delta**: 6 new keys × 2 langs under `dashboard.picker.*` — `title`, `cancel`, `all_added_title`, `all_added_subtitle`, `add_button`, `aria_close`.
10. **`useDashOrder` return shape**: extends from 2-element tuple to 3-element `[order, setOrder, addWidget]`. Internal-only — `internal/useDashOrder.ts` is not part of the public surface per row #10 api.md §S1.
11. **No public-surface export** of `AddWidgetPicker` from `@repo/plugin-web-dashboard-grid`. Component is internal to the package.
12. **Phase plan**: 2 phases (P1 component + tests, P2 wire-up + integration tests + PLUGIN_MAP). NO P3 — scope is small enough per dispatch brief recommendation.
13. **Cross-vendor verify**: ship-time deferred-24h cold-read per ADR-0008 carve-out, consistent with rows #2/#3/#4 W1 precedent.
14. **No prototype reference for picker UI**: `web design/module-dashboard.jsx` has no gallery panel. Card grid design is fresh; matches dashboard tokens (`.btn`, `--border-1`, `--bg-panel-2`, etc.) for visual consistency.
15. **No analytics / telemetry**: zero outbound network beyond the event bus. No Sentry, no fetch.

---

## 12. Final go/no-go

**Verdict: GO.** Plan is internally consistent, smallest of W1 footprint, no external deps, no CSP/OAuth/payment governance overhead, no third-party libraries, no new packages, no new storage keys, fully reuses SHIPPED catalog + persistence + event bus.

Status flips: dev_log Status `SHIPPED` (preserved verbatim above) + new appended block Status `NEEDS_REVIEW`. Suggested Next = `feature-review`.
