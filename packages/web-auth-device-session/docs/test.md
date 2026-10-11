# web-auth-device-session — Test Plan

## Validation Strategy

This row is planning-only today, but the implementation it unlocks is not docs-only. Validation must prove three things separately:

1. auth/session flows work in a browser-shaped environment
2. redirect/device rules cannot silently drift
3. host thinness is preserved while the package takes ownership of behavior

## Unit Coverage To Prepare

Future build phases should add focused tests for:

- `next` allowlist acceptance and rejection
- PKCE transient state lifecycle in `sessionStorage`
- custom storage adapter `getItem` / `setItem` / `removeItem`
- device-id persistence rules
- sign-out cleanup behavior
- device-bound request helper header injection
- heartbeat throttling / `visibilitychange` immediate refresh
- `unknown_device` and `device_revoked` cleanup paths

## Contract Coverage

Review and later verify should explicitly confirm:

1. `docs/reviews/web-auth-device-session/20260521-feature-brief.md` exists and reflects the roadmap seed.
2. `docs/reviews/web-auth-device-session/20260521-discovery-review.md` clearly selects the browser-client + custom IndexedDB storage boundary.
3. `packages/web-auth-device-session/docs/{design,api,test,dev_log}.md` exist.
4. The plan freezes:
   - `packages/web-auth-device-session` as the browser auth/device-session owner
   - `apps/web` as thin mount/wrapper only
   - `@repo/plugin-account` as contract owner, not stable runtime dependency
   - `X-Device-Id` injection as a package-owned seam
   - `next` allowlist as a central package rule

## Integration / Browser Scenarios

Later implementation rows should cover with mocks or local browser runs:

1. email sign-up -> verify -> login -> `/app/*` access
2. password reset request -> reset completion -> login
3. Google OAuth PKCE start -> callback -> session restore
4. Apple OAuth PKCE start -> callback -> session restore
5. browser restart -> session restore from custom IndexedDB storage
6. authenticated session -> `device_register` -> heartbeat -> sign-out
7. `401 unknown_device` -> session cleanup -> redirect to auth
8. `403 device_revoked` -> forced logout -> cleanup -> no silent retry loop

## Mock Strategy

Allowed local-only seams:

- fake IndexedDB for storage tests
- stubbed WebCrypto wrapper seam for at-rest token protection tests
- stubbed Supabase auth client for callback/session transitions
- deterministic mock transport for `device_register` / `device_heartbeat`
- local fake timer control for heartbeat cadence

Rules:

- mocks must preserve the planned public/session/device contract shapes
- no mock may skip `X-Device-Id` once device-bound requests are under test
- no test may move redirect validation into host pages

## Deferred Live Gates

- real Supabase project redirect allowlists
- real Google OAuth credentials and redirect URI checks
- real Apple OAuth credentials and private relay behavior
- real browser/Safari IndexedDB persistence quirks
- real `X-Device-Id` middleware behavior against hosted RPC and `/sync/*`
- real email delivery templates and verification links

## Suggested Checks

```bash
test -f docs/reviews/web-auth-device-session/20260521-feature-brief.md
test -f docs/reviews/web-auth-device-session/20260521-discovery-review.md
test -f packages/web-auth-device-session/docs/design.md
test -f packages/web-auth-device-session/docs/api.md
test -f packages/web-auth-device-session/docs/test.md
test -f packages/web-auth-device-session/docs/dev_log.md
rg -n "Supabase|IndexedDB|device_register|device_heartbeat|X-Device-Id|next allowlist|plugin-account" docs/reviews/web-auth-device-session/20260521-discovery-review.md packages/web-auth-device-session/docs/{design.md,api.md,test.md,dev_log.md}
```

## Acceptance Focus

- Reviewers can tell exactly where auth/session logic is allowed to live.
- Later build work has phase-scoped file boundaries and observable gates.
- The docs separate this row cleanly from later browser crypto runtime and sync-driver rows.

## REL-02 actual IndexedDB regression layer (2026-09-09)

`src/storage-indexeddb.test.ts` uses a fresh `fake-indexeddb` factory per case, directly exercising package adapters rather than memory substitutes. Ten cases cover session/device creation in both orders and concurrently; schema v2 store membership; read/write/delete isolation; migration from each v1 single-store shape preserving values; custom names and added stores; versionchange closure and higher-version reopen; blocked upgrade rejection/retry; asynchronous open failure retry; late successful request connection cleanup. The final two open lifecycle faults are injected; migrations and actual blocked behavior use IndexedDB transactions and connections.

Baseline first regression failed with NotFoundError (device store absent). After repair, package suite: 12 files / 52 tests passed; package and Web type checks passed. Real Safari/Chromium browser-specific persistence and live Supabase sign-in remain external verification gates, not claimed by the emulator suite.

REL-02 follow-up: warm custom database alpha write concurrent with first beta write reproduced InvalidStateError before the operation queue fix. Package regression now contains 53 passing tests. The standalone real-Chromium probe at docs/reviews/web-auth-device-session/verify-browser-idb.mjs verifies six scenarios including this race in an isolated profile. Cross-vendor review remains unavailable (Claude OAuth revoked); these results do not close that gate.

REL-03: session-lifecycle.test.tsx adds six independently authored React Provider checks for late bootstrap, token refresh, synchronous clear, unmount, client replacement and explicit session changes. auth-actions.test.ts additionally checks frozen deletion Authorization and disabled automatic sign-out. Current package run: 13 files, 60 tests PASS. These use synthetic sessions and do not prove hosted authentication or remote account deletion.

## REL-06 generic 404 regression (2026-09-09)

13 files / 70 tests pass, including 24 auth-actions cases. Uses actual installed Supabase `FunctionsHttpError` with native `Response`: function-not-found, invented already_deleted code, HTML and malformed body 404 all reject; 401/403/500 map from context status; response-only 404 rejects; normal HTTP 200/204 succeeds; captured-token/no-sign-out behavior remains. Error body remains readable. No live server account deleted. Independent verification and wider REL-06 gates remain pending.


## REL-06 legacy database reset result contract

REL-06 legacy wipe: five focused tests cover all-success, mixed blocked/error with late success, successful retry, unavailable IndexedDB and synchronous request refusal. Auth package full suite 14 files/75 tests and typecheck PASS. Native Chrome probe docs/reviews/web-account-deletion-reliability/verify-browser-wipe.mjs holds a connection in a second page context, observes named aggregate failure, releases it, retries and verifies every database has no stores. Uses an isolated temporary profile; not two physical tabs, production data or account-erasure acceptance.
