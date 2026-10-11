# API — xai-web-meditation

> Roadmap row #16 · Interface contracts + error semantics
> Design: `packages/xai-web-meditation/docs/design.md`

## 0. 2026-06-04 schema v3 detail upgrade

The current meditation module is no longer a static visual-only picker.

- `MeditationPrefs.schemaVersion` is `3`. v1/v2/unknown blobs are accepted and
  migrated by `validatePrefs`.
- `AmbientSoundId` includes `none / water / rain / waves / thunder / forest /
  whiteNoise`; non-silent sounds are generated with Web Audio, not fetched
  from bundled files or remote URLs.
- Clock configuration includes 12 variants, `clockScale`, and `clockColors`.
- Duration configuration includes `durationMode: "preset" | "custom" |
  "infinite"` plus `customDuration`.
- `customFixedDurations` stores user-added fixed duration chips such as
  `60` or `90`, separate from the built-in `5 / 10 / 15 / 25 / 45` presets.
- `customScenes` stores user-created scenes with name, colors, animation,
  sound, clock, clock colors, and default duration settings.

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
  BaseSceneId,              // "forest" | "ocean" | "night" | "rain" | "void"
  CustomSceneId,            // `custom:${string}`
  SceneId,                  // BaseSceneId | CustomSceneId
  ClockVariant,             // 12 variants across digital/split/analog/minimal/atmosphere styles
  ClockScale,               // "compact" | "normal" | "large" | "larger"
  ClockColorPalette,        // digits/hands/ring/background/highlight CSS colors
  AmbientSoundId,           // "none" | "water" | "rain" | "waves" | "thunder" | "forest" | "whiteNoise"
  PresetDuration,           // 5 | 10 | 15 | 25 | 45
  Duration,                 // number, clamped to 1..240 minutes
  DurationMode,             // "preset" | "custom" | "infinite"
  SceneAnimation,           // "particles" | "rain" | "waves" | "aurora" | "still"
  CustomScene,
  Scene,
  MeditationPrefs,          // schemaVersion 3 persisted blob
  MeditationModuleProps,
} from "./types.js";
```

### 1.3 Constant exports

```ts
export { MEDITATION_STORAGE_KEY, PRESET_DURATIONS } from "./constants.js";
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
| default | `{ schemaVersion: 3, scene: "ocean", clock: "split", sound: "water", volume: 0.55, duration: 15, customFixedDurations: [], durationMode: "preset", customDuration: 20, clockScale: "normal", clockColors, customScenes: [] }` |
| schemaVersion | `3` |
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

- `schemaVersion: 3` is the current version.
- v1, v2, and unknown-version blobs are treated as partial inputs; `validatePrefs`
  fills new fields from `DEFAULT_PREFS`.

## 3. Component API details

### 3.1 `<ClockDisplay variant accent mini static>`

```ts
interface ClockDisplayProps {
  variant: ClockVariant;
  accent?: string;
  scale?: ClockScale;
  colors?: ClockColorPalette;
  mini?: boolean;
  staticMode?: boolean;
}
```

- When `static === true`, **no** `setInterval` is started; time is the
  fixed `new Date(2024, 0, 1, 3, 44, 17)`. Used for clock-picker previews.
- When `static !== true` (default), a `setInterval(setNow, 1000)` ticks
  every second; cleared on unmount.
- All variants share the same internal time source.
- Analog digits/ring/hands/background/highlight are driven by
  `ClockColorPalette`.

### 3.2 `<MeditationPlayer scene clock sound duration lang onExit>`

```ts
interface MeditationPlayerProps {
  scene: Scene;
  sceneLabel: string;
  clock: ClockVariant;
  clockScale: ClockScale;
  clockColors: ClockColorPalette;
  sound: AmbientSoundId;
  volume: number;
  duration: Duration;
  durationMode: DurationMode;
  customDuration: number;
  lang: Lang;
  onExit: () => void;
  onVolumeChange?: (volume: number) => void;
}
```

- Starts `elapsed: 0` and advances by `1` every second via a single
  `setInterval`. Cleared on unmount.
- `total = resolveDurationSeconds(durationMode, duration, customDuration)`.
  Infinite mode returns `null` and displays elapsed time until End/Exit.
- Pause stops the elapsed timer and pauses ambient sound. Resume restarts both.
- The default player surface shows only time, scene, sound status, pause,
  controls, and end. The compact controls panel exposes sound toggle + volume.
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
- Start button pauses preview audio, closes the settings panel, and mounts the
  fullscreen player.
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
| `validatePrefs(raw)` finds unknown `scene` / `clock` / `sound` | Clamp the bad field to `DEFAULT_PREFS[field]`; preserve the rest. No log. |
| `validatePrefs(raw)` finds numeric `duration` outside 1..240 | Clamp to the supported range. |
| `validatePrefs(raw)` finds invalid `customFixedDurations` | Drop invalid, duplicate, and built-in values; sort the remaining custom values. |
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
3. `localStorage.setItem("xai_meditation_prefs", ...)` on every picker,
   setting, duration, volume, or custom-scene save/delete action.
4. Web Audio `AudioContext` is created only in the browser after a user
   play/start interaction. Tests and SSR degrade to no-op when unavailable.
5. No DOM mutations outside the rendered subtree.
6. No `fetch` / `XMLHttpRequest` / `WebSocket`.
7. No `BroadcastChannel`. (Cross-tab sync happens automatically via the
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

## 2026-09-09 save-result contract

`useMeditationPrefs` now returns `[prefs, commit(next, replacePending?), recovery]`. Commit returns true only after the shared storage setter succeeds. Recovery exposes failure (`write`, `conflict`, `account`), retry, discard and a scope-checked snapshot. A failed proposal is retained in mounted-page memory; unrelated mutations cannot replace it. Retry compares the original failed-write baseline and refuses to overwrite newer bytes. This is not an atomic multi-tab transaction. Initial corrupt/unknown-schema decoding remains a separate REL-07 concern.

Scene creation/editing advances the editor id only after success; deletion resets the editor only after success. Retrying a scene uses its latest editor values. Failed preference writes do not start playback or publish an audio change. The JSON recovery download contains committed-context settings/scenes plus the attempted proposal and current editor drafts; it has no import API. Refresh/route unmount/browser close can still discard in-memory drafts (REL-09). Captured account handles guard retry and export.

## MED-01/02 durable execution (2026-09-09)

`xai_meditation_active` is an account-owned, device-local execution row, schema v1. It is registered in PREF_REGISTRY/LOCAL_KEY_OWNERSHIP, exported with current account data and erased with owned account generations. An unscoped legacy execution row is never imported. It is not cloud sync or a session-history ledger.

Internal `createMeditationController()` exposes `getSnapshot`, `subscribe`, `retain`, `command(start|pause|resume|end|dismiss|reconcile)`, `retry` and raw `exportRecovery`. Writes require Web Locks plus captured business-account generation, session id and revision. Scope changes invalidate operation tokens; a held A lock cannot prevent B starting or allow late A finalizers to change B. Conflicting commands refresh current state without creating a permanent retry latch.

The row retains prefs at start, elapsed milliseconds, run start, absolute deadline (null for infinite), and a terminal ended state/reason/time. Pauses freeze accumulated elapsed; resume creates a new deadline from remaining duration. Due sessions end at their deadline exactly once; manual ends clamp clock rollback to the current run start. Ended rows remain until explicitly dismissed. Corrupt/unknown rows and storage failures retain original bytes and expose recovery/export.

Module unmount/browser close stops page observers and audio, preserving the row. Running time includes absence; paused time does not. Reopening shows a recovery card and never automatically starts audio. No JavaScript or audio is claimed to execute in a closed browser. If all observers are absent, due-state persistence occurs on reopening, with the original deadline as the business end time.

Audio starts only with usable AudioContext state. Rejected or nonsettling autoplay resume becomes a visible retryable failure (4 second limit). Pause/unmount/account change cancels pending playback and stops graphs. Running fixed sessions also schedule silence on the Web Audio timeline at the deadline, so JS throttling cannot keep the sound audible after the scheduled end. The controller's timer stops on paused/ended/error state. Native device/browser audio suspension and actual OS output remain browser responsibilities.
