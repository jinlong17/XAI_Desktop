# test.md — desktop-host-capability-profile-split

> Validation strategy. Frozen assumptions: see design.md.

## 1. Unit coverage (Vitest)

### P1 — core resolver (`packages/core/tests/`)

- `resolveDesktopHost({ VITE_XAI_DESKTOP_HOST: "tauri" }) === "tauri"`.
- `resolveDesktopHost({})` / undefined env → `"none"`.
- `resolveDesktopHost({ VITE_XAI_DESKTOP_HOST: "anything-else" }) → "none"`.
- `isDesktopHost("tauri") === true`; `isDesktopHost("none") === false`.
- If Option-B fallback approved (O1): `resolveDesktopHost({}, { __TAURI_INTERNALS__: {} }) === "tauri"`;
  env wins / fallback only when env absent; resolver stays pure (no global read
  without injection).
- Regression guard: `isDesktopPhase1OfflineRuntime` + `resolveWebRuntimeProfile`
  tests still pass unchanged (KEEP path intact).

### P2 — capability modules

- `desktop-native-notifications-reminders`: with host signal present →
  supported; absent → `non_desktop_runtime` / `unsupported`. Verify all 3
  callsites (:64/:139/:180); :180 still requires adapter AND host.
- `desktop-statusbar-quick-actions`: `runtimeSupported` true iff host present
  (+ adapter); Start Pomodoro / Today's Tasks gated correctly.
- `desktop-auto-update-release-channel`: both callsites (:125/:147) → updater
  configured iff host present; `updater_not_configured` otherwise.
- `desktop-global-hotkey-quick-open`: if a gate exists, mirror; else assert
  no behavioural change.
- Update each suite's mocking from `vi.stubEnv("VITE_WEB_RUNTIME_PROFILE", …)`
  to stub the host signal (env `VITE_XAI_DESKTOP_HOST` or injected `host`).

### P2 — host wiring

- `apps/web/src/providers/AppProviders.test.tsx`: with host signal →
  `mountDesktopLocalFirstRepositoryBridge` called, `__XAI_DESKTOP_*` globals SET,
  desktop transport selected, `setDesktopWebImport…` enabled. Without host →
  bridge NOT mounted, globals DELETED, web transport, enable switches off.
- `plugin-web-storage` storage tests: enable=false → `unmountDesktopRepoBridge()`.

## 2. Contract coverage

- `@repo/core` barrel exports `resolveDesktopHost` / `isDesktopHost` /
  `DesktopHost` / `XAI_DESKTOP_HOST_TAURI`.
- KEEP callsites still import and use `isDesktopPhase1OfflineRuntime`
  (decoupling assertion): UI modules do NOT import `isDesktopHost`; capability
  modules do NOT newly couple to UI profile. (Optional source-text guard test.)

## 3. Regression / E2E (UI alignment — MUST NOT break)

Manual, on real macOS desktop build (`pnpm dev` in `apps/desktop/` after P3):
- R-UI-1: Organizer rail hidden (web-live alignment preserved).
- R-UI-2: Boards opens with a default board (not empty offline cache).
- R-UI-3: mock-auth auto-enters `/app` without login.
- R-CAP-1: native notifications/reminders available (was silently off).
- R-CAP-2: status-bar Start Pomodoro / Today's Tasks available.
- R-CAP-3: auto-update / release-channel configured (not
  `updater_not_configured`).
- R-CAP-4: local-first repo bridge mounted; `__XAI_DESKTOP_WEB_IMPORT__ /
  RECONNECT_SYNC / BACKUP` present; web import / reconnect / backup work.
- R-WEB-1 (browser `web-live` build): capabilities OFF, UI unchanged — no
  desktop globals leak into the browser.

## 4. Mock strategy

- Primary seam: env. Tests inject `env`/`import.meta.env` so `vi.stubEnv` (the
  existing pattern) keeps working — this is the explicit testability constraint.
- Optional global fallback: `vi.stubGlobal("__TAURI_INTERNALS__", …)` or inject
  `globals` arg — resolver stays pure.
- `@repo/core` is Stable → no mock for the resolver; capability packages tested
  with stubbed host signal + stubbed adapter.

## 5. Acceptance criteria

- [ ] All P1 core resolver tests pass.
- [ ] All P2 capability + host-wiring tests pass (`pnpm --filter @repo/core test`
      + per-package Vitest).
- [ ] KEEP callsites unchanged; UI-alignment regression checks R-UI-1..3 pass on
      real macOS.
- [ ] Capability checks R-CAP-1..4 pass (capabilities restored) on real macOS.
- [ ] Browser web-live R-WEB-1 passes (no desktop leak).
- [ ] No new typed events / Tauri command changes.
- [ ] `desktop-phase1-offline` not reintroduced as a UI profile.
