# aes-gcm-aead-core — API Contract

Exposed behind the Tauri `crypto` feature:

```rust
pub mod crypto::aes_gcm;
```

## Constants

| Constant | Value |
|---|---|
| `AES_256_KEY_BYTES` | `32` |
| `GCM_NONCE_BYTES` | `12` |
| `GCM_TAG_BYTES` | `16` |

## Types

| Type | Contract |
|---|---|
| `Aes256GcmKey` | Non-serializable wrapper over `Zeroizing<[u8; 32]>`; `Debug` redacts bytes. |
| `Aes256GcmSealed` | `{ ciphertext: Vec<u8>, tag: [u8; 16] }`. |
| `AesGcmError` | `InvalidKey` or `AuthenticationFailed`. |

## Functions

| Function | Contract |
|---|---|
| `encrypt_aes256_gcm(key, nonce, aad, plaintext)` | AES-256-GCM encrypt with detached 16B tag and explicit AAD. |
| `decrypt_aes256_gcm(key, nonce, aad, sealed)` | Authenticates tag/AAD before returning plaintext; mismatch returns `AuthenticationFailed`. |

Nonce construction is intentionally absent from this API.

