# finder-dnd-path — Test Plan

## Automated Checks

- `test -f docs/reviews/window-ground-truth/finder-dnd-path/README.md`
- `pnpm --filter desktop exec tsc --noEmit`
- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter desktop build`

## Blocked Manual Checks

- `pnpm --filter desktop tauri dev`
- Finder drop a file, folder, `.app`, and alias
- Confirm the Grid window `Finder DnD` panel increments for each drop
- Confirm each console payload has real path, kind, position, source `tauri://drag-drop`, and target `gridId`
- Attach screenshots/logs to `docs/reviews/window-ground-truth/finder-dnd-path/`
