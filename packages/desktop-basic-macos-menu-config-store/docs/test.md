# desktop-basic-macos-menu-config-store — Test Plan

## Validation Goals

- Confirm the active desktop runtime exposes a real native macOS app menu.
- Confirm tray/status bootstrap is not being used as the Phase 1 menu solution.
- Confirm host-owned config persists locally and reloads safely.
- Confirm startup remains a single normal `main` window with no overlay/control/grid reactivation.

## Contract Checks

- `apps/desktop/src-tauri/src/lib.rs`
  - installs native app menu
  - handles native menu events where custom items exist
  - does not rely on default tray/status bootstrap for Phase 1 shell behavior
- `apps/desktop/src-tauri/src/commands/menubar.rs`
  - either inactive on the Phase 1 startup path or clearly gated/deferred
- new host config module
  - resolves `app_config_dir`
  - loads defaults when file is absent/corrupt
  - writes a versioned JSON file
- `apps/desktop/src-tauri/src/platform/macos/window_ext.rs`
  - stays on standard app-window behavior

## Automated Checks

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Rust Test Coverage

### Menu helper coverage

- menu builder emits the expected top-level submenu IDs/order
- app/about submenu is first for macOS
- predefined native items are used for standard edit/window actions where planned
- custom menu-item IDs remain stable for Phase 3 support actions:
  - `help.reveal_config_folder`
  - `help.reset_main_window_state`

### Config-store coverage

- default config produced when file is absent
- valid saved config round-trips through load/save
- corrupt JSON falls back to defaults
- unsupported `schemaVersion` follows the migration/fallback rule
- invalid persisted window bounds are rejected or clamped
- monitor-fit failures fall back to defaults

### Command / integration coverage

- only if a narrow command seam is added:
  - MockRuntime IPC tests for `get_app_config` / `reset_app_config_window_state`
  - `main`-window allowlist enforcement

## Manual macOS Checks

- Launch the desktop app and confirm the system menu bar shows:
  - app/about submenu
  - `File`
  - `Edit`
  - `View`
  - `Window`
  - `Help`
- Confirm practical standard items work:
  - `Copy` / `Paste` / `Select All` on editable fields where applicable
  - `Minimize`
  - `Enter Full Screen`
  - `Quit`
- Confirm no overlay/control/grid windows appear on launch
- Confirm the app remains a normal Dock-visible window

## Config Persistence Checks

- Resize and/or move the main window, relaunch, and verify restored state
- If fullscreen/maximized is persisted, verify restore behavior is safe on relaunch
- If a support item such as `Reveal Config Folder` or `Reset Window State` is added, verify it works without modifying web-owned preferences

## Residual Risks

- Native menu appearance and behavior cannot be fully trusted without real macOS manual verification
- Multi-monitor coordinate restore may behave differently across hardware layouts
- If tray/status code remains active by accident, automated tests may miss the scope violation unless startup/manual checks call it out explicitly
