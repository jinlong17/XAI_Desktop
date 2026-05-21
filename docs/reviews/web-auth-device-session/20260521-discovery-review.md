# Discovery Review — web-auth-device-session

| 字段 | 值 |
|---|---|
| Feature | `web-auth-device-session` |
| 日期 | 2026-05-21 |
| 执行者 | Codex (`feature-plan` inline) |
| 外部调研 | Required — browser auth/session stack and IndexedDB adapter scan |

## Problem Framing

这不是“给 `apps/web` 填几个登录页面”。本 row 要先冻结 **浏览器 auth/device session 的所有权边界**，否则三个风险会在后续 rows 里重复出现：

- `apps/web` 的 host 壳重新长出业务逻辑，违反 `web-release-site-archive-vite-shell` 刚冻结的 thin-host 规则。
- `@repo/plugin-account` 被当成 browser-ready 运行时依赖直接导入，绕过 `docs/PLUGIN_MAP.md` 对 In-Dev 依赖的警告。
- `X-Device-Id` / `device_register` / revoke 语义被拖到 sync driver 或 later UI row 才补，导致 auth 与业务请求层各写一套设备边界。

## Existing Repo Evidence

### Current host is ready for thin integration, not for business logic

- `apps/web/src/routes/HostRouter.tsx`
  - already splits `/`, `/auth`, `/app`, but only does pathname mapping.
- `apps/web/src/pages/AuthPage.tsx`
  - still a placeholder shell.
- `apps/web/src/pages/AppShellPage.tsx`
  - still a placeholder guarded-app shell.
- `apps/web/src/providers/AppProviders.tsx`
  - currently a no-op passthrough, which is the correct thin mount point for auth/session providers.

### Existing account code is useful context, but not a stable browser runtime dependency

- `docs/PLUGIN_MAP.md`
  - `@repo/plugin-account` is the auth/device/session contract owner for Web planning, but remains `In-Dev`.
- `packages/account-signup-login/docs/design.md`
  - existing account flow is seam-driven and desktop-oriented.
- `packages/plugin-account/src/account.ts`
  - assumes desktop-side crypto/keychain transport seams and does not prove browser runtime readiness.
- `packages/plugin-account/src/device-management.ts`
  - only covers mock revoke semantics today, not browser register/heartbeat/header injection.

### Sync/device contract is already frozen upstream

- `packages/web-sync-crypto-contract-preflight/docs/api.md`
  - `X-Device-Id` is mandatory on business APIs and `/sync/*`.
  - missing/unknown device => `401`.
  - revoked device => `403 device_revoked`.
- `docs/planning/sub-prds/web/PRD.md`
  - `device_id` is persisted locally in IndexedDB `device`.
  - `device_register` is the bootstrap exception that can run before device-authenticated RPCs.
  - auth storage lives in IndexedDB, and logout clears auth/session stores but not necessarily the whole browser state.

## External Research

### Search Queries

- `Supabase JavaScript auth custom storage PKCE official docs`
- `Supabase SSR cookies PKCE official docs`
- `Supabase signInWithOAuth PKCE official docs`
- `Supabase redirect URLs official docs`
- `Supabase Login with Apple official docs`
- `Supabase Login with Google official docs`
- `idb-keyval official repository`
- `localForage official repository`
- `Dexie official docs`
- `Auth.js official docs`

### Evidence Table

| Source | URL | What it establishes |
|---|---|---|
| Supabase JS auth overview | https://supabase.com/docs/reference/javascript/auth-api | browser client defaults to persisted session storage and explicitly supports a custom storage implementation |
| Supabase PKCE flow | https://supabase.com/docs/guides/auth/sessions/pkce-flow | PKCE code exchange flow, custom `SupportedStorage`, and `detectSessionInUrl` behavior |
| Supabase SSR advanced guide | https://supabase.com/docs/guides/auth/server-side/advanced-guide | SSR package is cookie-based and introduces response caching / `Set-Cookie` constraints on authenticated routes |
| Supabase OAuth sign-in reference | https://supabase.com/docs/reference/javascript/auth-signinwithoauth | `signInWithOAuth` supports PKCE |
| Supabase redirect URL guide | https://supabase.com/docs/guides/auth/redirect-urls | provider redirects must still be constrained by project allowlists; app-level redirect policy is separate |
| Supabase Apple auth | https://supabase.com/docs/guides/auth/auth-apple | Apple web sign-in is supported through Supabase Auth OAuth flow |
| Supabase Google auth | https://supabase.com/docs/guides/auth/social-login/auth-google | Google web sign-in is supported through Supabase Auth |
| idb-keyval | https://github.com/jakearchibald/idb-keyval | tiny, focused key/value IndexedDB wrapper suited to a small auth/device storage surface |
| idb-keyval npm | https://www.npmjs.com/package/idb-keyval | current maintenance snapshot, zero dependencies, Apache-2.0 |
| localForage | https://github.com/localforage/localforage | broader offline abstraction with multiple backends and additional configuration/legacy surface |
| Dexie | https://dexie.org/docs/Dexie/Dexie | full IndexedDB database abstraction, useful for richer stores but heavier than a token/device bucket |
| Auth.js | https://auth.js.org/ | separate auth abstraction layer for the web, but not Supabase-device-session specific |

## Decision Cluster A — Browser Auth Stack

### Option A — Supabase browser client with PKCE and custom IndexedDB storage

Structure:

- `@supabase/supabase-js` browser client in `packages/web-auth-device-session`
- `flowType: 'pkce'`
- custom `SupportedStorage` backed by IndexedDB
- same-origin `next` allowlist handled inside app code
- `apps/web` only mounts provider, pages, and route guards

Pros:

- Matches the actual host shape: Vite SPA `@repo/web`, not SSR.
- Supabase officially supports both PKCE and custom storage.
- Keeps session state under one authority instead of layering cookies or a second auth framework on top.
- Fits the roadmap requirement for local device registration, heartbeat, and future `X-Device-Id` request injection.
- Avoids authenticated-route cache pitfalls documented for cookie-based SSR flows.

Cons:

- Browser client still holds refresh-token lifecycle on the client, so revoke semantics must remain business-layer/device-layer rather than true remote refresh-token invalidation.
- Requires explicit redirect validation, explicit session cleanup, and explicit device-bound fetch helpers.
- Needs a clean package boundary so `apps/web` does not absorb the orchestration logic.

Assessment:

- Best fit for this repo and for the exact requirement statement.

### Option B — `@supabase/ssr` cookie-first session handling

Structure:

- server-aware Supabase client
- cookies as session storage
- auth callback and refresh handled through HTTP response lifecycle

Pros:

- Officially supported by Supabase.
- Cookie storage can unify server/client session reads in SSR frameworks.

Cons:

- Misaligned with the repo’s current Web host, which is a Vite SPA and not a server-rendered auth host.
- Conflicts directly with the requirement for **custom IndexedDB token storage**.
- Introduces authenticated-route cache/header hazards that are unnecessary for this thin SPA host.
- Makes per-device session persistence and `X-Device-Id` injection feel like add-ons to a cookie system rather than first-class behavior.

Assessment:

- Wrong fit for this row; reject.

### Option C — Auth.js or a second auth abstraction on top of Supabase

Structure:

- Auth.js manages browser/web sessions
- Supabase becomes one provider/backend inside that abstraction

Pros:

- Broad ecosystem and generic auth patterns.

Cons:

- Adds a second session authority on top of Supabase Auth.
- Does not solve the repo-specific `device_register` / heartbeat / `X-Device-Id` problem.
- Adds extra indirection between app code and the Supabase endpoints the PRD already names explicitly.
- Works against the need for a narrow, auditable session boundary under `packages/web-auth-device-session`.

Assessment:

- Over-abstracted for this repo; reject.

## Decision Cluster B — IndexedDB Adapter Choice

### Option A1 — `idb-keyval` for auth/session/device stores

Pros:

- Small surface area.
- Good fit for 2-3 object buckets such as `auth_tokens`, `auth_keys`, and `device`.
- No need to bring a full query/indexing abstraction into the auth row.
- Leaves later rows free to choose a richer IndexedDB strategy for encrypted entity caches.

Cons:

- Not suitable for the later complex cache/index stores by itself.

Assessment:

- Best fit for this row only.

### Option A2 — localForage

Pros:

- Mature offline abstraction.
- Supports multiple browser backends.

Cons:

- Larger and more legacy-oriented than this row needs.
- Backend abstraction is a poor match for a roadmap that already assumes IndexedDB as the canonical browser store.

Assessment:

- Acceptable fallback, but not the preferred default.

### Option A3 — Dexie

Pros:

- Strong choice for rich IndexedDB schema work.
- Good candidate space for later encrypted cache/index rows.

Cons:

- Heavier than needed for a narrow auth/session/device bucket.
- Risks conflating this row with the later cache/storage architecture row.

Assessment:

- Not selected here; keep available for later Web cache rows if needed.

## Recommendation

Choose **Option A + Option A1**:

- auth/session stack = `@supabase/supabase-js` browser client with PKCE
- storage adapter = custom Supabase `SupportedStorage` backed by `idb-keyval`
- ownership boundary = `packages/web-auth-device-session`
- host integration = thin `apps/web` wrappers only

## Frozen Package Boundary

### `packages/web-auth-device-session` owns

- Supabase browser client factory and auth configuration
- custom IndexedDB token storage and wrap/unwrap seam
- `next` redirect resolution / rejection policy
- email signup/login/verify/reset orchestration
- Apple/Google OAuth start + callback exchange
- browser session controller and route-guard helpers
- local `device_id` persistence
- `device_register` / `device_heartbeat`
- future request helper that injects `Authorization`, `X-Device-Id`, and `X-Sync-Version`

### `apps/web` owns only

- mounting provider(s) in `AppProviders`
- thin page wrappers in `AuthPage` and `AppShellPage`
- route family mapping in `HostRouter`

### `@repo/plugin-account` role in this row

- upstream contract/reference only
- no direct runtime dependency required by the plan
- if later build work finds browser-safe pure helpers worth extracting, that should happen explicitly, not by silently importing In-Dev desktop seams into Web

## Redirect and Session Safety Freeze

### `next` allowlist

- app-level allowlist is stricter than Supabase dashboard redirect allowlist
- only same-origin relative paths are accepted
- reject:
  - absolute URLs
  - protocol-relative URLs (`//...`)
  - encoded origin swaps
  - unsupported prefixes
- default fallback target is `/app`

Recommended v1 policy:

- allow `/app`
- allow `/app/*`
- keep any extra `/auth/*` completion routes explicit rather than open-ended

### PKCE temporary state

- `state` and `code_verifier` live in `sessionStorage`
- callback exchanges the one-time code exactly once
- callback cleanup removes transient PKCE state after success or hard failure

### Token at-rest model

- Supabase session payload is persisted via custom IndexedDB storage
- storage uses browser-native WebCrypto wrapping for disk-at-rest protection
- threat model is explicit:
  - protects against disk/cross-user local access
  - does not claim same-origin XSS resistance

## Device Session Freeze

### Local persistence

- `device.id` persists locally and is not coupled to auth token lifetime
- ordinary local sign-out should clear auth/session stores but preserve device identity
- `device_revoked` / `unknown_device` should force a cleanup path that is allowed to rotate `device.id` before the next register attempt

### Register / heartbeat lifecycle

- after a verified/restored session, ensure `device_id` exists locally
- call `device_register` once per active authenticated device bootstrap
- heartbeat every 5 minutes and once immediately on `visibilitychange -> visible`
- repeated register attempts with the same local `device_id` must be treated as idempotent/upsert-safe from the client perspective

### Error semantics

- `401 unknown_device`
  - local session becomes invalid for business APIs
  - clear auth/session stores
  - rotate/recreate device identity before next login/register
- `403 device_revoked`
  - force logout
  - clear auth/session stores
  - prevent silent retry loops

## Build-Ready Implementation Phases

### Phase 1 — Session core and package boundary

File boundary:

- `packages/web-auth-device-session/src/{index.ts,client.ts,storage.ts,device-store.ts,redirects.ts,session.ts}`
- `apps/web/src/providers/AppProviders.tsx`

Required implementation:

- create browser auth package boundary
- initialize Supabase browser client with PKCE and custom storage
- implement `next` allowlist helper
- persist `device.id`
- expose a provider/controller seam for host mount

Gate:

- host remains thin
- storage/redirect/device primitives are independently testable

Scoped verification:

- package-local unit tests for redirect rejection and device persistence
- `pnpm --filter @repo/web check-types`

### Phase 2 — Email auth, OAuth callback, and route guards

File boundary:

- `packages/web-auth-device-session/src/{auth-actions.ts,callback.ts,guards.ts,components/**}`
- `apps/web/src/pages/AuthPage.tsx`
- `apps/web/src/routes/HostRouter.tsx`

Required implementation:

- signup/login/verify/reset screens and actions
- Apple/Google OAuth start + callback exchange
- `sessionStorage` PKCE state handling
- `/auth/*` and `/app/*` guard helpers on the existing host router

Gate:

- auth flows run through the package boundary rather than directly inside host pages
- redirect safety is enforced centrally

Scoped verification:

- mock/integration tests for signup/reset/callback flows
- tests for `next` allowlist acceptance/rejection

### Phase 3 — Device register/heartbeat and request injection seam

File boundary:

- `packages/web-auth-device-session/src/{device-session.ts,device-transport.ts,device-fetch.ts,heartbeat.ts}`
- `apps/web/src/pages/AppShellPage.tsx`
- `apps/web/src/providers/AppProviders.tsx`

Required implementation:

- register authenticated device
- schedule heartbeat
- export request helper/interceptor for later RPC and `/sync/*` callers
- on `unknown_device` / `device_revoked`, clear session state and redirect back to auth

Gate:

- later rows can consume one canonical device-bound request seam
- revoke/unknown-device behavior is observable before sync driver lands

Scoped verification:

- unit tests for request header injection
- unit/integration tests for revoke and unknown-device cleanup
- `pnpm --filter @repo/web check-types`

## Risks

- If `packages/web-auth-device-session` is allowed to depend directly on unstable `@repo/plugin-account` runtime code, the browser boundary will inherit desktop-specific seams and drift risk.
- If this row tries to solve later encrypted-entity cache concerns now, it will blur into `web-browser-e2e-crypto-runtime` and `web-encrypted-indexeddb-cache`.
- If `next` validation is left to ad hoc page code, open-redirect regressions are likely.
- Supabase provider/dashboard redirect allowlists can be wider than the in-app allowlist; the app must enforce its own narrower rule.

## Open Questions

1. Should revoked-device cleanup preserve a tombstone for the previous `device_id`, or simply rotate to a fresh one at next login.
2. Whether the package should expose a package-local BroadcastChannel sign-out sync now, or leave all multi-tab coordination to the later device-management row.
3. Whether `idb-keyval` remains sufficient once the package adds a wrapped-key store, or whether a tiny repo-owned adapter layer should hide the library completely from the public surface.
