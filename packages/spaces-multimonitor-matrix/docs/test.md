# spaces-multimonitor-matrix — Test Plan

## Automated Checks

- `test -f docs/reviews/window-ground-truth/spaces-multimonitor-matrix/README.md`
- `system_profiler SPDisplaysDataType`
- `rg -n "CollectionBehavior|setCollectionBehavior|setLevel|configure_grid_window|configure_control_window" apps/desktop/src-tauri/src/platform/macos/window_ext.rs`

## Blocked Manual Checks

- `pnpm --filter desktop tauri dev`
- Single display, dual display, Mission Control, multiple Spaces, fullscreen-app adjacent Space
- Attach screenshots/logs to `docs/reviews/window-ground-truth/spaces-multimonitor-matrix/`
