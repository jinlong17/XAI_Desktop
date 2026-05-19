# rfc-test-vectors-gate — Test Report

## 2026-05-19 Local Autorun

Passed:

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto crypto::rfc_vectors`
- `bash scripts/ci/check-cbor-aad-cross-impl.sh`
- `bash scripts/ci/check-verify-strict.sh`

Local setup:

- Added root dev dependency `cbor-x@1.6.4`.
- Installed local Python package `cbor2==6.1.1` with `python3 -m pip install --user cbor2==6.1.1`.

Warnings:

- Cargo emitted existing dead-code warnings in non-#35 desktop paths.
- `pnpm add` repeated existing workspace warnings for deprecated Next and the
  `flag` React peer mismatch.

## Deferred Verification

- Human review and cross-vendor verify.
- Hosted GitHub Actions run and branch-protection required-status-check flip.
