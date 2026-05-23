# API — xai-web-meditation

> Roadmap row #16 · Interface contracts + error semantics
> Design: `packages/xai-web-meditation/docs/design.md`

## 1. Public surface (`src/index.ts`)

### 1.1 Component exports

```ts
export { MeditationModule, default } from "./MeditationModule.js";
export { meditationSlotRegistration } from "./registration.js";
```

```ts
// MeditationModule
interface MeditationModuleProps {
  /** Active UI language. Reads i18n via @repo/plugin-web-tokens useI18n. */
  lang: Lang;
}
function MeditationModule(props: MeditationModuleProps): JSX.Element;
```

`MeditationModule` is the default export so older `import MeditationModule
from "@repo/plugin-web-meditation"` syntax also works (matches habits).

### 1.2 Type exports

```ts
export type {
  SceneId,                  // "forest" | "ocean" | "night" | "rain" | "void"
  ClockVariant,             // "digital" | "split" | "analog" | "minimal"
  AmbientSoundId,           // "none" | "water" | "rain" | "waves" | "forest"
  Duration,                 // 5 | 10 | 15 | 25 | 45
  Scene,                    // { id: SceneId; grad: string; accent: string }
  MeditationPrefs,          // { schemaVersion: 1; scene; clock; sound; duration }
  MeditationModuleProps,
} from "./types.js";
```

### 1.3 Constant exports

```ts
export { MEDITATION_STORAGE_KEY } from "./constants.js";
// MEDITATION_STORAGE_KEY = "xai_meditation_prefs" as const
```

### 1.4 Slot registration export

```ts
export const meditationSlotRegistration: WebModuleSlotRegistration;
```

Consumed by `apps/web/src/routes/modules/shellRegistrations.tsx` (line 60
swap). Shape:

```ts
{
  moduleId:        "meditation",
  label:           "Meditation",
  defaultChildPath:"",
  children:        [{path:"", render:MeditationSlotHost}, {path:"*", render:MeditationSlotHost}],
  icon:            "leaf",
  railOrder:       9,
  i18nKey:         "nav.meditation",
  showInRail:      true,
}
```

### 1.5 Side-effect import

`@repo/plugin-web-meditation` performs a side-effect CSS import in
`index.ts`:

```ts
import "./styles.css";
```

`sideEffects` in `package.json` declares `"./src/styles.css"` and
`"./src/index.ts"` so Vite + Turbopack do not tree-shake the CSS away.

## 2. Storage registry contract

### 2.1 New entry in `plugin-web-storage/src/internal/registry.ts`

| Field | Value |
|---|---|
| key | `"xai_meditation_prefs"` |
| codec | `"json"` |
| default | `{ schemaVersion: 1, scene: "ocean", clock: "split", sound: "water", duration: 15 }` |
| schemaVersion | `1` |
| owner | `"xai-web-meditation"` |
| category | `"module"` |
| proposed | `false` (canonical — approved by worker brief #16) |

### 2.2 Read / write semantics

- `usePref("xai_meditation_prefs", DEFAULT_PREFS)` returns
  `[MeditationPrefs, (next: MeditationPrefs) => void]`.
- Every picker click (`onClick={() => setPrefs({ ...prefs, scene: id })}`)
  triggers an immediate `setPref` — no debounce.
- Storage `error` paths (quota, corrupted JSON, schemaVersion mismatch) all
  return `DEFAULT_PREFS` from `validatePrefs`. No error UI; no crash.

### 2.3 Migration

- `schemaVersion: 1` is the only known version. Future bumps add a
  `migrate(prev, fromVersion)` branch in `internal/validate.ts`.

## 3. Component API details

### 3.1 `<ClockDisplay variant accent mini static>`

```ts
interface ClockDisplayProps {
  variant: ClockVariant;
  accent?: string;        // CSS color string (oklch from scene). default "currentColor"
  mini?: boolean;         // smaller font + smaller svg
  static?: boolean;       // freeze time at 2024-01-01T03:44:17 + skip setInterval
}
```

- When `static === true`, **no** `setInterval` is started; time is the
  fixed `new Date(2024, 0, 1, 3, 44, 17)`. Used for clock-picker previews.
- When `static !== true` (default), a `setInterval(setNow, 1000)` ticks
  every second; cleared on unmount.
- All four variants share the same internal time source.
- Analog second-hand color is the hard-coded `oklch(70% 0.18 25)` (matches
  prototype). Hour/minute hands use `accent`.

### 3.2 `<MeditationPlayer scene clock sound duration lang onExit>`

```ts
interface MeditationPlayerProps {
  scene:    Scene;              // resolved via getScene(prefs.scene)
  clock:    ClockVariant;
  sound:    AmbientSoundId;
  duration: Duration;           // minutes
  lang:     Lang;
  onExit:   () => void;
}
```

- Starts `elapsed: 0` and advances by `1` every second via a single
  `setInterval`. Cleared on unmount.
- `total = duration * 60` seconds.
- `remaining = max(0, total - elapsed)`.
- `progress = elapsed / total` (clamped 0..1 — never overshoots).
- Renders `PARTICLE_COUNT = 18` particles with computed inline styles:
  `left: ${(i*53) % 100}%`, `animationDelay: ${i*0.6}s`,
  `animationDuration: ${10 + (i%4)*3}s`, `background: scene.accent`.
- Exit button → calls `onExit()`. No automatic dismiss when
  `remaining === 0` in v1 (user must press Exit). **Confirmed against
  prototype: it also has no auto-exit.**
- Layout: `position: fixed; inset: 0; z-index: 100`. Covers rail+topbar.

### 3.3 `<MeditationModule lang>`

- Reads persisted prefs via `useMeditationPrefs()` → `[prefs, setPrefs]`.
- Reads `active` via local `useState<boolean>(false)`.
- Picker handlers spread-update prefs and call `setPrefs(next)` —
  side-effect: localStorage write.
- Start button: `onClick={() => setActive(true)}`.
- Renders `<MeditationPlayer ... onExit={() => setActive(false)}/>` only
  when `active === true`.

### 3.4 `<MeditationSlotHost>`

- Reads `lang` from `useWebShell()` and renders `<MeditationModule
  lang={lang}/>`.
- Pure pass-through. No props.

## 4. Error semantics

| Failure mode | Behavior |
|---|---|
| `localStorage.getItem("xai_meditation_prefs")` returns `null` | Use `DEFAULT_PREFS`. No log. |
| `JSON.parse` throws | Return `DEFAULT_PREFS` (via `usePref`'s built-in catch). No log. |
| `validatePrefs(raw)` finds unknown `scene` / `clock` / `sound` / `duration` | Clamp the bad field to `DEFAULT_PREFS[field]`; preserve the rest. No log. |
| `setPref` throws (quota / disabled storage) | `usePref` swallows + warns once in dev. UI continues using in-memory state. |
| `setInterval` callback errors mid-tick | React error boundary at the route level catches. No crash; placeholder shown. |
| `getScene(id)` finds nothing (impossible — id always known) | Returns `SCENES[1]` (= ocean) safety net. |

## 5. Performance budget

| Metric | Target | Verification |
|---|---|---|
| Initial render of picker view | < 32ms on M1 (idle) | AC-PERF-1 (`vi.useFakeTimers` + `performance.now()` snapshot) |
| Picker click → re-render + localStorage write | < 8ms | AC-PERF-2 |
| Player render with 18 particles | < 16ms first paint | AC-PERF-3 |
| Steady-state breathing ring | 60fps (no layout shift) | Manual via DevTools Performance tab (XVENDOR-5) |

## 6. Idempotency

- `setPrefs(prefs)` (no-op update — same object reference) skips the
  localStorage write via `usePref`'s built-in equality guard.
- Starting the player while `active === true` is a no-op (the
  conditional render keeps the same instance — no remount).
- Exit while `active === false` cannot be triggered (button is not in
  the DOM).

## 7. Stability rules

- The 17 frozen assumptions in `design.md` §1 are **frozen contracts**.
  Any change requires a `design-revision.md` artifact + reviewer
  acknowledgment.
- Public types (`SceneId / ClockVariant / AmbientSoundId / Duration /
  Scene / MeditationPrefs / MeditationModuleProps`) follow semver:
  removing or narrowing a member is a breaking change.
- `MEDITATION_STORAGE_KEY` is part of the persistence contract; renaming
  requires a `migrate()` branch + schemaVersion bump.

## 8. Bilingual coverage

All visible labels go through `useI18n` → `s(...)`. No string literal
shall appear in JSX outside an `s(...)` call (lint rule via
`@repo/eslint-config` `no-restricted-syntax`). Existing i18n keys used:

| Key | EN | ZH |
|---|---|---|
| `nav.meditation` | "Meditation" | "冥想" |
| `meditation.title` | "Meditation" | "冥想" |
| `meditation.start` | "Start session" | "开始冥想" |
| `meditation.exit` | "Exit" | "退出" |
| `meditation.pick_scene` | "Choose a scene" | "选择场景" |
| `meditation.pick_clock` | "Clock style" | "时钟样式" |
| `meditation.pick_sound` | "Ambient sound" | "环境音" |
| `meditation.duration` | "Duration" | "时长" |
| `meditation.mins` | "min" | "分钟" |
| `meditation.breathe` | "Breathe" | "呼吸" |
| `meditation.scenes.{forest,ocean,night,rain,void}` | ... | ... |
| `meditation.clocks.{digital,split,analog,minimal}` | ... | ... |
| `meditation.sounds.{none,water,rain,waves,forest}` | ... | ... |

All present in `plugin-web-tokens/src/i18n.ts` lines 174–188 (EN) +
368–382 (ZH). **No i18n edit by this row.**

## 9. Side effects

1. `import "./styles.css"` in `src/index.ts` — globally applied CSS once.
2. `setInterval` (max 2 simultaneously while player is active: 1 for
   `elapsed` counter, 1 for live `ClockDisplay`).
3. `localStorage.setItem("xai_meditation_prefs", ...)` on every picker
   click (via `setPref`).
4. No DOM mutations outside the rendered subtree.
5. No `fetch` / `XMLHttpRequest` / `WebSocket`.
6. No `BroadcastChannel`. (Cross-tab sync happens automatically via the
   browser's `storage` event — `usePref` already wires it.)

## 10. Browser compatibility

| Browser | Min version | Notes |
|---|---|---|
| Chrome | 119 | Tested target; all features available |
| Safari | 17 | `oklch()` since 16.4; `prefers-reduced-motion` since 10.1 |
| Firefox | 121 | `oklch()` since 113; `prefers-reduced-motion` since 64 |

`oklch()` is mandatory; users on older browsers see the browser's CSS
fallback `currentColor` for unrecognized color functions — visually
degraded but functional. (Same constraint as matrix / habits / pomodoro.)
