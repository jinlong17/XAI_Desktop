# spaces-multimonitor-matrix — Test Plan

## Automated Checks

- `test -f docs/reviews/window-ground-truth/spaces-multimonitor-matrix/README.md`
- `system_profiler SPDisplaysDataType`
- `rg -n "CollectionBehavior|setCollectionBehavior|setLevel|configure_grid_window|configure_control_window" apps/desktop/src-tauri/src/platform/macos/window_ext.rs`

## Blocked Manual Checks

- Optional independent replay before ship: `pnpm --filter desktop tauri dev`
- Optional replay scenarios: single display, dual display, Mission Control, multiple Spaces, fullscreen-app adjacent Space
- Optional evidence path: attach screenshots/logs to `docs/reviews/window-ground-truth/spaces-multimonitor-matrix/`
