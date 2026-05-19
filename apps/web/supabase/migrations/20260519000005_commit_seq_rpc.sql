-- ============================================================
-- Migration 5: commit_seq RPC (fn_alloc_commit_seq)
-- Phase 5 of 6 — supabase-schema-migrations (sync-v1 T-02)
-- PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §6.1
-- PRD lines: 773–799
--
-- H-9 / OQ-1 confirmed in scope: fn_alloc_commit_seq is physically inside
-- the PRD §6.1 fenced DDL block and is schema infrastructure (not Edge logic).
--
-- AC-9 gate: pg_proc.prosecdef = true; PUBLIC not in proacl.
-- ============================================================

-- H-9 commit_seq allocator RPC (PRD lines 773–799)
-- SECURITY DEFINER so Edge Function /sync/push can call it with service_role
-- context. REVOKE ALL FROM PUBLIC ensures only service_role callers can invoke it.
-- H-13: uses UUID high/low 64-bit split for advisory lock (avoids 32-bit text-hash collision).
CREATE OR REPLACE FUNCTION fn_alloc_commit_seq(p_account_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_seq BIGINT;
  v_uuid_hex TEXT;
  v_lock_hi BIGINT;
  v_lock_lo BIGINT;
  v_lock_first BIGINT;
  v_lock_second BIGINT;
BEGIN
  -- v0.6 H-13: prevent per-account commit_seq regression.
  -- Postgres supports advisory locks as either one bigint or two int4 keys.
  -- To keep the UUID hi/lo 64-bit split without falling back to 32-bit
  -- text hashing, acquire both 64-bit halves in sorted order.
  v_uuid_hex := replace(p_account_id::text, '-', '');
  v_lock_hi := (('x' || substr(v_uuid_hex, 1, 16))::bit(64))::bigint;
  v_lock_lo := (('x' || substr(v_uuid_hex, 17, 16))::bit(64))::bigint;
  v_lock_first := LEAST(v_lock_hi, v_lock_lo);
  v_lock_second := GREATEST(v_lock_hi, v_lock_lo);
  PERFORM pg_advisory_xact_lock(v_lock_first);
  IF v_lock_second <> v_lock_first THEN
    PERFORM pg_advisory_xact_lock(v_lock_second);
  END IF;
  v_new_seq := nextval('account_commit_seq_global');
  UPDATE accounts
    SET current_account_commit_seq = v_new_seq
    WHERE id = p_account_id
      AND current_account_commit_seq < v_new_seq;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'account % not found or commit_seq regression', p_account_id;
  END IF;
  RETURN v_new_seq;
END;
$$;

-- Revoke public execute permission.
-- Only callable by service_role (Edge Function /sync/push context,
-- inside REPEATABLE READ transaction).
REVOKE ALL ON FUNCTION fn_alloc_commit_seq(UUID) FROM PUBLIC;
