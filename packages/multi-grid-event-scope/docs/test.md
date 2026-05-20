# multi-grid-event-scope — Test Plan

## Automated Checks

- `test -f docs/reviews/multi-grid-event-scope/20260519-feature-brief.md`
- `test -f packages/multi-grid-event-scope/docs/dev_log.md`
- `rg -n "grid-window-|organizer:grid|grid-update|grid-delete|grid-window-ready|grid-window-file-drop|organizer:create-grid-request|create-grid-request" apps/desktop/src packages/plugin-organizer/src packages/core/src docs/contracts -g '*.{ts,tsx,md}'`

## Deferred Implementation Checks

- Unit test: event without `gridId` is rejected or ignored.
- Unit test: two Grid windows do not consume each other's update/drop events.
- Unit test: listener cleanup prevents duplicate handling after remount.
- Runtime test: open two Grid windows, move/drop/close independently.

## Blocked Manual Checks

- `pnpm --filter desktop tauri dev`
- Create two Grid windows.
- Trigger update, close, and file drop in each.
- Confirm each event affects only its own `gridId`.
