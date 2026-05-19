# single-table-todos-e2e — Test

Focused checks run during the autorun:

```bash
pnpm --filter @repo/plugin-account test -- tests/integration/single-table-todos-e2e.test.ts
pnpm --filter @repo/plugin-account check-types
pnpm --filter web test:push
pnpm --filter @repo/plugin-account test
```

Coverage:

- Todo row and `sync_outbox` row are written in the same driver transaction.
- Device A pushes an encrypted todo blob; Device B pulls and decrypts it.
- Server dump does not contain todo plaintext, and wrong-key decrypt fails.
- A stale Device B write receives `E3015` and creates a conflict shadow entry.
- Device B can pull the winning revision after the conflict.
- The `/sync/push` Edge Function core regression suite still passes.

Deferred:

- Hosted Supabase/PostgREST/Reatime deployment.
- Real two-Mac sync within 5 seconds.
- SQLCipher copied-file dump PoC.
- Real menu-bar visual transition validation.
