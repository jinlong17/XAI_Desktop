# web-sync-crypto-contract-preflight — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option B — browser-native hybrid (`WebCrypto` + targeted JS/WASM libs) with shared RFC/vector gates |
| Review Doc Path | `docs/reviews/web-sync-crypto-contract-preflight/20260521-discovery-review.md` |
| Review Date/Version | 2026-05-21 |
| Feature Type | W1 docs-only crypto/contract preflight |
| Roadmap | `web-ticktick-parity` · feature #3 · W1 |

## Frozen Assumptions

- This row freezes browser crypto and Sync contract semantics only; it does not implement Web runtime code.
- Web v1 does **not** depend on sharing the Rust crypto implementation via runtime WASM.
- The shared authority is the shipped Sync W0-W3 contract plus RFC/vector fixtures, not source-level reuse.
- `commit_seq` remains the only global ordering truth; any `sync_events.seq` expression must alias that value rather than introduce a second cursor domain.
- Business entities remain zero-knowledge: all entity fields live inside the encrypted envelope/blob.
- `X-Device-Id` remains mandatory for business API authorization; Supabase auth alone is insufficient.

## Scope Boundary

This feature owns only:

- `docs/reviews/web-sync-crypto-contract-preflight/`
- `packages/web-sync-crypto-contract-preflight/docs/`

It must not modify:

- `apps/web/` runtime code
- `packages/core-data/`
- shipped Sync Rust / SQL / Edge implementations
- remote Supabase / Vercel / DNS resources

## Dependency Overview

- Upstream source: `docs/reviews/web-sync-crypto-contract-preflight/20260521-roadmap-seed.md`
- Context docs:
  - `docs/planning/sub-prds/web/PRD.md`
  - `docs/planning/sub-prds/sync/PRD.md`
  - `packages/commit-seq-authority/docs/design.md`
  - `packages/cipher-envelope-codec/docs/design.md`
  - `packages/deterministic-cbor-aad/docs/api.md`
  - `packages/crypto-tauri-commands/docs/design.md`
- Downstream rows:
  - `web-auth-device-session`
  - `web-browser-e2e-crypto-runtime`
  - `web-sync-blob-driver`
  - `web-encrypted-indexeddb-cache`
  - `web-realtime-metadata-sync`

## Browser Crypto Boundary

- `WebCrypto` owns AES-GCM and browser-native key operations.
- `hash-wasm` is the planned Argon2id path.
- `@hpke/core` + `@hpke/dhkem-x25519` are the planned HPKE path.
- `@noble/ed25519` is the planned recovery-signing fallback when Web actually needs that flow.
- Deterministic CBOR and envelope compatibility stay repo-owned and vector-gated.
