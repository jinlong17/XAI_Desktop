# crypto-tauri-commands — Test Strategy

## Local Checks

- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --locked`
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto commands::crypto::tests -- --nocapture`
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto error::tests -- --nocapture`
- `bash scripts/ci/check-exact-pins.sh`

## Covered Assertions

- Non-allowlisted `main` window receives `E3004` before crypto access.
- `crypto_encrypt_for` builds deterministic blob AAD inside Rust; decrypting with the expected Rust-built AAD succeeds.
- HPKE wrap/open round-trips a resident DEK through opaque handles.
- Recovery proof returns a transcript and signature accepted by strict Ed25519 verification.
- Default non-crypto build still compiles with stubbed commands.

## Deferred Gates

- Real Tauri invocation from plugin-account/core-data windows.
- Malicious plugin / non-account UI integration test.
- Live account-state seeding after signup/login.
