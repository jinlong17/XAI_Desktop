# cipher-envelope-codec — API Contract

Exposed behind the Tauri `crypto` feature:

```rust
pub mod crypto::envelope;
```

## Types

| Type | Contract |
|---|---|
| `CipherEnvelope` | Parsed envelope fields plus ciphertext and detached tag. |
| `EnvelopeError` | `TooShort`, `UnsupportedVersion`, `UnsupportedKdfVersion`, `InvalidKeyId`. |

## Functions

| Function | Contract |
|---|---|
| `CipherEnvelope::new(key_id, encryption_device_id, counter, sealed)` | Builds v1/kdf_v1 envelope from AES-GCM sealed output; rejects `key_id = 0`. |
| `CipherEnvelope::nonce()` | Rebuilds 12B GCM nonce from `(encryption_device_id, counter)`. |
| `CipherEnvelope::sealed()` | Returns `{ ciphertext, tag }` for decrypt. |
| `serialize_envelope(&CipherEnvelope)` | Byte-stable PRD §7.1.1 serialization. |
| `parse_envelope(bytes)` | Parses and validates fixed header/version/key id; never panics on short input. |

