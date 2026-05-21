# nonce-lease-server Dev Log

| Timestamp | Change | Verification | Notes |
|---|---|---|---|
| 2026-05-19 03:49 PDT | Added migration `20260519000008_nonce_lease_rpc.sql` with authenticated SECURITY DEFINER nonce lease RPC. | `pnpm --filter web test:nonce` passed. | RPC locks active device row and latest lease before inserting the next range. |
| 2026-05-19 03:49 PDT | Added used-nonce triggers for blobs, staging blobs, and conflict shadow rows plus append-only triggers on `used_nonces`. | Duplicate nonce and delete-negative tests passed. | Enforces same-transaction ledger write at the database layer. |
| 2026-05-19 03:49 PDT | Added `apps/web/supabase/tests/nonce-lease.test.ts` and `web` script `test:nonce`. | `pnpm --filter web check-types` passed. | First test iteration rolled back RPC state inside the helper; fixed by committing stateful RPC calls. |
| 2026-05-20 14:55 PDT | Added real scaffold package with in-memory lease RPC model, duplicate nonce ledger, lease renewal, and sync progress rollback defense. Converted web nonce test from Docker/Postgres to local Vitest mock. | `pnpm --filter @repo/nonce-lease-server test`; `pnpm --filter web test:nonce`; package `check-types` | No remote Supabase or Docker required. |
