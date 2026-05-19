# finder-dnd-path — Test Plan

## Automated Checks

- `test -f docs/reviews/window-ground-truth/finder-dnd-path/README.md`

## Blocked Manual Checks

- `pnpm --filter desktop tauri dev`
- Finder drop a file, folder, `.app`, and alias
- Confirm each payload has real path and target `gridId`
- Attach screenshots/logs to `docs/reviews/window-ground-truth/finder-dnd-path/`

