# rust-keyvault-opaque-handle — Test Strategy

## Acceptance Criteria

| Criterion | Verification |
|---|---|
| JS-visible handle is a non-zero `u32` only | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::key_vault::tests` |
| DEK handle can encrypt/decrypt through AES-GCM | Same target, `inserts_dek_and_encrypts_by_handle_without_exporting_key`. |
| Device private handle is rejected for DEK encryption | Same target, `rejects_wrong_key_kind_for_dek_operation`. |
| Eviction invalidates handle and zeroizes resident bytes | Same target, `drop_key_evicts_handle`; code path explicitly calls `ResidentKey::zeroize`. |
| Debug output does not reveal resident bytes | Same target, `debug_output_redacts_resident_key_bytes`. |
| Default and crypto builds compile locked | `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`. |

## Deferred

- Independent cross-vendor crypto/security review remains deferred under the 24h autorun contract.
- Tauri capability allowlist enforcement is deferred to `crypto-tauri-commands` / Phase 4.8 capability tests.
