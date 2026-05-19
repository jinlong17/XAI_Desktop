-- ============================================================
-- Migration 6: RLS Policies (§6.2)
-- Phase 6 of 6 — supabase-schema-migrations (sync-v1 T-02)
-- PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §6.2
-- PRD lines: 1080–1216
--
-- Enables RLS on 11 tables (nonce_lease already enabled in Phase 4 —
-- NOT re-enabled here to avoid duplicate ENABLE errors).
-- Adds all 11 named §6.2 policies verbatim from PRD.
--
-- AC-10 gate: pg_class.relrowsecurity = true for 12 tables;
--             11 named policies exist in pg_policies.
--
-- Note: all policies are FOR SELECT only — writes go through service_role
-- Edge Functions. RLS defends against authenticated/anon lateral access only;
-- service_role boundary is owned by provisioning + credential-rotation SOP.
-- ============================================================

-- Enable RLS on the 11 tables (nonce_lease already done in Phase 4).
-- PRD lines 1080–1090
ALTER TABLE accounts                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_keyring                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_dek_wraps                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_blobs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_blobs_conflict_shadow  ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_blobs                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutation_dedup                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sync_progress             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_devices                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_audit_log                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_quota                       ENABLE ROW LEVEL SECURITY;
-- nonce_lease: RLS already enabled in Phase 4 (PRD line 1043); omitted here.

-- ─────────────────────────────────────────────
-- accounts (v0.3 rewrite: C-B revokes client UPDATE)
-- PRD lines 1095–1097
-- ─────────────────────────────────────────────
CREATE POLICY accounts_self_read ON accounts
  FOR SELECT USING (id = auth.uid());
-- v0.3: accounts_self_update removed; all UPDATE via Edge Function service_role + Ed25519 recovery proof.

-- ─────────────────────────────────────────────
-- account_keyring (v0.3: read-only)
-- PRD lines 1103–1104
-- ─────────────────────────────────────────────
CREATE POLICY keyring_self_read ON account_keyring
  FOR SELECT USING (account_id = auth.uid());
-- writes by Edge Function service_role (create new key_id / mark retired / GC)

-- ─────────────────────────────────────────────
-- device_dek_wraps (v0.4 C-B strictened: own active device only)
-- PRD lines 1111–1121
-- ─────────────────────────────────────────────
-- Read: only current JWT device's own wrap, and device must be active (pending rejected)
CREATE POLICY dek_wraps_self_active_read ON device_dek_wraps
  FOR SELECT USING (
    account_id = auth.uid()
    AND device_id = (auth.jwt() ->> 'device_id')::uuid
    AND device_id IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid()
        AND status = 'active'
        AND revoked_at IS NULL
    )
  );
-- writes: Edge Function /sync/devices/grant_dek_wrap verifies donor active + target active, then service_role

-- ─────────────────────────────────────────────
-- encrypted_blobs (v0.4 C-D client read-only; C-B SELECT + active check)
-- PRD lines 1129–1138
-- ─────────────────────────────────────────────
-- Read: JWT device must be active (pending/revoked rejected)
CREATE POLICY blobs_self_active_read ON encrypted_blobs
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid()
        AND status = 'active'
        AND revoked_at IS NULL
    )
  );
-- v0.4 C-D: blobs_self_write / blobs_self_update removed.
-- All writes (INSERT/UPDATE/DELETE) via /sync/push Edge Function service_role.

-- ─────────────────────────────────────────────
-- conflict shadow / staging blobs: H-D read-only
-- PRD lines 1149–1165
-- v0.5 H-6: conflict_shadow / staging SELECT + active device check, same as encrypted_blobs
-- ─────────────────────────────────────────────
CREATE POLICY conflict_shadow_self_active_read ON encrypted_blobs_conflict_shadow
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
    )
  );

CREATE POLICY staging_blobs_self_active_read ON staging_blobs
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
    )
  );
-- writes by Edge Function /sync/rekey/upload_staging

-- ─────────────────────────────────────────────
-- mutation_dedup / device_sync_progress
-- PRD lines 1172–1188
-- v0.6 H-11: mutation_dedup / device_sync_progress + active device check
-- ─────────────────────────────────────────────
CREATE POLICY mutation_dedup_self_active ON mutation_dedup
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
    )
  );

CREATE POLICY device_progress_self_active ON device_sync_progress
  FOR SELECT USING (
    account_id = auth.uid()
    AND (auth.jwt() ->> 'device_id')::uuid IN (
      SELECT device_id FROM sync_devices
      WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
    )
  );

-- ─────────────────────────────────────────────
-- sync_devices
-- PRD lines 1194–1207
-- v0.6 M-6: SELECT defaults to active-only; pending device reads only its own row
-- ─────────────────────────────────────────────
CREATE POLICY devices_self_active_read ON sync_devices
  FOR SELECT USING (
    account_id = auth.uid()
    AND (
      -- any active device can read all active devices in the account (settings device list)
      (auth.jwt() ->> 'device_id')::uuid IN (
        SELECT device_id FROM sync_devices
        WHERE account_id = auth.uid() AND status = 'active' AND revoked_at IS NULL
      )
      OR
      -- pending device can only read its own row (to check status / wait for grant)
      device_id = (auth.jwt() ->> 'device_id')::uuid
    )
  );
-- INSERT (new device registration), UPDATE revoked_at (revoke) via Edge Function

-- ─────────────────────────────────────────────
-- audit / quota: read own only
-- PRD lines 1213–1216
-- ─────────────────────────────────────────────
CREATE POLICY audit_self ON sync_audit_log
  FOR SELECT USING (account_id = auth.uid());

CREATE POLICY quota_self ON sync_quota
  FOR SELECT USING (account_id = auth.uid());

-- Note: realtime.messages RLS is commented-out in PRD (lines 1218–1227)
-- and is out of scope for T-02 — belongs to dev-plan T-04 (Realtime Private Channels).
