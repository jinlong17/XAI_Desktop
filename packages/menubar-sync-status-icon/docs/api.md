# menubar-sync-status-icon — API

## plugin-account exports

```ts
createSyncStatusEmitter(options?): SyncStatusEmitter
runObservedSync(kind, operation, options?): Promise<T>
```

`runObservedSync()` emits:

- `account:sync-started` before the operation
- `account:sync-completed` with `durationMs` after success
- `account:sync-failed` with a displayable error string after failure

The operation error is rethrown.

## Desktop command

```ts
invoke("sync_set_menubar_status", {
  payload: {
    status: "idle" | "syncing" | "success" | "error",
    kind?: "push" | "pull",
    message?: string,
    frame?: number
  }
})
```

Only `apps/desktop/src/sync/useSyncMenuBarStatus.ts` should call this command.
