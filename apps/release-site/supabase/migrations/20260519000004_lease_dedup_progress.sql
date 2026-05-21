-- ============================================================
-- Migration 4: Lease, Dedup, Progress, Audit, Quota
-- Phase 4 of 6 — supabase-schema-migrations (sync-v1 T-02)
-- PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §6.1
-- PRD lines: 1022–1046 (nonce_lease + EXCLUDE gist + RLS + index),
--            925–933 (mutation_dedup), 990–996 (device_sync_progress),
--            1053–1064 (sync_audit_log), 1067–1074 (sync_quota)
--
-- v0.6 Hard Invariant concentrated here:
--   AC-6: no_lease_overlap EXCLUDE USING gist (btree_gist required — created in Phase 1)
--
-- Note: nonce_lease RLS is enabled here (PRD line 1043), no client policy by design.
--   File 6 (rls_policies) must NOT re-enable nonce_lease RLS (already done here).
-- ============================================================

-- ─── Mutation dedup (v0.3 H-H: GC 90 days covers typical offline window + dead-letter trigger)
-- PRD lines 925–933 (placed before nonce_lease per H-8 ordering: mutation_dedup listed after staging_blobs)
CREATE TABLE mutation_dedup (
  account_id  UUID NOT NULL,
  mutation_id UUID NOT NULL,
  result      JSONB NOT NULL,                                -- last push PushResponse JSON
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, mutation_id)
);

-- GC index: > 90-day rows eligible for cleanup (PRD lines 932–933)
CREATE INDEX idx_mutation_dedup_gc
  ON mutation_dedup (created_at);

-- ─── Nonce lease table (v0.5 C-C: server-side nonce lease for three-party nonce uniqueness)
-- PRD lines 1022–1046
-- IMPORTANT: btree_gist extension (Phase 1) MUST already exist before this ALTER EXCLUDE.
CREATE TABLE nonce_lease (
  id                   BIGSERIAL PRIMARY KEY,
  account_id           UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  encryption_device_id BIGINT NOT NULL REFERENCES sync_devices(encryption_device_id) ON DELETE CASCADE,
  key_id               INTEGER NOT NULL,
  lease_start          BIGINT NOT NULL CHECK (lease_start BETWEEN 0 AND 4294967295),  -- v0.6 H-6
  lease_end            BIGINT NOT NULL CHECK (lease_end   BETWEEN 0 AND 4294967295),  -- v0.6 H-6
  granted_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (lease_end >= lease_start)
);

-- v0.6 C-A: EXCLUDE USING gist prevents overlapping nonce-lease ranges for same (account, device, key).
-- Simplified protocol: fn_grant_nonce_lease RPC uses SELECT ... FOR UPDATE to lock
-- (account_id, enc_dev_id, key_id) max lease_end; new lease_start = max_lease_end + 1.
-- AC-6 gate: pg_get_constraintdef contains 'EXCLUDE USING gist' + '&&'.
-- PRD lines 1035–1041
ALTER TABLE nonce_lease ADD CONSTRAINT no_lease_overlap
  EXCLUDE USING gist (
    account_id WITH =,
    encryption_device_id WITH =,
    key_id WITH =,
    int8range(lease_start, lease_end, '[]') WITH &&
  );

-- v0.6 H-2: enable RLS on nonce_lease (PRD line 1043).
-- No client SELECT/INSERT/UPDATE/DELETE policy — all access via fn_grant_nonce_lease SECURITY DEFINER.
-- File 6 (rls_policies) must NOT re-enable this (already enabled here).
ALTER TABLE nonce_lease ENABLE ROW LEVEL SECURITY;

-- Lookup index for fn_grant_nonce_lease (PRD lines 1045–1046)
CREATE INDEX idx_nonce_lease_lookup
  ON nonce_lease (account_id, encryption_device_id, key_id, lease_end);

-- ─── Device sync progress (v0.2, M-11 GC tombstone)
-- PRD lines 990–996
CREATE TABLE device_sync_progress (
  account_id          UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_id           UUID NOT NULL,
  last_ack_commit_seq BIGINT NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, device_id)
);

-- ─── Audit log
-- PRD lines 1053–1064
CREATE TABLE sync_audit_log (
  id          BIGSERIAL PRIMARY KEY,
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_id   UUID,
  operation   TEXT NOT NULL,   -- 'push'/'pull'/'login'/'logout'/'mnemonic_reset'/'delete_request'
  entity_type TEXT,
  count       INTEGER,         -- affected record count
  status      TEXT,            -- 'ok'/'partial'/'error'
  error_code  TEXT,
  at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_account_at ON sync_audit_log(account_id, at DESC);

-- ─── Quota
-- PRD lines 1067–1074
CREATE TABLE sync_quota (
  account_id  UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  month       DATE NOT NULL,          -- first day of month
  bytes_pushed BIGINT NOT NULL DEFAULT 0,
  push_calls  BIGINT NOT NULL DEFAULT 0,
  pull_calls  BIGINT NOT NULL DEFAULT 0,
  tier        TEXT NOT NULL DEFAULT 'free'  -- free / pro
);
