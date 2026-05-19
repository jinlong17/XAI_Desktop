# sync-v1 Autorun Log — 2026-05-19

## Run Contract

- Mode: serial Codex conductor, Sync roadmap only.
- Roadmap: `docs/workflow/roadmap/sync-v1.md`
- Task plan: `docs/workflow/roadmap/sync-v1.tasks.md`
- Start: 2026-05-19 02:17 PDT
- Stop target: 24h from start, no eligible feature, or hard repository safety blocker.

## Current State

- Current feature: `account-signup-login` (#17) shipped locally; next eligible feature is `onboarding-backfill-ui` (#18), `crypto-tauri-commands` (#19), `core-data-sqlite-driver` (#20), or non-crypto rows #21/#23/#25.
- Completed this run: `kdf-primitives` (#3), `aes-gcm-aead-core` (#4), `deterministic-cbor-aad` (#5), `bip39-mnemonic-24w` (#6), `cipher-envelope-codec` (#7), `rust-keyvault-opaque-handle` (#11), `x25519-device-keypair` (#12), `hpke-per-device-wrap` (#13), `ed25519-recovery-signing` (#14), `sqlcipher-local-db` (#16), `account-signup-login` (#17) code/docs/tests locally complete with deferred gates.
- Failed this run: no feature blocked; incidents recorded for command/script/import/fixture issues.
- Next step: implement next eligible feature after committing #17, preferring `crypto-tauri-commands` (#19) or `core-data-sqlite-driver` (#20) before UI-heavy #18.

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
