# sync-engine-push API

## Outbox

```ts
const outbox = createSyncOutbox();
const entry = outbox.enqueue({
  entityType: 'todos',
  entityId: 'todo-1',
  plaintext,
});
```

`enqueue()` returns an `OutboxEntry` with a UUIDv7 `mutationId`. Calling
`enqueue()` again for the same entity squashes the old entry.

## Push

```ts
await pushBatch(
  { crypto, revisions, transport },
  { entries: outbox.list() },
);
```

`pushBatch()` builds records containing:

- `entityType`
- `entityId`
- `mutationId`
- `baseRevision`
- `proposedRevision`
- `clientUpdatedAtMs`
- `envelope`

`baseRevision` and `proposedRevision` are strings for BIGINT-safe transport.

## HTTP Transport

```ts
const transport = createSyncPushHttpTransport({ accessToken });
```

The default endpoint is `/sync/push`. Non-207/409 failed HTTP responses throw
`E3005`.

## Errors

`revision_mismatch` results throw `SyncPushRevisionMismatchError` with code
`E3015`, preserving the C-E protocol failure path for callers.
