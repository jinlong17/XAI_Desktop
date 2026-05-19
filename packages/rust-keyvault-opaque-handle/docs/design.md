# rust-keyvault-opaque-handle — Design

## Scope

This row implements the Rust-side in-memory KeyVault boundary for Sync crypto.

- JS receives only non-zero `u32` handles.
- Raw DEK and device private key bytes remain resident in Rust.
- Tauri command wiring and capability allowlist enforcement are owned by later rows.

## Code Boundary

| File | Responsibility |
|---|---|
| `apps/desktop/src-tauri/src/crypto/key_vault.rs` | In-memory opaque-handle map, resident key typing, zeroize-on-drop/evict, DEK handle AES-GCM helpers. |
| `apps/desktop/src-tauri/src/crypto/mod.rs` | Exposes `key_vault` behind the `crypto` feature. |

## Invariants

- `KeyHandleId` is a non-zero `u32`; `0` is invalid.
- Key material is wrapped in `Zeroizing<[u8; 32]>`.
- Resident key bytes never implement `serde::Serialize`.
- Debug output redacts resident bytes.
- DEK operations reject device-private handles.
- `drop_key` removes the handle and explicitly zeroizes the resident bytes before drop.
- `KeyVault::drop` zeroizes all remaining entries.

## Out of Scope

- Persistent KeyVault metadata in SQLCipher.
- Keychain-backed device private key persistence.
- Tauri `crypto_*` commands and capability allowlist enforcement.
- Cross-vendor security review.

