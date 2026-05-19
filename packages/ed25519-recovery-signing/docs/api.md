# ed25519-recovery-signing — API Contract

Exposed behind the Tauri `crypto` feature:

```rust
pub mod crypto::recovery_signing;
```

## Types

| Type | Contract |
|---|---|
| `RecoveryProof` | Contains `recovery_signing_pub`, 64-byte signature, and canonical transcript CBOR. |
| `RecoverySigningError` | `E3014` verification failure, invalid public key, KeyVault error, or KDF error. |

## Functions

| Function | Contract |
|---|---|
| `derive_recovery_signing_pub(vault, dek_handle)` | Derives recovery signing public key from resident current DEK. |
| `sign_recovery_transcript(vault, dek_handle, transcript)` | Encodes canonical CBOR transcript and signs it with DEK-derived Ed25519 key. |
| `verify_recovery_signature_strict(pub, transcript_cbor, signature)` | Verifies only via `VerifyingKey::verify_strict`; maps signature failure to `E3014`. |

