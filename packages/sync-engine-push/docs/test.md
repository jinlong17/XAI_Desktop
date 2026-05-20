# sync-engine-push Test Notes

Run:

```bash
pnpm --filter @repo/plugin-account check-types
pnpm --filter @repo/plugin-account test
```

Verified:

- same-entity edits squash to one outbox entry
- latest plaintext and latest mutation_id win
- `pushBatch()` computes `proposedRevision = baseRevision + 1`
- encryption happens during flush through the injected crypto seam
- transport is called once per batch
- HTTP transport posts one JSON request to `/sync/push`
- `revision_mismatch` maps to `SyncPushRevisionMismatchError`
- UUIDv7 version and variant bits are correct

Deferred:

- real Tauri `crypto_encrypt_for` client wiring
- hosted `/sync/push` Edge Function behavior
- outbox persistence in SQLCipher entity tables
