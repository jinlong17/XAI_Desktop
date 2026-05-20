# Roadmap Seed — mnemonic-full-recovery

> sync-v1 roadmap · feature #42 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-41
> Status hint: PENDING

## Requirement
End-to-end 24-word mnemonic recovery: input 24-word BIP-39 → decrypt DEK → verify `dek_check` → reset master_password + secret_key → Ed25519 recovery proof PATCH `/auth/me` → full pull, with donor grant for the new device's DEK wrap (per §3.6).

## Hard constraints
- Recovery is limited to the current key only; client must verify DEK via `dek_check` BEFORE attempting the signature (FR-AC-10 / R-10.16); signature failure → explicit error code E3014.
- Recovery proof: `recovery_seed = HKDF-Expand(DEK_current, "xai.recovery.sig.v1")`; sign canonical CBOR `{1:msg_v,2:challenge_id,3:account_id,4:payload_canonical_hash,5:ts}` (the single v0.4 C-E schema); sensitive `/auth/me` columns must go through Edge Function (FR-SY-69).
- Code boundary: recovery flow UI + logic in `packages/plugin-account/`; key derivation/signing via Rust KeyVault commands (`crypto_recovery_sign`) (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T4 (user forgot master password) — mnemonic is the sole recovery path; zero-knowledge cost.
- PRD §11 R-10.16 (Ed25519 recovery key inference error, C-A) — dek_check gate before sign; PRD §2 T1.1 bound via FR-SY-69 recovery proof.

## Acceptance signal
A fresh device entering email + master_password + 24-word mnemonic + new secret_key passes recovery proof, completes full pull, and ends with data consistent with the donor/source device.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate, onboarding-backfill-ui, rekey-two-phase. Blocked by #37 Phase 4.8 → Phase 5 gate.
