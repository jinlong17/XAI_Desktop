# sync-engine-pull Test Notes

Run:

```bash
pnpm --filter @repo/plugin-account check-types
pnpm --filter @repo/plugin-account test
```

Verified:

- account commit rollback throws E3024
- old entity revision throws E3015
- idempotent duplicate is ignored
- same-revision key change with higher commit_seq is accepted as re-encrypt
- pull uses one global commit_seq cursor
- HTTP transport does not send an `entity_type` query parameter

Deferred:

- hosted `/sync/pull` Edge Function
- real decrypt/apply routing into entity-specific SQLCipher tables
- Realtime-triggered pull scheduling
