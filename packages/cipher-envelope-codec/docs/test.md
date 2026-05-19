# cipher-envelope-codec — Test Strategy

## Acceptance Criteria

| Criterion | Verification |
|---|---|
| Envelope round-trip is byte-stable | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::envelope::tests` |
| Nonce rebuild matches LE field bytes | Same target, `nonce_reconstructs_from_little_endian_fields`. |
| Malformed short envelope fails without panic | Same target, `malformed_short_envelope_returns_error`. |
| Unsupported versions rejected | Same target. |
| `key_id = 0` rejected | Same target. |
| Default/crypto builds compile locked | `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`. |

## Deferred

- Full cargo-fuzz envelope parse/decrypt coverage is scoped to #47 `fuzz-harness-24h`.

