# web-auth-device-session — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-auth-device-session |
| Title | W3 browser auth and app-device session foundation |
| Roadmap | web-ticktick-parity · feature #6 · W3 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | — |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | ship (Codex gpt-5.3-codex inline) |
| Updated | 2026-05-21 16:48 PDT |
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
| 2026-05-21 16:48 PDT | ship (Codex gpt-5.3-codex inline) | Shipped from isolated branch `ship/web-auth-device-session-20260521` created from `origin/main`; cherry-picked only feature commits, restored READY_TO_SHIP verify record, re-ran pre-ship checks (`pnpm --filter @repo/web-auth-device-session test`, `pnpm --filter @repo/web-auth-device-session check-types`, `pnpm --filter @repo/web check-types`), and pushed without touching shared `main` or unrelated `web-browser-crypto` commits. | Reused: `690e766`, `7186d5f`, `15a297a`, `f2816d5`, `a2617c3`, `d219bd1`; New: `18ee588` | workflow-complete |
