# cipher-envelope-codec — Design Snapshot

## Identity

- Workflow: FEATURE_DEV
- Target: `cipher-envelope-codec`
- Roadmap: sync-v1 · feature #7 · wave W0 · Phase 0.3
- Source brief: `docs/reviews/cipher-envelope-codec/20260514-roadmap-seed.md`
- Scope: Rust envelope codec under `apps/desktop/src-tauri/src/crypto/envelope.rs`.

## Decisions

| Decision | Selected | Rationale |
|---|---|---|
| Binary format | `v:1B`, `kdf_v:1B`, `key_id:u32 LE`, `encryption_device_id:u64 LE`, `counter:u32 LE`, `ciphertext`, `tag:16B` | Matches PRD §7.1.1 / FR-SY-08. |
| Nonce handling | `nonce() = encryption_device_id.to_le_bytes() || counter.to_le_bytes()` | Reconstructs the 12B GCM nonce from envelope fields; no separate nonce field is serialized. |
| AAD handling | Not serialized | AAD is recomputed by `crypto::aad` per FR-SY-67. |
| Version policy | Reject unsupported `v` / `kdf_v`, reject `key_id = 0` | Provides downgrade and invalid-key guards for downstream decrypt paths. |

## Security Notes

- The parser has an explicit minimum length and returns typed errors for malformed/unsupported inputs.
- This row does not allocate keys or decrypt by itself; it packages the ciphertext/tag produced by `aes-gcm-aead-core`.
- Full fuzzing is deferred to the dedicated fuzz row.

## Deferred

- 24h fuzz / cargo-fuzz coverage is deferred to `fuzz-harness-24h` (#47).

