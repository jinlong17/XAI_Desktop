# Test Strategy — @repo/plugin-web-pet

> Vitest + React Testing Library + jsdom for unit/component coverage.
> Cross-vendor smoke (P3) covers pointer-events + CSS animation rendering
> in Chrome / Safari 17+ / Firefox latest on real macOS hardware.

## 1. Tooling

- **Runner**: `vitest@^3.2.1`
- **DOM**: `jsdom@^26`
- **Component**: `@testing-library/react@^16` + `@testing-library/user-event@^14`
- **Setup**: `setupFiles: ["./vitest.setup.ts"]` clears `localStorage` before each test, installs a `ResizeObserver` polyfill if needed, and patches `window.innerWidth`/`innerHeight` to deterministic defaults (1280 × 800).
- **Mocks**: NONE required. All three workspace deps (`@repo/plugin-web-tokens`,
  `@repo/plugin-web-storage`, `@repo/xai-web-event-bus`) are SHIPPED and used
  with their real implementations. Only `localStorage` is JSDom-native; tests
  reset it between cases.
- **Command**: `pnpm --filter @repo/plugin-web-pet test`.

## 2. Coverage Map

| Layer | File | What it covers |
|---|---|---|
| Pure helper | `__tests__/drag.test.ts` | `clampPos` math at edges, center, oversize coords, negative coords |
| Pure data | `__tests__/petDefs.test.ts` | `PET_DEFS` has all 8 ids; each id has matching anim; both `en` and `zh` non-empty |
| Hook | `__tests__/useTipRotation.test.tsx` | Initial bubble at t=0, dismiss at t=5500 ms, cycle at t=12000 ms; resets on `lang` change; pauses when `!on \|\| pickerOpen` |
| Hook | `__tests__/useToggleSync.test.tsx` | Event fires → `internalOn` updates; prop changes → reconciles; unmount cleans up listener |
| Component | `__tests__/PetArt.test.tsx` | All 8 ids render an `<svg>` with `width="84" height="84"`; mood `"happy"` swaps eye paths |
| Component | `__tests__/DesktopPet.behavior.test.tsx` | Render flow: on=true mounts body, on=false unmounts body, on=false+pickerOpen keeps picker |
| Component | `__tests__/DesktopPet.drag.test.tsx` | Pointer down/move/up sequence updates pos; persisted to `xai_pet_pos`; click vs drag distinction via `moved` flag |
| Component | `__tests__/DesktopPet.click-tip.test.tsx` | Click (no movement) → mood "happy" + bubble appears with one of 5 tip strings (random — assert set membership); mood reverts after 1.6 s |
| Component | `__tests__/DesktopPet.bubble-side.test.tsx` | When pos.x > innerWidth - 280, bubble has class `pet-bubble-left`; else `pet-bubble-right` |
| Component | `__tests__/DesktopPet.event.test.tsx` | Emit `web:shell:pet-toggle` with `on:false` while prop on=true → internal mirror hides; prop change re-reconciles |
| Component | `__tests__/DesktopPet.lang.test.tsx` | Render with `lang="en"` shows EN tips; switch to `lang="zh"` re-renders tips in ZH |
| Component | `__tests__/PetPicker.test.tsx` | Open/close, 8 rows rendered, current row gets `.current` class + "Selected" label, row click calls `onSelect(id) THEN onClose()`, scrim/close-button close |
| Component | `__tests__/PetPicker.preview.test.tsx` | Each row's avatar has class `pet-anim-<animid>` (animation live) and renders the `idle` mood SVG |
| Integration | `__tests__/DesktopPet.persistence.test.tsx` | Pre-seed `localStorage.xai_pet_id = "ember"` → renders Ember; pre-seed `xai_pet_pos = {x:200,y:300}` → renders at that transform |
| Integration | `__tests__/DesktopPet.resize.test.tsx` | Simulate `resize` shrinking viewport below pos → pos re-clamped + persisted |
| Barrel | `__tests__/index-barrel.test.ts` | Verifies public surface: `DesktopPet`, `PetPicker`, `PET_DEFS`, types are exported from `index.ts` |
| Type | `__tests__/types.test-d.ts` | Compile-time check: `DesktopPetProps.on` is `boolean`, not `boolean \| undefined`; `PetPickerProps.current` is `PetId` |

## 3. Acceptance Criteria (decomposed from seed brief §5)

| AC ID | Predicate | Test |
|---|---|---|
| AC-PET-1 | All 8 pets render with their correct SVG | `PetArt.test.tsx` |
| AC-PET-2 | Each pet animates per `PET_DEFS[i].anim` (CSS class on body) | `DesktopPet.behavior.test.tsx` + `PetPicker.preview.test.tsx` (class assertion) + visual smoke in P3 |
| AC-PET-3 | Drag anywhere persists position to `xai_pet_pos` | `DesktopPet.drag.test.tsx` + `DesktopPet.persistence.test.tsx` |
| AC-PET-4 | Drag clamps to viewport (8px ≤ pos ≤ wh-92px) | `drag.test.ts` (pure) + `DesktopPet.drag.test.tsx` (integration) |
| AC-PET-5 | Click triggers happy mood (1.6 s) + random tip bubble | `DesktopPet.click-tip.test.tsx` |
| AC-PET-6 | Tip bubble is bilingual via `useI18n(lang).s("pet.*")` | `DesktopPet.lang.test.tsx` |
| AC-PET-7 | "Change pet" link in bubble opens picker | `PetPicker.test.tsx` (via spy on `setPickerOpen`) + `DesktopPet.behavior.test.tsx` (link click path) |
| AC-PET-8 | Picker shows live animated previews | `PetPicker.preview.test.tsx` (class assertion) + P3 smoke |
| AC-PET-9 | Picker selection persists `xai_pet_id` | `PetPicker.test.tsx` + `DesktopPet.persistence.test.tsx` |
| AC-PET-10 | Rail toggle (`web:shell:pet-toggle` event) hides/shows pet | `DesktopPet.event.test.tsx` |
| AC-PET-11 | Bubble side flips based on pet x-position | `DesktopPet.bubble-side.test.tsx` |
| AC-PET-12 | Tip rotation cycles every 12 s after initial 5.5 s dismiss | `useTipRotation.test.tsx` (`vi.useFakeTimers`) |
| AC-PET-13 | Window resize re-clamps pet position | `DesktopPet.resize.test.tsx` |
| AC-PET-14 | Corrupted `petId` falls back to "mochi" | `DesktopPet.persistence.test.tsx` |
| AC-PET-15 | Pet click on `.pet-swap-btn` opens picker without triggering drag | `PetPicker.test.tsx` (via `stopPropagation` assertion) |
| AC-PET-16 | Public barrel exposes only the documented surface | `index-barrel.test.ts` |

## 4. Mock Strategy

| Dependency | Strategy |
|---|---|
| `@repo/plugin-web-tokens` `useI18n` | **Real**. The shipped hook is pure (no side-effects), supports `"en"` and `"zh"`. Tests assert on returned string values. |
| `@repo/plugin-web-storage` `usePref` | **Real**. `localStorage` is JSDom-native. Each test clears `localStorage` in `beforeEach`. |
| `@repo/xai-web-event-bus` `emitWebEvent` + `useWebEventListener` | **Real**. The bus runs on an `EventTarget` — events fire synchronously in JSDom. To test inbound, tests call `emitWebEvent("web:shell:pet-toggle", { on:false, source:"rail-bottom" })` directly. |
| `window.innerWidth` / `innerHeight` | **Patched** in `vitest.setup.ts` to 1280 × 800; per-test override via `Object.defineProperty`. |
| Pointer events | **`@testing-library/user-event`** with `setupPointer()` and manual `fireEvent.pointerDown/Move/Up` for fine control over coordinates. |
| Timers | **`vi.useFakeTimers()`** for tip rotation cycle tests; restored in `afterEach`. |
| CSS animations | **Not asserted at runtime** (jsdom does not run keyframes). Tests assert the **class name** on the body (`.pet-anim-bob`); visual verification deferred to P3 smoke. |

## 5. Test Phasing

Aligned to dev_log's 3-phase plan:

| Phase | Tests added |
|---|---|
| **P1 — Pet renderer + 8 characters + animations** | `petDefs.test.ts`, `PetArt.test.tsx`, `index-barrel.test.ts`, `types.test-d.ts` |
| **P2 — Drag + persistence + click happy state** | `drag.test.ts`, `useTipRotation.test.tsx`, `useToggleSync.test.tsx`, `DesktopPet.behavior.test.tsx`, `DesktopPet.drag.test.tsx`, `DesktopPet.click-tip.test.tsx`, `DesktopPet.bubble-side.test.tsx`, `DesktopPet.event.test.tsx`, `DesktopPet.lang.test.tsx`, `DesktopPet.persistence.test.tsx`, `DesktopPet.resize.test.tsx` |
| **P3 — PetPicker + smoke + tests** | `PetPicker.test.tsx`, `PetPicker.preview.test.tsx`, cross-vendor smoke in `apps/web/` (Chrome / Safari / Firefox) |

## 6. Cross-Vendor Smoke (P3)

Run `pnpm --filter apps/web dev` and verify on real macOS:

| Vendor | Smoke item | Pass criterion |
|---|---|---|
| Chrome latest | Pet renders, animates, drags, clicks | All 8 pets cycle in picker; drag updates position smoothly; click shows bubble |
| Safari 17+ | SVG pointer-events on pet body | `pointerdown` registers; no swallowing by inner SVG paths |
| Firefox latest | Bubble side-flip + resize | Right edge → bubble flips left; resize re-clamps |
| All 3 | Rail-bottom 🐾 button toggle | Click 🐾 → pet hides; click again → pet returns at last persisted pos |
| All 3 | Reload persistence | Set pet to Ember, drag to (400,300), reload page → still Ember at (400,300) |

Smoke results recorded in `dev_log.md` Verify section.

## 7. Performance & Battery Sanity (advisory, manual)

Manual check during P3 smoke (not gated by feature-verify):

- Chrome DevTools → Performance → record 5 s with pet visible + idle.
  Expect: no scripting frames; only "Composite Layers" frames from GPU.
- macOS Activity Monitor → Energy tab. Compare 60 s with pet on vs off.
  Expect: < 0.2 mW Energy Impact delta (GPU-composited transforms only).

If the delta exceeds 1 mW, investigate: most likely cause is `glow`'s
`filter: drop-shadow` not being GPU-composited in Safari. Mitigation: swap
`drop-shadow` for `box-shadow` on the wrapper.

## 8. Acceptance Gate

`feature-verify` passes when:

1. `pnpm --filter @repo/plugin-web-pet test` exits 0 with all AC-PET-* covered.
2. P3 cross-vendor smoke matrix all green on real macOS.
3. `pnpm --filter @repo/plugin-web-pet lint` exits 0.
4. `pnpm --filter @repo/plugin-web-pet type-check` exits 0.
5. `pnpm --filter apps/web build` exits 0 (host integration smoke).

Failure of any single item → BLOCKED with details in `dev_log.md`.
