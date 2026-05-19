# hpke-per-device-wrap — Test Strategy

## Acceptance Criteria

| Criterion | Verification |
|---|---|
| HPKE wrap/unseal round-trips a DEK for a device keypair | `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::hpke_wrap::tests` |
| Recovered DEK is returned as a KeyVault handle | Same target, `hpke_wrap_round_trips_dek_for_device_keypair`. |
| `info == aad` is rejected | Same target, `rejects_info_equal_to_aad`. |
| AAD mismatch fails to open | Same target, `aad_mismatch_fails_to_open`. |
| Low-order recipient public key is rejected | Same target, `low_order_recipient_public_key_is_rejected`. |
| Default and crypto builds compile locked | `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`. |
| Exact crypto pins remain enforced | `bash scripts/ci/check-exact-pins.sh`. |

## Deferred

- RFC 9180 official vectors in CI are deferred to #35 `rfc-test-vectors-gate`.
- Cross-vendor crypto/security verification remains deferred.
- Supabase `device_dek_wraps` write-path integration is deferred to downstream grant/sync rows.

