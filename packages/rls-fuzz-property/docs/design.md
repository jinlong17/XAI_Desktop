# rls-fuzz-property — Design

Feature #34 adds the Phase 4.8 RLS property-fuzz gate for Sync isolation.

## Implemented Gate

- `apps/web/supabase/tests/rls-fuzz-property.test.ts` runs against a local
  Postgres 16 Docker container with the Sync migrations applied.
- The fixture creates 1000 accounts and 100 devices per account, for 100,000
  total device rows.
- Device status distribution is deterministic:
  - active devices for normal cross-tenant attempts
  - `pending_dek_wrap` devices
  - revoked devices with `revoked_at`
- The property runner uses `fast-check` to generate randomized actor account,
  actor device, and target account attempts.
- Protected active-gated tables are checked together:
  - `encrypted_blobs`
  - `encrypted_blobs_conflict_shadow`
  - `staging_blobs`
  - `device_dek_wraps`

## Boundaries

- This is a local SQL/RLS harness, consistent with the existing RLS tests.
- Hosted Supabase and `@supabase/supabase-js` API-level verification remain
  deferred until the external Supabase project exists.
