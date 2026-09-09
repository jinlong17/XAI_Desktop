# web-auth-device-session — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — dedicated browser auth/session package using Supabase browser PKCE client + custom IndexedDB storage, mounted by a thin `apps/web` host |
| Review Doc Path | `docs/reviews/web-auth-device-session/20260521-discovery-review.md` |
| Review Date/Version | 2026-05-21 |
| Feature Type | W3 browser auth and app-device session foundation |
| Roadmap | `web-ticktick-parity` · feature #6 · W3 |

## Frozen Assumptions

- `apps/web` stays a thin host shell only: it may mount providers, pages, and guards, but not own auth/session business orchestration.
- `packages/web-auth-device-session` is the canonical browser boundary for Supabase auth, local device identity, and device-bound request setup.
- `@repo/plugin-account` remains an upstream contract/reference for planning, not a stable browser runtime dependency.
- This row owns **auth/session token at-rest storage only**, not the later DEK/entity-blob/runtime crypto stack.
- PKCE `state` and `code_verifier` stay in `sessionStorage`.
- `next` redirect handling is an app-level same-origin allowlist, stricter than any Supabase dashboard redirect wildcards.
- Ordinary local sign-out clears auth/session material but may preserve `device.id`; revoked/unknown-device paths may rotate `device.id` before the next register attempt.

## Scope Boundary

This feature owns planning for:

- browser email auth and OAuth session flows
- custom Supabase session storage in IndexedDB
- local `device.id` persistence
- `device_register` and `device_heartbeat`
- auth and app route guards on the current `apps/web` host shell
- future request helper that injects `Authorization`, `X-Device-Id`, and `X-Sync-Version`

This feature does not own:

- sync blob driver implementation
- DEK lifecycle, Argon2/HPKE/recovery runtime compatibility
- encrypted entity cache/index schema
- Realtime metadata sync
- device management UI
- account export/delete/privacy flows
- final router-library choice for the later `web-console-host-router` row

## Dependency Overview

- Upstream source: `docs/reviews/web-auth-device-session/20260521-roadmap-seed.md`
- Governing docs:
  - `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
  - `docs/PLUGIN_MAP.md`
  - `docs/planning/sub-prds/web/PRD.md`
  - `docs/planning/sub-prds/web/dev-plan.md`
  - `packages/web-sync-crypto-contract-preflight/docs/api.md`
- External runtime candidates frozen for planning:
  - `@supabase/supabase-js`
  - `idb-keyval`
- Downstream rows unlocked:
  - `web-browser-e2e-crypto-runtime`
  - `web-sync-blob-driver`
  - `web-console-host-router`
  - `web-todo-first-slice`
  - `web-device-management-revoke`

## Host and Package Shape

### `packages/web-auth-device-session`

Planned responsibility split:

- `client.ts`
  - Supabase browser client creation
- `storage.ts`
  - custom `SupportedStorage` backed by IndexedDB
- `redirects.ts`
  - `next` allowlist resolution/rejection
- `device-store.ts`
  - local `device.id` persistence
- `session.ts`
  - session lifecycle and auth-state controller
- `device-session.ts`
  - register/heartbeat and cleanup logic
- `device-fetch.ts`
  - device-bound request helper/interceptor
- `components/**`
  - browser auth views mounted by the host pages

### `apps/web`

Planned thin wrappers only:

- `src/providers/AppProviders.tsx`
  - mount package provider(s)
- `src/pages/AuthPage.tsx`
  - render package auth shell
- `src/pages/AppShellPage.tsx`
  - render guarded app shell wrapper
- `src/routes/HostRouter.tsx`
  - keep pathname family mapping and consume the package guard seam

## Build Phase Freeze

### Phase 1 — Session core and package scaffold

- touch:
  - `packages/web-auth-device-session/src/{index.ts,client.ts,storage.ts,device-store.ts,redirects.ts,session.ts}`
  - `apps/web/src/providers/AppProviders.tsx`
- deliverable:
  - browser auth package exists
  - Supabase client + custom storage + device store + redirect helper are isolated from host pages

### Phase 2 — Auth flows and guard wiring

- touch:
  - `packages/web-auth-device-session/src/{auth-actions.ts,callback.ts,guards.ts,components/**}`
  - `apps/web/src/pages/AuthPage.tsx`
  - `apps/web/src/routes/HostRouter.tsx`
- deliverable:
  - signup/login/reset/verify/OAuth callback flows
  - package-owned guard helpers mounted from host

### Phase 3 — Device register/heartbeat and request seam

- touch:
  - `packages/web-auth-device-session/src/{device-session.ts,device-transport.ts,device-fetch.ts,heartbeat.ts}`
  - `apps/web/src/pages/AppShellPage.tsx`
  - `apps/web/src/providers/AppProviders.tsx`
- deliverable:
  - device lifecycle and request injection seam ready for later `/sync/*` and RPC consumers

## Key Risks

- accidental runtime dependency on unstable `@repo/plugin-account`
- auth row overreaching into later encrypted-cache/runtime rows
- route-guard logic drifting between host pages and package code
- revoked-device cleanup semantics becoming inconsistent with future device-management UI

## REL-02 durable database schema (2026-09-09)

`storage.ts` owns shared connection initialization per IndexedDB factory and database name. The default `xai-web-auth` database has minimum schema version 2 and both `session` and `device` stores. Upgrade creates only missing stores and retains existing records, including v1 databases initialized by either adapter. Existing higher versions are opened without downgrade. Custom database/store options remain supported; missing custom stores are added through a version upgrade.

Connections close and invalidate their cache on `versionchange`/`close`. Open failures do not retain a rejected cache entry. A blocked upgrade rejects promptly instead of keeping auth initialization pending; a delayed rejected request aborts its upgrade or closes a late successful connection. The user must close the older blocking tab before retrying. This patch does not introduce a login UI retry control or change account/session security policy.

REL-02 follow-up: serialize the full store operation per database, rather than only the open promise. Otherwise adding a store can synchronously close a cached connection while an earlier caller is awaiting it. Keep the queue failure-tolerant and scoped to the database; retain v1 data and existing custom-store behavior.

REL-03: the auth package reports identity transitions through an injected synchronous callback, keeping local business-storage ownership in plugin-web-storage. Monotonic refresh revisions prevent stale getSession results from resurrecting an older account. Identity derives from session.user.id, never metadata/email/device ID. Auth events update tokens for the same user without resetting the local generation.
