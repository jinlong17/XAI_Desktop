# Roadmap Seed — bip39-mnemonic-24w

> sync-v1 roadmap · feature #6 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-06 (mnemonic.rs), T-07 (cross-impl test)
> Status hint: PENDING

## Requirement
Encode/decode a 24-word BIP-39 mnemonic (256-bit DEK + 8-bit checksum) representing the full active DEK backup, with cross-implementation compatibility between Rust `bip39` crate and JS `@scure/bip39` (each encodes one, the other decodes, results identical).

## Hard constraints
- FR-AC-10 / C-05: 24-word BIP-39 (256-bit + 8-bit checksum) is the complete backup of the **current active DEK only**; retired-key blobs must be re-encrypted to current key before retire (C-F caveat, R-10.14) — out of scope here but must not be contradicted.
- v1 uses English wordlist only; Chinese wordlist is v1.x (L-02) — do not implement dual wordlist now.
- Code boundary: `apps/desktop/src-tauri/src/crypto/mnemonic.rs` + JS side in `packages/plugin-account/` per codebase-orientation §5/§6.

## Threat model binding
- T4 (user forgets master password): the 24-word mnemonic is the sole recovery path (PRD §2 T4, FR-AC-09/10, R-10.2).
- STRIDE Information Disclosure / availability across TB-1 (user-held recovery secret).

## Acceptance signal
Rust ⇄ `@scure/bip39` cross-encode/decode produces identical 32B DEK + valid checksum; this cross-impl test enters the Phase 4.8 admission gate (PRD §10.x).

## Dependencies (advisory — manifest is authoritative)
Depends On: crypto-deps-lockdown (shipped)
