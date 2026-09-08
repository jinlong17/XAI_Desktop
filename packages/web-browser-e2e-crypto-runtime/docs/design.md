# web-browser-e2e-crypto-runtime — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — package-owned browser runtime using real Sync v0.6 unlock inputs, native `WebCrypto`, modular browser HPKE, and `hash-wasm` for Argon2id |
| Review Doc Path | `docs/reviews/web-browser-e2e-crypto-runtime/20260521-discovery-review.md` |
| Review Date/Version | 2026-05-21 (revise pass) |
| Feature Type | W3 browser runtime package planning |
| Roadmap | `web-ticktick-parity` · feature #7 · W3 |

## Frozen Assumptions

- This row implements the browser crypto runtime package boundary only; it does not move business logic into `apps/web`.
- The upstream Sync/browser contract is already frozen by `web-sync-crypto-contract-preflight`; this row must consume that truth directly.
- Public unlock input is **not** `encrypted_dek`; the source of truth is `/auth/me` keyring/current-key metadata plus active `device_dek_wraps` material, with only a local wrapped device-private-key mirror allowed as an at-rest seam.
- KEK derivation still belongs in this row and must include `secret_key` per Sync v0.6 because it gates unwrap of the local device-private-key mirror.
- This row owns browser-local HPKE open of the active device wrap; it does not own donor grant orchestration or remote wrap fetching.
- KEK and DEK live only as non-extractable in-memory key handles.
- `Uint8Array.fill(0)` is best effort only; JavaScript strings and GC remain non-deterministic and must be documented honestly.
- Lock transitions must be observable to downstream rows before cache/worker work starts.

## Scope Boundary

This feature owns planning for:

- `packages/web-browser-e2e-crypto-runtime/` package boundary
- browser-side KEK/DEK lifecycle and lock state
- unwrap of the local wrapped current-device private key
- local HPKE open of the active `device_dek_wraps` row
- AES-GCM helper API shape for downstream Web rows
- local RFC 9106 / RFC 9180 / AAD/envelope gate expectations
- observable lock transition seam for downstream cache/worker wipe consumers

This feature does not own:

- `apps/web` route/UI flows
- `/auth/me` fetching, device register, or donor grant orchestration
- IndexedDB object stores and local cache persistence
- `/sync/push` / `/sync/pull` transport
- PWA/security/deploy infrastructure

## Dependency Overview

- Upstream source: `docs/reviews/web-browser-e2e-crypto-runtime/20260521-roadmap-seed.md`
- Governing docs:
  - `packages/web-sync-crypto-contract-preflight/docs/design.md`
  - `packages/web-sync-crypto-contract-preflight/docs/api.md`
  - `packages/web-sync-crypto-contract-preflight/docs/test.md`
  - `packages/web-auth-device-session/docs/design.md`
  - `docs/TECHNICAL_REQUIREMENTS.md`
  - `docs/planning/sub-prds/sync/dev-plan.md`
  - `docs/planning/sub-prds/sync/PRD.md`
  - `packages/hpke-per-device-wrap/docs/{design.md,api.md,test.md}`
- External dependency choice:
  - native `WebCrypto`
  - `hash-wasm`
  - modular browser HPKE implementation already frozen by preflight
- Downstream rows unlocked:
  - `web-auth-device-session`
  - `web-sync-blob-driver`
  - `web-encrypted-indexeddb-cache`
  - `web-security-csp-sentry`
  - `web-export-delete-privacy`

## Proposed Package Shape

- `packages/web-browser-e2e-crypto-runtime/package.json`
- `packages/web-browser-e2e-crypto-runtime/src/index.ts`
- `packages/web-browser-e2e-crypto-runtime/src/types.ts`
- `packages/web-browser-e2e-crypto-runtime/src/errors.ts`
- `packages/web-browser-e2e-crypto-runtime/src/internal/argon2.ts`
- `packages/web-browser-e2e-crypto-runtime/src/internal/hpke.ts`
- `packages/web-browser-e2e-crypto-runtime/src/internal/session.ts`
- `packages/web-browser-e2e-crypto-runtime/src/internal/aes-gcm.ts`
- `packages/web-browser-e2e-crypto-runtime/src/internal/aad.ts`
- `packages/web-browser-e2e-crypto-runtime/src/internal/buffers.ts`
- `packages/web-browser-e2e-crypto-runtime/src/internal/idle-lock.ts`
- `packages/web-browser-e2e-crypto-runtime/tests/**`

## Build Phase Freeze

### Phase 1 — Package scaffold, policies, and observable lock-state primitives

- touch only:
  - `packages/web-browser-e2e-crypto-runtime/package.json`
  - `packages/web-browser-e2e-crypto-runtime/tsconfig.json`
  - `packages/web-browser-e2e-crypto-runtime/src/{index.ts,types.ts,errors.ts}`
  - `packages/web-browser-e2e-crypto-runtime/src/internal/{buffers.ts,idle-lock.ts,policy.ts}`
  - `packages/web-browser-e2e-crypto-runtime/tests/{buffers,policy,idle-lock}.test.ts`
- deliverable:
  - browser-safe package scaffold
  - versioned Argon2id policy defaults
  - lock-state / idle-timeout controller contracts
  - `subscribe(listener)` transition seam for downstream wipe observers
  - best-effort buffer cleanup helpers
- must not:
  - fetch `/auth/me`
  - implement device/session orchestration under `apps/web`
  - implement actual KEK/DEK unwrap yet

### Phase 2 — Real Sync unlock path: KEK derivation, keyring validation, and active-wrap open

- touch only:
  - `packages/web-browser-e2e-crypto-runtime/src/internal/{argon2.ts,hpke.ts,session.ts,webcrypto.ts}`
  - `packages/web-browser-e2e-crypto-runtime/src/index.ts`
  - `packages/web-browser-e2e-crypto-runtime/tests/{argon2,hpke,session,unlock}.test.ts`
  - local vector fixtures needed for Argon2id / HPKE / unlock
- deliverable:
  - `master_password + secret_key -> KEK` derivation
  - unwrap of the local wrapped current-device private key
  - `/auth/me` current-key metadata validation
  - browser-local HPKE open of the active `device_dek_wraps` row
  - explicit `lock()` / idle-lock cleanup with typed transition reasons
  - error mapping for bad secret key, malformed metadata, wrap/key mismatch, unsupported runtime, and HPKE open failure

### Phase 3 — AES-GCM helper APIs and contract gates

- touch only:
  - `packages/web-browser-e2e-crypto-runtime/src/internal/{aes-gcm.ts,aad.ts,envelope.ts}`
  - `packages/web-browser-e2e-crypto-runtime/src/index.ts`
  - `packages/web-browser-e2e-crypto-runtime/tests/{aes-gcm,aad,envelope,vectors}.test.ts`
- deliverable:
  - downstream-facing encrypt/decrypt helper surface
  - deterministic AAD assembly matching preflight contract
  - envelope compatibility gates
  - local negative tests for wrong AAD/tag/blob swap cases

## Reviewer Focus

- Confirm the runtime now matches Sync v0.6 by accepting real keyring/current-wrap inputs instead of a synthetic `encrypted_dek` contract.
- Confirm Phase 2 is the correct owner for browser-side HPKE active-wrap open and RFC 9180 coverage.
- Confirm the `subscribe(listener)` lock transition seam is sufficient for downstream cache/worker wipe rows without dragging those caches into this package.
