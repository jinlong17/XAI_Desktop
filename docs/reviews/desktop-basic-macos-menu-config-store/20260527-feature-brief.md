# Feature Brief — desktop-basic-macos-menu-config-store

| Field | Value |
|---|---|
| Feature | desktop-basic-macos-menu-config-store |
| Title | Phase 1 Basic macOS App Menu and Local Config Store |
| Date | 2026-05-27 |
| Source | ADR-0011 Phase 1 native-shell scope; `docs/audit/2026-05-26-patch-roadmap-source.md` candidate feature row `desktop-basic-macos-menu-config-store` |
| Executor | feature-plan (Codex, gpt-5.4 inline) |

## Requirement

Add a minimal native macOS application menu for the Phase 1 desktop app and persist host-owned desktop configuration locally without reintroducing overlay startup or widening into Phase 2 status-bar / notification / hotkey / updater work.

## Naming Rationale

`desktop-basic-macos-menu-config-store` is already the canonical slug in the patch-roadmap source and matches the actual gap:

- `desktop` — the scope is the Tauri/macOS host on `dev`
- `basic-macos-menu` — the target is the native app menu, not the existing tray/status sync icon
- `config-store` — the second deliverable is local host configuration persistence for Phase 1 desktop settings

## Scope

- Native app menu owned by `apps/desktop/src-tauri/` with practical `File` / `Edit` / `View` / `Window` / `Help` coverage for macOS
- Explicit handling of the existing `commands/menubar.rs` tray/status code as deferred Phase 2 work, not the Phase 1 app-menu implementation
- Local config store owned by the native host, with a stable on-disk path, schema version, and migration/default contract
- Persistence only for host-owned desktop settings needed by Phase 1:
  - main-window frame/state
  - other native-shell flags only if they are truly host-owned and already needed by active Phase 1 behavior
- Menu/config integration points where practical, such as config reveal/reset actions, without redesigning Web modules

## Non-goals

- No Phase 2 status-bar icon, notifications, global hotkeys, auto-update, or full native polish pass
- No Phase 3 SQLite, local-first repository, sync-log, or Web-storage redesign
- No reactivation of overlay/control/grid default startup
- No deletion of quarantined overlay code in `legacy_overlay.rs` or `platform::macos::legacy_overlay` unless it is demonstrably dead
- No migration of existing Web preference ownership from `apps/web` / `packages/plugin-web-*` into the desktop host

## Acceptance

- Planning artifacts exist for this feature: brief, discovery review, design, api, test, and dev_log
- The plan distinguishes the existing tray/status surface from the required native app menu and keeps tray/status behavior deferred
- The selected option defines:
  - the native menu construction boundary
  - menu-event handling ownership
  - the config file path
  - a versioned config schema
  - what is and is not persisted in Phase 1
- Verification requirements cover Rust tests plus real macOS manual checks for native menu behavior and config persistence
- The plan explicitly verifies that default launch remains the normal `main` app window only

## Current Baseline

- `desktop-tauri-web-dist-normal-window` is SHIPPED and keeps the active host on one normal window
- `desktop-web-auth-offline-mode` is READY_TO_SHIP and already makes desktop dev/build inject the offline Phase 1 auth/runtime profile
- `desktop-phase1-build-packaging-pipeline` is READY_TO_SHIP and already treats the `.app` bundle as the canonical local artifact
- `web-external-runtime-offline-gates` is READY_TO_SHIP and already handles Phase 1 online-surface degradation
- `apps/desktop/src-tauri/src/lib.rs` still installs `commands::menubar::install_sync_menubar(app.handle())`, which is a tray/status surface rather than a native app menu
- `apps/desktop/src-tauri/src/commands/bookmarks.rs` provides a good Rust-side precedent for typed command contracts and MockRuntime IPC tests
- There is no current persisted native config store; active console-frame persistence remains in-memory only

## Deferred Validation

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`
- Manual macOS launch to verify:
  - native app menu appears in the system menu bar
  - practical menu items work
  - no tray/status icon work is reintroduced or expanded
  - relaunch restores the intended host-owned settings from the config store
