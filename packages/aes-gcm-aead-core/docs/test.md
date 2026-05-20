# aes-gcm-aead-core — Test Strategy

## Acceptance Criteria

| Criterion | Verification |
|---|---|
| AES-256-GCM known vector passes | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::aes_gcm::tests` |
| Round-trip decrypt returns original plaintext | Same test target, NIST CAVS vector test. |
| AAD mismatch fails | Same test target, `aad_mismatch_fails_without_plaintext`. |
| Tag tamper fails without panic | Same test target, `tag_tamper_fails_without_panic`. |
| Key material is not debug-printed | Same test target, `key_debug_redacts_bytes`. |
| Default/crypto builds compile locked | `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`. |

## Deferred

- FR-SY-12 `<0.5ms encrypt 1KB P95` needs a release-mode benchmark harness. It was not asserted in debug unit tests.

