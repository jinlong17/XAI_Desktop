# ed25519-recovery-signing — Test Strategy

## Acceptance Criteria

| Criterion | Verification |
|---|---|
| Canonical transcript signs and verifies with strict Ed25519 | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::recovery_signing::tests` |
| Recovery public key is deterministic from `DEK_current` | Same target, `recovery_public_is_deterministic_from_dek_current`. |
| Wrong DEK public key fails with E3014 | Same target, `wrong_dek_public_key_fails_with_e3014`. |
| Transcript tamper fails with E3014 | Same target, `transcript_tamper_fails_with_e3014`. |
| Default and crypto builds compile locked | `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`. |
| Exact crypto pins remain enforced | `bash scripts/ci/check-exact-pins.sh`. |

## Deferred

- RFC 8032 official vector CI gate is deferred to #35 `rfc-test-vectors-gate`.
- Cross-vendor crypto/security verification remains deferred.
- Edge Function challenge/verify integration is deferred to downstream rows.

