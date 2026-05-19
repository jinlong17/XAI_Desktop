-- ============================================================
-- Migration 7: Realtime Private Channels authorization (T-04)
-- Phase 0.3 — realtime-private-channel-config (sync-v1 #21)
-- PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §5.5 / §6.2
--
-- Phase 0 config only: no client subscription code here.
-- ============================================================

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS realtime_sync_private_channel_active_device
  ON realtime.messages;

-- FR-SY-27 / v0.6 H-12:
-- - Realtime channel must be Private Channel + Authorization.
-- - Topic is bound to the authenticated account: sync:<auth.uid()>.
-- - JWT device_id must identify an active, non-revoked device for the account.
CREATE POLICY realtime_sync_private_channel_active_device
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    extension = 'postgres_changes'
    AND realtime.topic() = 'sync:' || auth.uid()::text
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id
      FROM public.sync_devices
      WHERE account_id = auth.uid()
        AND status = 'active'
        AND revoked_at IS NULL
    )
  );
