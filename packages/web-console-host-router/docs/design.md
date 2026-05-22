# web-console-host-router — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — keep `packages/web-console-host-router/docs/` as the workflow anchor, implement the runtime in `apps/web`, standardize on React Router for nested browser routing plus route-level error boundaries, and freeze package-exported module route registrations plus one shared `ConsoleViewCapabilities` surface |
| Review Doc Path | `docs/reviews/web-console-host-router/20260522-discovery-review.md` |
| Review Date/Version | 2026-05-22 |
| Feature Type | W6 Web host-shell and router planning |
| Roadmap | `web-ticktick-parity` · feature #10 · W6 |

## Frozen Assumptions

- `apps/web` remains the canonical browser host and stays thin: routing, providers, error boundaries, service-worker/bootstrap hooks, and host-capability assembly only.
- `packages/web-console-host-router/docs/` is the workflow anchor only; it is not evidence that runtime business code should live under `packages/web-console-host-router/`.
- `@repo/web-auth-device-session` remains the owner of auth/session/device lifecycle; this row only consumes its provider and route-guard surface.
- `plugin-console` remains the platform-neutral shell owner; this row assembles it for the Web face rather than replacing its information architecture.
- `apps/web` consumes browser-only exports via `@repo/plugin-console/web` and `@repo/web-auth-device-session/web`; importing those package roots from `apps/web/src/**` is forbidden.
- Browser module routing freezes at `/app/:moduleId/*` as the host-owned parent seam.
- Later module rows attach child routes by exporting shared registration contracts from their owning package public surface; the host composes them but does not own their business route content.
- Browser-rendered code must never import Tauri/native APIs directly.
- local authenticated routing verification may use `VITE_WEB_AUTH_MODE=mock-authenticated`; production auth flow remains the default `live` mode.
- `ConsoleViewCapabilities` remains the only public module capability surface; W6 extends it rather than keeping a parallel `WebHostCapabilities` type.
- Unsupported native/Desktop capabilities must either stay unexported from the shared capability surface or return explicit unsupported/degraded results through that same shared contract.
- Later Web module rows remain mock-first where upstream plugin authority is still non-stable in `docs/PLUGIN_MAP.md`.

## Scope Boundary

This feature owns planning for:

- `apps/web/src/main.tsx`
- `apps/web/src/routes/**`
- `apps/web/src/providers/**`
- `apps/web/src/pages/**`
- host-only Web capability adapters/stubs
- route-level error-boundary ownership
- the stable `/app/:moduleId/*` module-route seam
- shared route-registration and capability-contract decisions required to make build executable

This feature does not own:

- Todo/Project/Habit/Label/Calendar business logic
- auth/session/device lifecycle internals
- Sync blob driver or encrypted cache internals
- Tauri/native Desktop integrations
- a broad redesign of `plugin-console` shell contracts

## Dependency Overview

- Upstream source: `docs/reviews/web-console-host-router/20260521-roadmap-seed.md`
- Governing docs:
  - `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
  - `docs/planning/sub-prds/web/PRD.md`
  - `docs/planning/sub-prds/console/PRD.md`
  - `docs/PLUGIN_MAP.md`
- Existing runtime seams:
- `apps/web/src/providers/AppProviders.tsx`
- `packages/web-auth-device-session/src/{guards.tsx,components/WebAuthPage.tsx,index.ts}`
  - `packages/plugin-console/src/components/ConsoleLayout.tsx`
  - `packages/core/src/types/plugin.ts`
- Downstream rows unlocked:
  - `web-todo-first-slice`
  - `web-productivity-habits-pomodoro`
  - `web-project-label-calendar`
  - `web-search-keyboard-theme`
  - `web-responsive-mobile`
  - `web-security-csp-sentry`

## Proposed Implementation Shape

### Host router

- `apps/web/src/main.tsx`
  - render `RouterProvider`
- `apps/web/src/routes/router.tsx`
  - define the static `createBrowserRouter(...)` tree
- `apps/web/src/routes/modules/registrations.ts`
  - compose module registrations imported from package public surfaces and host-owned placeholder fallbacks
- `apps/web/src/routes/modules/buildModuleRoutes.tsx`
  - translate the shared registration contract into child route objects mounted below `/app/:moduleId/*`
- route families:
  - `/`
  - `/auth/*`
  - `/app/*`
  - `*`

### App shell

- `/app` redirects to a default module path
- `/app/:moduleId/*` is the stable host-owned parent route
- later rows add child routes by exporting a `WebModuleRouteRegistration` keyed to their `moduleId`
- the host keeps the top-level router static and only recomposes the module registration list
- route elements consume `AppRouteGate` / `AuthRouteGate`, not duplicated auth logic

### Error boundaries

- root route boundary
- auth family boundary
- app family boundary
- module child-route boundary

### Host capabilities

- the host mounts the browser implementation of shared `ConsoleViewCapabilities`
- W6 extends the shared contract for:
  - download
  - notification
  - shortcut registration
  - browser-safe drag-and-drop
  - capability status / degraded results
- settings navigation uses shared route navigation semantics
- search uses the existing command-palette/search entry semantics
- native/Desktop-only actions stay outside the public module capability surface and remain unreachable from browser-rendered modules

### Browser-safety guard

- `apps/web` owns the import/build guard for browser-rendered code
- transitive browser routing dependencies enter `plugin-console` and `web-auth-device-session` through their `/web` subpath entrypoints only
- the guard applies to host files and to all transitive files reachable through module registration exports
- later rows must extend browser routes through package public surfaces only; direct `src/internal/` imports remain forbidden

## Phase Mapping

### Phase 1 — Router foundation and route-family boundaries

Status: DONE (`6bbbf14`).

- add `react-router` to `apps/web`
- replace the current manual `HostRouter` switch
- define `/`, `/auth/*`, `/app/*`, and not-found route families
- add route-level error boundaries

### Phase 2 — App shell composition and module-route seam

Status: DONE (`18a30c2`).

- mount the guarded app shell under `/app/*`
- freeze `/app/:moduleId/*` as the module parent seam
- redirect `/app` to the default module route
- add the shared package-exported module registration contract plus host composition helper
- keep placeholder-safe module registration while later rows are still mock-first

### Phase 3 — Host capability injection and unsupported-native stubs

Status: DONE (`41db694`).

- extend shared `ConsoleViewCapabilities` in `@repo/core` and inject the browser implementation from `apps/web`
- add explicit unsupported-native results for Desktop/Tauri-only behavior
- add the browser-safety import/build guard
- ensure later module rows have one capability surface rather than ad hoc browser/native branching

## Reviewer Focus

- Confirm React Router is the right tradeoff versus TanStack Router and continuing the manual host switch.
- Confirm the package-exported module registration contract is the right ownership split for later rows under `/app/:moduleId/*`.
- Confirm auth stays provider/package-owned rather than moving into router loaders.
- Confirm extending shared `ConsoleViewCapabilities` is the right way to block native/Desktop leakage without a long-lived Web-only fork.
