## Codex Cross-vendor Review

**Feature**: keychain-opaque-handle
**Commit(s)**: d1fe45a
**Reviewer**: codex feature-review (cross-vendor) · gpt-5.4 high
**Verdict**: REVISE

### Strengths (max 4 bullets)
- Isolates the Keychain → KeyVault crossing into one feature-gated Rust module, with no JS-visible surface expansion beyond existing `secret_*` and `crypto_*` contracts.
- Contract text in `docs/contracts/tauri-commands-v0.md` §6.0.1 matches the intended boundary well: JS gets `KeyHandleId`, not raw KEK bytes.
- `KeyVault` already stores resident keys in `Zeroizing<[u8; 32]>`, so the long-lived in-vault copy is protected on drop.
- Independent check passed: `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto keychain_handle::` ran green (3/3).

### Gaps & risks (max 6 bullets, severity-tagged)
- [P1] `insert_kek_from_bytes` returns early on wrong length before scrubbing the caller buffer (`apps/desktop/src-tauri/src/crypto/keychain_handle.rs`, length check branch). Malformed-but-secret material stays in memory, which contradicts the helper’s zeroization claim.
- [P1] The success path still leaves an unzeroized transient stack copy: `owned` is a `[u8; 32]` (Copy type), so `vault.insert_kek(owned)` copies it into the vault while the local `owned` remains on stack unsanitized. The “byte zeroization” claim is therefore incomplete.
- [P2] Doc/code hygiene drift: `packages/keychain-opaque-handle/docs/dev_log.md` says “E1200-E1202 error codes” were added, while the code and contract explicitly say these errors are Rust-internal and must be mapped by callers instead.
- [P2] Workflow hygiene drift: the same Work Log row still says `pending commit`, even though the reviewed commit is `d1fe45a`.
- [P2] Coverage is light on error behavior: there is no regression test for `KeychainHandleError::Keychain(AppError)` passthrough, so future `secret_get` mapping drift would be easy to miss.
- [P2] The contract says the rule is “machine-enforced,” but there is no CI guard preventing future `secret_get` use for KEK/DEK/device-private material outside this helper.

### Concrete next-phase targets (max 6 bullets)
- Zeroize `bytes` before returning `InvalidKeyLength`, and add a unit test asserting scrub-on-error.
- Remove transient Copy-based key remnants on the happy path, likely by changing the insert path to use a non-Copy zeroizing wrapper instead of raw `[u8; 32]`.
- Add a small `KeychainHandleError -> AppError` mapper and a unit test for `KeychainLocked` passthrough.
- Fix `dev_log.md` Work Log to record `d1fe45a` and drop the nonexistent `E1200-E1202` claim.
- Add a cheap CI grep/test guard for forbidden `secret_get` use on KEK/DEK/device-private flows.
- Document caller-owned synchronization explicitly where this helper is intended to be used with shared Tauri state.

### Out of scope confirmed
- Live macOS Keychain runtime smoke with signed bundle identity and `WhenUnlockedThisDeviceOnly` remains a deferred gate, not a blocker for this review.
- SQLCipher `db_init`/`PRAGMA key` wiring belongs to the G2.6 follow-up, not this feature.
- Supabase single-table sync gates and MAS sandbox/notarization evidence remain separate deferred tracks; they do not need re-investigation here.