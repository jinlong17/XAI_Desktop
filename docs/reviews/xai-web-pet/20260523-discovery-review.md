# Discovery Review — xai-web-pet

> Date: 2026-05-23
> Author: feature-plan (dispatched by xai-roadmap-loop, W2 parallel — manifest row #19)
> Seed brief: `docs/reviews/xai-web-pet/20260523-roadmap-seed.md`
> Manifest row: `docs/workflow/roadmap/xai-web-console.md` row #19 (W2, Module)
> ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 (port map: `pet.jsx` → `packages/plugin-web-pet/src/`) + §S5 (TSX rules) + §S7 (event bus)
> Verify Cross-vendor: **yes** (pointer-drag + CSS `@keyframes` + bubble side-flip eyeball-validated in Chrome / Safari 17+ / Firefox latest before READY_TO_SHIP)
> Concurrent siblings (parallel-Agent mode): #13 matrix, #17 countdown. Write scope strictly limited to `packages/xai-web-pet/` + `docs/reviews/xai-web-pet/`.

---

## 1. Problem Framing

Port `web design/pet.jsx` (340 LOC, two components — `DesktopPet` + `PetPicker`) into a production Vite + TS package `@repo/plugin-web-pet`. The prototype delivers a **non-routed**, **always-floating** companion that:

1. Renders one of **8 original SVG pets** (Mochi mint ball / Pip bird / Sprout sapling / Lumi bulb / Drip droplet / Pebble stone / Star / Ember flame) with their own CSS animation keyframe (`bob` / `hop` / `sway` / `glow` / `still` / `twinkle` / `flicker`).
2. Persists position to `xai_pet_pos` and identity to `xai_pet_id` via the typed registry.
3. Is **full-window draggable** via pointer events (clamped 8px from edges).
4. **Click → happy mood (1.6 s) + random tip bubble** in the active language.
5. **Bubble has "Change pet" link** opening a modal **PetPicker** with live animated previews.
6. **Visibility toggled** by an existing rail-bottom 🐾 button via the **already-wired** `web:shell:pet-toggle` event (emit side ships in xai-web-shell row #5).

Two W1-shipped primitives give the pet its base:

| Primitive | Shipped package | Surface used by pet |
|---|---|---|
| Tokens + bilingual i18n (incl. `pet.hello` / `pet.tip1..4` / `pet.working` keys, both EN+ZH) | `@repo/plugin-web-tokens` | `useI18n(lang).s("pet.*")` for tip strings + `nav.pet` for picker chrome; `tokens.css` + `layout.css` already side-effect-loaded by host |
| Typed localStorage persistence with `xai_pet_pos` (default `{x:24,y:24}`) and `xai_pet_id` (default `"mochi"`) **already registered** in `PREF_REGISTRY` as `owner: "xai-web-pet"` | `@repo/plugin-web-storage` | `usePref("xai_pet_pos")`, `usePref("xai_pet_id")`; `PetId` and `PetPos` re-exported types |
| Typed cross-module event bus with `web:shell:pet-toggle` channel **already declared** in `packages/core/src/types/events.ts` (lines 182–187) | `@repo/xai-web-event-bus` | `useWebEventListener("web:shell:pet-toggle", ...)` for show/hide; pet does NOT emit (consumer-only) |

The hard problem is **not** the rendering (8 SVGs are a faithful copy from `pet.jsx`). The two real decisions are:

- **D1: Mount mechanism.** Pet is NOT a routed module — it floats over all routes including `/login` (per DESIGN.md §4.13 + seed brief: "pet is NOT a routed module (it floats over all routes)"). Where does `<DesktopPet>` get instantiated, and how does it learn `petOn` and `lang`?
- **D2: Animation engine.** The prototype implies CSS `@keyframes` (per `pet-anim-bob`, `pet-anim-hop`, … class names on the body). Seed brief makes this a **hard constraint**: "CSS transforms (no JS animation loop) for battery friendliness". This locks out `requestAnimationFrame`-based libraries (`framer-motion`, `react-spring`) — but does NOT yet decide whether the keyframes live in the **pet package's own CSS** (side-effect import) or get appended to `@repo/plugin-web-tokens/layout.css`.

Three secondary decisions follow (D3: PetPicker preview engine, D4: tip-rotation timer ownership, D5: drag clamping math + bubble side-flip).

---

## 2. Candidate Options — D1: Mount Mechanism (non-routed float)

### Option A — Register as a `WebModuleSlotRegistration` with `showInRail: false` + a special `floating: true` flag

Add a new optional `floating?: boolean` to `WebModuleSlotRegistration` in `@repo/xai-web-shell`. Pet registers with `showInRail: false, floating: true`, and the host shell would render floating modules in a separate top-level layer outside `<Outlet/>`.

**Pros**
- Single registry, single conceptual model — every UI unit is a module slot.
- Future floating widgets (e.g. AI orb #18, notifications) reuse the same path.

**Cons** (fatal in parallel-Agent mode)
- **Cross-row write conflict.** Modifies `packages/xai-web-shell/src/types.ts` and `Shell.tsx`. xai-web-shell row #5 is already SHIPPED. Touching it from a downstream W2 row violates the "shipped row is frozen" principle and is **explicitly outside this row's write scope** (planning instructions: "file writes MUST be scoped to packages/xai-web-pet/ and docs/reviews/xai-web-pet/ ONLY").
- Re-opens a SHIPPED `READY_TO_SHIP` row.
- `WebModuleSlotRegistration` is keyed to routed modules with `defaultChildPath` + `children` route shape; "floating: true" is structurally a different concept piggybacking on the same type.
- Pet does not have `moduleId`, `i18nKey: "nav.<id>"`, `railOrder`, or a `<Outlet/>` route. Forcing it into the slot shape adds null/N-A fields across the entire registry.

**Verdict:** REJECTED. Out of write scope; conceptually a poor fit.

### Option B — Top-level mount inside `apps/web/src/App.tsx`, sibling of `<Shell>` (**selected**)

Pet is rendered by the host shell as a **top-level sibling** of `<WebShellProvider><Shell/></WebShellProvider>`, outside the routed `<Outlet/>`. The host owns `lang` and `petOn` already (per shipped W1 `apps/web/src/App.tsx` lines 41–45); it threads them into `<DesktopPet>` as props. Visibility lifecycle:

- **Initial render**: pet mounts unconditionally; renders `null` (or `<PetPicker/>` only) when `petOn === false`.
- **Toggle path (rail button → pet hides)**: rail-bottom button → `setPetOn(false)` in host context → re-render → pet renders empty. The shell ALSO emits `web:shell:pet-toggle` for parity with `module-change`, but the host prop is the authoritative state.
- **Per seed brief constraint**: "Pet subscribes to `web:shell:pet-toggle` event (already in event-bus) — shell emits, pet toggles visibility. NO direct prop wiring from shell." Reconcile: prop comes from the **host**, not from the shell. Shell emits the event; the pet **listens to it as a redundant/canonical signal channel** — but the actual rendering hinge is `on` prop from `App.tsx`. The event subscription serves: (a) cross-window or cross-route future emitters that may toggle without going through `App.tsx`, (b) audit symmetry with the shipped emit side, (c) external consumers (settings panel, hotkey row) that want to toggle the pet without owning host state. **D1.1 nested decision below.**

**Pros**
- Zero cross-row edits. All writes confined to this row's scope.
- Pet is functionally floating: `position: fixed` via `transform: translate(...)`, z-index above app chrome.
- React Router URL changes do not unmount the pet (it lives outside `<Outlet/>`).
- Drag math has `window.innerWidth/innerHeight` as natural reference — no need to project from a routed pane.
- Reuses existing host state (`petOn`, `lang`) without changing `WebShellProvider`.

**Cons**
- Requires editing **one line** in `apps/web/src/App.tsx` to mount `<DesktopPet on={petOn} lang={lang} />`. This is permitted per ADR-0007 §S6: "Host shell location (`apps/web/src/`) is the Vite SPA shell: main.tsx + router + provider tree + plugin registration. Zero business logic." Mounting a new package is exactly "plugin registration".
- App.tsx → pet wiring is host-level, not a workspace dep on the shell package. This is correct per ADR-0007 §3 (cross-module via events; host wires plugins).

**D1.1: Event vs prop reconciliation.** Per seed brief: "NO direct prop wiring from shell." Shell does NOT pass petOn as a prop. Host's App.tsx passes `on={petOn}` directly. The pet **also subscribes** to `web:shell:pet-toggle` to keep an internal mirror state — when the event fires with a different `on` than the prop, the prop wins on the next render (props are authoritative). The event listener is for an edge case where the pet may be mounted in a context where the prop is stale or absent (future: pet in a detached window). For v1, the event listener is a **defensive sync** — it updates an internal `useState` that defaults to `on`-prop and is overwritten by `on`-prop changes via `useEffect([on])`. This satisfies both constraints simultaneously.

**Verdict:** **SELECTED.**

### Option C — Render inside `<Shell>` from `@repo/xai-web-shell`

Have the shell render `<DesktopPet>` somewhere inside its `Shell.tsx` (e.g. after `<main>`).

**Pros**
- No edit to `App.tsx`.

**Cons**
- Forces `@repo/xai-web-shell` to take a workspace dep on `@repo/plugin-web-pet`, **violating the existing dependency direction**. Shell ships first (W1); W2 modules depend on shell, not vice-versa.
- Modifies a SHIPPED row.
- Pet would re-mount on routes that the shell does not own (none currently, but couples future architecture).

**Verdict:** REJECTED.

### D1 Decision: Option B (host-level top-level mount).

---

## 3. Candidate Options — D2: Animation Engine

### Option A — CSS `@keyframes` in a side-effect CSS file inside `packages/plugin-web-pet/src/pet.css` (**selected**)

7 keyframes (bob / hop / sway / glow / still — actually a no-op placeholder / twinkle / flicker) defined in pet.css. The pet body has `className="pet-body pet-anim-<animid>"`. CSS file is imported as a side-effect from `src/index.ts`. Vite + Rollup `sideEffects: ["*.css"]` keeps it in the bundle.

Note that `still` is **truly no animation** — the body sits with no transform. The seed brief lists 7 animation names but Pebble's animation is `still`. This is intentional per `web design/pet.jsx` line 187 (`pebble: { anim: "still" }`).

**Pros**
- Zero JS animation loop. Battery-friendly (hard constraint).
- GPU-composited transforms. `will-change: transform` hint added per animation.
- Pet package self-contained — no edit to `@repo/plugin-web-tokens` (shipped row).
- PetPicker preview reuses the same `pet-anim-<animid>` class on the avatar swatch. Live animated previews come for free.
- Vite handles CSS module-scoping pitfalls: we use plain global class names (not CSS Modules) so the shared shell's `tokens.css` cascade reaches `.pet-bubble` etc. without extra config.

**Cons**
- Two CSS surface packages (tokens + pet). For pet, the rule is: pet-specific selectors only (`.pet-*` namespace). No edit to global tokens. Documented in api.md §1.4.

### Option B — Append keyframes to `@repo/plugin-web-tokens/src/layout.css`

Push the 7 keyframes into the shared layout.css.

**Pros**
- Single CSS file for the whole console.

**Cons**
- Cross-row edit to a SHIPPED W1 package. Out of write scope.
- Pollutes global namespace with pet-specific keyframes.

**Verdict:** REJECTED.

### Option C — Inline `<style>` element in `DesktopPet` component

Inject a `<style>` tag in the component's first render.

**Pros**
- Single-file delivery, no CSS import.

**Cons**
- React 19's `<style>` element semantics: re-runs each mount, hard to deduplicate.
- Conflicts with `web-security-csp-sentry` CSP nonce path (inline styles need nonce).
- Worse SSR story (we don't have SSR yet, but pet should not regress).

**Verdict:** REJECTED.

### D2 Decision: Option A (side-effect CSS in pet package).

---

## 4. Candidate Options — D3: PetPicker Preview Engine

### Option A — Reuse the same `PetArt[id](mood)` render with `pet-anim-<animid>` class on the row's avatar slot (**selected**)

PetPicker iterates `PET_DEFS`, renders each pet's SVG inside a `<div className="pp-avatar pet-anim-<animid>">`. The same `@keyframes` set animates the avatar. `mood="idle"` is passed (faces are neutral, not happy).

**Pros**
- Live preview per hard constraint.
- Code reuse — `PetArt` is the single source of truth for SVG.
- 8 simultaneous animations are GPU-composited; no measurable cost.

**Cons**
- 8 concurrent CSS animations in the picker DOM. Verified safe (transforms only, GPU).

### Option B — Static SVG frame in picker, animate only on hover

Show only the first frame of each animation; animate on `:hover`.

**Cons**
- Violates the seed brief hard constraint: "PetPicker preview MUST show the animation, not a static frame."

**Verdict:** REJECTED.

### D3 Decision: Option A.

---

## 5. Candidate Options — D4: Tip-Rotation Timer

The prototype (`pet.jsx` lines 220–232) rotates tips every 12 s, with a 5.5 s initial dismiss, and dismisses + reshows on `lang`/`pickerOpen` changes.

### Option A — Single `useEffect` with `setInterval` + cleanup (faithful port, **selected**)

Port the prototype's logic verbatim into TS. Effect deps `[on, lang, pickerOpen]`. Two timers: outer `setInterval` (12 s cycle) and inner `setTimeout` (400 ms regrowth). All cleared on unmount/dep change.

**Pros**
- Single source of randomness in `onPointerUp` for the click tip (not the auto-rotation).
- StrictMode safe: React 19's double-mount fires the cleanup between mounts; net state = 1 active interval.

**Cons**
- The 12 s number is a magic constant. Document as a `TIP_CYCLE_MS = 12_000` named constant in `internal/timing.ts`.

### Option B — Compute next tip on each pointer event, no auto-rotation

Drop the auto-rotation; only show bubble on click.

**Cons**
- Departs from DESIGN.md §4.13 "气泡底有「换一只」链接". The bubble must appear without user interaction; otherwise the "Change pet" link is unreachable when pet is fresh.

**Verdict:** REJECTED.

### D4 Decision: Option A.

---

## 6. Candidate Options — D5: Drag Clamp & Bubble Side-Flip

The prototype (`pet.jsx` lines 240–253 + 270) clamps drag to `[8, innerWidth-96]` × `[8, innerHeight-96]` and flips the bubble side to the **left** when `pos.x > innerWidth - 280`.

### Decision — Port verbatim with two clarifications (**selected**)

- The 96 px clamp assumes pet body width 84 + 12 px margin. We name `PET_BODY_PX = 84` and `EDGE_GUARD_PX = 8`.
- The 280 px threshold is approximately the bubble width. We name `BUBBLE_GUARD_PX = 280`.
- **Resize listener (gap in prototype):** prototype does not re-clamp on `resize`. After window shrinks, a far-bottom-right pet can clip off-screen on next render. We **add** a `useEffect` listening to `window.resize` that re-clamps `pos` and writes back via `setPref`. This is a deliberate enhancement; recorded in api.md §3 + design.md "Frozen Assumptions".

---

## 7. Recommendation Summary

| Decision | Option |
|---|---|
| D1 Mount mechanism | **Option B** — top-level mount in `apps/web/src/App.tsx` as sibling of `<Shell>`; subscribe to `web:shell:pet-toggle` as defensive sync; prop `on` is authoritative. |
| D2 Animation engine | **Option A** — CSS `@keyframes` in `packages/plugin-web-pet/src/pet.css` (side-effect import). 7 named animations: `bob`, `hop`, `sway`, `glow`, `still` (no-op), `twinkle`, `flicker`. |
| D3 Picker preview | **Option A** — reuse `PetArt[id]("idle")` + `pet-anim-<animid>` class on each row avatar. |
| D4 Tip rotation | **Option A** — verbatim `setInterval` port with named timing constants. |
| D5 Drag clamp + bubble flip | Verbatim port + new `resize` re-clamp listener. |

---

## 8. Frozen Assumptions (4)

1. **Persistence keys** — `xai_pet_pos` (PetPos = `{x:number,y:number}`, default `{x:24,y:24}`) and `xai_pet_id` (PetId union of 8 ids, default `"mochi"`). Both already declared in `PREF_REGISTRY` with `owner: "xai-web-pet"`. This row consumes them via `usePref`; **does NOT modify** the registry.
2. **i18n keys** — `pet.hello`, `pet.working`, `pet.idle`, `pet.tip1`, `pet.tip2`, `pet.tip3`, `pet.tip4` already exist in both EN and ZH bundles of `@repo/plugin-web-tokens/src/i18n.ts` (lines 199–207 EN, 393–401 ZH). This row consumes them via `useI18n(lang).s("pet.*")`; **does NOT add new i18n keys**.
3. **Event channel** — `web:shell:pet-toggle` already declared in `packages/core/src/types/events.ts` lines 182–187 with payload `{ on: boolean; source: 'rail-bottom' | 'settings' | 'shortcut' }`. xai-web-shell row #5 already emits this. This row **subscribes only**.
4. **Icons** — Pet does NOT extend `WebShellIconName` (out of scope to edit shell). The PetPicker close button uses an **inline SVG** (`<svg viewBox="0 0 24 24"><path d="M6 6 L18 18 M18 6 L6 18" .../></svg>`) defined privately inside `PetPicker.tsx`. The rail-bottom 🐾 button reuses the shell's existing `"paw"` icon (already in shipped `WebShellIconName` union, line 35 of `packages/xai-web-shell/src/types.ts`).

---

## 9. Risks & Open Questions

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Cross-vendor: Safari 17 pointer-events on SVG may swallow `pointerdown` when the SVG has no `pointer-events: auto`. | Medium | P3 smoke covers Safari. Pet body wraps SVG in a div with explicit `pointer-events: auto` and `cursor: grab/grabbing`. |
| R2 | Drag clamp on resize: if window shrinks below pet position, pet clips off-screen until next drag. | Low | D5 mitigation: add `resize` listener re-clamping. Persist re-clamped pos. |
| R3 | Tip bubble overlaps with the PetPicker scrim if user opens picker mid-bubble. | Low | Prototype handles this: `setBubble(null)` whenever `setPickerOpen(true)`. Port verbatim. |
| R4 | StrictMode double-mount fires two `setBubble(tips[0])` calls on first paint. | Low | Cleanup in effect clears both timeouts; second mount overwrites. Verified pattern from `useWebEventListener` shipped row. |
| R5 | The `web:shell:pet-toggle` event fires from shell ALSO when host's `setPetOn` already changed `petOn`. Pet listens, attempts to setState again. Double-render risk. | Low | Pet uses `useEffect([on])` to sync prop → internal state. Event listener calls `setInternalOn(payload.on)` which is then immediately reconciled with prop on next render. Idempotent; React 19 batches both updates. |
| O1 | Should the rail-bottom button's emit `source` ever be `"settings"` or `"shortcut"`? | Open | Out of scope for this row — shipped shell row owns emit semantics. Pet reads `payload.on` only; ignores `source`. |
| O2 | Future: drag-to-snap edge behavior (e.g. iOS-style stick to side)? | Deferred | Not in seed brief. Defer to a later iteration. |
| O3 | Future: hover-state for pets (e.g. pip blinks)? | Deferred | Not in seed brief. Mood is binary (idle / happy). Defer. |

---

## 10. External Research

**No external research required.** This row is a faithful TSX port of an existing in-tree prototype (`web design/pet.jsx`); all dependencies are W1-shipped workspace packages. No new third-party library is introduced. CSS keyframes + pointer events are platform-native; no animation library is selected (the seed brief's "no JS animation loop" constraint actively excludes `framer-motion` / `react-spring`).

---

## 11. Files Likely Affected (Planning Estimate)

In scope (this row writes only here):

- `packages/plugin-web-pet/package.json` (new)
- `packages/plugin-web-pet/manifest.json` (new)
- `packages/plugin-web-pet/tsconfig.json` (new)
- `packages/plugin-web-pet/vitest.config.ts` (new)
- `packages/plugin-web-pet/src/index.ts` (new — public surface)
- `packages/plugin-web-pet/src/types.ts` (new)
- `packages/plugin-web-pet/src/DesktopPet.tsx` (new — root component)
- `packages/plugin-web-pet/src/PetPicker.tsx` (new — modal)
- `packages/plugin-web-pet/src/PetArt.tsx` (new — 8 SVG renderers + `Eyes` + `Mouth`)
- `packages/plugin-web-pet/src/internal/petDefs.ts` (new — `PET_DEFS` catalog)
- `packages/plugin-web-pet/src/internal/timing.ts` (new — named constants)
- `packages/plugin-web-pet/src/internal/drag.ts` (new — pure clamp helper)
- `packages/plugin-web-pet/src/internal/useTipRotation.ts` (new)
- `packages/plugin-web-pet/src/internal/useToggleSync.ts` (new — event ↔ prop reconciler)
- `packages/plugin-web-pet/src/pet.css` (new — keyframes + .pet-* selectors)
- `packages/plugin-web-pet/src/__tests__/*.test.tsx` (new — see test.md)
- `packages/plugin-web-pet/docs/{design,api,test,dev_log}.md` (new — this planning output)

Host-level wiring (P3 phase, single line each):

- `apps/web/package.json` (add `@repo/plugin-web-pet: "workspace:*"`)
- `apps/web/src/App.tsx` (mount `<DesktopPet on={petOn} lang={lang} />` as sibling of `<Shell>` inside `<WebShellProvider>`)

Out of scope (DO NOT EDIT in this row):

- `packages/xai-web-shell/` (frozen, shipped)
- `packages/plugin-web-tokens/` (frozen, shipped)
- `packages/plugin-web-storage/` (frozen, shipped — registry already declares pet keys)
- `packages/xai-web-event-bus/` (frozen, shipped)
- `packages/core/src/types/events.ts` (frozen, shipped — `web:shell:pet-toggle` already declared)
- `docs/PLUGIN_MAP.md` (manifest row registration — ship phase concern, not feature-build)
- `docs/workflow/roadmap/xai-web-console.md` (loop driver only)

---

## 12. Acceptance Signal (from seed brief)

> All 8 pets render with their correct animation, drag-anywhere persists position, click triggers happy state + bilingual tip, picker opens via bubble link, and rail toggle hides/shows the pet (via event bus from shell).

Decomposed into testable predicates — see `packages/plugin-web-pet/docs/test.md` §3.
