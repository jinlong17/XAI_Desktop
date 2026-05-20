# Roadmap Seed — ed25519-recovery-signing

> sync-v1 roadmap · feature #14 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-06 (recovery seed/sign), companion to T-13
> Status hint: PENDING

## Requirement
Derive `recovery_seed = HKDF-Expand(DEK_current, "xai.recovery.sig.v1")`, build the Ed25519 recovery keypair from it, and sign the canonical recovery transcript `CBOR_canonical({1:msg_v, 2:challenge_id, 3:account_id, 4:payload_canonical_hash, 5:ts})`. Server only stores `recovery_signing_pub` (32B). Verification uses `verify_strict`.

## Hard constraints
- FR-SY-69 (C-A/C-E): unique recovery-message schema = the 5-field CBOR map above (v0.3 field-level hash schema abolished); recovery_seed from DEK_current (server has no DEK); each Re-key must sign the new recovery_signing_pub with old recovery_signing_priv (C-D).
- `ed25519-dalek` ≥ 2.x with `verify_strict` / RFC 8032 strict mode MUST be enforced (RUSTSEC-2022-0093 class, stride-cve §3 #4, FR-SY-69 acceptance).
- Client validates DEK via dek_check before signing (wrong DEK → wrong signature, error E3014) per R-10.16.
- Code boundary: `apps/desktop/src-tauri/src/crypto/` per codebase-orientation §5/§6; consumes kdf + deterministic-CBOR.

## Threat model binding
- T1.1 (malicious server / sensitive-field tamper): full-payload-bound Ed25519 recovery proof blocks unauthorized PATCH /auth/me (PRD §2 T1.1, FR-SY-69, R-10.16).
- STRIDE Tampering / Spoofing across TB-8 (Edge Function, zero-knowledge enforcement point).

## Acceptance signal
Sign/verify round-trip on the canonical transcript; `verify_strict` enforced and asserted (RFC 8032 official vectors pass at Phase 4.8 gate); wrong-DEK → signature mismatch + E3014.

## Dependencies (advisory — manifest is authoritative)
Depends On: kdf-primitives, deterministic-cbor-aad (shipped)
