# Roadmap Seed — crypto-tauri-commands

> sync-v1 roadmap · feature #19 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-08 (commands), §4.2
> Status hint: PENDING

## Requirement
Implement `commands/crypto.rs`: `crypto_encrypt_for(entity_type, entity_id, proposed_revision, plaintext) -> envelope` (Rust looks up KeyVault + builds the CBOR AAD itself), `crypto_unwrap_dek_for_device(wrap_envelope) -> dek_handle`, `crypto_wrap_dek_for_devices(dek_handle, device_pubs[]) -> wraps[]`, `crypto_recovery_sign(challenge, new_payload_hash) -> signature`. Register in `commands/mod.rs` + `lib.rs` invoke_handler. Add a scoped Tauri capability allowlisting `crypto_*` to plugin-account / core-data only.

## Hard constraints
- FR-SY-75 / C-06: commands never accept/return raw keys; Rust builds the AAD (client never supplies it); `crypto_encrypt_for` does NOT take encryption_device_id — Rust reads it from device state (H-9).
- Tauri capability allowlist: `crypto_*` callable only by plugin-account / core-data (FR-SY-75); command names `<domain>_<verb>` declared in plugin manifest tauriCommands (SYSTEM_ARCHITECTURE §5).
- Code boundary: `apps/desktop/src-tauri/src/commands/crypto.rs` + `commands/mod.rs` + `lib.rs` + `capabilities/` per codebase-orientation §4/§6.

## Threat model binding
- T6 (malicious plugin / same-process): capability allowlist + opaque-handle commands prevent unauthorized plugins from invoking crypto (PRD §2 T6, FR-SY-75, R-10.12).
- STRIDE Elevation-of-Privilege across TB-3 (JS/plugin ↔ Tauri IPC).

## Acceptance signal
All 4 commands work via opaque handles; a non-allowlisted plugin calling `crypto_*` is rejected (Phase 4.8 admission item, PRD §10.x); Rust-built AAD matches the deterministic-CBOR spec.

## Dependencies (advisory — manifest is authoritative)
Depends On: rust-keyvault-opaque-handle, cipher-envelope-codec, deterministic-cbor-aad (shipped)
