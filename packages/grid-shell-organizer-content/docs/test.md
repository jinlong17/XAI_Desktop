# grid-shell-organizer-content — Test Plan

## Automated Checks

- `test -f docs/reviews/grid-shell-organizer-content/20260519-feature-brief.md`
- `test -f packages/grid-shell-organizer-content/docs/dev_log.md`
- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter desktop build`
- `rg -n "SmartContainer|DesktopItem|GridBox|useFileDrop|@repo/plugin-organizer/src|packages/plugin-organizer/src" apps/desktop/src/windows/GridWindow.tsx` should return no matches.
- `rg -n "OrganizerGridContent" apps/desktop/src/windows/GridWindow.tsx packages/plugin-organizer/src/index.ts docs/contracts/plugin-organizer-public-api-v0.md`

## Manual Checks

- Open two Grid windows.
- Confirm Host `GridWindow.tsx` renders through the public Organizer component.
- Confirm Grid update/close/drop/toggle behavior remains scoped per `gridId`.
