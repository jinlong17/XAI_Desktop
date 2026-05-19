# sync-v1 Autorun Log — 2026-05-19

## Run Contract

- Mode: serial Codex conductor, Sync roadmap only.
- Roadmap: `docs/workflow/roadmap/sync-v1.md`
- Task plan: `docs/workflow/roadmap/sync-v1.tasks.md`
- Start: 2026-05-19 02:17 PDT
- Stop target: 24h from start, no eligible feature, or hard repository safety blocker.

## Current State

- Current feature: `audit-log-integrity` (#36) shipped locally; next eligible feature is `protocol-integrity-integration-tests` (#31), `rekey-two-phase` (#32), `rls-fuzz-property` (#34), `rfc-test-vectors-gate` (#35), or `onboarding-backfill-ui` (#18). `tla-protocol-model` (#33) remains BLOCKED on Java Runtime.
- Completed this run: `kdf-primitives` (#3), `aes-gcm-aead-core` (#4), `deterministic-cbor-aad` (#5), `bip39-mnemonic-24w` (#6), `cipher-envelope-codec` (#7), `rust-keyvault-opaque-handle` (#11), `x25519-device-keypair` (#12), `hpke-per-device-wrap` (#13), `ed25519-recovery-signing` (#14), `sqlcipher-local-db` (#16), `account-signup-login` (#17), `crypto-tauri-commands` (#19), `core-data-sqlite-driver` (#20), `commit-seq-authority` (#23), `realtime-private-channel-config` (#21), `rls-policies-and-tests` (#25), `nonce-lease-server` (#24), `sync-engine-push` (#26), `sync-engine-pull` (#27), `push-edge-function` (#28), `recovery-proof-edge-function` (#29), `menubar-sync-status-icon` (#22), `single-table-todos-e2e` (#30), and `audit-log-integrity` (#36) code/docs/tests locally complete with deferred gates.
- Failed this run: `tla-protocol-model` (#33) BLOCKED on missing Java Runtime for TLC; incidents recorded for command/script/import/fixture/type/runtime issues.
- Next step: continue with next eligible Phase 4.8 security row or #18 UI; do not wait for Java install.

## Checkpoints

### 2026-05-19 02:17 PDT — checkpoint 0 / startup

- Read workflow guide, roadmap manifest, task plan, and project rules.
- Existing dirty worktree detected before this run; unrelated modified/untracked files left untouched.
- Manifest has SHIPPED rows #1 `roadmap-kickoff`, #2 `crypto-deps-lockdown`, #8 `keychain-bridge-macos`, #15 `supabase-schema-migrations`.
- BLOCKED_EXTERNAL rows #9 `supabase-project-provisioning` and #10 `apple-developer-account` remain external, not converted.
- Eligible PENDING candidates by dependency state include #3 `kdf-primitives`, #4 `aes-gcm-aead-core`, #5 `deterministic-cbor-aad`, #6 `bip39-mnemonic-24w`, plus rows depending only on #1/#15 such as #21/#22/#23/#25.

### 2026-05-19 02:17 PDT — feature checkpoint: kdf-primitives (#3)

- Implemented `apps/desktop/src-tauri/src/crypto/argon2.rs` and `kdf.rs` behind the `crypto` feature.
- Added exact-pinned optional direct deps `hkdf`, `sha2`, and `zeroize`.
- Added docs anchor `packages/kdf-primitives/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::argon2::tests`
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::kdf::tests`
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
- Corrected one test-command usage error where Cargo rejected two simultaneous test filters; no product test failed.
- Deferred: human review and cross-vendor verify; recorded in `sync-v1.deferred-gates.md`.
- Commit: `feat(kdf-primitives): add sync KDF primitives`.

### 2026-05-19 02:17 PDT — feature checkpoint: aes-gcm-aead-core (#4)

- Implemented `apps/desktop/src-tauri/src/crypto/aes_gcm.rs` behind the `crypto` feature.
- Added explicit-AAD AES-256-GCM encrypt/decrypt with detached tag and non-serializable key wrapper.
- Added docs anchor `packages/aes-gcm-aead-core/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::aes_gcm::tests`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
- Deferred: human review, cross-vendor verify, and FR-SY-12 release-mode 1KB P95 benchmark.
- Commit: `feat(aes-gcm-aead-core): add AES-GCM primitive`.

### 2026-05-19 02:17 PDT — feature checkpoint: deterministic-cbor-aad (#5)

- Implemented `apps/desktop/src-tauri/src/crypto/aad.rs` behind the `crypto` feature.
- Added deterministic fixed-schema CBOR writer for blob, wrap, and recovery-message AAD.
- Added fixture `apps/desktop/src-tauri/tests/fixtures/cbor_aad_vectors.json`.
- Added docs anchor `packages/deterministic-cbor-aad/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::aad::tests`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
  - `bash scripts/ci/check-exact-pins.sh`
- Deferred: JS/Python cross-implementation vector verification and blob-swap integration test.
- Commit: `feat(deterministic-cbor-aad): add canonical AAD vectors`.

### 2026-05-19 02:17 PDT — feature checkpoint: cipher-envelope-codec (#7)

- Implemented `apps/desktop/src-tauri/src/crypto/envelope.rs` behind the `crypto` feature.
- Added PRD §7.1.1 binary serialization/deserialization and nonce reconstruction.
- Added docs anchor `packages/cipher-envelope-codec/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::envelope::tests`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
- Deferred: full cargo-fuzz / 24h fuzz to #47.
- Commit: `feat(cipher-envelope-codec): add envelope codec`.

### 2026-05-19 02:44 PDT — feature checkpoint: bip39-mnemonic-24w (#6)

- Implemented `apps/desktop/src-tauri/src/crypto/mnemonic.rs` behind the `crypto` feature.
- Added `packages/plugin-account/src/mnemonic.ts` and exported `encodeDekMnemonic` / `decodeDekMnemonic`.
- Added Rust exact-pinned optional dep `bip39 = "=2.2.2"` and plugin dependency `@scure/bip39@2.2.0`.
- Added docs anchor `packages/bip39-mnemonic-24w/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::mnemonic::tests`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
  - `pnpm --filter @repo/plugin-account check-types`
  - `pnpm --filter @repo/plugin-account exec node --input-type=module -e "<@scure/bip39 fixture smoke>"`
- Corrected initial TS subpath import and BIP-39 fixture expectation; final Rust/JS fixture smoke matches.
- Deferred: formal independent review / admission-gate sign-off.
- Commit: `feat(bip39-mnemonic-24w): add DEK mnemonic codec`.

### 2026-05-19 02:49 PDT — feature checkpoint: rust-keyvault-opaque-handle (#11)

- Implemented `apps/desktop/src-tauri/src/crypto/key_vault.rs` behind the `crypto` feature.
- Added non-zero `KeyHandleId(u32)` opaque handle and resident-key map for DEK + device private key material.
- Added zeroize-on-evict and zeroize-on-drop behavior.
- Added DEK handle AES-GCM encrypt/decrypt helpers using the existing AES primitive.
- Added docs anchor `packages/rust-keyvault-opaque-handle/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::key_vault::tests`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
- Deferred: human review, cross-vendor verify, and Tauri capability allowlist enforcement to downstream rows.
- Commit: `feat(rust-keyvault-opaque-handle): add Rust KeyVault`.

### 2026-05-19 02:53 PDT — feature checkpoint: x25519-device-keypair (#12)

- Implemented `apps/desktop/src-tauri/src/crypto/device_key.rs` behind the `crypto` feature.
- Enabled exact-pinned `x25519-dalek = "=2.0.1"` features `static_secrets` + `getrandom`.
- Added local CSPRNG device key generation with no KEK input, Keychain store abstraction, KeyVault device-private insertion, and staging-byte zeroize.
- Added all-zero and low-order public-key rejection.
- Added docs anchor `packages/x25519-device-keypair/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::device_key::tests`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
  - `bash scripts/ci/check-exact-pins.sh`
- Deferred: human review, cross-vendor verify, real signed-build Keychain ACL verification, and Supabase `device_pub` upload.
- Commit: `feat(x25519-device-keypair): add device key generation`.

### 2026-05-19 02:58 PDT — feature checkpoint: hpke-per-device-wrap (#13)

- Implemented `apps/desktop/src-tauri/src/crypto/hpke_wrap.rs` behind the `crypto` feature.
- Added fixed-suite HPKE Base-mode DEK wrap/open: DHKEM(X25519, HKDF-SHA256) + HKDF-SHA256 + AES-256-GCM.
- Integrated with KeyVault: seal uses resident DEK handle; open uses resident device-private handle and stores recovered DEK as a new handle.
- Enforced `info != aad`; tests use deterministic CBOR wrap AAD as HPKE `info`.
- Added low-order recipient public-key rejection via existing `device_key` validation.
- Added docs anchor `packages/hpke-per-device-wrap/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::hpke_wrap::tests`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
  - `bash scripts/ci/check-exact-pins.sh`
- Deferred: human review, cross-vendor verify, RFC 9180 official vectors, and Supabase `device_dek_wraps` write-path integration.
- Commit: `feat(hpke-per-device-wrap): add HPKE DEK wrapping`.

### 2026-05-19 03:02 PDT — feature checkpoint: ed25519-recovery-signing (#14)

- Implemented `apps/desktop/src-tauri/src/crypto/recovery_signing.rs` behind the `crypto` feature.
- Derived `recovery_seed` from resident DEK via `HKDF-Expand(DEK_current, "xai.recovery.sig.v1")`.
- Signed the canonical 5-field CBOR recovery transcript from `crypto::aad`.
- Added strict verification through `VerifyingKey::verify_strict` only.
- Mapped wrong-DEK and transcript tamper verification failure to `E3014`.
- Added docs anchor `packages/ed25519-recovery-signing/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::recovery_signing::tests`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
  - `bash scripts/ci/check-exact-pins.sh`
- Deferred: human review, cross-vendor verify, RFC 8032 official vectors, Edge Function integration, and re-key ceremony integration.
- Commit: `feat(ed25519-recovery-signing): add recovery proof signing`.

### 2026-05-19 03:05 PDT — feature checkpoint: sqlcipher-local-db (#16)

- Implemented `apps/desktop/src-tauri/src/crypto/sqlcipher.rs` behind the `crypto` feature.
- Extended KeyVault with resident `Kek` kind plus `insert_kek` / `with_kek`.
- Derived `db_key = HKDF(KEK, "xai.sqlite.v1")` and zeroized staging bytes after keying.
- Added SQLCipher raw-key PRAGMA generation guarded by strict 32-byte input and internal hex encoding.
- Applied `PRAGMA cipher_compatibility = 4` and validated keyed connection.
- Added docs anchor `packages/sqlcipher-local-db/docs/{design,api,test,dev_log}.md`.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::sqlcipher::tests`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
  - `bash scripts/ci/check-exact-pins.sh`
- Deferred: SQLite dump PoC, SQLCipher CLI compatibility check, and core-data repository/schema migration.
- Commit: `feat(sqlcipher-local-db): add SQLCipher open path`.

### 2026-05-19 03:13 PDT — feature checkpoint: account-signup-login (#17)

- Implemented `packages/plugin-account/src/account.ts`.
- Added injected seams for local crypto derivation/provisioning, auth transport, and `@repo/core-data` Keychain persistence.
- Enforced that `masterPassword` and `secretKey` are consumed by the local crypto seam only; auth transport receives derived `authPassword`/check fields.
- Added signup, login, refresh-token storage, rotated refresh persistence, 60-second refresh skew, and 3-failure `relogin-required` behavior.
- Added docs anchor `packages/account-signup-login/docs/{design,api,test,dev_log}.md` and updated plugin-account docs / PLUGIN_MAP.
- Tests/checks passed:
  - `pnpm --filter @repo/plugin-account check-types`
  - `pnpm --filter @repo/plugin-account test`
- Corrected initial Vitest fixture that embedded raw secret text in a mocked derived auth password.
- Deferred: real Supabase E2E, Tauri crypto command wiring, signed-build Keychain ACL verification, and refresh-failure UI.
- Commit: `feat(account-signup-login): add account auth orchestration`.

### 2026-05-19 03:20 PDT — feature checkpoint: crypto-tauri-commands (#19)

- Implemented `apps/desktop/src-tauri/src/commands/crypto.rs`.
- Registered `crypto_encrypt_for`, `crypto_wrap_dek_for_devices`, `crypto_unwrap_dek_for_device`, and `crypto_recovery_sign` in `lib.rs`.
- Added `CryptoCommandState` with default-build stubs and `crypto` feature real paths through KeyVault, envelope, deterministic AAD, HPKE wrap/open, and recovery signing.
- Added window-label allowlist rejecting non-account/control windows before crypto state access.
- Added `plugin-account-crypto` capability marker and declared all four `crypto_*` commands in `packages/plugin-account/manifest.json`.
- Added docs anchor `packages/crypto-tauri-commands/docs/{design,api,test,dev_log}.md` and updated PLUGIN_MAP/plugin-account docs.
- Tests/checks passed:
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto commands::crypto::tests -- --nocapture`
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto error::tests -- --nocapture`
  - `bash scripts/ci/check-exact-pins.sh`
- Deferred: live account-state seeding, TS clients, real Tauri invoke from allowed packages, and malicious-plugin integration test.
- Commit: `feat(crypto-tauri-commands): add crypto IPC handlers`.

### 2026-05-19 03:24 PDT — run hygiene checkpoint

- Added root `pnpm typecheck` alias to `pnpm check-types`, so the scheduled broader sweep no longer fails at script lookup.
- Fixed existing `@repo/plugin-organizer` mock-data type error surfaced by the restored root typecheck command.
- Declared the empty Cargo `keychain-it` feature to silence the known unexpected-cfg warning for gated Keychain integration tests.
- Checks passed:
  - `pnpm typecheck`
  - `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto:: --locked`
- Remaining non-blocking warnings: Rust dead-code warnings for unused sync/keychain variants/helpers in the current host build, and Next baseline-browser-mapping data age warnings.

### 2026-05-19 03:25 PDT — feature checkpoint: core-data-sqlite-driver (#20)

- Implemented `packages/core-data/src/sqlite.ts`.
- Added `SqliteDriver`, namespace-scoped `createSqliteRepo`, mutation hook seam, and SQL statement constants.
- Added `packages/core-data/src/local-storage.ts` with idempotent localStorage-to-repo migration.
- Extended `packages/core-data/src/testing.ts` with `createInMemorySqliteDriver`.
- Added `@repo/core-data/testing` export subpath.
- Added docs anchor `packages/core-data-sqlite-driver/docs/{design,api,test,dev_log}.md` and updated PLUGIN_MAP.
- Tests/checks passed:
  - `pnpm --filter @repo/core-data check-types`
  - `pnpm --filter @repo/core-data test`
  - red-line import grep for Tauri/deep-internal/plugin imports in core-data source/tests
- Corrected initial TypeScript generic cast error in the in-memory SQLite test driver.
- Deferred: real SQLCipher-backed Tauri driver, SQLite dump PoC, and PRD §6.3 entity/outbox schema.
- Commit: `feat(core-data-sqlite-driver): add SQLite repo boundary`.

### 2026-05-19 03:29 PDT — sweep checkpoint after W1 data/crypto loop

- Completed loop: #17 `account-signup-login`, #19 `crypto-tauri-commands`, #20 `core-data-sqlite-driver`.
- Broader checks:
  - `pnpm lint` PASS.
  - `pnpm typecheck` PASS.
  - `pnpm build` PASS.
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS.
- Non-blocking warnings seen:
  - Rust dead-code warnings for currently unused AppError variants and Keychain helper types.
  - Next `baseline-browser-mapping` data age warning during typegen/build.
  - Turbo warning: no output files found for `desktop#build`.
- Next eligible candidates: #18 `onboarding-backfill-ui`, #21 `realtime-private-channel-config`, #23 `commit-seq-authority`, #25 `rls-policies-and-tests`.

### 2026-05-19 03:33 PDT — feature checkpoint: commit-seq-authority (#23)

- Reconciled existing migration `apps/web/supabase/migrations/20260519000005_commit_seq_rpc.sql` against #23 requirements.
- Fixed invalid `pg_advisory_xact_lock(bigint,bigint)` usage by deriving UUID hi/lo 64-bit halves and taking two sorted single-bigint transaction advisory locks.
- Preserved `SECURITY DEFINER`, `SET search_path = public`, `REVOKE ALL ... FROM PUBLIC`, and the `current_account_commit_seq < v_new_seq` regression guard.
- Added docs anchor `packages/commit-seq-authority/docs/{design,api,test,dev_log}.md` and updated supabase-schema docs / PLUGIN_MAP.
- Tests/checks passed:
  - Local `postgres:16-alpine` Docker apply of migrations `20260519000001` through `20260519000005`.
  - Sequential allocation observed `1,2,3`.
  - `has_function_privilege('public', 'fn_alloc_commit_seq(uuid)', 'execute')` observed `false`.
  - Forced sequence regression raised the expected `commit_seq regression` exception.
  - Ten parallel same-account calls returned unique sorted sequence `1,2,3,4,5,6,7,8,9,10`.
- Deferred: live Supabase deploy, `/sync/push` Edge Function transaction integration, and client pull rollback monitor.
- Commit: `feat(commit-seq-authority): verify commit sequence RPC`.

### 2026-05-19 03:36 PDT — feature checkpoint: realtime-private-channel-config (#21)

- Added `apps/web/supabase/migrations/20260519000007_realtime_private_channels.sql`.
- Added `apps/web/supabase/realtime.private-channel.json` with `channels.sync.clientConfig.private = true`.
- Policy `realtime_sync_private_channel_active_device` binds `realtime.topic()` to `sync:<auth.uid()>`, requires `extension = 'postgres_changes'`, and requires active non-revoked JWT `device_id`.
- Added docs anchor `packages/realtime-private-channel-config/docs/{design,api,test,dev_log}.md` and updated PLUGIN_MAP.
- Tests/checks passed:
  - Local `postgres:16-alpine` Docker shim for `auth` and `realtime` applied the migration.
  - `pg_policies` contained the expected `realtime.messages` policy.
  - Active device + matching topic read count was `1`.
  - Active device + wrong topic read count was `0`.
  - Revoked device + matching topic read count was `0`.
  - Node JSON check confirmed `clientConfig.private === true`.
- Deferred: live Supabase deploy and cross-account Realtime subscription negative test.
- Commit: `feat(realtime-private-channel-config): add private channel policy`.

### 2026-05-19 03:45 PDT — feature checkpoint: rls-policies-and-tests (#25)

- Added Docker-backed Vitest harness `apps/web/supabase/tests/rls-policies.test.ts`.
- Added `web` script `test:rls` and Vitest config.
- Reworked active-device RLS predicates through `public.sync_jwt_device_is_active()` / `public.sync_jwt_device_id()` to avoid recursive policy evaluation.
- Tightened `sync_devices` visibility so active devices see active rows only, pending devices can poll only their own pending row, and revoked devices see no rows.
- Updated Realtime private-channel policy to reuse the shared active-device helper.
- Added docs anchor `packages/rls-policies-and-tests/docs/{design,api,test,dev_log}.md`, updated PLUGIN_MAP, and updated supabase-schema API docs.
- Tests/checks passed:
  - `pnpm --filter web test:rls`
  - `pnpm --filter web check-types`
- Incident fixed: first RLS harness run failed due local auth-shim permission and UPDATE expectation mismatch; rerun passed after correction.
- Deferred: hosted Supabase/PostgREST + `@supabase/supabase-js` verification blocked by #9.
- Commit: `feat(rls-policies-and-tests): add RLS behavior harness`.

### 2026-05-19 03:50 PDT — feature checkpoint: nonce-lease-server (#24)

- Added `apps/web/supabase/migrations/20260519000008_nonce_lease_rpc.sql`.
- Implemented `fn_grant_nonce_lease(account_id, key_id, count)` as authenticated SECURITY DEFINER RPC.
- RPC derives `encryption_device_id` from the active JWT device, locks the device row plus latest lease row, returns monotone non-overlapping ranges, and rejects requests at the `0xFFFFFF00` re-key threshold.
- Added trigger-enforced `used_nonces` ledger writes for `encrypted_blobs`, `staging_blobs`, and `encrypted_blobs_conflict_shadow`.
- Added append-only update/delete triggers for `used_nonces`.
- Added Docker-backed Vitest harness `apps/web/supabase/tests/nonce-lease.test.ts` and web script `test:nonce`.
- Added docs anchor `packages/nonce-lease-server/docs/{design,api,test,dev_log}.md`, updated PLUGIN_MAP, and updated supabase-schema API/test docs.
- Tests/checks passed:
  - `pnpm --filter web test:nonce`
  - `pnpm --filter web check-types`
- Incident fixed: first nonce test helper rolled back stateful RPC calls; rerun passed after committing those calls.
- Deferred: human/cross-vendor review, live Supabase deploy/RPC test, Edge Function error mapping, and macOS Keychain `high_water` rollback rehearsal.
- Commit: `feat(nonce-lease-server): add nonce lease RPC`.

### 2026-05-19 03:56 PDT — feature checkpoint: sync-engine-push (#26)

- Added `packages/plugin-account/src/sync-engine.ts`.
- Implemented plaintext `createSyncOutbox()` with same-entity squash and UUIDv7 mutation IDs.
- Implemented `pushBatch()` to read base revision, compute `proposedRevision = base + 1`, lazy-encrypt via injected crypto seam, and send one batch through transport.
- Implemented `createSyncPushHttpTransport()` defaulting to one JSON `POST /sync/push` with bearer auth.
- Added `packages/plugin-account/tests/sync-engine.test.ts`.
- Updated plugin-account docs and added docs anchor `packages/sync-engine-push/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP.
- Tests/checks passed:
  - `pnpm --filter @repo/plugin-account check-types`
  - `pnpm --filter @repo/plugin-account test`
- Deferred: real Tauri invoke wiring, SQLCipher-persistent outbox/entity schema, hosted `/sync/push` Edge Function, and network E2E.
- Commit: `feat(sync-engine-push): add lazy push batch`.

### 2026-05-19 03:59 PDT — feature checkpoint: sync-engine-pull (#27)

- Extended `packages/plugin-account/src/sync-engine.ts` with PULL contracts.
- Added `pullBatch()` using a single global `sinceCommitSeq` cursor and default limit 500.
- Added `createSyncPullHttpTransport()` generating `GET /sync/pull?since_commit_seq=&limit=` without `entity_type`.
- Added `applyServerRecords()` with FR-SY-68 H-6 classification:
  - idempotent duplicate ignored
  - same-revision key change with higher commit_seq accepted as legit re-encrypt
  - old revision / ambiguous changed blob rejected as E3015
  - account commit_seq rollback rejected as E3024
- Extended `packages/plugin-account/tests/sync-engine.test.ts` and plugin-account docs.
- Added docs anchor `packages/sync-engine-pull/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP.
- Tests/checks passed:
  - `pnpm --filter @repo/plugin-account check-types`
  - `pnpm --filter @repo/plugin-account test`
- Deferred: hosted `/sync/pull`, real decrypt/apply routing, entity-specific SQLCipher tables, and Realtime-triggered pull scheduling.
- Commit: `feat(sync-engine-pull): add global pull cursor`.

### 2026-05-19 04:00 PDT — sweep checkpoint after W2 client/protocol loop

- Completed loop since previous sweep: #21 `realtime-private-channel-config`, #23 `commit-seq-authority`, #25 `rls-policies-and-tests`, #24 `nonce-lease-server`, #26 `sync-engine-push`, #27 `sync-engine-pull`.
- Broader checks:
  - `pnpm lint` PASS.
  - `pnpm typecheck` PASS.
  - `pnpm build` PASS.
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS.
- Non-blocking warnings seen:
  - Next `baseline-browser-mapping` data-age warning during typegen/build.
  - Turbo warning: no output files found for `desktop#build`.
  - Rust dead-code warnings for currently unused AppError variants and Keychain helper types.
- Next eligible candidates: #18 `onboarding-backfill-ui`, #22 `menubar-sync-status-icon`, #28 `push-edge-function`, #29 `recovery-proof-edge-function`, #30 `single-table-todos-e2e` once all direct deps are satisfied.

### 2026-05-19 04:03 PDT — feature checkpoint: push-edge-function (#28)

- Added `apps/web/supabase/functions/sync-push/handler.ts`.
- Added lightweight `apps/web/supabase/functions/sync-push/index.ts` entry.
- Implemented Edge Function core protocol:
  - per-record processing
  - mutation_dedup idempotency
  - conditional `baseRevision/proposedRevision` validation
  - conflict shadow insertion for stale incoming losers
  - commit_seq allocation via injected DB seam
  - Rust envelope metadata parsing for server columns
  - mixed 207 per-record response
- Added `apps/web/supabase/tests/sync-push.test.ts` and `web` script `test:push`.
- Added docs anchor `packages/push-edge-function/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP.
- Tests/checks passed:
  - `pnpm --filter web test:push`
  - `pnpm --filter web check-types`
- Deferred: live Supabase deploy, real service_role DB adapter/JWT extraction, and concurrent Postgres integration blocked by #9.
- Commit: `feat(push-edge-function): add sync push core`.

### 2026-05-19 04:07 PDT — feature checkpoint: recovery-proof-edge-function (#29)

- Added `apps/web/supabase/functions/recovery-proof/handler.ts`.
- Added lightweight `apps/web/supabase/functions/recovery-proof/index.ts` entry.
- Implemented recovery challenge/proof core:
  - 32B challenge generation
  - 5 minute TTL
  - single-use challenge marking
  - canonical CBOR encoder for message/payload
  - full `new_payload` hash binding
  - recovery payload allowlist
  - injected strict-signature verifier seam
  - E3014 rejection for missing/expired/used/tampered/disallowed/bad-signature paths
- Added `apps/web/supabase/tests/recovery-proof.test.ts` and `web` script `test:recovery`.
- Added docs anchor `packages/recovery-proof-edge-function/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP.
- Tests/checks passed:
  - `pnpm --filter web test:recovery`
  - `pnpm --filter web check-types`
- Incident fixed: first typecheck failed on `crypto.subtle.digest` BufferSource narrowing; rerun passed.
- Deferred: live Supabase deploy, persistent challenge table/cleanup, strict Ed25519 verifier binding, and real Rust signature E2E.
- Commit: `feat(recovery-proof-edge-function): add recovery proof core`.

### 2026-05-19 04:14 PDT — feature checkpoint: menubar-sync-status-icon (#22)

- Added `packages/plugin-account/src/sync-status.ts` with plugin-owned `account:sync-*` lifecycle emission helpers.
- Added `runObservedSync()` wrapper that emits started/completed/failed and rethrows operation failures.
- Added `apps/desktop/src/sync/useSyncMenuBarStatus.ts` to listen for account sync events and drive the shell adapter.
- Added `apps/desktop/src-tauri/src/commands/menubar.rs` with Tauri tray install/update command and generated four-state RGBA icons:
  - idle grey
  - syncing blue spinner frames
  - success green flash
  - error red clickable/focus path
- Enabled Tauri `tray-icon` feature and registered `sync_set_menubar_status`.
- Added docs anchor `packages/menubar-sync-status-icon/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP and plugin-account docs.
- Tests/checks passed:
  - `pnpm --filter @repo/plugin-account test`
  - `pnpm --filter @repo/plugin-account check-types`
  - `pnpm --filter desktop build`
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml menubar`
- Incident fixed: first Rust menubar test compile failed on `AppError` conversion for tray/lock errors; rerun passed.
- Deferred: real macOS menu-bar visual/click validation and real push/pull transition verification.
- Commit: `feat(menubar-sync-status-icon): add sync status tray`.

### 2026-05-19 04:21 PDT — feature checkpoint: single-table-todos-e2e (#30)

- Added `packages/plugin-account/src/todo-sync.ts`.
- Implemented local todo sync store:
  - `account_todos` table contract
  - `sync_outbox` table contract
  - same-driver-transaction `putTodo()` entity + outbox write
  - remote apply path that does not create a new outbox row
  - outbox list/remove helpers for push flush
- Added `packages/plugin-account/tests/integration/single-table-todos-e2e.test.ts`.
- Local integration covers:
  - entity + outbox writes share one transaction id
  - Device A encrypted push through `pushBatch()` into `/sync/push` core
  - Device B pull/decrypt/apply through `applyServerRecords()`
  - server blob dump lacks plaintext and wrong-key decrypt fails
  - stale Device B write returns E3015 and records conflict shadow
- Added docs anchor `packages/single-table-todos-e2e/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP and plugin-account docs.
- Tests/checks passed:
  - `pnpm --filter @repo/plugin-account test -- tests/integration/single-table-todos-e2e.test.ts`
  - `pnpm --filter @repo/plugin-account check-types`
  - `pnpm --filter web test:push`
  - `pnpm --filter @repo/plugin-account test`
- Incident fixed: first integration run passed the wrong revision-reader seam; rerun passed after harness fix.
- Deferred: hosted Supabase deploy, real two-Mac sync, Realtime-triggered pull, SQLCipher copied-file dump PoC, and visual menu-bar transition validation.
- Commit: pending `feat(single-table-todos-e2e): add local todos sync harness`.

### 2026-05-19 04:26 PDT — feature checkpoint: tla-protocol-model (#33)

- Added `docs/spec/sync.tla`.
- Added `docs/spec/sync.cfg`.
- Added `docs/spec/sync-model-check.md`.
- The finite model covers the six mandatory scenarios as explicit actions/markers:
  - device revocation
  - new-device join
  - concurrent Re-key
  - offline replay
  - full recovery
  - duplicate mutation
- Documented known limitation: the model treats `account_commit_seq` as one honest global counter and does not prove defense against server equivocation.
- Static checks passed:
  - `rg "DeviceRevocation|NewDeviceJoin|ConcurrentRekey|OfflineReplay|FullRecovery|DuplicateMutation" docs/spec/sync.tla docs/spec/sync.cfg`
  - `wc -l docs/spec/sync.tla docs/spec/sync.cfg`
- TLC attempt:
  - Downloaded `/tmp/tla2tools.jar` from the TLA+ GitHub release URL.
  - `java -jar /tmp/tla2tools.jar -deadlock -workers 2 docs/spec/sync.tla` failed because macOS reports no Java Runtime.
- Status: BLOCKED, not shipped; model-check gate recorded in deferred gates and incident log.
- Commit: `feat(tla-protocol-model): add sync tla model`.

### 2026-05-19 04:32 PDT — feature checkpoint: audit-log-integrity (#36)

- Added `apps/web/supabase/migrations/20260519000009_audit_log_integrity.sql`.
- Reconciled with existing migration-4 `sync_audit_log` table by adding integrity columns instead of recreating the table.
- Added server audit integrity primitives:
  - `sync_audit_account_state`
  - append-only UPDATE/DELETE rejection triggers
  - `fn_append_sync_audit_log`
  - `fn_sync_audit_summary`
  - HMAC `device_hash`
  - `payload_hash`, `prev_hash`, `entry_hash`
- Added `apps/web/supabase/tests/audit-log.test.ts` and `web` script `test:audit`.
- Added `packages/plugin-account/src/audit-log.ts` with local `sync_audit_mirror` summary store and `SyncAuditMismatchError` (`E3025`).
- Added `packages/plugin-account/tests/audit-log.test.ts`.
- Added docs anchor `packages/audit-log-integrity/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP and plugin-account docs.
- Tests/checks passed:
  - `pnpm --filter web test:audit`
  - `pnpm --filter @repo/plugin-account test -- tests/audit-log.test.ts`
  - `pnpm --filter @repo/plugin-account check-types`
  - `pnpm --filter @repo/plugin-account test`
  - `pnpm --filter web check-types`
- Incidents fixed: first audit Docker test hit existing `sync_audit_log`; second hit missing `entity_id`; migration reconciliation fixed both and rerun passed.
- Deferred: human review, cross-vendor verify, live Supabase deploy/service_role integration, and runtime severe-alert UI wiring.
- Commit: pending `feat(audit-log-integrity): add audit mirror`.

### 2026-05-19 04:36 PDT — feature checkpoint: protocol-integrity-integration-tests (#31)

- Added `packages/plugin-account/tests/integration/protocol-integrity.test.ts`.
- Added `apps/web/supabase/tests/protocol-integrity.test.ts` and `web` script `test:protocol`.
- Tightened recovery Edge handler to return HTTP 401 with `E3014` for `PATCH /auth/me` requests missing a recovery proof.
- Added docs anchor `packages/protocol-integrity-integration-tests/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP and roadmap/task status.
- Local coverage:
  - AES-GCM blob-swap rejection through entity/revision-bound AAD.
  - Pull revision rollback rejection as `E3015`.
  - Recovery no-proof `PATCH /auth/me` rejection as `401/E3014`.
  - Push mutation idempotency: same `mutation_id` resent 10 times creates exactly one revision.
  - Tauri `crypto_*` allowlist denial for non-allowlisted window.
- Tests/checks passed:
  - `pnpm --filter @repo/plugin-account test -- tests/integration/protocol-integrity.test.ts`
  - `pnpm --filter web test:protocol`
  - `pnpm --filter web check-types`
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto commands::crypto::tests::rejects_non_allowlisted_window`
- Deferred: human review, cross-vendor verify, live Supabase deployed integration, malicious plugin/window runtime verification, and recovery/KDF performance budget.
- Commit: pending `feat(protocol-integrity-integration-tests): add protocol regression suite`.

### 2026-05-19 04:48 PDT — feature checkpoint: rfc-test-vectors-gate (#35)

- Added `apps/desktop/src-tauri/src/crypto/rfc_vectors.rs` and test-only module wiring.
- Added Rust vector coverage:
  - RFC 9106 Argon2id v=19 KAT.
  - RFC 8032 Ed25519 test vector 1 with `verify_strict`.
  - RFC 9180 HPKE Base DHKEM(X25519, HKDF-SHA256) + HKDF-SHA256 + AES-256-GCM open/export vector.
  - exact `ed25519-dalek =2.2.0` pin assertion and active strict-verify source tripwire.
- Added JS/Python CBOR AAD cross-check scripts:
  - `scripts/ci/check-cbor-aad-cross-impl.sh`
  - `scripts/ci/check-cbor-aad-cborx.mjs`
  - `scripts/ci/check-cbor-aad-cbor2.py`
- Added root dev dependency `cbor-x@1.6.4`; installed local Python `cbor2==6.1.1` for verification.
- Added `.github/workflows/supply-chain-security.yml` job `rfc-vectors`.
- Added docs anchor `packages/rfc-test-vectors-gate/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP and roadmap/task status.
- Tests/checks passed:
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::rfc_vectors`
  - `bash scripts/ci/check-cbor-aad-cross-impl.sh`
  - `bash scripts/ci/check-verify-strict.sh`
- Incident recorded: dependency install repeated existing Next/React peer warnings.
- Deferred: human review, cross-vendor verify, hosted GitHub Actions run, and branch-protection required-status-check setup.
- Commit: pending `feat(rfc-test-vectors-gate): add crypto vector gate`.

### 2026-05-19 04:55 PDT — feature checkpoint: rls-fuzz-property (#34)

- Added `apps/web/supabase/tests/rls-fuzz-property.test.ts`.
- Added `apps/web` script `test:rls-fuzz`.
- Added `fast-check@4.8.0` to `apps/web`.
- Harness behavior:
  - applies Sync migrations 1-7 in a local Postgres 16 Docker container.
  - creates 1000 accounts.
  - creates 100 devices per account, 100,000 devices total.
  - includes active, pending, and revoked device status distribution.
  - uses fast-check to randomize actor account, actor device, and target account attempts.
  - asserts zero cross-tenant rows from `encrypted_blobs`, `encrypted_blobs_conflict_shadow`, `staging_blobs`, and `device_dek_wraps`.
  - asserts revoked/pending devices read zero rows from those active-gated tables.
- Added docs anchor `packages/rls-fuzz-property/docs/{design,api,test,dev_log}.md`; updated PLUGIN_MAP and roadmap/task status.
- Tests/checks passed:
  - `pnpm --filter web test:rls-fuzz`
  - `pnpm --filter web check-types`
  - `pnpm install --frozen-lockfile`
- Incident recorded: dependency install repeated existing Next/React peer warnings.
- Deferred: human review, cross-vendor verify, and hosted Supabase/supabase-js property run.
- Commit: pending `feat(rls-fuzz-property): add RLS property fuzz gate`.

### 2026-05-19 05:00 PDT — sweep checkpoint after Phase 4.8 test gates

- Completed this sweep window:
  - #31 `protocol-integrity-integration-tests` (`746cfbf`)
  - #35 `rfc-test-vectors-gate` (`53b9cf3`)
  - #34 `rls-fuzz-property` (`c3859c4`)
- Broader checks:
  - `pnpm lint` initially FAIL, then PASS after removing #31 unused test import.
  - `pnpm typecheck` PASS.
  - `pnpm build` PASS.
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS.
- Non-blocking warnings seen:
  - Next `baseline-browser-mapping` data-age warning during typegen/build.
  - Turbo warning: no output files found for `desktop#build`.
  - Rust dead-code warnings in desktop error/keychain paths.
- Next eligible candidates: #32 `rekey-two-phase`, #18 `onboarding-backfill-ui`. #37 remains blocked by #33 TLC/Java plus #32 pending.
- Commit: pending `fix(protocol-integrity-integration-tests): clear lint warning`.

### 2026-05-19 05:02 PDT — feature checkpoint: rekey-two-phase (#32)

- Added `packages/plugin-account/src/rekey.ts` and exports.
- Added `packages/plugin-account/tests/rekey.test.ts`.
- Added `apps/web/supabase/migrations/20260519000010_rekey_two_phase.sql`.
- Added `apps/web/supabase/tests/rekey.test.ts` and `web` script `test:rekey`.
- Updated `/sync/push` core to reject quarantined current-key pushes as `E3033`.
- Fixed nonce-ledger trigger behavior needed by rekey swap:
  - table-specific `OLD.*` fields are now read only inside the matching table branch.
  - encrypted blob UPDATE can consume a nonce already reserved by `staging_blobs`.
- Local coverage:
  - immediate key quarantine and staging key entry.
  - E3033 old-key write rejection.
  - E3028 mnemonic/proof gate before swap.
  - preserved revision during staging/swap.
  - old key retired, new key active, quarantine cleared after swap.
  - old mnemonic rejected and new mnemonic accepted after swap.
  - restart classification for init, staging 30%, staging 70%, before-swap, and after-swap.
- Tests/checks passed:
  - `pnpm --filter @repo/plugin-account test -- tests/rekey.test.ts`
  - `pnpm --filter @repo/plugin-account check-types`
  - `pnpm --filter @repo/plugin-account test`
  - `pnpm --filter web test:rekey`
  - `pnpm --filter web check-types`
  - `pnpm --filter web test:nonce`
  - `pnpm --filter web lint`
- Incidents fixed: first `test:rekey` found a table-specific trigger field bug; second found the staging nonce reservation vs swap duplicate ledger issue.
- Deferred: human review, cross-vendor verify, blocking mnemonic UI, real Tauri crypto commands, hosted service_role Edge wiring, process-level kill-9 rehearsals, and two-Mac/device-revocation E2E.
- Commit: pending `feat(rekey-two-phase): add rekey orchestration core`.

### 2026-05-19 02:55 PDT — sweep checkpoint after next 4-feature loop

- Completed next eligible loop: #7 `cipher-envelope-codec`, #6 `bip39-mnemonic-24w`, #11 `rust-keyvault-opaque-handle`, #12 `x25519-device-keypair`.
- Broader checks:
  - `pnpm lint` PASS.
  - `pnpm build` PASS.
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS.
  - `pnpm typecheck` FAIL: root script is not defined (`Command "typecheck" not found`); repeated known incident.
- Non-blocking warnings seen:
  - Rust `keychain-it` unexpected cfg warning from pre-existing Keychain gated tests.
  - Next.js `baseline-browser-mapping` data age warning during build.
  - Turbo warning: no output files found for `desktop#build`.
- Next eligible candidates: #13 `hpke-per-device-wrap`, #14 `ed25519-recovery-signing`, #16 `sqlcipher-local-db`, #17 `account-signup-login`, #21 `realtime-private-channel-config`, #23 `commit-seq-authority`, #25 `rls-policies-and-tests`.

### 2026-05-19 02:17 PDT — sweep checkpoint after first 3-feature loop

- Completed first eligible loop: #3 `kdf-primitives`, #4 `aes-gcm-aead-core`, #5 `deterministic-cbor-aad`.
- Broader checks:
  - `pnpm lint` PASS.
  - `pnpm build` PASS.
  - `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` PASS.
  - `pnpm typecheck` FAIL: root script is not defined (`Command "typecheck" not found`); recorded in incidents.
- Non-blocking warnings seen:
  - Rust `keychain-it` unexpected cfg warning from pre-existing Keychain tests.
  - Next.js `baseline-browser-mapping` data age warning during build.
- Next eligible candidates: #6 `bip39-mnemonic-24w`, #7 `cipher-envelope-codec`, #21 `realtime-private-channel-config`, #22 `menubar-sync-status-icon`, #23 `commit-seq-authority`, #25 `rls-policies-and-tests`.
