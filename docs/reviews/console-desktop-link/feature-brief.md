# G5-E3 Console Desktop Linkage Feature Brief

## Goal

Define the console-to-desktop interaction seam with a mock "Create task from Grid item" flow.

## Scope

- `ConsoleDesktopBridge` in-memory event interface.
- `gridItemToTask` conversion utility.
- Mock event emission for `console:create-task-from-grid-item`.

## Out of Scope

- Real organizer event subscription.
- Host event bus integration.
- Core event type changes.

## Validation

- `pnpm --filter @repo/plugin-console check-types`
