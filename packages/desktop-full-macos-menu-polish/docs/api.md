# desktop-full-macos-menu-polish — API / Contract Notes

## Contract Summary

This feature refines existing native-host menu contracts. It should not create a broad new application API. The primary interfaces remain:

- Rust-side menu construction
- Rust-side menu event handling
- narrow reads of existing host/runtime state for custom item enablement

## Upstream Interfaces

### Native menu ownership

- `apps/desktop/src-tauri/src/app_menu.rs` remains the single ownership point for:
  - top-level menu structure
  - stable custom menu item IDs
  - menu event dispatch
  - custom item state application

### Host config contract

- `apps/desktop/src-tauri/src/app_config.rs` remains the host-owned config seam
- this feature may call existing reset/reveal helpers
- this feature should not redesign the config schema except for tiny menu-support metadata if absolutely necessary

### Quick-open integration contract

- Reuse the existing narrow functions in `commands/global_hotkey.rs`:
  - `disable_quick_open_from_menu(app)`
  - `reset_quick_open_to_default_from_menu(app)`
- If disabled-state logic needs runtime inspection, prefer reading the existing quick-open snapshot/state rather than inventing new commands

### Statusbar pattern reference

- `commands/statusbar.rs` is not a direct dependency target
- it may be used as a native reference for item enable/disable update patterns only

## Downstream Interfaces

### Required top-level sections

The polished menu must preserve or improve the following top-level sections:

- app submenu
- `File`
- `Edit`
- `View`
- `Window`
- `Help`

### Custom item ID contract

Current stable IDs that should be preserved unless review/build finds a concrete defect:

- `help.reveal_config_folder`
- `help.reset_main_window_state`
- `help.disable_quick_open_shortcut`
- `help.reset_quick_open_shortcut`

If any item moves from `Help` to `Window`, preserve the underlying action contract and introduce an ID rename only if the review/build rationale is explicit and migration-safe.

### Custom enabled/disabled contract

Recommended state inputs:

- `main_window_present: bool`
- `config_dir_available: bool`
- `quick_open_enabled: bool`
- `quick_open_default_active: bool`

Recommended state outputs:

- `Reveal Config Folder`:
  - enabled when config-dir resolution succeeds
- `Reset Main Window State`:
  - enabled when the `main` window exists
- `Disable Quick Open Shortcut`:
  - enabled when quick open is currently enabled
- `Reset Quick Open Shortcut to Default`:
  - enabled when quick open is disabled, conflicted, invalid, or non-default

### Standard action contract

- Prefer predefined native items for app/edit/view/window actions
- Do not emulate standard actions in JS when Tauri already provides them
- Any custom fallback handler must remain host-owned and scoped to the `main` window only

## Error Semantics

- Menu build/install failure remains startup-fatal.
- Custom action failure should log clearly in Rust and fail only that action, not the whole app.
- Config resolution failure for a support item should disable the item where possible rather than crash startup.
- Quick-open recovery actions should preserve the existing `AppResult<()>` semantics from `commands/global_hotkey.rs`.

## Permission Notes

- No new broad desktop command surface should be added for this feature by default.
- No plugin-facing or web-facing menu API is required.
- If a tiny helper is added for menu state, keep it Rust-internal unless tests prove a command seam is necessary.

## Idempotency Notes

- Rebuilding the native menu on startup should be deterministic.
- Reapplying custom enabled/disabled state should be safe to run repeatedly.
- `Reset Main Window State` must remain idempotent.
- Quick-open reset/disable actions must remain safe to repeat without corrupting config state.
