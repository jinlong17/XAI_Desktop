# rust-keyvault-opaque-handle — Dev Log (Workflow State Machine)

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | rust-keyvault-opaque-handle |
| Title | Rust KeyVault opaque handle map |
| Roadmap | sync-v1 · feature #11 · wave W1 · Phase 0.3 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | x25519-device-keypair (#12), ed25519-recovery-signing (#14), sqlcipher-local-db (#16), or account-signup-login (#17) |
| Automation Mode | A-Claude |
| Verify Cross-vendor | yes |
| Executor | Codex serial autorun |
| Updated | 2026-05-19 02:49 PDT |

## Phase Plan

### Phase 1 — KeyVault core [DONE]

- Added `KeyHandleId` non-zero `u32` handle.
- Added `KeyVault` resident map for DEK and device private key material.
- Added zeroize-on-evict and zeroize-on-drop paths.

### Phase 2 — Crypto use by handle [DONE]

- Added DEK handle AES-GCM encrypt/decrypt helpers using the existing primitive.
- Added resident-key kind checks so device private handles cannot be used as DEKs.

### Phase 3 — Tests and docs [DONE]

- Added unit tests for handle validation, AES round-trip, wrong-kind rejection, eviction, and debug redaction.
- Added design/api/test/dev_log docs.

## Deferred Gates

- Human review and cross-vendor verification are deferred. See `docs/workflow/roadmap/sync-v1.deferred-gates.md`.
- Tauri command capability enforcement remains deferred to downstream command/gate rows.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 02:49 PDT | Codex serial autorun | Implemented #11 Rust KeyVault, docs, and tests; ran minimal Rust checks; prepared local commit. | local commit `feat(rust-keyvault-opaque-handle): add Rust KeyVault` | x25519-device-keypair (#12) |

