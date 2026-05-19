# rfc-test-vectors-gate — Design

Feature #35 is the Phase 4.8 admission gate for official crypto vectors and
canonical CBOR cross-implementation checks.

## Implemented Gate

- Rust RFC-vector module under `apps/desktop/src-tauri/src/crypto/rfc_vectors.rs`.
- RFC 9106 Argon2id v=19 KAT reuses the existing Argon2 helper and asserts the
  official digest.
- RFC 8032 Ed25519 test vector 1 signs the empty message, checks the public key
  and signature bytes, and verifies with `verify_strict`.
- RFC 9180 HPKE Base mode vector opens the finalized
  DHKEM(X25519, HKDF-SHA256) + HKDF-SHA256 + AES-256-GCM ciphertext and checks
  the exported value.
- RFC 8949 deterministic CBOR gate compares the existing three AAD fixture bytes
  against JS `cbor-x` and Python `cbor2` encoders.
- CI now has an `rfc-vectors` job in `.github/workflows/supply-chain-security.yml`.

## Boundaries

- Runtime crypto code is unchanged except for adding test-only module wiring.
- `cbor-x` is a root dev dependency for the JS cross-check only.
- Python `cbor2` is installed by the CI job and by local verification, not
  vendored into the repo.
