# deterministic-cbor-aad — API Contract

Exposed behind the Tauri `crypto` feature:

```rust
pub mod crypto::aad;
```

## Types

| Type | Schema |
|---|---|
| `BlobAad` | PRD §7.1.2.1 keys 1..9. |
| `WrapAad` | PRD §7.1.2.2 keys 1..5. |
| `RecoveryMessageAad` | PRD §7.1.2.3 keys 1..5. |

## Functions

| Function | Output |
|---|---|
| `encode_blob_aad(&BlobAad)` | Deterministic CBOR bytes for blob encryption AAD. |
| `encode_wrap_aad(&WrapAad)` | Deterministic CBOR bytes for device DEK wrap metadata. |
| `encode_recovery_message_aad(&RecoveryMessageAad)` | Deterministic CBOR bytes for Ed25519 recovery message signing. |

All maps are encoded with ascending integer keys, shortest integer/length forms,
and definite lengths only.

