# menubar-sync-status-icon — Design

Feature #22 adds a shell adapter for the account sync lifecycle.

## Scope

- `@repo/plugin-account` owns `account:sync-started`,
  `account:sync-completed`, and `account:sync-failed` emission through
  `createSyncStatusEmitter()` and `runObservedSync()`.
- `apps/desktop` listens to those typed events and maps them to the Tauri tray
  icon state.
- Host code remains presentation-only: it does not initiate sync, inspect
  records, or emit `account:*` events.

## States

| State | Menu-bar treatment |
|---|---|
| idle | grey dot |
| syncing | blue four-frame spinner updated from the React listener |
| success | green flash, reset to idle after 2 seconds |
| error | red icon with error tooltip; click focuses the main window |

## Deferred

- Real macOS menu-bar visual/click validation on a signed device.
- Real push/pull lifecycle verification once #30 connects a live sync path.
