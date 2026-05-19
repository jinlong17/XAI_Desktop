# hpke-per-device-wrap — API Contract

Exposed behind the Tauri `crypto` feature:

```rust
pub mod crypto::hpke_wrap;
```

## Types

| Type | Contract |
|---|---|
| `DeviceDekWrap` | Contains serialized HPKE `encapped_key` and ciphertext containing the wrapped 32-byte DEK. |
| `HpkeWrapError` | Distinct info/aad violation, invalid length, invalid DEK length, invalid public key, KeyVault error, or HPKE error. |

## Functions

| Function | Contract |
|---|---|
| `seal_dek_for_device(vault, dek_handle, recipient_device_pub, info, aad)` | HPKE Base-mode seals the resident DEK to `recipient_device_pub`; rejects `info == aad`; validates recipient public key. |
| `open_dek_wrap_into_vault(vault, device_priv_handle, wrap, info, aad)` | Opens the wrap with resident device private key and stores recovered DEK in KeyVault, returning a new DEK handle. |
| `ensure_info_aad_distinct(info, aad)` | Enforces the H-5 separation between HPKE `info` and AEAD `aad`. |

## Suite

`DHKEM(X25519,HKDF-SHA256)+HKDF-SHA256+AES-256-GCM`.

