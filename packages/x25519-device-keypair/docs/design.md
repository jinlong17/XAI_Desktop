# x25519-device-keypair — Design

## Scope

This row implements local per-device X25519 keypair generation for Sync.

- `device_priv` is generated with local OS CSPRNG through `x25519-dalek`.
- `device_priv` is persisted through the existing macOS Keychain bridge.
- `device_priv` is inserted into Rust KeyVault as a resident device-private handle.
- `device_pub` is returned as 32 raw bytes for downstream upload to `sync_devices.device_pub`.

## Code Boundary

| File | Responsibility |
|---|---|
| `apps/desktop/src-tauri/src/crypto/device_key.rs` | Device key generation/import, Keychain key naming, public-key validation, KeyVault insertion. |
| `apps/desktop/src-tauri/src/crypto/mod.rs` | Exposes `device_key` behind the `crypto` feature. |
| `apps/desktop/src-tauri/Cargo.toml` | Enables `x25519-dalek` `static_secrets` + `getrandom` features for CSPRNG-backed long-term device keys. |

## Invariants

- There is no KEK input to device key generation.
- The generated private key is written to `xai.devicekey.<account_id>.<device_id>`.
- Staging private-key bytes are explicitly zeroized after Keychain write + KeyVault insertion.
- The original `StaticSecret` is zeroized on drop by `x25519-dalek`.
- All-zero public keys are rejected.
- Low-order public keys are rejected by checking for an all-zero X25519 shared secret with a fixed validation scalar.

## Deferred Runtime Work

- Actual upload to `sync_devices.device_pub` belongs to account/device registration flow after Supabase provisioning.
- Real macOS Keychain ACL / signed-build validation remains deferred to the Apple Developer / real-hardware gates.

