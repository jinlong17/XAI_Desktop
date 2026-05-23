# Discovery Review — xai-web-meditation

> Roadmap row #16 · Wave W2c · Parallel-Agent dispatch 2026-05-23
> Author: claude-opus-4-7 — feature-plan (discovery pass)
> Source brief: docs/reviews/xai-web-meditation/20260523-roadmap-seed.md
> Source PRD: web design/DESIGN.md §4.9 + web design/module-meditation.jsx
> Authority: ADR-0007 §S4 port-map row `module-meditation.jsx` →
> `packages/plugin-web-meditation/src/`

## 1. Requirement restatement

Port the Meditation module from `web design/module-meditation.jsx` (243 LOC)
into a workspace plugin at `packages/xai-web-meditation/` published as
`@repo/plugin-web-meditation`. The module contributes a rail-visible slot at
`/app/meditation` (icon: `leaf`, railOrder: 9) and ships:

### 1.1 Picker view (default in-rail render)

- **Large preview card** — full-width scene gradient background + small clock
  overlay + meta strip (scene / clock / sound / duration icons) + a primary
  "Start session" button.
- **4 selectors stacked under the preview**:
  - **Scene** — 5 scene cards in a `scene-grid`, each with its own oklch
    gradient and bilingual label (`Forest / Ocean / Night / Rain / Void`
    × `森林 / 海洋 / 夜空 / 雨窗 / 虚空`).
  - **Clock style** — 4 cards in a `clock-grid`, each rendering a static
    (frozen-time = 03:44:17) mini `ClockDisplay` preview + bilingual label
    (`Digital / Split / Analog / Minimal`).
  - **Ambient sound** — 5 cards in a `sound-grid` (`Silence / Flowing Water /
    Soft Rain / Ocean Waves / Forest Birds` × `无声 / 流水 / 细雨 / 海浪 /
    鸟鸣`) with appropriate icon (`sound` / `soundOff` / `rain`).
  - **Duration** — 5 chip buttons (5 / 10 / 15 / 25 / 45) with bilingual unit
    label (`min` / `分钟`).

### 1.2 Fullscreen player view

Activated by **Start session**; deactivated by the top-right **Exit** button:

- Full-viewport fixed overlay above rail + topbar; background = selected
  scene gradient; subtle dark overlay for legibility.
- **Ambient rising-particle layer** — 18 absolute-positioned `<div>`s,
  evenly distributed horizontally, animated bottom→top with staggered delays
  + speeds; particle color = scene `accent`.
- **Centered live clock** — same `ClockDisplay` variant the user picked, in
  full-size mode, color = scene `accent`.
- **Breathing ring** — outlined ring (`border` style), animated via
  `transform: scale(0.6) → scale(1.0)` on an 8s `ease-in-out infinite
  alternate` cycle; border color = scene `accent`. A "Breathe / 呼吸" label
  centered inside.
- **Bottom progress band** — thin progress bar (width = `elapsed / total`)
  + mono `MM:SS` remaining countdown + ambient sound name.
- **Exit button** — fixed top-right; circular icon button; `aria-label`
  bound to `s("meditation.exit")`.

### 1.3 Persistence

Per seed brief hard constraint: "every state choice persists" + "ambient
sound choice persisted". Single JSON blob `xai_meditation_prefs` keyed by:

```ts
{
  schemaVersion: 1,
  scene: "ocean",       // SceneId
  clock: "split",       // ClockVariant
  sound: "water",       // AmbientSoundId
  duration: 15,         // 5 | 10 | 15 | 25 | 45
}
```

`active` state (player on/off) is NOT persisted — closing the tab during a
session does not auto-resume the player on reopen. (Confirmed against the
prototype: `setActive(false)` on every Exit; never serialized.)

## 2. Source reading

### 2.1 web design/module-meditation.jsx (243 LOC)

- `MeditationModule({ lang })` — top-level component, 4 `useState` hooks,
  reads `MOCK.meditationScenes` for the active scene's gradient + accent.
- `PickerGroup({ title, children })` — generic section wrapper, used 4 times.
- `ClockDisplay({ variant, accent, mini, static })` — pure renderer with
  optional `setInterval(setNow, 1000)` ticker (skipped when `static`).
  Static mode renders frozen time = 2024-01-01 03:44:17 for grid previews.
  - **Digital** — `HH:MM:SS` mono single line.
  - **Split** — three monospaced cells with `:` separators.
  - **Analog** — inline SVG, 12 tick marks + hour/minute/second hands
    rotated by computed angles; second hand uses fixed `oklch(70% 0.18 25)`.
  - **Minimal** — `HH` + dim `MM` two-cell mono.
- `MeditationPlayer({ scene, clock, sound, duration, lang, onExit })` —
  manages `elapsed` (seconds) via `setInterval(+1, 1000)`. Renders 18 ambient
  particles via `Array.from({length:18}).map`. Reads `s("meditation.breathe")`
  for the ring label and `s(\`meditation.sounds.${sound}\`)` for the footer.

### 2.2 MOCK.meditationScenes (web design/i18n.js:629–635)

```js
[
  { id:"forest", grad:"linear-gradient(160deg, oklch(45% 0.07 145), oklch(20% 0.04 145))", accent:"oklch(82% 0.10 145)" },
  { id:"ocean",  grad:"linear-gradient(160deg, oklch(50% 0.10 230), oklch(22% 0.06 230))", accent:"oklch(85% 0.10 220)" },
  { id:"night",  grad:"linear-gradient(160deg, oklch(28% 0.05 280), oklch(12% 0.04 260))", accent:"oklch(85% 0.08 280)" },
  { id:"rain",   grad:"linear-gradient(160deg, oklch(40% 0.04 240), oklch(18% 0.02 240))", accent:"oklch(80% 0.06 240)" },
  { id:"void",   grad:"linear-gradient(160deg, oklch(18% 0.01 220), oklch(8% 0.01 220))",  accent:"oklch(90% 0.005 220)" },
]
```

All values are already in `oklch()` — no new token additions to
`packages/plugin-web-tokens/src/tokens.css` are required. Per seed brief:
"Scene gradients use oklch values; no hard-coded hex." This payload is
copied verbatim into `internal/scenes.ts` as a typed `const SCENES`.

### 2.3 plugin-web-tokens/src/i18n.ts:174–188 / 368–382

The full `meditation.*` namespace is already wired in **both** EN and ZH
i18n shards (`title / enter / exit / pick_scene / pick_clock / pick_sound /
scenes.* / clocks.* / sounds.* / duration / mins / breathe / start`). The
shell's `nav.meditation` key is also present (line 17 / 211). **No i18n
edit is required by this row.**

### 2.4 packages/core/src/types/events.ts

`ConsoleModuleId` (`packages/core/src/types/events.ts:8`) already includes
`'meditation'`. No new entry needed. The shell-level `web:shell:module-change`
channel (line 175) is sufficient to flag `moduleId: "meditation"` on rail
navigation; this is emitted by `Shell.tsx` automatically — no module-level
emit is required for entering the rail.

**No new event channels are needed by this row.** Player-active state is
local to the module (CSS `position: fixed; inset: 0; z-index: 100` covers
rail+topbar without coordination); Exit toggles a local `useState<boolean>`.

### 2.5 packages/xai-web-shell/src/types.ts

`WebShellIconName` already has `"leaf"` declared (line 30). No icon
additions to the shell are required. Module-internal glyphs (`close`,
`sound`, `soundOff`, `rain`, `play`, `dots`) are inlined in
`internal/icons.tsx` (mirrors habits Q5 / matrix Q2 / countdown precedent).

### 2.6 plugin-web-storage/src/internal/registry.ts

Append target: line 354 (after `xai_habits_state` closes, before the final
`} as const;`). Pattern mirrors `xai_matrix_state` (line 328) and
`xai_habits_state` (line 341):

- New opaque alias `MeditationPrefsBlob = unknown` (after line 96).
- New registry entry `xai_meditation_prefs` with `codec: "json"`,
  `owner: "xai-web-meditation"`, `category: "module"`, `schemaVersion: 1`,
  `proposed: false` (canonical name approved by worker brief #16).
- One-line append to `apps/web/package.json` `dependencies` block:
  `"@repo/plugin-web-meditation": "workspace:*"`.
- One-line swap to `apps/web/src/routes/modules/shellRegistrations.tsx`
  line 59 (the current `placeholder("meditation", "Meditation", "leaf", 9)`)
  → `meditationSlotRegistration`.

## 3. Dependency scan

| Dependency | Status (PLUGIN_MAP) | Mock needed? | Notes |
|---|---|---|---|
| `@repo/core` (types: `WebModuleId`, `ConsoleModuleId`) | Stable | No | `meditation` member already in `ConsoleModuleId` |
| `@repo/plugin-web-tokens` (i18n + tokens + oklch CSS variables) | Stable | No | `meditation.*` namespace pre-wired |
| `@repo/plugin-web-storage` (`usePref`, `setPref`, registry) | Stable | No | Append one entry per §S8 owner-row pattern |
| `@repo/xai-web-event-bus` (`emitWebEvent`) | Stable | No | Not used by this row (no module-level emits) |
| `@repo/xai-web-shell` (`WebModuleSlotRegistration`, `useWebShell`) | Stable | No | Slot-pattern host wrapper |

All five dependencies are Stable (W1 packages). No mocking is required.

## 4. Cross-package writes (scope expansion)

This row touches three files outside its primary directory, all per the
**§S8 owner-row registration pattern** established by matrix / habits /
pomodoro / countdown / pet:

| File | Edit | Sibling-overlap risk |
|---|---|---|
| `packages/plugin-web-storage/src/internal/registry.ts` | (a) `+1 line` opaque type `MeditationPrefsBlob = unknown` near line 92; (b) `+12 lines` registry entry at line 354 (end-of-block append) | None — sibling #12 calendar has no persisted blob (read-only month view); sibling #18 ai-chat has its own keys (`xai_ai_convos`, `xai_ai_insights`, `xai_ai_voice`) per ADR-0007 row #18 — disjoint key names + disjoint append positions |
| `apps/web/src/routes/modules/shellRegistrations.tsx` | Line 59: swap `placeholder("meditation", "Meditation", "leaf", 9)` → `meditationSlotRegistration` + one `import` line at top | None — sibling #12 swaps line 55 (calendar); sibling #18 swaps line 51 (ai) — all line-disjoint |
| `apps/web/package.json` | One additive dep line in `dependencies` | None — additive line; pnpm auto-merges |

This is **identical** to the habits row #15's write-scope expansion which
the reviewer cleared (Q6 APPROVE: "standard §S8 owner-row registration
path; siblings #13/#14/#17/#19 use this pattern").

## 5. JSX → TSX strategy (ADR-0007 §S5 — applied 10 rules)

Following the §S5 deltas already proven by matrix / habits / pomodoro:

| Rule | Application |
|---|---|
| **R1** Strip `window.*` globals | Replace `window.Icon` (used: `leaf`, `dots`, `clock`, `sound`, `soundOff`, `rain`, `timer`, `play`, `close`) with `internal/icons.tsx` inline SVGs. Replace `window.useI18n(lang)` with `useI18n` from `@repo/plugin-web-tokens` (or local `useI18n` if not exported — TBD via Q1). Replace `MOCK.meditationScenes` with imported typed `const SCENES` from `internal/scenes.ts`. |
| **R2** Typed props | All component props get explicit interfaces; `ClockDisplay` props use a discriminated `variant: ClockVariant` union. |
| **R3** Persisted state via `usePref` | `useState(...) × 4` (scene, clock, sound, duration) become one `usePref("xai_meditation_prefs", DEFAULT_PREFS)`. `active` stays in `useState` (NOT persisted). |
| **R4** Event bus replaces window.dispatchEvent | N/A (this row emits no module-level events). |
| **R5** No inline string concatenation for classNames | Replace `"scene-card" + (scene===sc.id?" active":"")` with `clsx`-style local helper or template-string with conditional segments. |
| **R6** Side-effect CSS import | `src/index.ts` imports `./styles.css` once; `sideEffects` array in `package.json` declares it. |
| **R7** Bilingual everywhere | All literal strings via `s("...")`; the `MeditationPlayer`'s `s(\`meditation.sounds.${sound}\`)` template lookup is preserved (i18n keys already exist). |
| **R8** Strict null-safety on `Array.find` | `SCENES.find(x => x.id === scene)` returns `Scene | undefined`; resolve with a `getScene(id): Scene` helper that throws if missing (impossible at runtime — `scene` is always a known id from the persisted blob's narrowed union). |
| **R9** No layout-thrash animations | Breathing ring uses `transform: scale(...)`. Particles use `transform: translateY(...)` + `opacity`. Both run on the GPU compositor. No `width / height / top` keyframe animation. |
| **R10** Token-only styles | `styles.css` uses only `var(--token)`, `oklch(...)` (from MOCK), and `color-mix(in oklch, ...)`. No hardcoded hex. |

## 6. Risk inventory

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Player full-screen overlay must cover rail+topbar without coordinating with shell | Medium | CSS `position: fixed; inset: 0; z-index: 100` is sufficient. The shell's `.app` grid doesn't constrain stacking context above `z-index: 100`. Verified pattern: countdown's edit dialog uses the same approach. **Tested** via AC-PLAYER-1 (rail/topbar visually obscured). |
| R2 | Breathing ring 8s cycle at 60fps on Safari 17 | Medium | Only `transform: scale()` keyframes — Safari 17 has no compositor bugs for this; established by matrix's drag-flip transforms. Reduced-motion fallback via `@media (prefers-reduced-motion: reduce)` snaps to static `scale(0.8)`. |
| R3 | 18 simultaneous particle animations may jank low-end devices | Low | Each particle is a small (~6px) absolutely-positioned div with two animated properties (`transform translateY` + `opacity`). Compositor-only. The prototype shipped this with no jank reports. `prefers-reduced-motion` hides particles entirely. |
| R4 | Persisted `scene/clock/sound/duration` must narrow to typed unions | Low | `validatePrefs(blob: unknown): MeditationPrefs` clamps unknown ids to defaults (scene→"ocean", clock→"split", sound→"water", duration→15). Standard pattern from habits `validateHabitsState`. |
| R5 | `setInterval` in `MeditationPlayer` and `ClockDisplay` can drift / leak | Low | Each interval is cleaned up in the `useEffect` return. `MeditationPlayer` also runs on a single interval (the elapsed counter); the live `ClockDisplay` runs on a separate one. Total ≤ 2 intervals while player is active. |
| R6 | `crypto.randomUUID` may be unavailable in older Safari | N/A | This row does not generate IDs. |
| R7 | Sibling-overlap on `shellRegistrations.tsx` / `apps/web/package.json` / `registry.ts` with calendar #12 + ai-chat #18 | Medium | All three rows append-only / line-disjoint. Documented in §4. Habits row #15's identical pattern survived parallel dispatch with tasks #6 + pomodoro #14. |
| R8 | Bilingual scene labels use template-string i18n keys (e.g. `s(\`meditation.scenes.${scene}\`)`) — must not break on missing key | Low | All 5 scene ids are present in both EN and ZH i18n shards (verified at i18n.ts lines 181 + 375). A TypeScript `SceneId` literal-union narrows the input to the 5 known keys. |
| R9 | `ClockDisplay` analog variant uses fixed red second-hand `oklch(70% 0.18 25)` | Low | Token-compliant `oklch()`; the prototype hard-coded this. Documented in `design.md` §6 as "deliberate visual signal — red second-hand reads as the only sub-1s-tick element". |
| R10 | Audio source for ambient sounds is **deferred** per DESIGN.md §13 (Future) | N/A | Per seed brief: "Ambient-sound choice persisted but actual audio source is deferred"; UI picker only this row. `<audio>` element is NOT instantiated. The `sound` value is persisted + reflected in the player footer label only. |
| R11 | Lint --max-warnings 0 — historically caught unused imports / vars | Medium | Mirror habits' lint-fix discipline: assert in P3 `pnpm --filter @repo/plugin-web-meditation lint` exit 0. |
| R12 | `prefers-reduced-motion` accessibility — must disable breathing + particles | Medium | `@media (prefers-reduced-motion: reduce)` in `styles.css` collapses both. AC-A11Y-1 explicit. |

## 7. Mock strategy

Per CLAUDE.md "before working on any plugin: only Stable/Production plugins
can be depended on; In-Dev/Migrating plugins must be mocked": all
dependencies (§3) are Stable. **No mocks required.**

For tests:
- `setInterval` mocked via `vi.useFakeTimers()` + `vi.advanceTimersByTime()`
  (proven pattern in `xai-web-pomodoro/src/__tests__`).
- `@repo/plugin-web-storage` `usePref` is real (jsdom + localStorage).
- `crypto.randomUUID` not used.
- Animations: jsdom doesn't run CSS animations; we assert keyframe rule
  presence in `styles.css.tokens.test.ts` (AC-TOKENS-3 style — checks that
  `@keyframes breathe` exists + uses `transform: scale`, not `width`).

## 8. Acceptance signal (from seed brief)

> User picks scene + clock style + duration, presses Start, player goes
> full-screen and runs to completion or until Exit, every state choice
> persists, and EN/中文 parity holds.

Decomposed into AC-* test categories (see `test.md` §2):

- **AC-PICK-1..6** — picker buttons render + selecting one updates state.
- **AC-PREVIEW-1..4** — preview card reflects current state + clock ticks.
- **AC-PLAYER-1..7** — start opens fullscreen overlay; exit dismisses;
  countdown decreases; progress grows; particles + breathing render.
- **AC-PERSIST-1..6** — persistence round-trip + reload + corrupted blob
  recovery.
- **AC-I18N-1..6** — EN/中文 parity for every visible label.
- **AC-A11Y-1..3** — `prefers-reduced-motion` honored, exit button
  `aria-label`, focus visible.
- **AC-TOKENS-1..3** — styles use tokens / oklch only.
- **AC-SHELL-1..2** — slot registration + rail rendering.
- **AC-XVENDOR-1..7** — Safari 17 / Chrome / Firefox manual smoke.

## 9. Open questions for feature-review

- **Q1** — `useI18n` import path. The prototype uses `window.useI18n(lang)`.
  In TSX-land, `@repo/plugin-web-tokens` exports `useI18n` as a hook. Sibling
  rows (habits / matrix / countdown) import it from
  `@repo/plugin-web-tokens`. Confirm.
  - **Planner recommendation**: import from `@repo/plugin-web-tokens` per
    sibling convention.

- **Q2** — Should `scene / clock / sound / duration` be split into 4 separate
  registry entries (e.g. `xai_meditation_scene`, etc.) vs one JSON blob
  `xai_meditation_prefs`?
  - **Planner recommendation**: single blob `xai_meditation_prefs`.
    Matches habits / matrix single-blob precedent. Atomic update on every
    picker change; one schemaVersion bump path; fewer registry entries.

- **Q3** — Persist `active` (player-running) state across reload, or wipe on
  reload?
  - **Planner recommendation**: do NOT persist `active`. The original
    prototype does not. Resuming a partially-elapsed player on reload would
    require persisting `elapsed` too and re-syncing the wall clock — out of
    scope. Confirmed by re-reading prototype.

- **Q4** — Inline icons (`close`, `sound`, `soundOff`, `rain`, `timer`,
  `play`, `dots`) in `internal/icons.tsx` vs reusing the shell `Icon`?
  - **Planner recommendation**: inline. Matches matrix Q2 + habits Q5 +
    countdown precedent. Shell `Icon` is not exported as a public
    component (`@repo/xai-web-shell/src/icons.tsx` is internal).

- **Q5** — Static clock preview in clock picker uses fixed time
  `03:44:17`. Preserve? Or use real "now" for previews?
  - **Planner recommendation**: preserve `03:44:17`. The prototype's
    explicit static rendering avoids 4 extra `setInterval` ticking
    instances; the choice is deliberate. (Verified: jsx line 124 — `if
    (isStatic) return;`).

- **Q6** — `prefers-reduced-motion` fallback for particles: hide entirely
  vs render statically (visible at randomized y-positions)?
  - **Planner recommendation**: hide entirely (`display: none` on
    `.particle` under the reduce media query). Simpler + a11y-correct.

- **Q7** — Reduced-motion fallback for breathing ring: hide vs static
  `scale(0.8)`?
  - **Planner recommendation**: static `scale(0.8)`. The ring is a
    deliberate focal element; hiding it removes the "Breathe" label too.
    A static ring with the label is the better a11y compromise.

- **Q8** — Cross-vendor smoke: include all 7 AC-XVENDOR-* or defer to
  ship-time human like habits / matrix?
  - **Planner recommendation**: declare 7 AC-XVENDOR-* in `test.md` §6;
    DEFER execution to ship-time human (sibling precedent).

- **Q9** — Write-scope expansion to `plugin-web-storage/registry.ts` +
  `shellRegistrations.tsx` + `apps/web/package.json` — approve?
  - **Planner recommendation**: APPROVE. Standard §S8 owner-row
    registration pattern; identical to habits / matrix / pomodoro /
    countdown / pet.

- **Q10** — `proposed: false` on the new registry entry vs `proposed: true`?
  - **Planner recommendation**: `proposed: false`. `xai_meditation_prefs` is
    the canonical name approved by the worker brief (§S8 invites owner-row
    additions). Matches habits precedent (also `proposed: false`).

- **Q11** — Particle count fixed at 18 (prototype value) vs configurable?
  - **Planner recommendation**: hard-code 18 as `PARTICLE_COUNT` constant
    in `internal/scenes.ts`. The prototype value works; configurability is
    a future row.

- **Q12** — Live clock interval period: 1000ms (prototype) vs 500ms (smoother
  second-hand on analog)?
  - **Planner recommendation**: 1000ms. Matches the prototype exactly; the
    analog second-hand "tick" feel is intentional. Smoother animation would
    require subsecond `requestAnimationFrame` — out of scope.

## 10. Verdict

**Cleared to plan** — no blocking ambiguity. All 12 risks have a mitigation.
12 open questions are answered with planner recommendations. The plan
authoring step (`feature-plan` `design.md / api.md / test.md / dev_log.md`)
proceeds immediately after this discovery.
