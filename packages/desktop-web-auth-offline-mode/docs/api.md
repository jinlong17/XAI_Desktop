# desktop-web-auth-offline-mode — API / Contract Notes

## Contract Summary

This feature changes runtime selection and host build contract, not business-module interfaces. The primary contracts are:

- desktop host env injection
- web auth provider mode resolution
- auth/session state transition into `/app`

## Upstream Interfaces

### `AppProviders` auth-mode contract

`apps/web/src/providers/AppProviders.tsx` currently recognizes:

- `live`
- `mock-authenticated`
- `mock-unauthenticated`

Unspecified values fall back to `live`.

Phase 1 desktop contract:

- desktop host must explicitly select `mock-authenticated`
- the feature must not change the normal default for Web/browser callers

### Supabase config contract

`resolveWebSupabaseConfig()` returns `null` when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are absent.

Implication:

- in `live` mode with missing Supabase env, auth state becomes `unconfigured`
- in `mock-authenticated` mode, desktop must still reach `authenticated` without those vars

### Session-state contract

`packages/web-auth-device-session/src/session.tsx` exposes these states:

- `loading`
- `authenticated`
- `unauthenticated`
- `unconfigured`

`packages/web-auth-device-session/src/guards.tsx` allows `/app` only for `authenticated`.

Therefore the feature must guarantee that desktop Phase 1 reaches `authenticated`, not merely `unconfigured`.

## Downstream Interfaces

### Desktop build/dev contract

Preferred contract:

- `apps/desktop/package.json` desktop wrapper scripts reflect Phase 1 offline-auth policy
- `apps/desktop/src-tauri/tauri.conf.json` `beforeDevCommand` and `beforeBuildCommand` propagate `VITE_WEB_AUTH_MODE=mock-authenticated`

Required behavior:

- `pnpm --filter desktop tauri dev` enters `/app` without Supabase env
- `pnpm --filter desktop tauri build --debug --bundles app` produces a bundle whose offline launch also enters `/app`

### Device-session transport contract

In desktop Phase 1 offline mode:

- `DeviceSessionBridge` should not mount
- `createRestRpcDeviceTransport(...)` should not be used
- Supabase device register / heartbeat RPC should not be attempted

This is an expected result of selecting a non-live auth mode, not a separate feature.

### Fallback seam constraint

If source changes are unavoidable, they must stay isolated to:

- `apps/web/src/providers/AppProviders.tsx`
- closely related auth/session tests

Do not touch web business modules to solve desktop auth entry.

## Error Semantics

- Missing desktop env injection is a Phase 1 build/runtime regression. The app will fall back to live mode and redirect to `/auth/login`; this must be treated as a failure, not as an acceptable degraded state.
- Missing Supabase env in desktop Phase 1 must not crash the app. It should be irrelevant once desktop selects mock-authenticated mode.
- If a minimal fallback provider seam is introduced, it must fail closed to the existing live behavior for non-desktop callers.

## Permission Notes

- No new Tauri permissions or native commands should be introduced for this feature.
- No local secret storage, SQLite, or native account persistence belongs here.
- Future real account sync remains an online capability and is not redefined by this feature.

## Idempotency Notes

- Re-running desktop dev/build should deterministically select the same Phase 1 mock-authenticated contract.
- The mock desktop identity may be synthetic, but it must be stable enough that repeated local launches do not alternate between `/app` and `/auth/login`.
