# grid-persistence — Test Plan

## Automated Checks

- `test -f docs/reviews/grid-persistence/20260519-feature-brief.md`
- `test -f packages/grid-persistence/docs/dev_log.md`
- `rg -n "PersistedLayout|localStorage|repository|Repository|Grid.*persist|restore|open Grid|last active|sqlite|sqlcipher|GridBox|DesktopItem" packages/plugin-organizer/src packages/core/src packages/core-data docs/contracts docs/planning/execution -g '*.{ts,tsx,rs,md}'`

## Deferred Implementation Checks

- Unit test: load valid persisted layout.
- Unit test: corrupt persisted state falls back without blank screen.
- Unit test: save debounce writes latest layout.
- Unit test: read-only localStorage migration does not delete source on failure.
- Integration test: restart restores Grid rects and items.

## Blocked Manual Checks

- `pnpm --filter desktop tauri dev`
- Create and move Grid windows, add file-backed items, restart app.
- Confirm rects/items restore or Control reset is available after corrupt state.
