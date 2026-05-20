# rust-keyvault-opaque-handle — API Contract

Exposed behind the Tauri `crypto` feature:

```rust
pub mod crypto::key_vault;
```

## Types

| Type | Contract |
|---|---|
| `KeyHandleId` | Non-zero opaque `u32`; JS-visible integer value is returned by `.get()`. |
| `ResidentKeyKind` | `Dek` or `DevicePrivate`. |
| `KeyVault` | In-memory map from `KeyHandleId` to resident key material. |
| `KeyVaultError` | Invalid handle, handle-space exhaustion, wrong resident-key kind, or AES-GCM error. |

## Functions

| Function | Contract |
|---|---|
| `KeyHandleId::from_raw(u32)` | Rejects `0`; accepts non-zero raw handles for later command boundaries. |
| `KeyVault::insert_dek([u8; 32])` | Stores active DEK and returns an opaque handle. |
| `KeyVault::insert_device_private([u8; 32])` | Stores device private key and returns an opaque handle. |
| `KeyVault::with_dek(handle, f)` | Gives Rust-internal closure access to DEK bytes only for the closure duration. |
| `KeyVault::with_device_private(handle, f)` | Gives Rust-internal closure access to device private bytes only for the closure duration. |
| `KeyVault::encrypt_with_dek(...)` | Encrypts with the resident DEK through `aes_gcm`; raw key bytes do not leave Rust. |
| `KeyVault::decrypt_with_dek(...)` | Decrypts with the resident DEK through `aes_gcm`; wrong key kind is rejected. |
| `KeyVault::drop_key(handle)` | Evicts and explicitly zeroizes the resident key material. |

