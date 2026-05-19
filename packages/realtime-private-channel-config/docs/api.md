# realtime-private-channel-config — API Contract

## Config Contract

`apps/web/supabase/realtime.private-channel.json`:

```json
{
  "channels": {
    "sync": {
      "nameTemplate": "sync:<account_id>",
      "clientConfig": {
        "private": true
      }
    }
  }
}
```

## SQL Policy

`apps/web/supabase/migrations/20260519000007_realtime_private_channels.sql` creates:

```sql
CREATE POLICY realtime_sync_private_channel_active_device
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (...)
```

The policy is config-only. It does not create subscription code or Realtime message emitters.
