# sync-v1 Autorun Log — 2026-05-19

## Run Contract

- Mode: serial Codex conductor, Sync roadmap only.
- Roadmap: `docs/workflow/roadmap/sync-v1.md`
- Task plan: `docs/workflow/roadmap/sync-v1.tasks.md`
- Start: 2026-05-19 02:17 PDT
- Stop target: 24h from start, no eligible feature, or hard repository safety blocker.

## Current State

- Current feature: first 3-feature loop complete; next eligible feature is `bip39-mnemonic-24w` (#6) or `cipher-envelope-codec` (#7).
- Completed this run: `kdf-primitives` (#3), `aes-gcm-aead-core` (#4), `deterministic-cbor-aad` (#5) code/docs/tests locally complete with deferred gates.
- Failed this run: none yet.
- Next step: implement next eligible wave-W0 feature, starting with `deterministic-cbor-aad` (#5) unless dependency checks change.

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
