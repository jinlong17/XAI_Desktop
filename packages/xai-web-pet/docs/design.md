# Design Snapshot — @repo/plugin-web-pet

> Decision freeze produced by `feature-plan`. This document is **read-only**
> from the perspective of `feature-build` — phase work refers back here for
> the "Why" and quotes this snapshot in commit bodies.

## Selected Option

**D1 Mount mechanism:** Option B — top-level mount in `apps/web/src/App.tsx`
as sibling of `<Shell>` inside `<WebShellProvider>`. Prop `on` is authoritative;
pet also subscribes to `web:shell:pet-toggle` for defensive sync.

**D2 Animation engine:** Option A — CSS `@keyframes` defined in
`packages/plugin-web-pet/src/pet.css` (side-effect import). 7 named keyframes:
`bob`, `hop`, `sway`, `glow`, `still`, `twinkle`, `flicker`. Applied via
`pet-anim-<animid>` class on the body and on each picker row's avatar.

**D3 Picker preview:** Option A — reuse `PetArt[id]("idle")` + same
`pet-anim-<animid>` class so animations run live in the picker.

**D4 Tip rotation:** Option A — port `setInterval` cycle verbatim with named
constants in `src/internal/timing.ts`.

**D5 Drag clamp + bubble flip:** Verbatim port of prototype math plus a new
`window.resize` re-clamp listener (records re-clamped pos via `usePref`).

## Review Doc Path

`docs/reviews/xai-web-pet/20260523-discovery-review.md`

## Review Date / Version

2026-05-23 / v1 (initial port).

## Frozen Assumptions (4)

1. **Persistence** — `xai_pet_pos` and `xai_pet_id` already declared in
   `@repo/plugin-web-storage` `PREF_REGISTRY` with `owner: "xai-web-pet"`.
   Defaults: `{x:24, y:520}` and `"mochi"`. This row consumes via
   `usePref()`; **DOES NOT** modify the registry.
2. **i18n** — `pet.hello`, `pet.working`, `pet.idle`, `pet.tip1..4` already
   present in both EN + ZH bundles of `@repo/plugin-web-tokens/src/i18n.ts`.
   Consumed via `useI18n(lang).s("pet.*")`. **DOES NOT** add new i18n keys.
3. **Event channel** — `web:shell:pet-toggle` already typed in
   `packages/core/src/types/events.ts:182-187` with payload
   `{ on: boolean; source: 'rail-bottom' | 'settings' | 'shortcut' }`. Pet
   **subscribes only**; emit side ships in `xai-web-shell` row #5.
4. **Icons** — `paw` already in `WebShellIconName` (shipped). PetPicker
   close button uses an **inline SVG** (private to `PetPicker.tsx`), so this
   row **does not extend** `WebShellIconName` or touch `xai-web-shell/icons.tsx`.

## Dependency Overview

### Runtime workspace dependencies (3 W1-shipped packages)

| Dep | What it gives the pet | Stable status |
|---|---|---|
| `@repo/plugin-web-tokens` | `useI18n` for tip strings + bundled `tokens.css` (transitive — host already imports) | SHIPPED (W1) |
| `@repo/plugin-web-storage` | `usePref("xai_pet_pos")`, `usePref("xai_pet_id")`, type re-exports `PetId` + `PetPos` | SHIPPED (W1) |
| `@repo/xai-web-event-bus` | `useWebEventListener("web:shell:pet-toggle", ...)` | SHIPPED (W1) |

### Runtime peer dependencies

- `react ^19.2.0`
- `react-dom ^19.2.0`

No `react-router` peer — pet is not routed.

### Dev dependencies

- `@repo/eslint-config`
- `@repo/typescript-config`
- `@types/react`, `@types/react-dom`
- `@testing-library/react ^16`
- `jsdom ^26`
- `vitest ^3.2.1`

### What the pet exports (public surface)

```ts
// packages/plugin-web-pet/src/index.ts
export { DesktopPet } from "./DesktopPet.js";
export { PetPicker } from "./PetPicker.js";       // standalone usable from settings panel later
export type { DesktopPetProps, PetPickerProps } from "./types.js";
export { PET_DEFS } from "./internal/petDefs.js"; // re-exported read-only catalog
export type { PetDef } from "./types.js";
```

### What the pet imports from host

Nothing. The pet does **not** import from `@repo/xai-web-shell` or `apps/web/`.
The host imports the pet and passes `on` + `lang` props.

### Outgoing event emits

**None.** Pet is a pure consumer of `web:shell:pet-toggle`. No new event keys.

### Cross-row contract

This row does **not** modify any other workspace package. Concurrent sibling
rows (#13 matrix, #17 countdown) are safe to plan/build in parallel.

## Component Topology

```
apps/web/src/App.tsx
  └── <WebShellProvider modules petOn setPetOn lang railPos>
        ├── <Shell ...>                        ← shipped W1
        │     └── <Outlet/>                    ← routed modules
        └── <DesktopPet on={petOn} lang={lang}/>   ← this row, top-level sibling

packages/plugin-web-pet/src/
  index.ts                       — public barrel
  DesktopPet.tsx                 — root component (drag, mood, bubble, picker open/close)
  PetPicker.tsx                  — modal overlay (scrim + 8-row list + inline close SVG)
  PetArt.tsx                     — 8 SVG renderers + <Eyes/> + <Mouth/> helpers
  pet.css                        — side-effect: 7 @keyframes + .pet-* class rules
  types.ts                       — public DesktopPetProps, PetPickerProps, PetDef
  internal/
    petDefs.ts                   — PET_DEFS catalog: id × anim × name × desc
    timing.ts                    — TIP_CYCLE_MS, TIP_FIRST_DISMISS_MS, etc.
    drag.ts                      — pure clampPos(pos, viewport) helper
    useTipRotation.ts            — encapsulates the prototype's tip cycle
    useToggleSync.ts             — listens to web:shell:pet-toggle; syncs internal mirror
  __tests__/                     — Vitest + RTL (see test.md)
```

## State Ownership

| State | Owner | Storage |
|---|---|---|
| `petOn` | `apps/web/src/App.tsx` (shipped W1) | `useState` (non-persisted; resets to `true` on reload — matches prototype) |
| `lang` | `apps/web/src/App.tsx` (shipped W1) | `useState` (non-persisted) |
| `petId` | `DesktopPet.tsx` | `usePref("xai_pet_id")` (persisted) |
| `pos` | `DesktopPet.tsx` | `usePref("xai_pet_pos")` (persisted) |
| `mood` | `DesktopPet.tsx` | `useState<"idle" \| "happy">` — `"happy"` lasts 1.6 s after click |
| `bubble` | `DesktopPet.tsx` | `useState<string \| null>` — managed by `useTipRotation` |
| `pickerOpen` | `DesktopPet.tsx` | `useState<boolean>` |
| `drag` | `DesktopPet.tsx` | `useState<{ox,oy,moved} \| null>` — null when not dragging |
| `internalOn` (event mirror) | `useToggleSync` (internal hook) | `useState<boolean>` — defaults to prop `on`; updated by event listener; reconciled to prop on `useEffect([on])` |

## Risks & Open Questions

See discovery review §9 (R1–R5 + O1–O3). R1 (Safari pointerdown on SVG)
is addressed by wrapping each SVG in a `<div className="pet-body">` with
explicit `pointer-events: auto` and `cursor: grab/grabbing`.

## Out of Scope (Hard Boundary)

- **No edits** to `@repo/xai-web-shell` (frozen, shipped — Shell already emits
  `web:shell:pet-toggle`).
- **No edits** to `@repo/plugin-web-tokens` (frozen, shipped — i18n strings
  already cover `pet.*`).
- **No edits** to `@repo/plugin-web-storage` (frozen, shipped — registry
  already declares `xai_pet_pos` + `xai_pet_id`).
- **No edits** to `packages/core/src/types/events.ts` (frozen, shipped — event
  declared).
- **No new event channels.** Pet is consumer-only.
- **No router edits.** Pet is not routed.
- **No drag-onto-card interaction** (DESIGN.md §13 future extension; out of
  v1 scope).

## ADR Anchor

`docs/adr/0007-xai-web-console-build-form.md` §S4 (port: `pet.jsx` →
`packages/plugin-web-pet/src/`), §S5 (TSX rules), §S7 (event bus contract).
