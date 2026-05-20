# push-edge-function API

## Files

- `apps/web/supabase/functions/sync-push/handler.ts`
- `apps/web/supabase/functions/sync-push/index.ts`
- `apps/web/supabase/tests/sync-push.test.ts`

## Core Entry

```ts
processPushBatch(db, {
  accountId,
  records,
});
```

`PushDatabase` abstracts the service_role operations required by the Edge
Function:

- per-record transaction
- mutation dedup read/write
- current blob read
- blob upsert
- conflict shadow insert
- commit sequence allocation

## Statuses

- `ok`
- `revision_mismatch`
- `duplicate_mutation_id`
- `causal_dep_unsatisfied`
- `error`

## Envelope Parse

`parseEnvelope()` reads the Rust v1 envelope header:

- byte 0: `v`
- byte 1: `kdf_v`
- bytes 2-5: `key_id` little-endian u32
- bytes 6-13: `encryption_device_id` little-endian u64
- bytes 14-17: `counter` little-endian u32
