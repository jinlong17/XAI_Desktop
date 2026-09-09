# web-auth-device-session — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | BUGFIX |
| Target | web-auth-device-session |
| Title | REL-02 shared IndexedDB schema initialization |
| Status | FIX_READY_FOR_VERIFY |
| Current Phase | BUG_VERIFY |
| Suggested Next | bug-verify |
| Automation Mode | A-Codex |
| Verify Cross-vendor | pending; no cross-vendor PASS claimed |
| Executor | bug-fix (Codex) |
| Updated | 2026-09-09 10:57 PDT |
| Blockers | — |

## REL-02 Diagnosis

- Reproduction: fake-indexeddb fresh database, createAuthSessionStorage().setItem followed by createDeviceIdentityStore().ensure. Fails with NotFoundError: No objectStore named device. Expected both durable stores to work in either order.
- Root cause: independent idb-keyval createStore calls open the same database without schema version coordination; only the first store is created. Existing tests use memory adapters and miss the database contract.
- Strategy: shared versioned database manager in storage.ts; default schema v2 includes session/device, migration preserves existing records, connection closes on versionchange, failed or blocked opens reject and permit retry, late connections are closed. Keep custom database/store API working. Add actual IndexedDB regressions and contract documentation.
- Scope: Web package only; no route/manifest/native or Supabase network changes.

### REL-02 Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-09-09 10:53 PDT | bug-diagnose (Codex) | Reproduced missing device store; recorded root cause and schema migration strategy. | — | bug-fix |

| 2026-09-09 10:57 PDT | bug-fix (Codex) | Goal: preserve auth/device storage. Done: shared schema, migration and failure lifecycle; Tests: 52/52 package regressions, package/Web type checks; Risks: real browser/live auth not verified. | `0141ecb` | bug-verify |

### REL-02 Fix Result

- Implemented default schema v2 and custom-store upgrades; no deletion or clearing during migration.
- Reproduction now passes. Existing PKCE memory tests remain unchanged.
- Verification requested from independent reviewer; no READY_TO_SHIP or cross-vendor PASS claimed.
- Commit reference: `0141ecb` — `fix(web-auth-device-session): migrate shared auth database safely`.

## Historical W3 Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-auth-device-session |
| Title | W3 browser auth and app-device session foundation |
| Roadmap | web-ticktick-parity · feature #6 · W3 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | workflow complete |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | ship (Codex parent session) |
| Updated | 2026-05-21 22:56 PDT |
| Blockers | — |

## Source Context

- Roadmap manifest: `docs/workflow/roadmap/web-ticktick-parity.md`
- Source seed: `docs/reviews/web-auth-device-session/20260521-roadmap-seed.md`
- Governing ADR: `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
- Dependency authority: `docs/PLUGIN_MAP.md`
- Upstream contract freeze: `packages/web-sync-crypto-contract-preflight/docs/api.md`

## Phase Plan

### Phase 1 — Session core and package boundary

Status: DONE (`690e766`).

File boundary:

- `packages/web-auth-device-session/src/{index.ts,client.ts,storage.ts,device-store.ts,redirects.ts,session.ts}`
- `apps/web/src/providers/AppProviders.tsx`

Required implementation:

- create browser auth/session package boundary
- initialize Supabase browser client with PKCE
- implement custom IndexedDB session storage
- persist local `device.id`
- centralize `next` allowlist handling
- mount provider(s) from the thin host only

Gate:

- reviewers can see auth/session primitives exist outside `apps/web` page logic

Scoped verification:

- package-local unit tests for redirect and device persistence primitives
- `pnpm --filter @repo/web check-types`

### Phase 2 — Auth flows and route-guard wiring

Status: DONE (`7186d5f`).

File boundary:

- `packages/web-auth-device-session/src/{auth-actions.ts,callback.ts,guards.ts,components/**}`
- `apps/web/src/pages/AuthPage.tsx`
- `apps/web/src/routes/HostRouter.tsx`

Required implementation:

- email signup/login/verify/reset flows
- Apple/Google OAuth start + callback handling
- PKCE transient state in `sessionStorage`
- `/auth/*` and `/app/*` guard helpers mounted from the host

Gate:

- auth pages become thin wrappers over package-owned behavior

Scoped verification:

- mock/integration tests for email and OAuth callback flows
- allowlist rejection/acceptance tests for `next`

### Phase 3 — Device lifecycle and request-injection seam

Status: DONE (`15a297a`).

File boundary:

- `packages/web-auth-device-session/src/{device-session.ts,device-transport.ts,device-fetch.ts,heartbeat.ts}`
- `apps/web/src/pages/AppShellPage.tsx`
- `apps/web/src/providers/AppProviders.tsx`

Required implementation:

- call `device_register` after restored/verified session
- schedule heartbeat every 5 minutes and on visibility resume
- expose a canonical device-bound request helper for later RPC and `/sync/*` consumers
- handle `401 unknown_device` and `403 device_revoked` with forced cleanup and auth redirect

Gate:

- later rows have one canonical request seam instead of inventing their own header logic

Scoped verification:

- tests for header injection, heartbeat cadence, and revoke/unknown-device cleanup
- `pnpm --filter @repo/web check-types`

## Risks

- Direct runtime reuse of `@repo/plugin-account` could pull unstable desktop seams into the browser row.
- Token at-rest storage could accidentally sprawl into the later DEK/entity crypto scope if the package boundary is not kept narrow.
- App-level redirect validation may drift if host pages and package code both try to own it.
- Revoked-device cleanup semantics need to stay compatible with the later device-management row.

## Suggested Review Focus

- Confirm the package boundary is correct: browser auth/session logic in `packages/web-auth-device-session`, thin mount only in `apps/web`.
- Confirm Supabase browser client + custom IndexedDB storage is the right fit relative to SSR/cookie alternatives.
- Confirm the split versus `web-browser-e2e-crypto-runtime` is clean.
- Confirm `@repo/plugin-account` is handled as contract reference only, not as a stable runtime dependency.
- Confirm the `next` allowlist and revoke/unknown-device assumptions are strict enough for v1.

## Review Notes

- APPROVED. The package boundary is aligned with `ADR-0006` and with the current `apps/web` host shape: browser auth/session/device lifecycle stays in `packages/web-auth-device-session`, while `AppProviders`, `AuthPage`, `AppShellPage`, and `HostRouter` remain thin mount/wrapper seams.
- APPROVED. Supabase browser PKCE plus custom IndexedDB storage is the right fit for the current SPA host and for the required `X-Device-Id` device-session flow; SSR/cookie-first alternatives would add the wrong authority and unnecessary cache/response coupling.
- APPROVED. The split from `web-browser-e2e-crypto-runtime` is clean enough for build: this row owns auth-token/session storage and device registration/heartbeat/request injection, while the later runtime row owns DEK/KEK/AES envelope behavior.
- APPROVED WITH EXECUTION DISCIPLINE. Keep `@repo/plugin-account` reference-only during build, keep the `next` allowlist limited to same-origin relative `/app` and explicit `/auth/*` completion routes, and centralize `401 unknown_device` / `403 device_revoked` cleanup in the package-owned request/session seam rather than host pages.

## Verification Summary

- PASS. Reviewed commits `690e766`, `7186d5f`, `15a297a`, `f2816d5`, `a2617c3`, and `d219bd1`; each kept a single intent, stayed within its phase or docs boundary, and used the required commit body format.
- PASS. Current implementation still matches the approved Phase 1/2/3 plan: `apps/web` remains a thin host wrapper, business auth/device logic stays in `packages/web-auth-device-session`, and there is no runtime dependency on `@repo/plugin-account`.
- PASS. Prior blockers are closed in the current tree: PKCE `code_verifier` keys route to `sessionStorage` while durable auth/session keys stay in IndexedDB, and email verification completion is wired through same-origin `/auth/verify` callback handling.
- PASS. Verification commands run locally: `pnpm --filter @repo/web-auth-device-session test` (33 passed), `pnpm --filter @repo/web-auth-device-session check-types`, and `pnpm --filter @repo/web check-types`.

## Residual Risks

- Deferred live gates remain unchanged: real Supabase redirect allowlists, Google/Apple OAuth credentials, real email delivery/verification links, browser-specific IndexedDB behavior, and hosted `X-Device-Id` middleware semantics still need environment-backed validation in later rows or pre-ship acceptance.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-21 15:30 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh planning pass from the roadmap seed: created the Step 0 brief, compared browser auth stack and IndexedDB adapter options with current official source evidence, selected a dedicated `packages/web-auth-device-session` package boundary, and initialized design/api/test/dev_log docs for review. | — | feature-review |
| 2026-05-21 15:36 PDT | feature-review (Codex gpt-5.3-codex inline) | Review pass returned APPROVED. The package boundary, Supabase PKCE + IndexedDB session strategy, downstream split versus `web-browser-e2e-crypto-runtime`, and `@repo/plugin-account` reference-only posture are executable as planned; build should preserve strict same-origin `next` rules and centralized revoked/unknown-device cleanup. | — | feature-build |
| 2026-05-21 15:43 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Completed Phase 1 implementation: package core boundary (`client/storage/device-store/redirects/session`) and workspace dependency wiring for `@repo/web-auth-device-session`. | `690e766` | feature-auto-build |
| 2026-05-21 15:50 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Completed Phase 2 implementation: email/OAuth actions, PKCE callback handling, `/auth/*` + `/app/*` route guards, and thin host wiring in `AuthPage` + `HostRouter`. | `7186d5f` | feature-auto-build |
| 2026-05-21 15:56 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Completed Phase 3 implementation: device register/heartbeat lifecycle, canonical device-bound fetch seam (`Authorization` + `X-Device-Id` + `X-Sync-Version`), and unknown/revoked cleanup wiring in provider/app shell. Validation run: `pnpm --filter @repo/web-auth-device-session test` (26 passed), `pnpm --filter @repo/web-auth-device-session check-types`, `pnpm --filter @repo/web check-types`. | `15a297a` | feature-verify |
| 2026-05-21 16:02 PDT | feature-verify (Codex gpt-5.3-codex inline) | Verification blocked after reviewing commits `690e766`, `7186d5f`, `15a297a`, and `f2816d5`. Commit scope stayed phase-aligned and the thin-host/package boundary held, but two contract drifts remain: Supabase PKCE stores `${storageKey}-code-verifier` in the configured IndexedDB auth storage instead of `sessionStorage`, and Phase 2 does not wire email verification completion because sign-up omits `emailRedirectTo` while the auth page only handles `/auth/callback`. Verification commands run locally after hydrating workspace deps with `pnpm install --frozen-lockfile`: `pnpm --filter @repo/web-auth-device-session test` (26 passed), `pnpm --filter @repo/web-auth-device-session check-types`, `pnpm --filter @repo/web check-types`. | `690e766`, `7186d5f`, `15a297a`, `f2816d5` | feature-build |
| 2026-05-21 16:08 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Repaired verify blockers only. B1: `createAuthSessionStorage` now uses package-owned key routing so Supabase durable auth/session keys remain in IndexedDB while `${storageKey}-code-verifier` is persisted in `sessionStorage` (covered by `src/storage.test.ts` with durable/transient store assertions). B2: `signUpWithEmail` now sets same-origin `emailRedirectTo=/auth/verify?next=...`, `/auth/verify` is treated as a completion route in `WebAuthPage`, and callback handling supports verify completion without PKCE transient state while still requiring PKCE state for `/auth/callback` (covered by `src/auth-actions.test.ts`, `src/callback.test.ts`, `src/components/WebAuthPage.test.ts`). Validation run: `pnpm --filter @repo/web-auth-device-session test` (33 passed), `pnpm --filter @repo/web-auth-device-session check-types`, `pnpm --filter @repo/web check-types`. | `a2617c3` | feature-verify |
| 2026-05-21 16:14 PDT | feature-verify (Codex gpt-5.3-codex inline) | Verification passed after reviewing phase commits `690e766`, `7186d5f`, `15a297a`, docs commits `f2816d5`, `d219bd1`, and repair commit `a2617c3`. Commit scope/body hygiene matches the convention, the package/host boundary remains correct, prior PKCE and email-verification blockers are closed in code and tests, and scoped validation is clean: `pnpm --filter @repo/web-auth-device-session test` (33 passed), `pnpm --filter @repo/web-auth-device-session check-types`, `pnpm --filter @repo/web check-types`. | `690e766`, `7186d5f`, `15a297a`, `f2816d5`, `a2617c3`, `d219bd1` | ship |
| 2026-05-21 22:56 PDT | ship (Codex parent session) | Batch ship pass with sibling W3 crypto row: revalidated `READY_TO_SHIP`, preserved the verified feature commit chain on `main`, reconciled roadmap row #6, and marked workflow `SHIPPED`. Push scope intentionally includes the adjacent `web-browser-e2e-crypto-runtime` W3 row because both verified feature chains are already contiguous on local `main` ahead of `origin/main`. | `690e766`, `7186d5f`, `15a297a`, `f2816d5`, `a2617c3`, `d219bd1`; ship-state docs commit | workflow complete |
| 2026-05-26 | feature-auto-build (claude-sonnet-4-6) | Extension — Account-delete helper (gap-closure row #9): added `deleteAccount(client)` + `AccountDeleteError` class + `ACCOUNT_LOCAL_WIPE_IDB_NAMES` frozen const + `wipeRegisteredIDB()` in `src/auth-actions.ts` + `src/wipe.ts`. Exported from `src/index.ts`. 9 new DAA tests in `src/auth-actions.test.ts`. 42/42 total tests pass. SHIPPED state of row #6 W3 preserved — this is additive extension only. | `72c70ee` (P2 — deleteAccount + AccountDeleteError), `5bc7417` (P3 — wipe.ts + exports) | workflow complete (extension merged into SHIPPED row) |

---

## Bugfix-Extension Lineage — Account-delete helper (2026-05-26 row #9)

> APPEND-ONLY block. The Workflow State Panel, Phase Plan, Work Log, and
> Residual Risks sections above record the SHIPPED row #6 (W3) baseline and
> are NOT mutated by this extension lineage. This block tracks the additive
> extension introduced by `xai-web-console-gap-closure` manifest row #9
> (W2 LAST — Account Delete real wire).
>
> The SHIPPED Status (`Status = SHIPPED`) of this package is preserved.
> This extension is additive (new exports only; no existing API changed).

### Extension Status

| Field | Value |
|---|---|
| Extension Target | Account-delete helper for `xai-web-settings-account-delete-wire` (gap-closure row #9) |
| Extension Status | SHIPPED (merged into SHIPPED row #6 baseline) |
| Dispatched By | `xai-roadmap-loop` SERIAL dispatch — wave 2 LAST row |
| Executor | claude-sonnet-4-6 (feature-auto-build, 2026-05-26) |
| Updated | 2026-05-26 |

### Extension Scope

Added to `packages/web-auth-device-session/src/`:

- `src/auth-actions.ts` — added `AccountDeleteErrorKind` type, `AccountDeleteError` class, `DeleteAccountOptions` interface, `deleteAccount(client, options?)` function. HTTP status mapping: 200 OK → success (signOut best-effort); 401 → `unauthorized`; 403 → `forbidden`; 404 → `already_deleted` (idempotent, proceeds to signOut); 5xx → `server`; network throw → `network`. All other kinds → `unknown`.
- `src/wipe.ts` (NEW) — `ACCOUNT_LOCAL_WIPE_IDB_NAMES` frozen const (`["web-encrypted-cache", "xai-web-ai-secrets", "xai-web-auth"]` — fixed at row-#9-time per DEL-IDB-LIST-1); `wipeRegisteredIDB()` parallel best-effort `Promise.allSettled` over `indexedDB.deleteDatabase()` for each name.
- `src/index.ts` — added 5 new exports: `deleteAccount`, `AccountDeleteError`, `AccountDeleteErrorKind`, `DeleteAccountOptions`, `ACCOUNT_LOCAL_WIPE_IDB_NAMES`, `wipeRegisteredIDB`.
- `src/auth-actions.test.ts` — added DAA-1..8 + DAA-TYPED tests (9 new tests; 42/42 total pass).

### Extension Commits

| Commit | Description |
|--------|-------------|
| `72c70ee` | feat(xai-web-settings-account-delete-wire): P2 — deleteAccount() helper + AccountDeleteError in web-auth-device-session (gap-closure row #9) |
| `5bc7417` | feat(xai-web-settings-account-delete-wire): P3 — useAccountDeleteOrchestrator + ACCOUNT_LOCAL_WIPE_IDB_NAMES + mock-auth fallback + redirect (gap-closure row #9) |

### Security Constraints Enforced

- `deleteAccount()` calls the Supabase Edge Function `account-delete` via `client.functions.invoke()` — no service_role key in client bundle (NEVER).
- `wipeRegisteredIDB()` operates on a frozen static list; list is not dynamically expanded at runtime (DEL-IDB-LIST-1).
- `signOut()` is best-effort (non-throwing); account deletion success does not depend on signOut success (R9 risk mitigation).
- `already_deleted` (404) is treated as idempotent success and proceeds to signOut (DEL-ORCH-4 / R3 idempotency).

### REL-02 parent verification follow-up · 2026-09-09

Executor: Codex parent review/fix. Status remains FIX_READY_FOR_VERIFY. Independent review found a warm custom-store upgrade race, reproduced by the new 53rd test (InvalidStateError). Added per-database operation queue through callback completion. All 53 package tests and six isolated real-Chromium scenarios now pass. Cross-vendor reviewer could not authenticate (401 revoked OAuth), so independent cross-vendor approval remains pending; no READY_TO_SHIP claim. Next: independent review of follow-up and cross-vendor verification when available.
