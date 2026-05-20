# ed25519-recovery-signing — Design

## Scope

This row implements DEK-derived Ed25519 recovery proof signing for Sync.

- `recovery_seed = HKDF-Expand(DEK_current, "xai.recovery.sig.v1")`.
- The recovery signing key is derived inside Rust from the resident DEK KeyVault handle.
- The signed message is the canonical CBOR recovery transcript from `crypto::aad`.
- Verification always uses `VerifyingKey::verify_strict`.

## Code Boundary

| File | Responsibility |
|---|---|
| `apps/desktop/src-tauri/src/crypto/recovery_signing.rs` | DEK-derived recovery signing pub, canonical transcript signing, strict verification, E3014 failure mapping. |
| `apps/desktop/src-tauri/src/crypto/mod.rs` | Exposes `recovery_signing` behind the `crypto` feature. |

## Invariants

- Raw DEK remains in KeyVault.
- Recovery seed staging bytes are zeroized after constructing `SigningKey`.
- `SigningKey` zeroizes on drop through `ed25519-dalek`.
- Verification failure maps to `E3014`.
- Transcript tampering and wrong-DEK public key both fail strict verification.
- Field-level recovery hash schemas are not used; only the 5-field canonical CBOR transcript is signed.

## Deferred Runtime Work

- Server challenge/Edge Function wiring belongs to `recovery-proof-edge-function`.
- Re-key old-key-signs-new-recovery-pub ceremony belongs to `rekey-two-phase`.
- RFC 8032 official vector admission remains deferred to #35.

