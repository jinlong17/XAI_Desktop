# realtime-private-channel-config — Test Strategy

## Local Verification

Using a throwaway `postgres:16-alpine` Docker container with lightweight `auth` and `realtime` shims:

- Apply core account/device migrations.
- Create `realtime.messages` and shim `auth.uid()`, `auth.jwt()`, and `realtime.topic()`.
- Apply `20260519000007_realtime_private_channels.sql`.
- Assert `pg_policies` contains `realtime_sync_private_channel_active_device`.
- Assert active device + matching `sync:<account_id>` topic can read one row.
- Assert matching active device + wrong topic reads zero rows.
- Assert revoked device + matching topic reads zero rows.

Config contract check:

- Node JSON check confirms `channels.sync.clientConfig.private === true`.

## Deferred Gates

- Live Supabase deploy/verify.
- Real Realtime client subscription integration.
- Cross-account negative integration test.
