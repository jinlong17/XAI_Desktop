# API Contract — @repo/plugin-web-pet

> Single public surface: `packages/plugin-web-pet/src/index.ts`.
> Internal modules under `src/internal/` are private — consumers MUST NOT
> import from them per CLAUDE.md "Code Boundaries".

## 1. Public Surface

### 1.1 Exported Components

#### `DesktopPet`

```ts
export interface DesktopPetProps {
  /**
   * Visibility flag. When `false`, the pet body is unmounted but
   * <PetPicker/> may still render if pickerOpen was true at toggle-off.
   * Authoritative source: apps/web/src/App.tsx `petOn` useState.
   */
  on: boolean;

  /**
   * Active UI language. Drives useI18n(lang) for tip strings and picker chrome.
   * Authoritative source: apps/web/src/App.tsx `lang` useState.
   */
  lang: Lang; // "en" | "zh" — imported from @repo/plugin-web-tokens
}

export function DesktopPet(props: DesktopPetProps): JSX.Element | null;
```

**Behaviour**

- When `on === false` AND `pickerOpen === false` → returns `null`.
- When `on === false` AND `pickerOpen === true` → returns `<PetPicker/>` only
  (matches prototype `pet.jsx` line 265–267 where Picker is reachable even
  with `!on` to allow choosing a pet before re-enabling).
- When `on === true` → returns `<div.pet-wrap>` + optional `<div.pet-bubble>`
  + optional `<PetPicker/>`.
- Subscribes to `web:shell:pet-toggle` via `useWebEventListener` (internal hook).
  Event payload `on` updates an internal mirror; prop `on` is authoritative
  (sync'd via `useEffect([on])`).

#### `PetPicker`

```ts
export interface PetPickerProps {
  open: boolean;
  onClose: () => void;
  current: PetId;        // re-exported from @repo/plugin-web-storage
  onSelect: (next: PetId) => void;
  lang: Lang;
}

export function PetPicker(props: PetPickerProps): JSX.Element | null;
```

**Behaviour**

- When `open === false` → returns `null`.
- When `open === true` → renders modal scrim + list of 8 rows (one per
  `PET_DEFS` entry). Each row's avatar shows `PetArt[id]("idle")` with
  `pet-anim-<animid>` class (live animation).
- Row click → `onSelect(id)` THEN `onClose()` (both synchronously).
- Scrim click OR close-button click → `onClose()`.
- Esc key handling: **not implemented in v1** (prototype does not handle it;
  open question for future iteration — recorded in design.md).

### 1.2 Exported Types

```ts
export type { DesktopPetProps, PetPickerProps, PetDef } from "./types.js";
export { PET_DEFS } from "./internal/petDefs.js"; // re-exported read-only

// PetId and PetPos are re-imported from @repo/plugin-web-storage:
import type { PetId, PetPos } from "@repo/plugin-web-storage";
// Consumers should import those directly from the storage package.

export interface PetDef {
  readonly id: PetId;
  readonly anim: PetAnim;
  readonly name: { readonly en: string; readonly zh: string };
  readonly desc: { readonly en: string; readonly zh: string };
}

export type PetAnim = "bob" | "hop" | "sway" | "glow" | "still" | "twinkle" | "flicker";
```

### 1.3 `PET_DEFS` Catalog (read-only)

```ts
export const PET_DEFS: readonly PetDef[] = [
  { id: "mochi",  anim: "bob",     name: { en: "Mochi",  zh: "麻薯" }, desc: { ... } },
  { id: "pip",    anim: "hop",     name: { en: "Pip",    zh: "啾啾" }, desc: { ... } },
  { id: "sprout", anim: "sway",    name: { en: "Sprout", zh: "豆芽" }, desc: { ... } },
  { id: "lumi",   anim: "glow",    name: { en: "Lumi",   zh: "小灯" }, desc: { ... } },
  { id: "drip",   anim: "bob",     name: { en: "Drip",   zh: "水滴" }, desc: { ... } },
  { id: "pebble", anim: "still",   name: { en: "Pebble", zh: "小石" }, desc: { ... } },
  { id: "star",   anim: "twinkle", name: { en: "Twink",  zh: "小星" }, desc: { ... } },
  { id: "ember",  anim: "flicker", name: { en: "Ember",  zh: "小火" }, desc: { ... } },
] as const;
```

`as const` so types are narrowed. Drip uses `bob` (same animation as Mochi
but smaller amplitude in CSS — both share `pet-anim-bob` class; visual
distinction comes from the pet body's shape, not animation parameters).

### 1.4 Side-Effect CSS

`packages/plugin-web-pet/src/pet.css` is imported as a side-effect from
`src/index.ts`. `package.json` declares `"sideEffects": ["*.css"]` so Vite
+ Rollup do not tree-shake the import.

**Selector namespace**: ALL selectors begin with `.pet-` to avoid colliding
with global tokens. No `*`-selector resets. No `body` / `html` rules.

**Keyframes provided**:

```css
@keyframes pet-bob     { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes pet-hop     { 0%,40%,100% { transform: translateY(0); } 60% { transform: translateY(-10px) rotate(-3deg); } 80% { transform: translateY(-4px) rotate(2deg); } }
@keyframes pet-sway    { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes pet-glow    { 0%,100% { filter: brightness(1) drop-shadow(0 0 6px var(--accent-soft, rgba(255,220,120,0.5))); } 50% { filter: brightness(1.15) drop-shadow(0 0 14px var(--accent, rgba(255,200,60,0.8))); } }
@keyframes pet-still   { 0%,100% { transform: none; } }   /* explicit no-op */
@keyframes pet-twinkle { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.85; transform: scale(0.96) rotate(8deg); } }
@keyframes pet-flicker { 0%,100% { transform: translateY(0) scale(1); } 30% { transform: translateY(-2px) scale(1.03); } 60% { transform: translateY(-1px) scale(0.98); } }
```

Animation duration / easing per pet (applied via class rules):

```css
.pet-anim-bob     { animation: pet-bob 2.4s ease-in-out infinite; }
.pet-anim-hop     { animation: pet-hop 1.4s ease-in-out infinite; }
.pet-anim-sway    { animation: pet-sway 3.2s ease-in-out infinite; }
.pet-anim-glow    { animation: pet-glow 2.8s ease-in-out infinite; }
.pet-anim-still   { /* no animation */ }
.pet-anim-twinkle { animation: pet-twinkle 1.8s ease-in-out infinite; }
.pet-anim-flicker { animation: pet-flicker 0.7s ease-in-out infinite; }
```

All animations use `will-change: transform` on `.pet-body` to hint GPU
compositing. `.pet-wrap` has `position: fixed; top: 0; left: 0; z-index: 60;
transform: translate(...)` for the drag.

## 2. Internal Modules (NOT public surface)

Importable only from within the package. Consumers MUST go through `index.ts`.

| Module | Purpose |
|---|---|
| `src/internal/petDefs.ts` | The PET_DEFS const (re-exported via index.ts). |
| `src/internal/timing.ts` | `TIP_CYCLE_MS = 12_000`, `TIP_FIRST_DISMISS_MS = 5_500`, `TIP_REGROW_MS = 400`, `HAPPY_DURATION_MS = 1_600`. |
| `src/internal/drag.ts` | `clampPos(raw: PetPos, viewport: { w, h }): PetPos` — pure helper. |
| `src/internal/useTipRotation.ts` | Hook signature: `useTipRotation({ on, lang, pickerOpen }) → bubble: string \| null`. |
| `src/internal/useToggleSync.ts` | Hook signature: `useToggleSync(propOn: boolean) → internalOn: boolean`. Listens to `web:shell:pet-toggle`; returns the freshest of (event-payload, prop). |

## 3. Behaviour Contracts

### 3.1 Visibility flow

| Trigger | Outcome |
|---|---|
| `on` prop transitions `true → false` | Pet body unmounts on next render. Bubble cleared. PetPicker stays open if it was open. |
| `on` prop transitions `false → true` | Pet body mounts at persisted `pos`. Tip rotation effect restarts, but waits one 12 s cycle before showing the first automatic bubble; click tips still show immediately. |
| `web:shell:pet-toggle` event with `on: false` | `internalOn` becomes `false`; same effect as prop change. On next render, prop `on` is reconciled — if prop is still `true`, body mounts again. (Use case: external future emitter wants to hide; if host still says `on=true`, prop wins. This is documented edge-case behavior.) |
| `web:shell:pet-toggle` event with `on: true` | Symmetric. |

### 3.2 Drag flow

| Event | Action |
|---|---|
| `pointerdown` on `.pet-body` | `setDrag({ ox: clientX - pos.x, oy: clientY - pos.y, moved: false })`; `setBubble(null)`. |
| `pointermove` (window) while `drag != null` | `clampPos(...)` → `setPos(...)`. If `|movementX|+|movementY| > 1`, `drag.moved = true`. |
| `pointerup` (window) while `drag != null` | If `!drag.moved` → treat as click → `setBubble(randomTip)`, `setMood("happy")`, `setTimeout(setMood("idle"), HAPPY_DURATION_MS)`. Then `setDrag(null)`. |
| `window resize` | Re-clamp current pos against new viewport; persist via `usePref` setter if it changed. |

`clampPos` math:
```ts
clampPos({ x, y }, { w, h }) = {
  x: max(EDGE_GUARD_PX, min(w - PET_BODY_PX - EDGE_GUARD_PX, x)),  // 8 ≤ x ≤ w-92
  y: max(EDGE_GUARD_PX, min(h - PET_BODY_PX - EDGE_GUARD_PX, y)),  // 8 ≤ y ≤ h-92
}
```

(Note: prototype uses `w - 96` as the upper bound, equivalent to `w - 84 - 12`
with a 12 px outer-margin allowance. We name `EDGE_GUARD_PX = 8` for the lower
clamp and the upper clamp uses `PET_BODY_PX + EDGE_GUARD_PX = 92`, giving
identical results to prototype's `96` minus 4 px conservative margin — verified
in `drag.test.ts`.)

### 3.3 Tip rotation flow

| Phase | Time | Action |
|---|---|---|
| Mount when `on === true && !pickerOpen` | t=0 | No bubble; schedule the first automatic tip. |
| First automatic tip | t=12000 ms | `setBubble(tips[0])` |
| First dismiss | t=17500 ms | `setBubble(null)` |
| Cycle tick | every 12000 ms after first tip | `setBubble(null)`; 400 ms later `setBubble(tips[(i+1)%n])`; i++ |

Tips array: `[s("pet.hello"), s("pet.tip1"), s("pet.tip2"), s("pet.tip3"), s("pet.tip4")]`
— total 5 strings, cycles indefinitely.

Click tips array (random pick on click): `[s("pet.tip1"), s("pet.tip2"),
s("pet.tip3"), s("pet.tip4"), s("pet.working")]` — total 5 strings,
deliberately overlapping with the cycle (matches prototype line 248).

### 3.4 Bubble side-flip

```ts
const bubbleSide: "left" | "right" =
  pos.x > window.innerWidth - BUBBLE_GUARD_PX /* 280 */ ? "left" : "right";
```

CSS: `.pet-bubble-left` anchors bubble to the right of `.pet-wrap`; `.pet-bubble-right`
anchors it to the left.

### 3.5 PetPicker open paths

| Trigger | Result |
|---|---|
| Click "Change pet" link in bubble | `setPickerOpen(true)`; `setBubble(null)` |
| Click `.pet-swap-btn` (small sparkle button on pet body) | `setPickerOpen(true)`; `e.stopPropagation()` so it doesn't trigger drag |
| Inside picker: click a row | `onSelect(id)` → host's `setPetId(id)` (which routes to `usePref("xai_pet_id")` setter) → `onClose()` |
| Click scrim | `onClose()` |
| Click close (×) icon button | `onClose()` |

### 3.6 PetPicker UI structure

```
.pet-picker-scrim                 — fixed full-screen, semi-opaque, blur
  .pet-picker                     — centered card
    .pp-head                      — title + close button
    .pp-list                      — 8 .pp-row buttons
      .pp-row[.current]
        .pp-avatar.pet-anim-<id>  — live animation
        .pp-meta                  — name + desc
        .pp-btn[.selected]        — "Select" / "Selected"
    .pp-foot                      — hint text
```

### 3.7 Error / edge behavior

| Edge case | Behaviour |
|---|---|
| `petId` from storage is unknown (corrupted) | `PET_DEFS.find(p => p.id === petId) || PET_DEFS[0]` — fallback to Mochi. Matches prototype line 269. |
| `pos` from storage is corrupted (e.g. NaN coords) | `usePref` returns the registry default `{x:24, y:520}` (codec failure path). Verified in `usePref` tests in `@repo/plugin-web-storage`. |
| Window resize shrinks viewport below pet pos | `useEffect(resize)` re-clamps and persists. |
| Click on the small `.pet-swap-btn` | `e.stopPropagation()` prevents pointer-down from registering as drag-start. Opens picker. |
| Event payload `web:shell:pet-toggle` with mismatched type | TypeScript type-guarded at compile time (channel name is the type key); runtime guard not needed. |
| Lang change while bubble is showing | `useTipRotation`'s effect deps include `lang` — on lang change, current bubble is dismissed and re-shown in the new language on the next cycle tick. |

## 4. Cross-Module Contracts

### 4.1 Inbound event (subscribe only)

```ts
import { useWebEventListener } from "@repo/xai-web-event-bus";

useWebEventListener("web:shell:pet-toggle", (payload) => {
  // payload: { on: boolean; source: 'rail-bottom' | 'settings' | 'shortcut' }
  // ignore `source` in v1; only consume `on`.
});
```

Already declared in `packages/core/src/types/events.ts:182-187` — no edits needed.

### 4.2 Outbound events

**None.** Pet does not emit. PetPicker selection does not emit; `onSelect` is
a local React callback into the consuming component (which itself manages
`usePref("xai_pet_id")` state).

### 4.3 localStorage / persistence

```ts
import { usePref, type PetId, type PetPos } from "@repo/plugin-web-storage";

const [pos, setPos] = usePref("xai_pet_pos");   // PetPos = {x:number, y:number}
const [petId, setPetId] = usePref("xai_pet_id"); // PetId = "mochi" | ... | "ember"
```

Both keys already declared in `PREF_REGISTRY` with `owner: "xai-web-pet"`,
schemaVersion 1. Defaults: `{x:24, y:520}` for `xai_pet_pos`, `"mochi"` for
`xai_pet_id`. No registry edits in this row.

### 4.4 i18n

```ts
import { useI18n } from "@repo/plugin-web-tokens";

const { s } = useI18n(lang);
const tip = s("pet.hello");       // EN: "Hi! Don't forget to drink water 💧"
                                  // ZH: "嗨！别忘了喝水 💧"
```

All required keys present in shipped bundles. No edits.

## 5. Manifest (`packages/plugin-web-pet/manifest.json`)

```json
{
  "name": "plugin-web-pet",
  "displayName": "Desktop Pet",
  "version": "0.0.0",
  "description": "Floating 8-character desktop pet with drag + tips + picker",
  "status": "In-Dev",
  "type": "ui",
  "author": "XAI Team",
  "enabled": true,
  "contentTypes": [],
  "windows": { "console": true },
  "events": {
    "emit": [],
    "listen": ["web:shell:pet-toggle"]
  },
  "dependencies": [
    "@repo/plugin-web-tokens",
    "@repo/plugin-web-storage",
    "@repo/xai-web-event-bus"
  ],
  "tauriCommands": []
}
```

Note: no dependency on `@repo/xai-web-shell`. The pet is mounted by the host
(`apps/web/`), not by the shell. The host edit lands in P3.
