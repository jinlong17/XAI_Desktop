# web-sync-crypto-contract-preflight — Test Plan

## Automated Checks

```bash
test -f docs/reviews/web-sync-crypto-contract-preflight/20260521-roadmap-seed.md
test -f docs/reviews/web-sync-crypto-contract-preflight/20260521-feature-brief.md
test -f docs/reviews/web-sync-crypto-contract-preflight/20260521-discovery-review.md
test -f packages/web-sync-crypto-contract-preflight/docs/design.md
test -f packages/web-sync-crypto-contract-preflight/docs/api.md
test -f packages/web-sync-crypto-contract-preflight/docs/test.md
test -f packages/web-sync-crypto-contract-preflight/docs/dev_log.md
rg -n "since_commit_seq|commit_seq|X-Device-Id|blob_aad|Option B" docs/reviews/web-sync-crypto-contract-preflight/20260521-discovery-review.md packages/web-sync-crypto-contract-preflight/docs/{design.md,api.md,test.md,dev_log.md}
```

## Required Browser Compatibility Gates

Future implementation rows must not claim completion unless they cover:

- RFC 9106 Argon2id vector parity.
- AES-GCM interoperability vector plus wrong-AAD and wrong-tag failures.
- RFC 8949 deterministic CBOR byte-equality against `cbor_aad_vectors.json`.
- RFC 9180 HPKE Base mode vector parity for X25519/HKDF-SHA256.
- RFC 8032 Ed25519 vector parity if recovery signing/verification is wired on Web.
- Envelope header stability and nonce reconstruction from `encryption_device_id || counter`.

## Contract Coverage

Future Web runtime/driver tests must explicitly prove:

- `/sync/pull` uses `GET` + `since_commit_seq`, not `since_seq`.
- `/sync/push` transmits base64 `blob` envelopes, not split `blob_nonce` / `blob_aad` wire fields.
- `commit_seq` and `current_account_commit_seq` stay string-typed in JSON.
- Realtime metadata triggers pull scheduling rather than direct record merge.
- `X-Device-Id` is attached to every business API request and revoked-device paths force logout.
- `E3015`, `E3024`, and duplicate `mutation_id` branches remain observable in browser tests.

## Local Mock Strategy

Allowed local-only seams:

- in-memory `/sync/push` and `/sync/pull` transports
- local Realtime emitter for metadata-only events
- deterministic device RPC mocks
- deterministic nonce-lease allocator
- fixture-backed vector/admission gates

Rules:

- mock data must preserve the shipped contract shapes exactly
- no remote Supabase provisioning or deployment is attempted in this row
- live Edge Function / Realtime / RLS / nonce ledger verification are deferred gates, not reasons to invent alternate local contracts

## Deferred Live Gates

- real Supabase Edge `/sync/push` and `/sync/pull`
- real Realtime private channels
- real `X-Device-Id` middleware + revoked-device path
- real nonce lease / used_nonces enforcement
- real browser-account recovery signing against deployed backend

## Acceptance Focus

- Reviewer can tell which browser crypto path is approved.
- Reviewer can tell which Web PRD expressions are now obsolete.
- Later Web rows have one unambiguous source for crypto/runtime wire semantics and one unambiguous mock-vs-live boundary.
