# sync-v1 Autorun Log — 2026-05-19

## Run Contract

- Mode: serial Codex conductor, Sync roadmap only.
- Roadmap: `docs/workflow/roadmap/sync-v1.md`
- Task plan: `docs/workflow/roadmap/sync-v1.tasks.md`
- Start: 2026-05-19 02:17 PDT
- Stop target: 24h from start, no eligible feature, or hard repository safety blocker.

## Current State

- Current feature: `rust-keyvault-opaque-handle` (#11) shipped locally; next eligible feature is `x25519-device-keypair` (#12), `ed25519-recovery-signing` (#14), `sqlcipher-local-db` (#16), `account-signup-login` (#17), or non-crypto rows #21/#23/#25.
- Completed this run: `kdf-primitives` (#3), `aes-gcm-aead-core` (#4), `deterministic-cbor-aad` (#5), `bip39-mnemonic-24w` (#6), `cipher-envelope-codec` (#7), `rust-keyvault-opaque-handle` (#11) code/docs/tests locally complete with deferred gates.
- Failed this run: no feature blocked; incidents recorded for command/script/import/fixture issues.
- Next step: implement next eligible feature after committing #11, starting with `x25519-device-keypair` (#12) unless dependency checks change.

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
