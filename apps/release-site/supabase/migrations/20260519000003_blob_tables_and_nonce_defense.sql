-- ============================================================
-- Migration 3: Blob Tables + Nonce Defense (T1.1 / STRIDE-Tampering)
-- Phase 3 of 6 — supabase-schema-migrations (sync-v1 T-02)
-- PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §6.1
-- PRD lines: 870–889 (encrypted_blobs), 893–918 (used_nonces + indexes),
--            936–957 (conflict_shadow), 965–983 (staging_blobs)
--
-- v0.6 Hard Invariants concentrated here:
--   AC-4: used_nonces PK = 4-tuple (account_id, key_id, encryption_device_id, counter)
--   AC-5: counter CHECK BETWEEN 0 AND 4294967295 (H-6: 4-byte GCM counter bound)
--   AC-7: uniq_encrypted_blobs_nonce partial unique WHERE hard_deleted = false
-- ============================================================

-- ─── Encrypted blob single table (v0.2 major revision: added revision / key_id / commit_seq / mutation_id)
-- PRD lines 870–889
CREATE TABLE encrypted_blobs (
  account_id              UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  entity_type             sync_entity_type NOT NULL,
  entity_id               TEXT NOT NULL,                      -- client-generated uuidv7
  revision                BIGINT NOT NULL,                    -- monotonic (FR-SY-68)
  key_id                  INTEGER NOT NULL,                   -- references account_keyring (C-07)
  -- v0.5 C-B: nonce fields split out of envelope, added as server columns + UNIQUE constraint
  encryption_device_id    BIGINT NOT NULL,                    -- nonce high 8B, parsed from envelope
  counter                 BIGINT NOT NULL,                    -- nonce low 4B, parsed from envelope
  blob                    BYTEA NOT NULL,                     -- AES-GCM envelope full bytes (v|kdf|key_id|enc_dev_id|counter|ct|tag)
  commit_seq              BIGINT NOT NULL,                    -- H-4: allocated by fn_alloc_commit_seq SECURITY DEFINER RPC
  client_updated_at       BIGINT NOT NULL,                    -- ms, display only
  server_updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(), -- audit only
  deleted_at              TIMESTAMPTZ,                        -- tombstone (soft)
  hard_deleted            BOOLEAN NOT NULL DEFAULT false,     -- user explicit hard delete (FR-SY-24)
  originator_device_id    UUID NOT NULL,
  mutation_id             UUID NOT NULL,                      -- idempotency (FR-SY-72)
  blob_size               INTEGER NOT NULL,                   -- used for quota
  PRIMARY KEY (account_id, entity_type, entity_id)
);

-- v0.6 C-A: used_nonces — immutable nonce ledger.
-- All write paths must first INSERT into used_nonces in the same transaction.
-- A PK violation = nonce reuse → E3027 + severe alert (PRD lines 891–904).
-- T1.1 threat defense: this table is NEVER DELETEd from — even for hard_deleted blobs
-- (prevents attacker hard-deleting then reusing the same nonce).
-- PRD lines 893–902
CREATE TABLE used_nonces (
  account_id            UUID NOT NULL,
  key_id                INTEGER NOT NULL,
  encryption_device_id  BIGINT NOT NULL,
  counter               BIGINT NOT NULL CHECK (counter BETWEEN 0 AND 4294967295),  -- H-6: 4-byte GCM counter upper bound
  source                TEXT NOT NULL CHECK (source IN ('blob','staging','rekey_swap','shadow_loser')),
  inserted_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, key_id, encryption_device_id, counter)
  -- NOTE: NEVER DELETE from this table.
  -- hard_deleted blobs do NOT release their nonce (prevents attacker nonce reuse, PRD line 901).
  -- All nonce consume paths (encrypted_blobs / staging_blobs / encrypted_blobs_conflict_shadow / rekey swap)
  -- must INSERT used_nonces in the same transaction; PK violation = nonce reuse → E3027.
);

-- v0.5 retained redundant defense (defense-in-depth second barrier, PRD lines 906–909)
-- Partial unique: only active (non-hard-deleted) blobs for nonce uniqueness.
-- AC-7 gate: contains UNIQUE + WHERE (hard_deleted = false).
CREATE UNIQUE INDEX uniq_encrypted_blobs_nonce
  ON encrypted_blobs (account_id, key_id, encryption_device_id, counter)
  WHERE hard_deleted = false;

-- v0.2 idempotency unique index (PRD lines 911–912)
CREATE UNIQUE INDEX idx_blobs_mutation_id
  ON encrypted_blobs (account_id, mutation_id);

-- v0.2 commit_seq cursor index (PRD lines 914–915)
CREATE INDEX idx_blobs_pull_cursor
  ON encrypted_blobs (account_id, entity_type, commit_seq);

-- realtime index (PRD lines 917–918)
CREATE INDEX idx_blobs_realtime
  ON encrypted_blobs (account_id, commit_seq);

-- ─── Conflict shadow (v0.4 C-H extended: full AAD metadata for 30-day loser reconstruction)
-- PRD lines 936–957
CREATE TABLE encrypted_blobs_conflict_shadow (
  id                         BIGSERIAL PRIMARY KEY,
  account_id                 UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  entity_type                sync_entity_type NOT NULL,
  entity_id                  TEXT NOT NULL,
  loser_blob                 BYTEA NOT NULL,                  -- overwritten loser envelope
  -- v0.4 C-H: full AAD context, required to reconstruct loser decryption after 30 days
  loser_key_id               INTEGER NOT NULL,                -- which DEK version was used
  loser_encryption_device_id BIGINT NOT NULL,                 -- nonce high 8B
  loser_counter              INTEGER NOT NULL,                -- nonce low 4B
  loser_revision             BIGINT NOT NULL,                 -- revision in AAD
  loser_deleted_flag         SMALLINT NOT NULL,               -- AAD deleted_flag
  loser_schema_version       INTEGER NOT NULL,                -- AAD schema_version
  loser_blob_size            INTEGER NOT NULL,                -- for validation
  loser_mutation_id          UUID NOT NULL,                   -- audit
  loser_device_id            UUID NOT NULL,                   -- submitter device
  loser_commit_seq           BIGINT,                         -- if loser was previously assigned a commit_seq
  rejected_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  winner_commit_seq          BIGINT NOT NULL                  -- which commit overwrote this
);

-- GC index: > 30-day rows eligible for cleanup (PRD lines 956–957)
CREATE INDEX idx_conflict_shadow_gc
  ON encrypted_blobs_conflict_shadow (rejected_at);

-- ─── Staging blobs (v0.4 H-5: re-encrypt does not change entity revision, only key + rekey_session ordering)
-- PRD lines 965–983
CREATE TABLE staging_blobs (
  account_id               UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rekey_session_id         UUID NOT NULL,                     -- one session per re-key
  snapshot_commit_seq      BIGINT NOT NULL,                   -- account commit_seq snapshot at session start
  new_key_id               INTEGER NOT NULL,
  entity_type              sync_entity_type NOT NULL,
  entity_id                TEXT NOT NULL,
  -- v0.4 H-5: re-encrypt preserves original entity revision (only key changes)
  preserved_revision       BIGINT NOT NULL,                   -- copy of original blob.revision (unchanged, key-only swap)
  new_encryption_device_id BIGINT NOT NULL,                   -- re-encryption device enc_dev_id
  new_counter              INTEGER NOT NULL,                  -- re-encryption counter
  new_blob                 BYTEA NOT NULL,                    -- re-encrypted with DEK_v_new
  preserved_deleted_flag   SMALLINT NOT NULL,                 -- 0/1/2 same as original, unchanged
  preserved_schema_version INTEGER NOT NULL,
  source_mutation_id       UUID NOT NULL,                     -- original blob's mutation_id (audit)
  rekey_session_order      BIGSERIAL,                         -- in-session ordering; swap applies in this order
  uploaded_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, rekey_session_id, entity_type, entity_id)
);
