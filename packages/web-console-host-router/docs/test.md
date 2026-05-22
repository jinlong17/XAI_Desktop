# web-console-host-router — Test Strategy

## Validation Goals

- prove the Web host uses a real browser router with refresh/deep-link/history semantics
- prove route-family and module boundaries stay thin and host-only
- prove later module rows extend `/app/:moduleId/*` through one frozen registration mechanism
- prove browser-rendered code cannot quietly depend on native/Desktop APIs
- prove shared `ConsoleViewCapabilities` is the only public module capability surface and unsupported behavior is explicit and recoverable

## Unit / Component Coverage

### Router and boundary coverage

- route tree creation
  - `/` renders landing
  - `/auth/*` renders auth family wrappers
  - `/app/*` renders guarded app family wrappers
  - unknown route renders not-found
- redirect behavior
  - `/app` redirects to default module route
  - unauthenticated `/app/*` uses `AppRouteGate` redirect semantics
  - authenticated `/auth/*` uses `AuthRouteGate` redirect semantics
- route-level error boundaries
  - thrown root bootstrap failure hits root boundary
  - thrown auth-route failure hits auth boundary
  - thrown app-shell or module child failure hits app/module boundary without collapsing the whole browser session
- module registration assembly
  - duplicate `moduleId` registration fails test/build
  - missing child registration degrades to placeholder or route-safe not-found boundary
  - `/app` default redirect resolves from the registration list rather than a second static host map
  - implemented in `apps/web/src/routes/modules/buildModuleRoutes.test.ts`

### Host capability coverage

- shared `ConsoleViewCapabilities.download` success path and explicit failure path
- shared `ConsoleViewCapabilities.notify` permission-denied degrade path
- shared `ConsoleViewCapabilities.registerShortcut` subscribe/unsubscribe behavior
- shared `ConsoleViewCapabilities.beginDrag` unsupported-browser or unsupported-native result path
- settings/search navigation remains deterministic through shared `navigate` and `openCommandPalette` entrypoints
- native-only actions are absent from the public capability bag, so browser modules cannot compile against them
- implemented in `apps/web/src/host/capabilities.test.ts`

### Browser-safety coverage

- static/lint/type guard proving no `@tauri-apps/*` imports in `apps/web` and any browser-shared helper touched by this row
- restricted-import guard proving `apps/web` only imports browser-safe package entrypoints (`@repo/plugin-console/web`, `@repo/web-auth-device-session/web`) instead of package roots
- route or capability helpers do not import Desktop-only modules
- files transitively imported through module route registrations are included in the same browser-safety guard scope

## Contract Coverage

- `@repo/web-auth-device-session`
  - host uses exported guard/provider/page seams only
  - host does not fork auth/session logic
- `plugin-console`
  - host consumes shell contracts without pulling module business logic into `apps/web`
- module-route seam
  - `/app/:moduleId/*` is stable and later rows add children through shared package-exported registrations without top-level router churn
- shared capability seam
  - browser modules consume only `ConsoleViewProps.capabilities`
  - this row does not leave a second public `WebHostCapabilities` fork behind
- unsupported-native contract
  - unsupported actions return typed unsupported results, not silent no-ops

## Integration / Regression Scenarios

- deep link directly to a valid module path under `/app/:moduleId/*`
  - app loads
  - guard executes
  - route remains stable after refresh
- route integration test coverage:
  - `apps/web/src/routes/router.integration.test.tsx` verifies guarded app route deep-link rendering, history-entry family resolution, and unsupported capability-stub interaction stability
- browser back/forward across `/`, `/auth/*`, and `/app/*`
- not-found routing under both top-level and module-child paths
- route-safe app-shell fallback when a module child route is missing or throws
- capability degrade UI remains usable when notification permission is denied or DnD/native action is unsupported

## Mock Strategy

- auth/session state
  - use mock `WebAuthSessionProvider` state or guard wrappers instead of live Supabase
  - local manual verification can use `VITE_WEB_AUTH_MODE=mock-authenticated` to exercise `/app/:moduleId/*` without a configured external session
- module content
  - use placeholder-safe module registrations or shell-owned fallback registrations while upstream plugin rows remain non-stable
- host capabilities
  - inject deterministic fake implementations for shared capability methods such as download/notify/shortcut/navigation/search
  - inject explicit unsupported responses for native/Desktop-only actions
- cache/runtime state
  - mock route-level cache/search state; do not require real IndexedDB ownership in the router row

## Manual Verification Targets For Build/Verify

- `pnpm --filter @repo/web check-types`
- `pnpm --filter @repo/core check-types`
- `pnpm --filter @repo/plugin-console check-types`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web exec vitest run src/routes/modules/buildModuleRoutes.test.ts src/host/capabilities.test.ts src/routes/router.integration.test.tsx`
- `pnpm --filter @repo/web exec eslint --max-warnings 0 src`
- `pnpm --filter @repo/web dev:mock-auth` (manual guarded-route verification seam)
- route-focused test suite for `apps/web`
- manual browser verification:
  - open `/`
  - open `/auth/login`
  - open a guarded `/app/...` deep link
  - refresh on the guarded deep link
  - use browser back/forward
  - trigger one route-level error boundary
  - exercise at least one supported and one unsupported host capability action

## Acceptance Criteria

1. The current manual pathname switch is gone from the canonical host path.
2. `/`, `/auth/*`, `/app/*`, and not-found are owned by one browser router tree.
3. `/app/:moduleId/*` exists as the stable parent seam for later module rows.
4. Later module rows extend that seam through one frozen shared registration contract rather than ad hoc host routing.
5. Route-derived state survives refresh/deep link and follows browser history.
6. Host capability injection is explicit and shared through `ConsoleViewCapabilities`.
7. Unsupported native/Desktop actions are either build-blocked by absence/import guards or degrade through typed shared capability results.
