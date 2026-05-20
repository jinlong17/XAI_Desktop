# rfc-test-vectors-gate — API

This row introduces no public runtime API.

## CI/Test Entrypoints

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::rfc_vectors`
- `bash scripts/ci/check-cbor-aad-cross-impl.sh`
- `bash scripts/ci/check-verify-strict.sh`

## CI Job

`.github/workflows/supply-chain-security.yml` now includes:

- `rfc-vectors`: installs Rust, pnpm, JS dependencies, Python `cbor2==6.1.1`,
  then runs the Rust vector tests and CBOR cross-implementation check.
