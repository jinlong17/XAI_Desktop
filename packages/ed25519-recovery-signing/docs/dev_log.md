# ed25519-recovery-signing — Dev Log (Workflow State Machine)

## 2026-05-20 14:55 PDT

- Implemented Node crypto Ed25519 recovery transcript signing, verification, and `E3014` assertion helper.
- Verification: `pnpm --filter @repo/ed25519-recovery-signing test`; package `check-types`.

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | ed25519-recovery-signing |
| Title | DEK-derived Ed25519 recovery proof signing |
| Roadmap | sync-v1 · feature #14 · wave W1 · Phase 0.3 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | sqlcipher-local-db (#16) or account-signup-login (#17) |
| Automation Mode | A-Claude |
| Verify Cross-vendor | yes |
| Executor | Codex serial autorun |
| Updated | 2026-05-19 03:02 PDT |

## Phase Plan

### Phase 1 — DEK-derived recovery key [DONE]

- Derived recovery seed through existing HKDF helper.
- Constructed Ed25519 signing key from recovery seed inside Rust.
- Zeroized recovery seed staging bytes.

### Phase 2 — Canonical transcript sign/verify [DONE]

- Signed existing 5-field canonical CBOR recovery transcript.
- Added strict verification via `VerifyingKey::verify_strict`.
- Mapped wrong-DEK/tamper verification failure to E3014.

### Phase 3 — Tests and docs [DONE]

- Added sign/verify, deterministic public key, wrong-DEK, and tamper tests.
- Added design/api/test/dev_log docs.

## Deferred Gates

- Human review and cross-vendor verification are deferred. See `docs/workflow/roadmap/sync-v1.deferred-gates.md`.
- RFC 8032 official vector CI gate is deferred to #35.
- Edge Function and re-key ceremony integration are deferred to downstream rows.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 03:02 PDT | Codex serial autorun | Implemented #14 Ed25519 recovery signing, strict verification, E3014 failure mapping, docs, and tests. | local commit `feat(ed25519-recovery-signing): add recovery proof signing` | sqlcipher-local-db (#16) |
