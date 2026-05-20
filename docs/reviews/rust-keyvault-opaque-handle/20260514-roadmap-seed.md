# Roadmap Seed — rust-keyvault-opaque-handle

> sync-v1 roadmap · feature #11 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-08
> Status hint: PENDING

## Requirement
Implement the Rust-side KeyVault (`key_vault.rs`): a `KeyHandleId: u32` opaque-handle map keeping DEK and device_priv resident in the Rust process. JS only ever receives the `u32` handle; commands never accept or return raw keys. Convergence point for all Tauri crypto commands.

## Hard constraints
- FR-SY-75 / C-06: DEK never leaves the Rust KeyVault; device_priv also resident (used to unwrap DEK); JS gets only opaque `key_handle`; raw key never crosses the JS boundary, never `serde::Serialize` (FR-SY-10).
- PRD §3.1 invariant #4: DEK resident in Rust KeyVault; JS/plugin only gets opaque handle.
- This is the architectural figure that must exist before Phase 0.3 (R-10.12) — confused-deputy / raw-key-exposure root mitigation.
- Code boundary: `apps/desktop/src-tauri/src/crypto/key_vault.rs` per codebase-orientation §5/§6; depends on aes-gcm + kdf primitives.

## Threat model binding
- T6 (malicious plugin / same-process): opaque handle prevents direct key read; raw DEK never crosses IPC (FR-SY-75/10, R-10.12).
- STRIDE Elevation-of-Privilege / Information Disclosure across TB-2/TB-3 (KeyVault process boundary, JS↔IPC).

## Acceptance signal
JS receives only a `u32` handle; no command path returns raw key bytes; DEK/device_priv zeroized on eviction; KeyVault round-trip via handle works in unit tests.

## Dependencies (advisory — manifest is authoritative)
Depends On: aes-gcm-aead-core, kdf-primitives (shipped)
