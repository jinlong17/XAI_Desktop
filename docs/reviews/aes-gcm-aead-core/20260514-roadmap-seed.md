# Roadmap Seed — aes-gcm-aead-core

> sync-v1 roadmap · feature #4 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-06 (aes_gcm.rs)
> Status hint: PENDING

## Requirement
Implement the AES-256-GCM AEAD core with an explicit AAD parameter (encrypt/decrypt interface taking key, nonce, AAD, plaintext) and `zeroize`-based key wiping. This is the encryption primitive `cipher-envelope-codec` and `crypto-tauri-commands` build on.

## Hard constraints
- PRD §3.1 invariant #8: GCM nonce = `encryption_device_id (8B) ‖ counter (4B)`; nonce construction is forbidden in JS — Rust KeyVault owns it (FR-SY-07). This row exposes the AEAD interface only; nonce policy is enforced downstream.
- FR-SY-10: use `zeroize` crate, wipe KEK/DEK immediately after use (not relying on Drop); DEK never `serde::Serialize`, never crosses JS boundary.
- Footgun (stride-cve §3 #2): nonce reuse = catastrophic; non-key-committing (Invisible Salamanders) explicitly NOT defended in v1 (R-10.9) — document, do not silently ignore.
- Code boundary: `apps/desktop/src-tauri/src/crypto/aes_gcm.rs` per codebase-orientation §5/§6.

## Threat model binding
- T1 / T6: AES-256-GCM blob encryption (FR-SY-07/10) keeps server-dump and same-process attackers from plaintext; zeroize bounds T3'/T6 memory residue.
- STRIDE Information Disclosure across TB-2 (Rust KeyVault process boundary).

## Acceptance signal
AES-256-GCM round-trip + known RFC vectors pass; AAD mismatch → decrypt fails; tag failure surfaces as error (no panic); zeroize verified; benchmark per FR-SY-12 (<0.5ms encrypt 1KB P95).

## Dependencies (advisory — manifest is authoritative)
Depends On: crypto-deps-lockdown (shipped)
