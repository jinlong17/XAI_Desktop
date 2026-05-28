# desktop-full-macos-menu-polish — Test Plan

## Validation Goals

- Confirm the desktop app exposes a fuller macOS-native menu while preserving the shipped Phase 1 baseline.
- Confirm custom support/diagnostic items have correct enabled/disabled behavior.
- Confirm menu work does not widen into statusbar, overlay, or new hotkey scope.
- Confirm the normal `main` window remains the active desktop host surface.

## Contract Checks

- `apps/desktop/src-tauri/src/app_menu.rs`
  - preserves macOS top-level section contract
  - adds fuller `File` / `View` / `Window` coverage where planned
  - keeps stable custom item IDs or explicitly documents any rename
  - applies explicit enabled/disabled rules for custom items
- `apps/desktop/src-tauri/src/lib.rs`
  - continues installing the native app menu on startup
  - keeps menu event handling in the Rust shell
  - does not reactivate overlay/control/grid startup
- `apps/desktop/src-tauri/src/commands/global_hotkey.rs`
  - remains a tiny integration seam only
- `apps/desktop/src-tauri/src/commands/statusbar.rs`
  - remains unchanged or receives only harmless coexistence-level adjustments

## Automated Checks

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Rust Test Coverage

### Menu contract coverage

- top-level section order remains `app`, `File`, `Edit`, `View`, `Window`, `Help`
- custom item IDs remain stable
- fuller standard-action coverage is encoded in helper tests where practical
- custom item grouping across `Window` and `Help` matches the chosen build-phase decision

### Disabled-state coverage

- `Reveal Config Folder` disabled when config-dir resolution/support state is unavailable
- `Reset Main Window State` disabled when `main` window is absent
- `Disable Quick Open Shortcut` disabled when quick open is already disabled
- `Reset Quick Open Shortcut to Default` disabled when the default active state is already present
- repeated state application is deterministic

### Integration coverage

- quick-open menu helpers still update existing config/runtime state correctly
- no new overlay/control/grid startup hook is introduced
- if any custom fallback handlers are added for standard window actions, they are covered by narrow Rust tests

## Manual macOS Checks

- Launch the app and confirm the menu bar shows:
  - app submenu
  - `File`
  - `Edit`
  - `View`
  - `Window`
  - `Help`
- Confirm standard actions behave as expected on the normal window:
  - `Minimize`
  - fullscreen entry/exit
  - `Close Window` behavior if retained
  - `Quit`
- Confirm editable inputs in the web surface still respect `Copy`, `Paste`, and `Select All`
- Confirm support/diagnostic item enablement is sensible at launch and after quick-open changes
- Confirm no overlay/control/grid windows appear

## Residual Real-macOS Checks

- verify predefined native window/view actions behave correctly on the actual macOS version used for ship
- verify any item moved between `Window` and `Help` feels native and consistent
- verify quick-open recovery items remain understandable without adding verbose labels
- verify coexistence with the status bar causes no duplicate/confusing native affordances

## Mock Strategy

- Prefer pure/helper Rust tests for menu section and state logic
- Reuse existing Rust state structs rather than mocking broad plugin behavior
- If a Tauri runtime-dependent helper must be tested indirectly, keep the seam narrow and host-owned
