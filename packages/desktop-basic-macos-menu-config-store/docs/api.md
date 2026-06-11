# desktop-basic-macos-menu-config-store — API / Contract Notes

## Contract Summary

This feature changes native-host contracts. The primary interfaces are:

- Rust-side menu construction and menu-event handling
- Rust-side config load/save/apply behavior
- optional narrow debug/support actions, only if Phase 1 truly needs them

## Upstream Interfaces

### Tauri menu contract

- Use Tauri’s native Rust menu builders (`MenuBuilder`, `SubmenuBuilder`) from the host
- Respect macOS submenu rules: top-level menu entries should be submenus
- Prefer predefined native actions where available instead of custom emulation

### Tauri config-path contract

- Resolve the config directory via `app.path().app_config_dir()`
- Store host config in a single versioned file inside that directory
- Treat missing file as default state, not as an error

## Downstream Interfaces

### Native app menu contract

Required Phase 1 top-level coverage:

- application/about submenu in the first macOS slot
- `File`
- `Edit`
- `View`
- `Window`
- `Help`

Implemented support IDs:

- `help.reveal_config_folder`
- `help.reset_main_window_state`

Required scope discipline:

- do not treat `commands::menubar.rs` tray/status behavior as fulfillment of this contract
- do not add Phase 2 status-bar actions, notifications, global shortcuts, or updater actions

### Config-store contract

Recommended V1 Rust type:

```rust
struct DesktopAppConfigV1 {
    schema_version: u32,
    updated_at: String,
    window: WindowConfig,
}
```

Current `updated_at` value is an internal host timestamp tag (`unix-seconds:<epoch>`). It is host-owned metadata and not consumed by web runtime.

Required semantics:

- schema-versioned
- defaultable
- tolerant of missing file
- corruption fallback to defaults
- atomic write or best-effort temp-file rename strategy

### Persistence scope contract

Persist in V1:

- main-window width/height
- main-window x/y when available and valid
- maximized/fullscreen state if validated conservatively

Do not persist in V1:

- any `xai_*` web preference keys
- auth/session secrets
- tray/status runtime details
- overlay/grid/control state

## Error Semantics

- Menu install failure is a startup failure and should fail fast.
- Config read failure from a missing file is non-fatal and should resolve to defaults.
- Config parse or migration failure should be logged and fall back to defaults, not crash the app.
- Config write failure should surface clearly in Rust logs and, if a custom support action exists, return a typed `Result<T, String>` error.

## Permission Notes

- No new broad capability expansion is expected.
- If a custom support action is exposed to JS later, keep it `main`-window scoped only.
- Do not widen permissions to solve native menu/config ownership.

## Idempotency Notes

- Repeated startup with the same config file should yield the same initial window behavior.
- Repeated writes of unchanged config should be safe.
- If a custom reset action exists, repeated reset should be idempotent and restore defaults deterministically.

## Optional Future Command Boundary

Preferred Phase 1 initial state:

- no broad JS config-management API
- config is owned and consumed by Rust startup/window lifecycle

If build or verify shows a real need for inspection/support, the only acceptable Phase 1 additions are narrow host commands such as:

- `get_app_config() -> Result<DesktopAppConfigV1, String>`
- `reset_app_config_window_state() -> Result<DesktopAppConfigV1, String>`

Those commands must remain host-owned, `main`-window scoped, and explicitly exclude web preference mutation.
