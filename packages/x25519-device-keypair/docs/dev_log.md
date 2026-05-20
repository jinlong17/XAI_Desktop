# x25519-device-keypair — Dev Log (Workflow State Machine)

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | x25519-device-keypair |
| Title | Local CSPRNG X25519 device keypair |
| Roadmap | sync-v1 · feature #12 · wave W1 · Phase 0.3 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | hpke-per-device-wrap (#13) |
| Automation Mode | A-Claude |
| Verify Cross-vendor | yes |
| Executor | Codex serial autorun |
| Updated | 2026-05-19 02:53 PDT |

## Phase Plan

### Phase 1 — Device key generation [DONE]

- Enabled `x25519-dalek` `static_secrets` + `getrandom` features.
- Added local CSPRNG `StaticSecret::random()` device key generation.
- Added public-key validation rejecting all-zero and low-order values.

### Phase 2 — Keychain and KeyVault residency [DONE]

- Added `DevicePrivateKeyStore` abstraction and macOS Keychain-backed implementation.
- Added KeyVault insertion for resident `device_priv` handles.
- Zeroized staging private-key bytes after persistence and KeyVault insertion.

### Phase 3 — Tests and docs [DONE]

- Added unit tests for key naming, generated key storage, import/rehydrate, and public-key rejection.
- Added design/api/test/dev_log docs.

## Deferred Gates

- Human review and cross-vendor verification are deferred. See `docs/workflow/roadmap/sync-v1.deferred-gates.md`.
- Real signed-build Keychain ACL verification and Supabase `device_pub` upload are deferred.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 02:53 PDT | Codex serial autorun | Implemented #12 local CSPRNG X25519 device key generation, Keychain store abstraction, KeyVault insertion, public-key validation, docs, and tests. | local commit `feat(x25519-device-keypair): add device key generation` | hpke-per-device-wrap (#13) |

