# aes-gcm-aead-core — Design Snapshot

## Identity

- Workflow: FEATURE_DEV
- Target: `aes-gcm-aead-core`
- Roadmap: sync-v1 · feature #4 · wave W0 · Phase 0.3
- Source brief: `docs/reviews/aes-gcm-aead-core/20260514-roadmap-seed.md`
- Scope: Rust-only AES-256-GCM primitive under `apps/desktop/src-tauri/src/crypto/aes_gcm.rs`.

## Decisions

| Decision | Selected | Rationale |
|---|---|---|
| Feature gating | `#[cfg(feature = "crypto")]` | Keeps default Tauri builds crypto-off while enabling real primitive tests. |
| API shape | `encrypt_aes256_gcm(key, nonce, aad, plaintext)` and `decrypt_aes256_gcm(key, nonce, aad, sealed)` | Explicit AAD parameter, explicit 12B nonce input, and separated ciphertext/tag for downstream envelope codec. |
| Nonce ownership | This row accepts `[u8; 12]`; it does not construct `encryption_device_id || counter`. | PRD forbids JS nonce construction; downstream KeyVault/nonce rows own deterministic nonce policy. |
| Key handling | `Aes256GcmKey` wraps `Zeroizing<[u8; 32]>` and redacts `Debug`. | Provides a non-serializable key wrapper and zeroizes the local key buffer on drop/after use. |
| Error semantics | `AuthenticationFailed` for AAD/tag mismatch, no panic. | Decrypt failures are expected protocol errors and must surface safely. |

## Security Notes

- AES-GCM nonce reuse remains catastrophic and is not solved in this primitive. Nonce lease/high-water enforcement belongs to `nonce-lease-server` and KeyVault rows.
- AES-GCM v1 is not key-committing; Invisible Salamanders-style substitution is explicitly out of scope for v1 per roadmap risk R-10.9.
- This module wipes its local key buffer. It does not claim to zeroize internals of the upstream AES implementation after key schedule expansion.

## Deferred

- Human review and cross-vendor verify were skipped by the 24h autorun contract and recorded in `docs/workflow/roadmap/sync-v1.deferred-gates.md`.
- FR-SY-12 release-mode 1KB P95 benchmark is deferred; debug unit tests are not valid performance evidence.

