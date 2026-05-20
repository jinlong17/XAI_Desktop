# crypto-tauri-commands — Design Snapshot

## Scope

- Feature: `crypto-tauri-commands` (#19)
- Rust surface: `apps/desktop/src-tauri/src/commands/crypto.rs`
- Status: local command layer shipped; runtime account-state wiring deferred

## Command Boundary

The command layer exposes only opaque handles and encrypted/proof outputs:

- `crypto_encrypt_for(entity_type, entity_id, proposed_revision, plaintext) -> envelope`
- `crypto_wrap_dek_for_devices(dek_handle, device_pubs[]) -> wraps[]`
- `crypto_unwrap_dek_for_device(wrap_envelope) -> dek_handle`
- `crypto_recovery_sign(challenge, new_payload_hash) -> proof`

Raw DEK, KEK, device private key, and recovery seed bytes never cross IPC. The command state owns a Rust `KeyVault`; command inputs contain identifiers, public keys, plaintext, or encrypted envelopes only.

## AAD Ownership

`crypto_encrypt_for` builds `BlobAad` in Rust using the active account/device state plus caller-provided entity identifiers and proposed revision. The caller cannot provide CBOR AAD or `encryption_device_id`.

HPKE wrap/open commands build `WrapAad` in Rust from account state and target device identifiers. Recovery signing builds `RecoveryMessageAad` in Rust from active account state, challenge, payload hash, and local timestamp.

## Capability Boundary

`commands/crypto.rs` rejects non-allowlisted windows before touching crypto state. The current allowlist is `account` and `control`, matching the dedicated capability marker `plugin-account-crypto.json`. `packages/plugin-account/manifest.json` declares all four `crypto_*` command names.

## Deferred Runtime Wiring

- Account signup/login has not yet seeded live `CryptoCommandState`.
- Package-level plugin identity cannot be fully proven by this local command test; Tauri custom commands are guarded by window label plus manifest/capability metadata here.
- Full malicious-plugin integration test is deferred to the Phase 4.8 capability admission gate.
