# web-browser-e2e-crypto-runtime — Test Plan

## Validation Strategy

Validation focuses on runtime contract correctness against Sync v0.6, explicit HPKE ownership, and executable local verification gates.

## Required Automated Coverage Once Built

### Unit coverage

- Argon2id policy defaults and overrides
- password-byte / `secretKey` byte normalization helpers
- local wrapped device-private-key unwrap helpers
- keyring metadata validation helpers
- idle-lock controller state transitions
- `subscribe()` registration/removal semantics
- best-effort buffer cleanup helpers
- runtime error mapping and idempotent `lock()` behavior

### Contract coverage

- `/auth/me` keyring/current-key metadata adapter coverage
- `secretKeyCheck` success/failure handling
- active-wrap `keyId` / current-key mismatch failures
- RFC 9106-style Argon2id keyed-input vector parity (`password`/`salt`/`secret`) plus `secretKey` sensitivity gate on KEK derivation
- HPKE deterministic reference-vector gate for browser active-wrap open using the desktop `hpke-per-device-wrap` vector constants
- AES-GCM success + wrong-tag + wrong-AAD failures
- RFC 8949 deterministic CBOR AAD byte equality against repo fixtures
- envelope header round-trip / nonce reconstruction compatibility
- locked-state denial for encrypt/decrypt helpers

### Browser/runtime coverage

- real `CryptoKey` non-extractability in a browser-capable test environment
- successful `masterPassword + secretKey + keyring + wrappedDevicePrivateKey + activeWrap` unlock lifecycle
- missing/invalid active wrap fails with typed errors
- idle timeout clears the active DEK session
- explicit unload/manual/error lock paths emit one first lock transition and clear runtime-owned session state best effort

## Local Mock Strategy

Allowed seams:

- fixture-backed `/auth/me` keyring metadata, `secret_key_check`, `dek_check`, active-wrap samples, AAD, and envelope samples
- fixture-backed local wrapped device-private-key samples
- fake timers for idle-lock tests
- local browser-compatible test runner for `crypto.subtle`
- local device-private-key fixtures/import helpers for HPKE vector tests
- in-memory downstream callers that simulate `web-auth-device-session`, `web-sync-blob-driver`, and `web-encrypted-indexeddb-cache`

Rules:

- Do not mock away the runtime boundary so far that `CryptoKey` lifecycle becomes a plain-object test.
- Do not replace HPKE open with a fake success path in the main unlock tests; browser-local vector coverage is part of this row’s contract.
- Do not require live Supabase, remote `/auth/me`, remote `grant_dek_wrap`, or IndexedDB schemas for this row.
- Keep vector fixtures deterministic and repo-local.

## Per-Phase Verification Gates

### Phase 1 — Package scaffold and observable lock primitives

- `test -f packages/web-browser-e2e-crypto-runtime/package.json`
- `test -f packages/web-browser-e2e-crypto-runtime/src/index.ts`
- `pnpm --filter @repo/web-browser-e2e-crypto-runtime check-types`
- targeted unit tests for buffers/policy/idle lock
- targeted tests that `subscribe()` emits `locked->unlocking` + `unlocking->unlocked` for unlock and one transition per first lock reason only

### Phase 2 — Real Sync unlock path

- Argon2id keyed-input vector tests pass locally and prove `secretKey` is wired through Argon2 `secret` (not password concatenation)
- HPKE reference-vector tests pass locally for browser active-wrap open against deterministic desktop vector constants
- valid `secretKeyCheck` + keyring metadata + wrapped device key + active wrap unlocks successfully
- wrong `secretKey` produces typed failure
- wrong password path fails before HPKE open by rejecting the wrapped device-private-key unwrap
- missing or mismatched active wrap produces typed failure
- repeated `lock()` is idempotent and does not emit duplicate wipe-trigger transitions
- KEK/DEK cannot be exported through public APIs

Vector boundary note:

- `hash-wasm` exposes Argon2 `secret` but not an associated-data input field in its public API, so this package gates keyed RFC 9106-style inputs (`password`/`salt`/`secret`) and defers full associated-data RFC parity to the Rust `rfc-test-vectors-gate`.
- This package's active-wrap payload format is a simplified CBOR envelope (`suite`, ephemeral public key SPKI, iv, ciphertext, tag), so HPKE gate wording here intentionally references the desktop deterministic vector boundary rather than claiming direct official RFC 9180 vector ingestion.

### Phase 3 — AES-GCM helpers and envelope gates

- AES-GCM helper tests pass
- derived AAD bytes match frozen fixtures
- wrong-AAD / wrong-tag / blob-swap cases fail
- envelope header fields and nonce reconstruction match preflight contract
- downstream-style decrypt cache listener harness sees the expected transition sequence on `manual` / `idle` / `unload` / `error`

## Suggested Commands

```bash
test -f docs/reviews/web-browser-e2e-crypto-runtime/20260521-feature-brief.md
test -f docs/reviews/web-browser-e2e-crypto-runtime/20260521-discovery-review.md
test -f packages/web-browser-e2e-crypto-runtime/docs/design.md
test -f packages/web-browser-e2e-crypto-runtime/docs/api.md
test -f packages/web-browser-e2e-crypto-runtime/docs/test.md
test -f packages/web-browser-e2e-crypto-runtime/docs/dev_log.md
rg -n "secretKey|wrappedDevicePrivateKey|device_dek_wraps|RFC 9180|subscribe\\(|lock transition|active wrap|currentKeyId" docs/reviews/web-browser-e2e-crypto-runtime/20260521-discovery-review.md packages/web-browser-e2e-crypto-runtime/docs/{design.md,api.md,test.md,dev_log.md}
```

## Acceptance Focus

- Reviewers can tell the public unlock contract now matches Sync v0.6 rather than a deprecated `encrypted_dek` model.
- Build work has an explicit Phase 2 owner for browser-side HPKE active-wrap open and its RFC gates.
- Downstream cache/worker rows have a frozen observable lock seam without this row absorbing their cache implementation.
