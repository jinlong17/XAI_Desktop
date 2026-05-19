# realtime-private-channel-config — Design Snapshot

## Scope

- Feature: `realtime-private-channel-config` (#21)
- SQL surface: `apps/web/supabase/migrations/20260519000007_realtime_private_channels.sql`
- Config contract: `apps/web/supabase/realtime.private-channel.json`
- Status: local SQL/config verified; live Supabase deployment deferred

## Channel Contract

Each account uses exactly one private channel:

```text
sync:<account_id>
```

The repo-local config contract sets `clientConfig.private` to `true`. Client subscription code is intentionally out of scope for Phase 0 and remains owned by `realtime-subscription` (#38).

## RLS Policy

The `realtime.messages` policy is `FOR SELECT TO authenticated` and requires:

- `extension = 'postgres_changes'`
- `realtime.topic() = 'sync:' || auth.uid()::text`
- JWT `device_id` belongs to an active, non-revoked `sync_devices` row for the account

This binds the channel to the authenticated account and the active device claim.

## Deferred Runtime Gates

- Supabase project deployment and dashboard/private-channel runtime verification.
- Real `supabase.channel(name, { config: { private: true } })` subscription.
- Cross-account integration test where user B subscribes to user A's channel and receives zero messages.
