# desktop-web-auth-offline-mode — Test Plan

## Validation Goals

- Confirm the desktop Tauri Phase 1 path reaches `/app` without network access.
- Confirm desktop `/app` entry does not require Supabase env configuration.
- Confirm the existing mock-authenticated seam satisfies the route guard without broad web-source changes.
- Confirm live Web/browser auth defaults remain unchanged.

## Contract Checks

- `apps/desktop/package.json`
  - desktop wrapper scripts reflect the Phase 1 offline-auth policy
- `apps/desktop/src-tauri/tauri.conf.json`
  - `beforeDevCommand` and `beforeBuildCommand` propagate `VITE_WEB_AUTH_MODE=mock-authenticated`
- `apps/web/src/providers/AppProviders.tsx`
  - non-live mode uses the mock session path
  - non-live mode does not require Supabase config
- `packages/web-auth-device-session/src/session.tsx`
  - desktop Phase 1 resolves `authenticated`, not `unconfigured`
- `packages/web-auth-device-session/src/guards.tsx`
  - `/app` remains gated by `authenticated`
  - no guard weakening for `unconfigured`

## Automated Checks

- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/web-auth-device-session test`
- `pnpm --filter desktop tauri build --debug --bundles app`

If build phase adds a focused `AppProviders` test seam under `apps/web`, also run:

- `pnpm --filter @repo/web test`

## Manual Desktop Checks

- Launch `pnpm --filter desktop tauri dev` with network disabled and without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- Open `/app`.
- Verify the app reaches module content rather than redirecting to `/auth/login`.
- Verify startup does not require sign-in UI to enter the shell in the Phase 1 desktop path.
- Verify no obvious Supabase device/session RPC failure blocks app entry.

## App Bundle Offline Checks

- Build the `.app` bundle via `pnpm --filter desktop tauri build --debug --bundles app`.
- Launch the built app on macOS with network unavailable.
- Verify `/app` entry succeeds from bundled local assets with no Supabase env configured.
- Record whether any online-only panels degrade after entry; do not treat those degradations as auth/session failure unless they block `/app` itself.

## Regression Checks

- Standard Web/browser builds without the desktop env override still use their intended auth mode behavior.
- `mock-unauthenticated` behavior remains available for callers that already rely on it.
- No Phase 2 native capabilities are added to "fix" auth entry.
- No Phase 3 local-first persistence or account-sync logic is introduced.

## Mock Strategy

- Reuse the existing `mock-authenticated` path as the primary test double.
- If targeted web-provider tests are added, stub `import.meta.env` at the provider seam and assert:
  - desktop mode resolves to mock-authenticated
  - Supabase config is not required
  - device transport remains inactive

## Residual Risk

- Real offline desktop verification must be performed on macOS hardware because Tauri bundle launch and network-disabled behavior are environment-sensitive.
- `/app` success does not close remaining offline degradation for AI, maps, OAuth, Stripe, or live Supabase RPC. Those remain owned by `web-external-runtime-offline-gates`.
