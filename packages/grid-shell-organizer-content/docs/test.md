# grid-shell-organizer-content — Test Plan

## Automated Checks

- `test -f docs/reviews/grid-shell-organizer-content/20260519-feature-brief.md`
- `test -f packages/grid-shell-organizer-content/docs/dev_log.md`
- `rg -n "SmartContainer|useFileDrop|GridSystem|OrganizerLayer|useMultiWindowGrids" apps/desktop/src packages/plugin-organizer/src -g '*.{ts,tsx}'`

## Deferred Implementation Checks

- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter desktop exec tsc --noEmit`
- `pnpm --filter desktop build`

## Blocked Manual Checks

- Open two Grid windows after G0/G1.1 unblock.
- Confirm Host `GridWindow.tsx` renders through the public Organizer component.
- Confirm Grid update/close/drop/toggle behavior remains scoped per `gridId`.
