# desktop-tauri-web-dist-normal-window — API / Contract Notes

## Contract Summary

This feature changes the desktop host contract, not business logic contracts. The primary interfaces are Tauri build/runtime configuration and the exposed native capability surface.

## Upstream Interfaces

### `apps/web` build contract

- Dev server source: `apps/web` Vite server
- Build source: `apps/web` Vite dist
- Expected producer scripts:
  - dev: `apps/web` `dev`
  - build: `apps/web` `build`

This feature must not change the web module graph or browser-side route contracts.

### Desktop package script contract

- `apps/desktop/package.json` becomes a thin host wrapper around the `apps/web` frontend source for Tauri.
- Legacy desktop-frontend-only scripts should no longer imply that the active Tauri UI lives in `apps/desktop/src/App.tsx`.

## Downstream Interfaces

### Tauri main window contract

After implementation, the main window must satisfy:

- visible standard app window
- `resizable = true`
- `transparent = false`
- `decorations = true`
- `skipTaskbar = false`
- no `hiddenTitle`
- no `Overlay` title bar style

### Rust startup contract

`lib.rs` setup should expose only the Phase 1 main window path:

- no `configure_main_overlay`
- no `control` window bootstrap
- no `grid_*` startup
- no overlay-specific monitor resize/position behavior

Reusable legacy startup pieces may remain compiled behind an explicit inactive
boundary, such as `legacy_overlay::bootstrap_control_window` or
`legacy_overlay::register_state`, as long as Phase 1 `run()` does not call them.

### macOS adapter contract

`window_ext.rs` remains the platform seam, but Phase 1 active behavior must not set:

- desktop icon window levels for the main window
- `ignoresMouseEvents`
- overlay transparency/background assumptions

Legacy desktop-level, click-through, control, and grid window helpers should be
namespaced under `platform::macos::legacy_overlay` when kept for P3+ reuse.
Phase 1 active calls must use the normal-window helpers.

### Command surface contract

Recommended Phase 1 contract:

- legacy grid/control/console window lifecycle commands are not part of the active public desktop surface
- if left compiled, they must be unregistered from the active invoke surface or clearly marked unsupported for Phase 1

Preservation rule: do not delete existing transparent overlay/control/grid
implementation unless it is demonstrably dead or trivial config-only behavior.
Prefer moving, namespacing, or quarantining reusable pieces under a future or
legacy overlay boundary.

## Error Semantics

- Build/config errors should fail fast at Tauri startup or build time; do not add silent fallback to the legacy desktop bundle.
- Any temporarily retained legacy command path should use an explicit phase-aware error code rather than silently recreating overlay behavior.

## Permission Notes

- Phase 1 capability scope should default to the `main` window only unless a concrete shipped Phase 1 caller needs more.
- `control`, `console`, and `grid_*` scopes are legacy/P3 and should be removed from the active allowlist for this feature.
- Do not widen permissions to solve build wiring problems; adjust the build/startup contract instead.

## Idempotency Notes

- Re-running Tauri dev/build with the new wiring should always consume the current `apps/web` output and should not depend on any prior legacy desktop dist artifacts.
- Main-window startup must be single-path and deterministic: one main window, no side-effect child window creation.
