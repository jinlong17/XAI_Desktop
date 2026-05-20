# rls-policies-and-tests API

## Test Command

```bash
pnpm --filter web test:rls
```

The command runs `apps/web/supabase/tests/rls-policies.test.ts`.

## Database Surface

- `public.sync_jwt_device_id() RETURNS uuid`
- `public.sync_jwt_device_is_active() RETURNS boolean`
- RLS policies in `apps/web/supabase/migrations/20260519000006_rls_policies.sql`
- Realtime RLS policy in `apps/web/supabase/migrations/20260519000007_realtime_private_channels.sql`

## Verified Behaviors

- active account A device reads account A blobs but not account B blobs
- active account A device reads only its own `device_dek_wraps` row
- revoked account A device reads no active-gated rows
- active account A device sees only active rows in `sync_devices`
- pending account A device can poll only its own pending `sync_devices` row
- anon reads return zero rows
- direct client `accounts` UPDATE does not mutate rows
- direct client `encrypted_blobs` INSERT is rejected by RLS
