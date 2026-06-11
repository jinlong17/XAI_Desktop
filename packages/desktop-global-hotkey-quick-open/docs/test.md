# desktop-global-hotkey-quick-open — Test Plan

## Validation Goals

- Confirm the desktop app can register a global quick-open shortcut on macOS through the Rust host.
- Confirm the shortcut only shows/focuses the normal desktop app window.
- Confirm desired shortcut changes and disabled state persist across relaunch.
- Confirm conflict or registration failure is surfaced clearly and remains recoverable.
- Confirm the browser-safe settings integration stays free of `@tauri-apps/*` and `window.__TAURI__` leakage.
- Confirm the capability surface stays on `apps/desktop/src-tauri/capabilities/default.json` with `main`-window-only scope and no guest `global-shortcut:*` permissions.

## Contract Checks

- `apps/desktop/src-tauri/src/`
  - initializes the official global-shortcut plugin
  - owns registration/unregistration and runtime-state classification
  - focuses or recreates the `main` window only
  - does not reactivate overlay/control/grid behavior
- `apps/desktop/src-tauri/capabilities/default.json`
  - remains the only capability file in scope for this row
  - keeps `windows: ["main"]`
  - keeps the selected host-bridge permission surface without guest additions for:
    - `global-shortcut:allow-is-registered`
    - `global-shortcut:allow-register`
    - `global-shortcut:allow-register-all`
    - `global-shortcut:allow-unregister`
    - `global-shortcut:allow-unregister-all`
- `apps/desktop/src-tauri/src/app_config.rs`
  - migrates v1 config to v2
  - persists only `quickOpen` preference fields
  - keeps runtime failure state in memory only
- `apps/desktop/src-tauri/src/app_menu.rs`
  - exposes only the narrow disable/reset recovery items for this row
- browser-safe desktop hotkey package
  - exports `/web`
  - mounts from `apps/web/src/providers/AppProviders.tsx`
  - consumes only the host-injected adapter
  - never imports `@tauri-apps/*`
- settings surface
  - shows runtime state
  - allows preset change
  - allows disable/reset recovery

## Automated Checks

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
- `pnpm --filter @repo/plugin-web-settings-rest test -- src/__tests__/hotkeysPane.test.tsx`
- `pnpm --filter @repo/web test -- src/providers/AppProviders.test.tsx`
- `pnpm --filter @repo/web build`
  - must emit no browser-safety regressions in built artifacts
- `rg -n '"windows"|"permissions"|"global-shortcut:' apps/desktop/src-tauri/capabilities/default.json`
  - verify `windows` stays `["main"]` and no guest `global-shortcut:*` permission strings were added
- `pnpm --filter desktop tauri build --debug --bundles app`

## Rust Test Coverage

### Config migration and persistence

- missing config file still produces v2 defaults with quick-open enabled
- existing v1 file migrates forward without losing `window.main`
- changed quick-open preference round-trips through save/load
- disabled state round-trips through save/load
- runtime conflict/native-error state is not written to disk

### Shortcut lifecycle coverage

- preset id resolves to the expected accelerator string
- enabling a preset unregisters any previous shortcut before re-registering
- disabling unregisters the active shortcut
- repeated write of the same preset is idempotent
- invalid preset input returns a recoverable error or `invalid_config` snapshot
- non-`main` callers are rejected by the Rust allowlist for any quick-open snapshot/config command

### Trigger behavior coverage

- shortcut action focuses/shows existing `main`
- hidden/minimized `main` becomes visible/focused
- missing `main` path recreates only the normal `main` window or returns a typed error if recreation is intentionally unsupported
- no overlay/control/grid window label is touched by the shortcut path

### Menu helper coverage

- custom menu IDs remain stable:
  - `help.disable_quick_open_shortcut`
  - `help.reset_quick_open_shortcut`
- disable/reset menu actions reuse the same persistence/apply path as settings writes
- disable/reset menu actions publish the updated snapshot to the bridge subscription path

## Web / settings coverage

### Browser-safe adapter tests

- missing `window.__XAI_DESKTOP_GLOBAL_HOTKEY__` degrades safely
- present adapter returns and updates snapshots correctly
- `AppProviders`-mounted bridge hydrates once with `getSnapshot()` and installs one long-lived `subscribe(...)` listener
- adapter subscription pushes snapshot updates after native/menu changes even if the hotkeys pane was not already open
- no `@tauri-apps/*` or `window.__TAURI__` strings appear in the feature package source

### Hotkeys pane coverage

- existing 10-row web shortcut table still renders
- desktop quick-open section renders current shortcut and status
- selecting a new preset updates displayed state
- disabled state renders clearly
- conflict/native-error helper copy renders clearly
- reset/disable controls call feature actions and refresh state from the mounted bridge store rather than a pane-local adapter

## Mock Strategy

- mock the host-injected desktop adapter in web/unit tests
- do not use real system-global shortcuts in automated tests
- model registration conflict and native failure via Rust test seams or deterministic fakes
- use fixture config files for v1 and v2 migration tests

## Manual macOS Smoke

- launch the desktop app on real macOS hardware
- confirm the default quick-open shortcut registers on first run
- trigger the shortcut while the app is backgrounded and verify the normal `main` window focuses
- disable the shortcut, relaunch, and verify it remains disabled
- change to a non-default preset, relaunch, and verify the new preset remains active
- force or reproduce a conflict scenario and verify:
  - settings UI shows the conflict state
  - Help-menu recovery actions remain usable
  - disabling or resetting clears the issue when a valid shortcut is chosen
- confirm no overlay/control/grid surface is created

## Residual Risks

- Real macOS shortcut conflicts are environment-dependent and still require on-device verification.
- Recreate-if-absent behavior for `main` depends on current app-lifecycle semantics and must be verified against the live host.
- Built-artifact browser-safety checks remain important because the settings surface is browser-rendered even though the shortcut is host-owned.
- Capability drift is a review target: if build later requires guest `global-shortcut:*` permissions, that is a design change and should reopen plan review.
