# click-through-matrix — Test Plan

## Automated Checks

- `test -f docs/reviews/window-ground-truth/click-through-matrix/README.md`

## Blocked Manual Checks

- `pnpm --filter desktop tauri dev`
- Real Finder/Desktop hit-test validation
- `macOSPrivateApi=true` and `false` comparison
- Screenshots/logs for transparent area, Grid item area, and resize handle

