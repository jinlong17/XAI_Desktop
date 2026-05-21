-- ============================================================
-- Migration 2: Core Tables (accounts, account_keyring,
--   device_dek_wraps, sync_devices) + H-3 deferred FK
-- Phase 2 of 6 — supabase-schema-migrations (sync-v1 T-02)
-- PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT §6.1
-- PRD lines: 810–828 (accounts), 831–839 (keyring),
--            842–864 (device_dek_wraps), 999–1019 (sync_devices + H-3 FK)
-- H-8 deployment order: accounts → account_keyring → device_dek_wraps
--   → sync_devices → [H-3 ALTER FK]
-- ============================================================

-- ─── accounts (v0.3: removed encrypted_dek + current_dek_key_id;
--              migrated to device_dek_wraps/keyring)
-- PRD lines 810–828
CREATE TABLE accounts (
  id                          UUID PRIMARY KEY,             -- = auth.users.id
  email                       TEXT NOT NULL UNIQUE,
  encrypted_display_name      BYTEA,                        -- client-encrypted (M-04)
  kek_salt                    BYTEA NOT NULL,               -- 16B Argon2id salt
  kek_kdf_version             SMALLINT NOT NULL DEFAULT 1,
  current_dek_key_id          INTEGER NOT NULL DEFAULT 1,   -- current active key_id (C-07)
  secret_key_check            BYTEA NOT NULL,               -- HMAC(secret_key,"xai.sk.check.v1") (FR-SY-73)
  dek_check                   BYTEA NOT NULL,               -- HMAC(DEK_current,"xai.dek.check.v1") (M-13)
  recovery_signing_pub        BYTEA NOT NULL,               -- v0.3 Ed25519 public key 32B (FR-SY-69)
  mnemonic_acknowledged       BOOLEAN NOT NULL DEFAULT false,
  secret_key_acknowledged     BOOLEAN NOT NULL DEFAULT false,
  mfa_enabled                 BOOLEAN NOT NULL DEFAULT false,
  current_account_commit_seq  BIGINT NOT NULL DEFAULT 0,    -- v0.3 H-A: full-account rollback detection
  key_quarantine_at           TIMESTAMPTZ,                  -- v0.6 H-7: Re-key emergency quarantine start; NOT NULL rejects old-key writes
  deletion_scheduled_at       TIMESTAMPTZ,                  -- GDPR 30-day
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── DEK Keyring (v0.3 revision: removed encrypted_dek, added can_retire)
-- PRD lines 831–839
CREATE TABLE account_keyring (
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  key_id      INTEGER NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('active','retired','staging')),
  can_retire  BOOLEAN NOT NULL DEFAULT false,  -- v0.3 C-F: server cron checks "no blob/shadow/staging for this key_id" before setting true
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  retired_at  TIMESTAMPTZ,
  PRIMARY KEY (account_id, key_id)
);

-- ─── Per-device DEK wraps (v0.3 new table, C-D)
-- PRD lines 842–864
-- NOTE: device_id FK to sync_devices is intentionally OMITTED here (H-3).
-- It is added via ALTER TABLE after sync_devices is created below.
CREATE TABLE device_dek_wraps (
  account_id           UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_id            UUID NOT NULL,
  key_id               INTEGER NOT NULL,
  wrap                 BYTEA NOT NULL,          -- v0.4 H-3: HPKE Base mode (RFC 9180):
                                                -- X25519 + HKDF-SHA256 + AES-GCM
                                                -- info binds CBOR AAD wrap schema (§7.1.2.2)
                                                -- envelope: { v=1, enc:32B (ephemeral_pub), ct, tag:16B }
  granted_by_device_id UUID,                   -- audit: donor device (self on registration)
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, device_id, key_id),
  FOREIGN KEY (account_id, key_id) REFERENCES account_keyring(account_id, key_id) ON DELETE CASCADE
  -- v0.6 H-3: device_id FK to sync_devices added via ALTER after sync_devices is created below
);

CREATE INDEX idx_dek_wraps_device
  ON device_dek_wraps (account_id, device_id);  -- batch delete on device revocation

-- ─── Device registry (v0.3: added device_pub + encryption_device_id; os/app_version fuzzed)
-- PRD lines 999–1012
CREATE TABLE sync_devices (
  device_id              UUID PRIMARY KEY,
  account_id             UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_pub             BYTEA NOT NULL,                    -- v0.3 X25519 public key 32B (C-D)
  encryption_device_id   BIGINT NOT NULL UNIQUE,            -- v0.3 server-assigned, 8B unique, GCM nonce high bits (C-C)
  name                   TEXT,                              -- default random "Mac-XXXX" (L-05), no hostname stored
  os_major               TEXT,                              -- v0.3 fuzzed: major version only e.g. "macOS 14" (M-10)
  app_version            TEXT,                              -- "1.0.x" granularity, not patch (M-10)
  status                 TEXT NOT NULL DEFAULT 'pending_dek_wrap'
                         CHECK (status IN ('pending_dek_wrap','active','revoked')),
  registered_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at             TIMESTAMPTZ                        -- revoke → device_dek_wraps all deleted + Re-key triggered
);

-- v0.6 H-3: now that sync_devices exists, add the deferred FK on device_dek_wraps.
-- PRD lines 1017–1019. Gate AC-8 checks this constraint name exists.
ALTER TABLE device_dek_wraps
  ADD CONSTRAINT fk_dek_wraps_device
  FOREIGN KEY (device_id) REFERENCES sync_devices(device_id) ON DELETE CASCADE;
