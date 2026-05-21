# Roadmap Seed — web-sync-crypto-contract-preflight

> web-ticktick-parity roadmap · feature #3 · wave W1 · contract preflight
> Source PRD: docs/planning/sub-prds/web/PRD.md §0.1, §5.1, §5.2, §5.3, §5.12 · Sync PRD: docs/planning/sub-prds/sync/PRD.md
> Status hint: PENDING

## Requirement

Freeze the browser crypto and Sync contract before implementing the Web driver or local cache. Decide whether Web shares a WASM implementation with Rust primitives or uses independent WebCrypto/hash-wasm code with shared RFC/vector gates, and align `/sync/pull`, `/sync/push`, `sync_events.seq`, `blob_aad`, and `X-Device-Id` semantics with shipped Sync W0-W3 artifacts.

## Hard constraints

- Business entities remain zero-knowledge: all fields go into `encrypted_blob`; no service-side todo/list/label fields.
- Browser code must verify RFC/vector compatibility for Argon2id, AES-GCM envelope/AAD, deterministic CBOR, X25519/HPKE, and recovery-related primitives where applicable.
- Record local mock strategy for missing live Supabase resources; do not attempt remote provisioning in this row.

## Acceptance signal

A concrete contract/preflight doc exists with browser crypto choice, endpoint payload shapes, required test vectors, local mock plan, and blockers/deferred live gates.

## Dependencies (advisory — manifest is authoritative)

Depends On: web-architecture-adr-lite.
