-- ============================================================
-- Migration 9: Audit Log Integrity (GAP-T1 / R-10.26)
-- Phase 4.8 hardening — audit-log-integrity (sync-v1 #36)
--
-- Server-side append-only audit log plus account-level summary used by the
-- client mirror count/last-hash check. Full Merkle/hash-chain remains v2.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE sync_audit_account_state (
  account_id   UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  entry_count  BIGINT NOT NULL DEFAULT 0 CHECK (entry_count >= 0),
  last_hash    BYTEA,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sync_audit_log
  ADD COLUMN event_type TEXT,
  ADD COLUMN device_hash BYTEA,
  ADD COLUMN commit_seq BIGINT,
  ADD COLUMN entity_id TEXT,
  ADD COLUMN mutation_id UUID,
  ADD COLUMN payload_hash BYTEA,
  ADD COLUMN prev_hash BYTEA,
  ADD COLUMN entry_hash BYTEA;

ALTER TABLE sync_audit_log
  ADD CONSTRAINT sync_audit_event_type_check CHECK (
    event_type IS NULL OR event_type IN (
      'push',
      'pull',
      'conflict',
      'dead_letter',
      'device_register',
      'login',
      'mnemonic_reset',
      'rekey'
    )
  );

ALTER TABLE sync_audit_log
  ADD CONSTRAINT sync_audit_entry_hash_required CHECK (
    event_type IS NULL OR (payload_hash IS NOT NULL AND entry_hash IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_sync_audit_log_account_order
  ON sync_audit_log (account_id, id);

CREATE OR REPLACE FUNCTION fn_sync_audit_log_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'sync_audit_log is append-only';
END;
$$;

CREATE TRIGGER trg_sync_audit_log_no_update
BEFORE UPDATE ON sync_audit_log
FOR EACH ROW
EXECUTE FUNCTION fn_sync_audit_log_append_only();

CREATE TRIGGER trg_sync_audit_log_no_delete
BEFORE DELETE ON sync_audit_log
FOR EACH ROW
EXECUTE FUNCTION fn_sync_audit_log_append_only();

CREATE OR REPLACE FUNCTION fn_append_sync_audit_log(
  p_account_id UUID,
  p_event_type TEXT,
  p_device_id UUID DEFAULT NULL,
  p_commit_seq BIGINT DEFAULT NULL,
  p_entity_type sync_entity_type DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_mutation_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(entry_count BIGINT, last_hash BYTEA, entry_hash BYTEA)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev_count BIGINT;
  v_prev_hash BYTEA;
  v_device_hash BYTEA;
  v_payload_hash BYTEA;
  v_entry_hash BYTEA;
BEGIN
  INSERT INTO sync_audit_account_state (account_id)
  VALUES (p_account_id)
  ON CONFLICT (account_id) DO NOTHING;

  SELECT s.entry_count, s.last_hash
    INTO v_prev_count, v_prev_hash
    FROM sync_audit_account_state s
    WHERE s.account_id = p_account_id
    FOR UPDATE;

  v_device_hash := CASE
    WHEN p_device_id IS NULL THEN NULL
    ELSE hmac(p_device_id::text, p_account_id::text, 'sha256')
  END;
  v_payload_hash := digest(COALESCE(p_payload::text, ''), 'sha256');
  v_entry_hash := digest(
    concat_ws(
      '|',
      p_account_id::text,
      p_event_type,
      COALESCE(encode(v_device_hash, 'hex'), ''),
      COALESCE(p_commit_seq::text, ''),
      COALESCE(p_entity_type::text, ''),
      COALESCE(p_entity_id, ''),
      COALESCE(p_mutation_id::text, ''),
      encode(v_payload_hash, 'hex'),
      COALESCE(encode(v_prev_hash, 'hex'), '')
    ),
    'sha256'
  );

  INSERT INTO sync_audit_log (
    account_id,
    operation,
    event_type,
    device_id,
    device_hash,
    commit_seq,
    entity_type,
    entity_id,
    mutation_id,
    count,
    status,
    payload_hash,
    prev_hash,
    entry_hash
  ) VALUES (
    p_account_id,
    p_event_type,
    p_event_type,
    p_device_id,
    v_device_hash,
    p_commit_seq,
    p_entity_type::text,
    p_entity_id,
    p_mutation_id,
    1,
    'ok',
    v_payload_hash,
    v_prev_hash,
    v_entry_hash
  );

  UPDATE sync_audit_account_state
    SET entry_count = v_prev_count + 1,
        last_hash = v_entry_hash,
        updated_at = now()
    WHERE account_id = p_account_id;

  entry_count := v_prev_count + 1;
  last_hash := v_entry_hash;
  entry_hash := v_entry_hash;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION fn_sync_audit_summary(p_account_id UUID)
RETURNS TABLE(entry_count BIGINT, last_hash BYTEA)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(s.entry_count, 0), s.last_hash
    FROM (SELECT p_account_id AS account_id) input
    LEFT JOIN sync_audit_account_state s ON s.account_id = input.account_id;
$$;

REVOKE ALL ON FUNCTION fn_append_sync_audit_log(
  UUID, TEXT, UUID, BIGINT, sync_entity_type, TEXT, UUID, JSONB
) FROM PUBLIC;
REVOKE ALL ON FUNCTION fn_sync_audit_summary(UUID) FROM PUBLIC;
