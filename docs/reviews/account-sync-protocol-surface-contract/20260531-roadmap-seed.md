# Roadmap Seed Brief - account-sync-protocol-surface-contract

## Requirement

Produce the protocol-surface contract that connects repository mutations to `/sync/push`, `/sync/pull`, encrypted blobs, outbox behavior, conflict routing, and sync cadence without changing sync-v1 cryptography.

## Hard Constraints

- Preserve sync-v1 invariants: AES-256-GCM with deterministic CBOR AAD, nonce lease, mutation idempotency, global account `commit_seq`, conflict shadow, device-active RLS, and client-read-only `encrypted_blobs`.
- Sync is near-real-time eventual, not realtime-only. Triggers include post-write push, start pull, focus pull, network-recover replay, 15-60 second light pull, and manual sync.
- Conflict handling must be explicit and deterministic; silent last-write-wins is forbidden.
- This slice must not rework crypto primitives already covered by sync-v1.

## Acceptance Signal

- A sequence-level contract describes write, push, server accept/conflict, pull, apply, retry, dead-letter, and manual sync flows.
- The plan names the per-feature evidence needed before a new account-sync entity can be marked complete.
