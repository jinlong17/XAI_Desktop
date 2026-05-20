# multi-grid-event-scope — Test Plan

## Automated Checks

- `test -f docs/reviews/multi-grid-event-scope/20260519-feature-brief.md`
- `test -f packages/multi-grid-event-scope/docs/dev_log.md`
- `pnpm --filter @repo/core check-types`
- `pnpm --filter @repo/plugin-organizer check-types`
- `pnpm --filter @repo/plugin-organizer test`
- `pnpm --filter desktop build`
- Legacy event scan should find only compatibility constants in `gridEvents.ts`.
- Target event scan should find `organizer:grid:*`, `organizer:file:drop`, and guard usage.

## Deferred Runtime Checks

- Runtime test: open two Grid windows, move/drop/close independently.
- Runtime test: confirm listener cleanup prevents duplicate handling after remount.

## Blocked Manual Checks

- `pnpm --filter desktop tauri dev`
- Create two Grid windows.
- Trigger update, close, and file drop in each.
- Confirm each event affects only its own `gridId`.
