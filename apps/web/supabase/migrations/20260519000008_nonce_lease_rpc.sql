-- ============================================================
-- Migration 8: Nonce lease RPC + used_nonces hard guard
-- Phase 0.3 — nonce-lease-server (sync-v1 #24)
-- PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §6.1 / FR-SY-07
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_grant_nonce_lease(
  p_account_id UUID,
  p_key_id INTEGER,
  p_count INTEGER
)
RETURNS TABLE (
  encryption_device_id BIGINT,
  lease_start BIGINT,
  lease_end BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_device_id UUID := public.sync_jwt_device_id();
  v_encryption_device_id BIGINT;
  v_previous_end BIGINT;
  v_start BIGINT;
  v_end BIGINT;
  v_rekey_at CONSTANT BIGINT := 4294967040; -- 0xFFFFFF00
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_account_id THEN
    RAISE EXCEPTION 'nonce_lease_not_owned'
      USING ERRCODE = '28000';
  END IF;

  IF p_count IS NULL OR p_count <= 0 THEN
    RAISE EXCEPTION 'nonce_lease_count_invalid'
      USING ERRCODE = '22023';
  END IF;

  SELECT d.encryption_device_id
    INTO v_encryption_device_id
  FROM public.sync_devices AS d
  WHERE d.account_id = p_account_id
    AND d.device_id = v_device_id
    AND d.status = 'active'
    AND d.revoked_at IS NULL
  FOR UPDATE;

  IF v_encryption_device_id IS NULL THEN
    RAISE EXCEPTION 'nonce_lease_not_owned'
      USING ERRCODE = '28000';
  END IF;

  PERFORM 1
  FROM public.account_keyring AS k
  WHERE k.account_id = p_account_id
    AND k.key_id = p_key_id
    AND k.status IN ('active', 'staging')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'nonce_lease_key_not_active'
      USING ERRCODE = '22023';
  END IF;

  SELECT n.lease_end
    INTO v_previous_end
  FROM public.nonce_lease AS n
  WHERE n.account_id = p_account_id
    AND n.encryption_device_id = v_encryption_device_id
    AND n.key_id = p_key_id
  ORDER BY n.lease_end DESC
  LIMIT 1
  FOR UPDATE;

  v_start := COALESCE(v_previous_end + 1, 0);
  v_end := v_start + p_count::BIGINT - 1;

  IF v_start < 0 OR v_end < v_start OR v_end >= v_rekey_at THEN
    RAISE EXCEPTION 'nonce_lease_exhausted'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.nonce_lease (
    account_id,
    encryption_device_id,
    key_id,
    lease_start,
    lease_end
  ) VALUES (
    p_account_id,
    v_encryption_device_id,
    p_key_id,
    v_start,
    v_end
  );

  encryption_device_id := v_encryption_device_id;
  lease_start := v_start;
  lease_end := v_end;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_grant_nonce_lease(UUID, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_grant_nonce_lease(UUID, INTEGER, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.sync_record_used_nonce()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'encrypted_blobs' THEN
      IF OLD.key_id = NEW.key_id
         AND OLD.encryption_device_id = NEW.encryption_device_id
         AND OLD.counter = NEW.counter THEN
        RETURN NEW;
      END IF;
    ELSIF TG_TABLE_NAME = 'staging_blobs' THEN
      IF OLD.new_key_id = NEW.new_key_id
         AND OLD.new_encryption_device_id = NEW.new_encryption_device_id
         AND OLD.new_counter = NEW.new_counter THEN
        RETURN NEW;
      END IF;
    ELSIF TG_TABLE_NAME = 'encrypted_blobs_conflict_shadow' THEN
      IF OLD.loser_key_id = NEW.loser_key_id
         AND OLD.loser_encryption_device_id = NEW.loser_encryption_device_id
         AND OLD.loser_counter = NEW.loser_counter THEN
        RETURN NEW;
      END IF;
    END IF;
  END IF;

  IF TG_TABLE_NAME = 'encrypted_blobs' THEN
    -- Re-key swap moves a nonce already reserved by staging_blobs into the
    -- active blob row. That is not reuse; it is the second phase of the same
    -- nonce-consumption path.
    IF TG_OP = 'UPDATE' AND EXISTS (
      SELECT 1
      FROM public.used_nonces
      WHERE account_id = NEW.account_id
        AND key_id = NEW.key_id
        AND encryption_device_id = NEW.encryption_device_id
        AND counter = NEW.counter
        AND source = 'staging'
    ) THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.used_nonces (
      account_id, key_id, encryption_device_id, counter, source
    ) VALUES (
      NEW.account_id, NEW.key_id, NEW.encryption_device_id, NEW.counter, 'blob'
    );
  ELSIF TG_TABLE_NAME = 'staging_blobs' THEN
    INSERT INTO public.used_nonces (
      account_id, key_id, encryption_device_id, counter, source
    ) VALUES (
      NEW.account_id, NEW.new_key_id, NEW.new_encryption_device_id, NEW.new_counter, 'staging'
    );
  ELSIF TG_TABLE_NAME = 'encrypted_blobs_conflict_shadow' THEN
    INSERT INTO public.used_nonces (
      account_id, key_id, encryption_device_id, counter, source
    ) VALUES (
      NEW.account_id, NEW.loser_key_id, NEW.loser_encryption_device_id, NEW.loser_counter, 'shadow_loser'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER encrypted_blobs_used_nonce
  BEFORE INSERT OR UPDATE OF key_id, encryption_device_id, counter ON public.encrypted_blobs
  FOR EACH ROW EXECUTE FUNCTION public.sync_record_used_nonce();

CREATE TRIGGER staging_blobs_used_nonce
  BEFORE INSERT OR UPDATE OF new_key_id, new_encryption_device_id, new_counter ON public.staging_blobs
  FOR EACH ROW EXECUTE FUNCTION public.sync_record_used_nonce();

CREATE TRIGGER conflict_shadow_used_nonce
  BEFORE INSERT OR UPDATE OF loser_key_id, loser_encryption_device_id, loser_counter
  ON public.encrypted_blobs_conflict_shadow
  FOR EACH ROW EXECUTE FUNCTION public.sync_record_used_nonce();

CREATE OR REPLACE FUNCTION public.sync_used_nonces_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'used_nonces_append_only'
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER used_nonces_no_update
  BEFORE UPDATE ON public.used_nonces
  FOR EACH ROW EXECUTE FUNCTION public.sync_used_nonces_append_only();

CREATE TRIGGER used_nonces_no_delete
  BEFORE DELETE ON public.used_nonces
  FOR EACH ROW EXECUTE FUNCTION public.sync_used_nonces_append_only();
