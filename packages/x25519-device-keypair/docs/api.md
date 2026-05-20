# x25519-device-keypair — API Contract

Exposed behind the Tauri `crypto` feature:

```rust
pub mod crypto::device_key;
```

## Types

| Type | Contract |
|---|---|
| `DeviceKeypair` | Contains `device_priv_handle`, `device_pub`, and `keychain_key`. Does not contain raw `device_priv`. |
| `DevicePrivateKeyStore` | Testable storage abstraction for persisting `device_priv` bytes. |
| `MacosKeychainDevicePrivateStore` | Store implementation backed by `platform::macos::keychain::secret_set`. |
| `DeviceKeyError` | Invalid keychain scope, invalid public key, KeyVault error, or Keychain error. |

## Functions

| Function | Contract |
|---|---|
| `device_keychain_key(account_id, device_id)` | Builds `xai.devicekey.<account_id>.<device_id>`; rejects blank ids. |
| `generate_and_store_device_keypair(vault, store, account_id, device_id)` | Generates local CSPRNG `StaticSecret`, stores private bytes through `store`, inserts them into KeyVault, zeroizes staging bytes, and returns public bytes + handle. |
| `import_device_private_into_vault(vault, device_priv)` | Rehydrates a Keychain-loaded device private key into KeyVault and recomputes public bytes. |
| `validate_device_public(device_pub)` | Rejects all-zero and low-order X25519 public keys. |

