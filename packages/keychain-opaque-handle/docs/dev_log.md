# keychain-opaque-handle — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | keychain-opaque-handle |
| Title | G2.4 Keychain ↔ KeyVault opaque-handle bridge |
| Roadmap | xai-g2-data-security-foundation · feature #5 · G2.4 |
| Status | READY_TO_SHIP |
| Current Phase | VERIFY |
| Suggested Next | manual ship only; SQLCipher PRAGMA wiring tracked under G2.6 reconciliation |
| Automation Mode | D-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-build + feature-verify (Claude Code, Track A) |
| Updated | 2026-05-20 00:54 PDT |
| Blockers | None; sandbox runtime evidence remains in `xai-v1.deferred-gates.md` |

## Phase Plan

### Phase 1 — Bridge module + tests

Status: DONE.

- Reconciled the existing macOS Keychain bridge (`platform::macos::keychain`)
  with the existing `KeyVault` opaque-handle store
  (`crypto::key_vault`).
- Added `apps/desktop/src-tauri/src/crypto/keychain_handle.rs` exposing:
  - `load_kek_into_vault(key, vault) -> KeyHandleId` — `secret_get`
    + `KeyVault::insert_kek`; zeroizes the byte buffer.
  - `insert_kek_from_bytes(bytes, vault) -> KeyHandleId` — same
    insertion + zeroize for callers that already hold bytes.
- 3 cargo tests covering wrong-length rejection, successful insert with
  byte-buffer zeroization, and handle resolution back to the inserted
  KEK.
- New Rust-internal error type `KeychainHandleError` (does NOT cross
  IPC — callers map to JS-visible `E11xx`/`E13xx` variants):
  - `Keychain(AppError)` — passthrough from `secret_get`.
  - `InvalidKeyLength` — payload length is not exactly 32 bytes.
  - `KeyVault(KeyVaultError)` — vault insertion failure.
- Updated `docs/contracts/tauri-commands-v0.md` §6.0.1 with the
  authorised "Keychain bytes → KeyVault handle" crossing and the rule
  that `secret_get` MUST NOT surface KEK / DEK / device-private bytes
  directly to JS.

### Phase 2 — Verify

Status: DONE.

- `cargo check --features crypto`: PASS.
- `cargo test --features crypto keychain_handle::`: 3/3 PASS.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`: PASS
  (no default-feature regressions).
- `pnpm --filter desktop build`: PASS.

Deferred / out-of-scope for G2.4:

- Live macOS Keychain runtime smoke (item creation under
  WhenUnlockedThisDeviceOnly + signed bundle id) — already covered by
  existing keychain-bridge-macos package; not a G2.4 ask.
- Wiring `load_kek_into_vault` into `db_init` for SQLCipher PRAGMA —
  tracked under G2.6 single-table sync reconciliation so the encrypted
  database open path lands with its sync gate.

## Verification Notes

feature-verify (Claude Code, Track A), 2026-05-20 00:54 PDT. Verdict: READY_TO_SHIP.

The single authorised crossing between the macOS Keychain byte surface
and the Rust-resident `KeyVault` is documented and tested. Raw KEK /
DEK / device-private bytes never cross IPC; JS only receives
`KeyHandleId` integers. Existing `secret_*` commands remain valid for
non-key material (refresh tokens, recovery transcripts, etc.).

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-20 00:54 PDT | feature-build + feature-verify (Claude Code, Track A) | Added `crypto/keychain_handle.rs` bridge + E1200-E1202 error codes + contract doc §6.0.1; 3 cargo tests passing. | pending commit | manual ship only; continue roadmap |
