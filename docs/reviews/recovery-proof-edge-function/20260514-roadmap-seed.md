# Roadmap Seed — recovery-proof-edge-function

> sync-v1 roadmap · feature #29 · wave W2 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-13
> Status hint: PENDING

## Requirement
Implement the `POST /auth/recovery_challenge` + `PATCH /auth/me` Edge Function flow: server issues a 32B challenge (5min TTL, single-use), client signs a canonical CBOR message binding `payload_canonical_hash`, server verifies Ed25519 against `accounts.recovery_signing_pub`; sensitive columns are client-UPDATE-denied and only mutated by service_role after proof passes (FR-SY-69, §3.5).

## Hard constraints
- Message MUST be the unique schema `CBOR_canonical({1:msg_v, 2:challenge_id, 3:account_id, 4:payload_canonical_hash, 5:ts})`; field-level new_*_hash schema is dead (v0.5 C-E) — full-payload binding only.
- Edge Function checks: (1) challenge unexpired + unused (replay defense); (2) message.account_id == auth.uid(); (3) `SHA256(CBOR_canonical(new_payload)) == message.payload_canonical_hash`; (4) `Ed25519_verify(recovery_signing_pub, message, signature)`; (5) new_payload field allowlist (PRD §3.5).
- Ed25519 verification MUST use strict mode (`verify_strict` / RFC 8032 strict); failure / hash-mismatch / expired-challenge → E3014, reject PATCH (FR-SY-69, R-10.16).
- `accounts` sensitive columns are RLS client-UPDATE-denied (C-B); only service_role UPDATE after proof (PRD §6.2 / §3.5).
- Code boundary: Edge Function in `apps/web/supabase/functions/`; Ed25519 signing client-side via Rust `crypto_recovery_sign` command (FR-SY-75); never expose recovery_signing_priv (codebase-orientation §6, CLAUDE.md §Code Boundaries).

## Threat model binding
- T1.1 (FR-SY-69 C-A/C-E recovery proof); R-10.16 (Ed25519 recovery key inference error); R-10.13.
- STRIDE Tampering / Spoofing — recovery proof blocks malicious sensitive-field PATCH (stride-cve.md §2.1 T1.1; §3 dep #4 ed25519-dalek verify_strict footgun).

## Acceptance signal
Integration: PATCH `/auth/me` with no recovery-proof signature → server 401/E3014; tampering any new_payload field → hash mismatch → reject; replayed challenge → reject; Argon2id/proof verify < 500ms (PRD §10.x, dev-plan §3.1.5 T-A3/T-A4, §5.3 scenario 12).

## Dependencies (advisory — manifest is authoritative)
Depends On: ed25519-recovery-signing, supabase-schema-migrations (both shipped). Deploy blocked-by supabase-project-provisioning (#9) per R8.
