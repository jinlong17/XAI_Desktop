# sync-engine-pull API

## Pull

```ts
await pullBatch(
  { transport, entityStates, applier },
  {
    sinceCommitSeq: 123n,
    lastSeenAccountCommitSeq: 123n,
  },
);
```

Default `limit` is `500`.

## HTTP Transport

```ts
const transport = createSyncPullHttpTransport({ accessToken });
```

The default endpoint is `/sync/pull`; the generated URL contains only
`since_commit_seq` and `limit`.

## Apply

```ts
await applyServerRecords(
  { entityStates, applier },
  {
    currentAccountCommitSeq: '124',
    lastSeenAccountCommitSeq: '123',
    records,
  },
);
```

`PullRecord.revision`, `PullRecord.commitSeq`, and account commit sequence
values are JSON BIGINT strings.

## Errors

- `SyncRevisionRollbackError`, code `E3015`
- `SyncAccountRollbackError`, code `E3024`
