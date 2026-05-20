-- ============================================================
-- Migration 10: Two-phase Re-key server primitives
-- sync-v1 #32 rekey-two-phase
-- ============================================================

CREATE OR REPLACE FUNCTION fn_start_rekey(
  p_account_id UUID,
  p_new_key_id INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_key_id INTEGER;
BEGIN
  SELECT current_dek_key_id
    INTO v_current_key_id
    FROM accounts
    WHERE id = p_account_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'E3005: account not found';
  END IF;

  IF p_new_key_id <= v_current_key_id THEN
    RAISE EXCEPTION 'E3005: new key_id must increase';
  END IF;

  INSERT INTO account_keyring (account_id, key_id, status)
  VALUES (p_account_id, p_new_key_id, 'staging')
  ON CONFLICT (account_id, key_id) DO NOTHING;

  UPDATE accounts
    SET key_quarantine_at = COALESCE(key_quarantine_at, now())
    WHERE id = p_account_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_reject_quarantined_old_key()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_key_id INTEGER;
  v_quarantine_at TIMESTAMPTZ;
BEGIN
  SELECT current_dek_key_id, key_quarantine_at
    INTO v_current_key_id, v_quarantine_at
    FROM accounts
    WHERE id = NEW.account_id;

  IF v_quarantine_at IS NOT NULL AND NEW.key_id = v_current_key_id THEN
    RAISE EXCEPTION 'E3033: key_quarantined';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS encrypted_blobs_reject_quarantined_old_key ON encrypted_blobs;
CREATE TRIGGER encrypted_blobs_reject_quarantined_old_key
  BEFORE INSERT OR UPDATE OF key_id ON encrypted_blobs
  FOR EACH ROW
  EXECUTE FUNCTION fn_reject_quarantined_old_key();

CREATE OR REPLACE FUNCTION fn_complete_rekey_swap(
  p_account_id UUID,
  p_rekey_session_id UUID,
  p_old_key_id INTEGER,
  p_new_key_id INTEGER,
  p_new_recovery_signing_pub BYTEA,
  p_mnemonic_confirmed BOOLEAN,
  p_old_recovery_proof_valid BOOLEAN
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_swapped INTEGER;
BEGIN
  IF NOT p_mnemonic_confirmed OR NOT p_old_recovery_proof_valid THEN
    RAISE EXCEPTION 'E3028: rekey proof or mnemonic confirmation missing';
  END IF;

  PERFORM 1
    FROM accounts
    WHERE id = p_account_id
      AND current_dek_key_id = p_old_key_id
      AND key_quarantine_at IS NOT NULL
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'E3005: account not in rekey quarantine';
  END IF;

  PERFORM 1
    FROM account_keyring
    WHERE account_id = p_account_id
      AND key_id = p_new_key_id
      AND status = 'staging'
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'E3005: staging key not found';
  END IF;

  UPDATE encrypted_blobs b
    SET key_id = s.new_key_id,
        encryption_device_id = s.new_encryption_device_id,
        counter = s.new_counter,
        blob = s.new_blob
    FROM staging_blobs s
    WHERE b.account_id = s.account_id
      AND b.entity_type = s.entity_type
      AND b.entity_id = s.entity_id
      AND b.revision = s.preserved_revision
      AND s.account_id = p_account_id
      AND s.rekey_session_id = p_rekey_session_id
      AND s.new_key_id = p_new_key_id;

  GET DIAGNOSTICS v_swapped = ROW_COUNT;

  IF v_swapped = 0 THEN
    RAISE EXCEPTION 'E3005: no staging blobs to swap';
  END IF;

  UPDATE account_keyring
    SET status = 'retired', retired_at = now()
    WHERE account_id = p_account_id
      AND key_id = p_old_key_id;

  UPDATE account_keyring
    SET status = 'active'
    WHERE account_id = p_account_id
      AND key_id = p_new_key_id;

  UPDATE accounts
    SET current_dek_key_id = p_new_key_id,
        recovery_signing_pub = p_new_recovery_signing_pub,
        mnemonic_acknowledged = TRUE,
        key_quarantine_at = NULL
    WHERE id = p_account_id;

  DELETE FROM staging_blobs
    WHERE account_id = p_account_id
      AND rekey_session_id = p_rekey_session_id;

  RETURN v_swapped;
END;
$$;
