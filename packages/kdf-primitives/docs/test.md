# kdf-primitives — Test Strategy

## Acceptance Criteria

| Criterion | Verification |
|---|---|
| RFC 9106 Argon2id v=19 vector passes | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::argon2::tests` |
| KEK derivation uses `secret_key` as Argon2 secret | Same test target, `derive_kek_uses_secret_key_as_argon2_secret`. |
| `auth_password` includes `secret_key` | Same test target, `derive_auth_password_is_dual_factor`. |
| HKDF helper is correct and domain-separated | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::kdf::tests`. |
| Default build remains crypto-off | `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`. |
| Crypto feature compiles with lockfile | `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`. |

## Notes

- Tests intentionally use real Argon2 parameters for the PRD paths; they are slower than pure unit tests but keep the security surface falsifiable.
- Existing keychain test warnings for missing `keychain-it` feature are pre-existing and do not fail this row.

