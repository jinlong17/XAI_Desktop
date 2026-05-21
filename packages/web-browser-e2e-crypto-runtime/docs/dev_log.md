# web-browser-e2e-crypto-runtime — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-browser-e2e-crypto-runtime |
| Title | W3 browser-side E2E crypto runtime |
| Roadmap | web-ticktick-parity · feature #7 · W3 |
| Status | READY_FOR_VERIFY |
| Current Phase | FEATURE_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | feature-auto-build (Codex GPT-5 inline) |
| Updated | 2026-05-21 16:26 PDT |
| Blockers | — (resolved by parent rescue commit `813205c`) |

## Source Context

- Roadmap manifest: `docs/workflow/roadmap/web-ticktick-parity.md`
- Source seed: `docs/reviews/web-browser-e2e-crypto-runtime/20260521-roadmap-seed.md`
- Upstream contract: `packages/web-sync-crypto-contract-preflight/docs/{design.md,api.md,test.md,dev_log.md}`
- Adjacent owner: `packages/web-auth-device-session/docs/{design.md,api.md}`
- HPKE reference: `packages/hpke-per-device-wrap/docs/{design.md,api.md,test.md}`
- Protocol authority: `docs/planning/sub-prds/sync/PRD.md`, `docs/planning/sub-prds/sync/dev-plan.md`, `docs/TECHNICAL_REQUIREMENTS.md` §2.4

## Phase Plan

### Phase 1 — Package scaffold, lock-state primitives, and observable transition seam

Status: DONE (`813205c`, parent rescue commit).

File boundary:

- `packages/web-browser-e2e-crypto-runtime/package.json`
- `packages/web-browser-e2e-crypto-runtime/tsconfig.json`
- `packages/web-browser-e2e-crypto-runtime/src/{index.ts,types.ts,errors.ts}`
- `packages/web-browser-e2e-crypto-runtime/src/internal/{buffers.ts,idle-lock.ts,policy.ts}`
- `packages/web-browser-e2e-crypto-runtime/tests/{buffers,policy,idle-lock}.test.ts`

Required implementation:

- initialize the browser-safe workspace package
- define the public types and typed error surface
- freeze the Argon2id default policy object
- implement idle-lock controller primitives
- add `subscribe(listener)` / unsubscribe semantics for runtime state transitions
- implement best-effort buffer helpers

Gate:

- package exists as an isolated browser runtime boundary with no app-shell logic, and downstream rows have one stable observable lock surface for wipe planning

Scoped verification:

- `pnpm --filter @repo/web-browser-e2e-crypto-runtime check-types`
- targeted unit tests for `buffers`, `policy`, and `idle-lock`
- targeted transition-emission tests for `subscribe()`

### Phase 2 — Real Sync unlock path: KEK derivation, keyring validation, and active-wrap open

Status: DONE (`10c8b8a`).

File boundary:

- `packages/web-browser-e2e-crypto-runtime/src/internal/{argon2.ts,hpke.ts,session.ts,webcrypto.ts}`
- `packages/web-browser-e2e-crypto-runtime/src/index.ts`
- `packages/web-browser-e2e-crypto-runtime/tests/{argon2,hpke,session,unlock}.test.ts`
- package-local vector fixtures for Argon2id, HPKE, and unlock inputs

Required implementation:

- derive a KEK from `masterPassword + secretKey` via `hash-wasm` Argon2id using `/auth/me` keyring metadata
- unwrap the local wrapped current-device private key with that KEK
- validate current-key metadata and `secretKeyCheck`
- HPKE-open the active `device_dek_wraps` row using the unwrapped current-device private key handle
- maintain explicit locked/unlocked runtime state
- clear runtime-owned transient buffers best effort on success/failure/lock

Gate:

- a valid `masterPassword + secretKey + keyring + wrappedDevicePrivateKey + activeWrap` unlocks a local DEK session, invalid credential/wrap metadata fails with typed errors, RFC 9106 and RFC 9180 vectors pass locally, and `lock()` / idle lock clear the active session idempotently

Scoped verification:

- local Argon2id vector tests
- local wrapped-device-key unwrap tests
- local HPKE Base-mode vector tests
- unlock success/failure tests
- repeated `lock()` and transition-emission behavior tests

### Phase 3 — AES-GCM helper APIs and contract vectors

Status: DONE (`40f6905`).

File boundary:

- `packages/web-browser-e2e-crypto-runtime/src/internal/{aes-gcm.ts,aad.ts,envelope.ts}`
- `packages/web-browser-e2e-crypto-runtime/src/index.ts`
- `packages/web-browser-e2e-crypto-runtime/tests/{aes-gcm,aad,envelope,vectors}.test.ts`

Required implementation:

- expose encrypt/decrypt helpers around the unlocked DEK
- derive deterministic AAD bytes from structured inputs
- enforce envelope/header compatibility with the preflight contract
- wire negative cases for wrong AAD, wrong tag, and blob swap failures

Gate:

- downstream rows can consume one stable helper surface for browser encrypt/decrypt work, and local vector gates prove contract compatibility before integration work starts

Scoped verification:

- AES-GCM success/failure tests
- deterministic AAD fixture parity
- envelope round-trip and nonce reconstruction tests
- downstream-style lock-subscription harness tests for cache/worker wipe paths

## Risks

- If build work smuggles `/auth/me` transport or device grant orchestration into this package, the auth/runtime boundary will drift again.
- Browser runtime tests can create false confidence if they fake the HPKE open path instead of using real local vectors.
- Lock transition ordering may be under-specified if Phase 1 does not pin event behavior before downstream cache/worker rows start.
- If the package over-exposes raw crypto primitives, downstream rows may bypass the contract helpers and reintroduce drift.

## Suggested Review Focus

- Confirm the revised unlock contract now matches Sync v0.6 by using `secret_key`, `/auth/me` keyring metadata, and active `device_dek_wraps` material rather than `encrypted_dek`.
- Confirm Phase 2 is the correct owner for browser-side HPKE active-wrap open and RFC 9180 coverage, while remote fetch/grant orchestration remains upstream.
- Confirm the `subscribe(listener)` lock transition seam is sufficient for downstream decrypted cache and worker-memory wipe rows.

## Review Notes

feature-review (Codex inline), 2026-05-21 15:47 PDT. Verdict: APPROVED.

The revise pass resolves the prior blockers cleanly. The public unlock contract now uses the active Sync v0.6 inputs (`secretKey`, `/auth/me` keyring/current-key metadata, KEK-wrapped local device-private-key seam, and active `device_dek_wraps`) instead of a stale `encrypted_dek` API; Phase 2 explicitly owns browser-side HPKE active-wrap open plus RFC 9180 vector gates while remote fetch/register/grant orchestration remains with `web-auth-device-session`; and `subscribe(listener)` now provides a stable lock-transition seam for downstream cache/worker wipe consumers. The package boundary and per-phase file scopes are explicit enough for `feature-build` to execute without reopening ownership ambiguity.

## Revision Response

- Revised:
  - replaced the stale `encrypted_dek` unlock contract with `secretKey`, `/auth/me` keyring metadata, active `device_dek_wraps` material, and a KEK-wrapped local device-private-key seam
  - assigned browser-local HPKE active-wrap open plus RFC 9180 vector coverage to this row’s Phase 2
  - froze `subscribe(listener)` as the observable lock transition seam for downstream cache/worker wipe consumers
- Follow-up:
  - aligned `20260521-feature-brief.md` with the revised Sync v0.6 contract so Step 0 no longer describes `encrypted_dek` unwrap as the desired runtime model
- Intentionally not changed:
  - `/auth/me` fetch/refresh, device register, pending-device polling, and donor `grant_dek_wrap` orchestration remain owned by `web-auth-device-session`
  - decrypted cache/index storage and worker mirrors remain owned by downstream rows
  - Automation Mode stays `A-Claude`; Verify Cross-vendor stays `no`

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 15:27 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh planning pass from the roadmap seed: created the formal feature brief, compared browser crypto dependency options inside the shipped hybrid boundary, selected `WebCrypto` + `hash-wasm` as the recommended runtime composition, and initialized design/api/test/dev_log docs with a three-phase implementation plan for the new package. | — | feature-review |
| 2026-05-21 15:33 PDT | feature-review (Codex gpt-5.3-codex inline) | Review pass returned REVISE. The browser crypto dependency direction is acceptable, but the plan is not build-ready: the unlock contract is still based on stale `encrypted_dek` assumptions, the DEK acquisition boundary does not reconcile current Sync/device-wrap authority, and idle-lock propagation is too underspecified for downstream cache/worker consumers. | — | feature-plan |
| 2026-05-21 15:36 PDT | feature-plan (Codex gpt-5.3-codex inline) | Revise pass: aligned the runtime contract to Sync v0.6 real inputs (`secret_key`, `/auth/me` keyring metadata, active `device_dek_wraps`) plus a KEK-wrapped local device-private-key seam, assigned browser-side HPKE active-wrap open plus RFC 9180 gates to Phase 2, and added a `subscribe(listener)` lock-transition seam for downstream cache/worker wipe consumers. | — | feature-review |
| 2026-05-21 15:45 PDT | feature-plan (Codex gpt-5.3-codex inline) | Follow-up revise pass: aligned the Step 0 feature brief with the already-revised Sync v0.6 runtime contract so the problem statement, desired outcome, acceptance criteria, and planner handoff now reference `secret_key`, `/auth/me` keyring metadata, the KEK-wrapped local device-key seam, active-wrap HPKE open, observable lock transitions, and local RFC/vector gates. | — | feature-review |
| 2026-05-21 15:47 PDT | feature-review (Codex GPT-5 inline) | Approved the revised plan. Revalidated the Sync v0.6 unlock inputs against `docs/TECHNICAL_REQUIREMENTS.md` §2.4 and `docs/planning/sub-prds/sync/dev-plan.md`, confirmed Phase 2 explicitly owns browser-side HPKE active-wrap open plus RFC 9180 gates while remote orchestration stays upstream, and confirmed `subscribe(listener)` is sufficient as the downstream lock-wipe observation seam. | — | feature-build |
| 2026-05-21 16:02 PDT | feature-auto-build (Codex GPT-5 inline) | Phase 1 implementation reached the commit gate: scaffolded `@repo/web-browser-e2e-crypto-runtime`, added public runtime types/errors, Argon2id policy defaults, best-effort buffer cleanup helpers, idle-lock scheduling, and the `subscribe(listener)` transition store. Stopped before Phase 1 commit because the sandbox denies writes under `.git` (`git add` failed creating `.git/index.lock`). | None — commit blocked by `.git` write permission. Tests: `node node_modules/typescript/bin/tsc --project packages/web-browser-e2e-crypto-runtime/tsconfig.json --noEmit` passed; `node ../../node_modules/vitest/vitest.mjs run tests/buffers.test.ts tests/policy.test.ts tests/idle-lock.test.ts` passed (9 tests). | feature-auto-build |
| 2026-05-21 16:08 PDT | parent session (Codex) | Resolved the prior `.git/index.lock` blocker outside the nested worker sandbox with a scoped Phase 1 rescue commit, then handed control back to `feature-auto-build` for remaining phases. | `813205c` — `feat(web-browser-crypto): scaffold runtime lock primitives` | feature-auto-build |
| 2026-05-21 16:24 PDT | feature-auto-build (Codex GPT-5 inline) | Phase 2 complete: implemented `hash-wasm` Argon2id KEK derivation, `secretKeyCheck` validation, KEK unwrap for local wrapped device private key, browser-local X25519/HKDF/AES-GCM active-wrap open, and unlock session lifecycle with typed errors and lock transition semantics. Evidence: unlock gates cover valid unlock plus wrong secret key, bad password unwrap, key-id mismatch, and HPKE AAD mismatch failures. | `10c8b8a` — `feat(web-browser-crypto): Phase 2 — real sync unlock path` | feature-auto-build |
| 2026-05-21 16:26 PDT | feature-auto-build (Codex GPT-5 inline) | Phase 3 complete: implemented deterministic CBOR AAD builder, envelope encode/decode with nonce reconstruction (`encryption_device_id || counter`), AES-GCM encrypt/decrypt helpers on unlocked DEK sessions, and negative gates for wrong AAD/tag/blob swap. Evidence: local vector asserts fixed envelope bytes and decrypt failures under swapped/tampered context. | `40f6905` — `feat(web-browser-crypto): Phase 3 — AES-GCM envelope helpers` | feature-verify |
