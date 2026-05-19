# hpke-per-device-wrap — Design

## Scope

This row implements the Rust HPKE DEK wrap primitive for per-device grants.

- Suite is fixed to `DHKEM(X25519,HKDF-SHA256)+HKDF-SHA256+AES-256-GCM`.
- Sender seals the resident DEK from a KeyVault handle to a target device public key.
- Receiver opens the wrap with a resident device-private KeyVault handle and inserts the recovered DEK back into KeyVault.
- Server row writing is not implemented here; output is the row payload needed by downstream `device_dek_wraps` writes.

## Code Boundary

| File | Responsibility |
|---|---|
| `apps/desktop/src-tauri/src/crypto/hpke_wrap.rs` | HPKE seal/open, info-vs-aad enforcement, KeyVault integration, low-order public-key rejection. |
| `apps/desktop/src-tauri/src/crypto/mod.rs` | Exposes `hpke_wrap` behind the `crypto` feature. |

## Invariants

- HPKE mode is Base mode only.
- `info` and `aad` are separate parameters and identical byte strings are rejected.
- Recipient public keys pass the `device_key` all-zero / low-order checks before HPKE setup.
- Raw DEK is copied only inside Rust, zeroized after seal staging, and never crosses the JS boundary.
- Opened DEK bytes are immediately inserted into KeyVault and returned as an opaque handle.

## Deferred Runtime Work

- `device_dek_wraps(account_id, device_id, key_id)` SQL writes belong to downstream account/device grant flow.
- RFC 9180 official vector admission remains deferred to Phase 4.8 `rfc-test-vectors-gate`.
- Independent cross-vendor crypto review remains deferred under the 24h autorun contract.

