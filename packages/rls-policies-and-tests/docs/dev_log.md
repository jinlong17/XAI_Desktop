# rls-policies-and-tests Dev Log

## 2026-05-20 14:55 PDT

- Implemented local RLS policy model for accounts, devices, wraps, blobs, mutation dedup, progress, and nonce leases.
- Converted web RLS test from Docker/Postgres to local Vitest mock with account filter assertions.
- Verification: `pnpm --filter @repo/rls-policies-and-tests test`; `pnpm --filter web test:rls`; package `check-types`.

| Timestamp | Change | Verification | Notes |
|---|---|---|---|
| 2026-05-19 03:44 PDT | Added Docker-backed Vitest RLS harness for Sync v1 migrations. | `pnpm --filter web test:rls` passed. | Uses local `auth`/`realtime` shims, not live Supabase. |
| 2026-05-19 03:44 PDT | Reworked active-device predicates through `sync_jwt_device_is_active()` and tightened `sync_devices` active/pending visibility. | RLS tests passed against `postgres:16-alpine`. | Fixes recursive-policy risk and prevents active devices from seeing revoked/pending device rows. |
| 2026-05-19 03:44 PDT | Updated Realtime private-channel policy to reuse the shared active-device helper. | Included in migration apply path for `test:rls`. | Keeps #21 behavior aligned with #25 helper. |
