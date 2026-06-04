# Test Strategy — xai-web-meditation

> Roadmap row #16 · Test strategy + acceptance criteria + coverage targets
> Design: `packages/xai-web-meditation/docs/design.md`
> API: `packages/xai-web-meditation/docs/api.md`

## 0. 2026-06-04 coverage update

The current suite covers the schema v2 configurable meditation upgrade:
100 tests pass across picker/render/player/persistence/type/style/registry
surfaces.

- New coverage: 7 ambient sound ids, volume control, schema v2 defaults,
  custom duration, infinite mode, clock size/color slots, custom-scene
  save/edit/delete, and custom scene validation.
- Web Audio itself is browser-only and gracefully no-ops in jsdom when
  `AudioContext` is unavailable; rendered flow is covered by browser smoke.

## 1. Tooling

- Vitest 3 + jsdom 26 (mirrors habits / matrix / pomodoro setup).
- `@testing-library/react` 16 + `@testing-library/user-event` 14.
- `@testing-library/jest-dom` 6 matchers.
- `vi.useFakeTimers()` for time-driven assertions (player elapsed,
  ClockDisplay tick).
- `crypto.randomUUID` is used for custom scene ids in browsers; tests run in
  jsdom where it is available, with a Date fallback in product code.
- Test setup file `vitest.setup.ts` clears `localStorage` per test
  (mirrors `xai-web-matrix/vitest.setup.ts`).

## 2. Acceptance criteria categories

### 2.1 AC-PICK-* (picker interaction — 8 IDs)

- **AC-PICK-1**: 5 scene cards render with localized labels in EN.
- **AC-PICK-2**: clicking a scene card sets `data-active` (or `.active`)
  on that card and unsets on others.
- **AC-PICK-3**: 4 clock cards render with mini static `ClockDisplay`
  previews; each shows the fixed `03:44:17` time.
- **AC-PICK-4**: clicking a clock card updates the preview card's
  `ClockDisplay`.
- **AC-PICK-5**: 7 sound cards render with icons (none → `soundOff`,
  rain → `rain`, otherwise `sound`).
- **AC-PICK-6**: 5 duration chips render with values 5/10/15/25/45 and
  bilingual unit suffix.
- **AC-PICK-7**: clicking a duration chip updates the preview meta-row
  count.
- **AC-PICK-8**: same picker click twice = no-op (idempotent — `setPref`
  equality guard).

### 2.2 AC-PREVIEW-* (preview card — 5 IDs)

- **AC-PREVIEW-1**: preview card's inline `background` style is the
  active scene's `grad` string.
- **AC-PREVIEW-2**: preview meta-row reflects all 4 selectors after
  changing each one independently.
- **AC-PREVIEW-3**: preview `ClockDisplay` is live (advances after
  `vi.advanceTimersByTime(1000)`).
- **AC-PREVIEW-4**: clicking the "Start session" button toggles `active`
  to true.
- **AC-PREVIEW-5**: preview card icon set matches expectation (leaf /
  clock / sound / timer).

### 2.3 AC-PLAYER-* (fullscreen player — 9 IDs)

- **AC-PLAYER-1**: when `active === true`, an element with
  `class="med-player"` is in the DOM at `position: fixed` (verified via
  `getComputedStyle`).
- **AC-PLAYER-2**: player's inline background is the active scene's
  `grad`.
- **AC-PLAYER-3**: player renders exactly 18 `.particle` divs.
- **AC-PLAYER-4**: player's central clock matches the user's selected
  `clock` variant.
- **AC-PLAYER-5**: countdown text `mm:ss` decreases after
  `vi.advanceTimersByTime(60_000)` (e.g. 15:00 → 14:00).
- **AC-PLAYER-6**: progress bar's inline `width` grows with elapsed
  time (e.g. after 5min of 15min → `33%` ± 1).
- **AC-PLAYER-7**: clicking the exit button removes the player from the
  DOM.
- **AC-PLAYER-8**: exit button has `aria-label` equal to
  `s("meditation.exit")` in both EN ("Exit") and ZH ("退出").
- **AC-PLAYER-9**: when `duration === 5` and `elapsed === 300`, `remaining`
  is `0` and `mm:ss` is `00:00`.
- **AC-PLAYER-10**: infinite mode displays elapsed time and never counts down
  to an automatic end state.

### 2.4 AC-PERSIST-* (storage round-trip — 7 IDs)

- **AC-PERSIST-1**: changing any picker writes the full blob to
  `localStorage["xai_meditation_prefs"]` (verify with `JSON.parse(
  localStorage.getItem(...))`).
- **AC-PERSIST-2**: unmount + remount restores the last selection.
- **AC-PERSIST-3**: cold mount with empty localStorage applies
  `DEFAULT_PREFS` (ocean / split / water / 15).
- **AC-PERSIST-4**: corrupted JSON in localStorage → falls back to
  `DEFAULT_PREFS` and does not throw.
- **AC-PERSIST-5**: unknown `scene: "mars"` in localStorage → clamped
  to `"ocean"`; other fields preserved.
- **AC-PERSIST-6**: `schemaVersion: 999` → still loads and migrates to
  schema v2 defaults for missing fields.
- **AC-PERSIST-7**: cross-tab `storage` event with new blob updates the
  current tab's UI (assert via `window.dispatchEvent(new StorageEvent(
  "storage", { key: "xai_meditation_prefs", newValue: ... }))`).
- **AC-PERSIST-8**: custom duration and infinite mode persist independently
  from fixed duration.
- **AC-PERSIST-9**: custom scene save/edit/delete updates `customScenes` and
  selected scene id correctly.

### 2.5 AC-I18N-* (bilingual parity — 6 IDs)

- **AC-I18N-1**: render with `lang="en"` shows "Meditation" in the
  module title; `lang="zh"` shows "冥想".
- **AC-I18N-2**: `pick_scene` / `pick_clock` / `pick_sound` /
  `duration` headers all have EN and ZH variants present.
- **AC-I18N-3**: scene labels: 5 EN ("Forest" / "Ocean" / "Night Sky" /
  "Rain Window" / "Void") and 5 ZH ("森林" / "海洋" / "夜空" / "雨窗" /
  "虚空") all reachable.
- **AC-I18N-4**: clock labels: 4 EN + 4 ZH all reachable.
- **AC-I18N-5**: sound labels: 7 EN + 7 ZH all reachable.
- **AC-I18N-6**: `mins` suffix: "min" (EN) / "分钟" (ZH) appears on
  every duration chip.

### 2.6 AC-A11Y-* (accessibility — 4 IDs)

- **AC-A11Y-1**: under `prefers-reduced-motion: reduce`, the `.particle`
  rule has `display: none` AND `.breathe-ring` has
  `animation: none; transform: scale(0.8)`. (Verified via static CSS
  inspection of `styles.css`.)
- **AC-A11Y-2**: exit button has `aria-label` (not just visual icon).
- **AC-A11Y-3**: scene / clock / sound / duration buttons are
  keyboard-focusable (`tabindex` not negative) and clicking via
  `userEvent.keyboard("{Enter}")` while focused works.
- **AC-A11Y-4**: contrast: scene-card `.scene-label` text on the
  gradient background — manual XVENDOR-7 check; not blocking unit tests.

### 2.7 AC-TOKENS-* (style discipline — 3 IDs)

- **AC-TOKENS-1**: `styles.css` contains zero `#[0-9a-fA-F]{3,8}\b`
  hex literals. (regex grep test).
- **AC-TOKENS-2**: every `color` / `background` / `border-color` rule
  in `styles.css` references `var(--...)` OR `oklch(...)` OR
  `currentColor` OR `transparent` OR `inherit` OR `color-mix(...)`.
- **AC-TOKENS-3**: `@keyframes med-breathe` uses only `transform` (no
  `width` / `height` / `top` / `left` keyframe properties).

### 2.8 AC-SHELL-* (slot registration — 3 IDs)

- **AC-SHELL-1**: `meditationSlotRegistration.moduleId === "meditation"`,
  `icon === "leaf"`, `railOrder === 9`, `showInRail === true`.
- **AC-SHELL-2**: `apps/web/src/routes/modules/shellRegistrations.tsx`
  imports `meditationSlotRegistration` from
  `@repo/plugin-web-meditation` and includes it in the
  `webShellModuleRegistrations` array (the line 60 placeholder is
  gone).
- **AC-SHELL-3**: `apps/web/package.json`'s `dependencies` includes
  `@repo/plugin-web-meditation: workspace:*`.

### 2.9 AC-REGISTRY-* (storage registry — 2 IDs)

- **AC-REGISTRY-1**: `PREF_REGISTRY.xai_meditation_prefs` exists with
  the exact shape from `api.md` §2.1.
- **AC-REGISTRY-2**: `plugin-web-storage` test suite still green
  (regression).

### 2.10 AC-BARREL-* (public surface — 2 IDs)

- **AC-BARREL-1**: `src/index.ts` exports `MeditationModule`,
  `meditationSlotRegistration`, all public types listed in
  `api.md` §1.2, and `MEDITATION_STORAGE_KEY`.
- **AC-BARREL-2**: `src/index.ts` does NOT export anything from
  `src/internal/*`.

### 2.11 AC-TYPE-* (typed-d tests — 6 IDs)

`__tests__/types.test-d.ts` uses `expectTypeOf` from `vitest`:

- **AC-TYPE-1**: `SceneId` is the literal union of 5 known scenes.
- **AC-TYPE-2**: `ClockVariant` is the literal union of 4 variants.
- **AC-TYPE-3**: `AmbientSoundId` is the literal union of 5 sounds.
- **AC-TYPE-4**: `Duration` is the literal union of 5 numbers.
- **AC-TYPE-5**: `MeditationPrefs.scene` is `SceneId` (not `string`).
- **AC-TYPE-6**: `meditationSlotRegistration` satisfies
  `WebModuleSlotRegistration` from `@repo/xai-web-shell`.

### 2.12 AC-XVENDOR-* (cross-vendor manual smoke — 7 IDs, DEFERRED to ship)

Per `discovery-review.md` §9 Q8 — declared but execution deferred to
ship-time human (matches habits / matrix / countdown / pet precedent).

- **AC-XVENDOR-1**: Chrome — picker → start → exit cycle works.
- **AC-XVENDOR-2**: Safari 17 — same.
- **AC-XVENDOR-3**: Firefox 121 — same.
- **AC-XVENDOR-4**: lang switch mid-session — all labels swap
  correctly.
- **AC-XVENDOR-5**: DevTools Performance tab shows steady 60fps for
  breathing ring + particles for 10s sample.
- **AC-XVENDOR-6**: cross-tab — picker change in tab A immediately
  reflects in tab B (storage event).
- **AC-XVENDOR-7**: `prefers-reduced-motion: reduce` system setting
  hides particles + freezes ring.

## 3. Test files

```
packages/xai-web-meditation/src/__tests__/
├── MeditationModule.render.test.tsx        AC-PICK-1..3, AC-PICK-5..6, AC-PREVIEW-1..5, AC-I18N-1..6
├── MeditationModule.pick.test.tsx          AC-PICK-2, AC-PICK-4, AC-PICK-7, AC-PICK-8
├── MeditationModule.persist.test.tsx       AC-PERSIST-1..7
├── MeditationPlayer.test.tsx               AC-PLAYER-1..9, AC-A11Y-2
├── ClockDisplay.test.tsx                   covers digital/split/analog/minimal + static + live tick (AC-PICK-3)
├── validate.test.ts                        AC-PERSIST-4..6 (unit)
├── formatRemaining.test.ts                 unit assertions on AC-PLAYER-5, AC-PLAYER-9
├── getScene.test.ts                        unit on fallback semantics
├── computeAnalogAngles.test.ts             unit on angle math
├── registration.test.tsx                   AC-SHELL-1
├── registry-presence.test.ts               AC-REGISTRY-1
├── styles.css.tokens.test.ts               AC-TOKENS-1..3 (regex / parse)
├── index-barrel.test.ts                    AC-BARREL-1, AC-BARREL-2
└── types.test-d.ts                         AC-TYPE-1..6

apps/web/src/routes/modules/__tests__/
└── shellRegistrations.test.ts (extend)     AC-SHELL-2, AC-SHELL-3
```

## 4. Mock strategy

| Real | Stubbed |
|---|---|
| `@repo/plugin-web-tokens` `useI18n` | Real (deterministic; depends only on `lang`). |
| `@repo/plugin-web-storage` `usePref` + jsdom localStorage | Real. |
| `@repo/xai-web-shell` `useWebShell` | **Stubbed** in tests that don't mount a `WebShellProvider` — use `vi.mock("@repo/xai-web-shell", () => ({ useWebShell: () => ({ lang: "en" }), ... }))`. |
| `setInterval` / `setTimeout` | `vi.useFakeTimers()` per test that asserts time. |
| `Date.now()` / `new Date()` | Frozen via `vi.setSystemTime(new Date(2026, 4, 23, 10, 0, 0))` for AC-PLAYER-5 / AC-PLAYER-6 / AC-PLAYER-9. |
| `crypto.randomUUID` | Not used. |
| `<audio>` | Not instantiated. |

## 5. Coverage targets

| Metric | Target |
|---|---|
| Statements | ≥ 90% |
| Branches | ≥ 85% |
| Functions | ≥ 95% |
| Lines | ≥ 90% |

Coverage tool: `vitest run --coverage` (v8 provider, configured in
`vitest.config.ts`). Excluded from coverage:

- `src/index.ts` (barrel, no logic).
- `internal/icons.tsx` (static SVG paths).
- `internal/scenes.ts` (static data).

## 6. Cross-vendor manual smoke

Per §2.12 — declared as AC-XVENDOR-1..7. Execution deferred to ship-time
human (matches matrix / habits / countdown / pet precedent). Results
recorded in `dev_log.md` `Verify Notes` block when `feature-verify`
runs.

## 7. Exit gates (feature-verify gate set)

`feature-verify` flips status to READY_TO_SHIP only when ALL gates pass:

1. `pnpm --filter @repo/plugin-web-meditation test` → 100% pass.
2. `pnpm --filter @repo/plugin-web-meditation check-types` → 0.
3. `pnpm --filter @repo/plugin-web-meditation lint` → 0 (under
   `--max-warnings 0`).
4. `pnpm --filter @repo/plugin-web-meditation test:coverage` → meets §5
   targets.
5. `pnpm --filter @repo/plugin-web-storage check-types` → 0 (registry
   edit didn't regress).
6. `pnpm --filter @repo/plugin-web-storage test` → 100% pass.
7. `pnpm --filter @repo/web check-types` → 0 (shellRegistrations edit
   didn't regress).
8. `pnpm --filter @repo/web test` → 100% pass.
9. `pnpm -w lint` green (cross-workspace).
10. `pnpm -w check-types` green (cross-workspace).
11. All AC-* (§2.1–§2.11) unit tests pass.
12. AC-XVENDOR-1..7 declared in this file (§6); execution DEFERRED to
    ship-time human per precedent.
13. Commit history is clean (single intent per commit; conventional
    `type(scope): summary` body).
14. `dev_log.md` `Status Panel` is `READY_TO_SHIP` + `Suggested Next:
    ship`.
