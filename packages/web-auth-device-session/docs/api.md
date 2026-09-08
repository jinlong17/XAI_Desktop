# web-auth-device-session — API / Contract Notes

## Runtime API

This row plans the browser auth/session boundary. It does not finalize every implementation symbol yet, but it freezes the contract surfaces that later rows must consume.

## Upstream Interfaces

| Surface | Assumption |
|---|---|
| `apps/web/src/routes/HostRouter.tsx` | host already splits `/`, `/auth/*`, `/app/*` and should stay a thin route-family mapper |
| `apps/web/src/providers/AppProviders.tsx` | canonical mount point for auth/session providers |
| `docs/adr/0006-web-face-hybrid-reuse-boundary.md` | Web may rewrite view/session logic, but shared contracts stay mandatory |
| `docs/PLUGIN_MAP.md` | `@repo/plugin-account` is the contract owner for auth/device/session semantics, but is not a stable browser runtime dependency |
| `packages/web-sync-crypto-contract-preflight/docs/api.md` | `X-Device-Id` and device-auth failure semantics are already frozen upstream |

## Downstream Interfaces

| Consumer | Contract this row must preserve |
|---|---|
| `web-sync-blob-driver` | one canonical request seam that can attach `Authorization`, `X-Device-Id`, and `X-Sync-Version` |
| `web-console-host-router` | auth/app guard state without re-implementing session ownership in the host |
| `web-todo-first-slice` | stable authenticated browser session before module data loading |
| `web-device-management-revoke` | device session semantics and cleanup behavior |
| `web-security-csp-sentry` | auth callback and provider routes remain same-origin and auditable |

## Planned Public Surface

The package should expose browser-only seams from `index.ts` similar to:

- `createWebSupabaseClient(config)`
- `createAuthSessionStorage(deps)`
- `resolveSafeNextPath(input, allowlist)`
- `createDeviceIdentityStore(deps)`
- `createDeviceSessionController(deps)`
- `createDeviceBoundFetch(deps)`
- `WebAuthSessionProvider`
- `AuthRouteGate`
- `AppRouteGate`

The exact names may change during build, but the ownership split must not:

- storage/redirect/device/session logic live in the package
- host pages/providers import the package surface only

## Auth Contract

### Email auth flows

Supported browser flows in scope:

- sign up
- log in
- email verification landing/completion
- password reset request
- password reset completion

Out of scope for this row:

- passkeys
- magic-link-only auth productization
- account deletion/export

### OAuth flows

- providers in scope: `google`, `apple`
- initiation uses Supabase browser auth `signInWithOAuth(...)`
- PKCE is required
- callback exchanges the code for a session
- callback state lives in `sessionStorage`, not IndexedDB

## Redirect Contract

### `next` policy

- input is treated as untrusted
- accept only same-origin relative paths
- reject:
  - absolute URLs
  - protocol-relative URLs
  - origin-changing encoded payloads
  - unsupported prefixes

Recommended allowed targets for v1:

- `/app`
- `/app/*`
- explicitly approved `/auth/*` completion routes only

Fallback:

- if rejected or missing, redirect to `/app`

## Storage Contract

### Session storage

- Supabase session persistence uses custom `SupportedStorage`
- backing store is IndexedDB
- storage implementation is package-owned and must be swappable in tests

### Threat model

- at-rest protection target:
  - disk access
  - cross-user local machine access
- not claimed:
  - same-origin XSS resistance

### Device identity storage

- local `device.id` persists independently from access-token lifetime
- browser data clear may remove it and force a fresh register path
- ordinary local sign-out should not automatically destroy `device.id`

## Device Session Contract

### RPCs

Planned RPC usage:

- `POST /rest/v1/rpc/device_register`
- `POST /rest/v1/rpc/device_heartbeat`

Future consumers from other rows:

- `device_revoke`
- `revoke_others_rpc`
- `device_list_rpc`

### Lifecycle

1. restore or create authenticated Supabase session
2. ensure local `device.id` exists
3. call `device_register`
4. start heartbeat timer
5. use device-bound request helper for later business RPC and `/sync/*`

### Idempotency

- `device_register` must be safe for retry after refresh/page restore from the client perspective
- `device_heartbeat` is repeatable and client-throttled

## Device-Bound Request Contract

Future package seam for later rows must inject:

```http
Authorization: Bearer <access_token>
X-Device-Id: <device_uuid>
X-Sync-Version: 2026-05
```

Rules:

- do not silently send business requests without `X-Device-Id`
- do not let later rows invent a second header helper
- handle device-auth failures centrally

## Error Semantics

| Error | Meaning | Required client reaction |
|---|---|---|
| `redirect_rejected` | `next` target violates app allowlist | drop target and continue with fallback |
| `pkce_state_missing` | callback cannot validate transient PKCE state | hard fail the callback and restart auth |
| `pkce_exchange_failed` | auth code exchange failed or expired | restart auth and clear transient PKCE data |
| `401 unknown_device` | local `device.id` is not accepted by business middleware | clear auth/session stores and prepare a fresh device bootstrap |
| `403 device_revoked` | local device has been revoked remotely | force logout, clear auth/session stores, and block silent retries |
| `auth_required` | unauthenticated access to `/app/*` | redirect to login with safe fallback target |

## Permission / Idempotency Notes

- This row does not require Tauri permissions, desktop event wiring, or macOS capabilities.
- Re-running auth callback handling must not duplicate device registration side effects from the browser perspective.
- Re-running ordinary sign-out should be safe and local-only.
- Revoked-device cleanup may invalidate and rotate local `device.id`; ordinary sign-out should not.
