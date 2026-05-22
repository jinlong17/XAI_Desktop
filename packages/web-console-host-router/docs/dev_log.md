# web-console-host-router — Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | web-console-host-router |
| Title | W6 Web Console host shell and browser router |
| Roadmap | `web-ticktick-parity` · feature #10 · W6 |
| Current Phase | SHIP |
| Status | SHIPPED |
| Suggested Next | — |
| Automation Mode | A-Claude |
| Verify Cross-vendor | no |
| Executor | ship (Codex gpt-5.3-codex inline) |
| Updated | 2026-05-22 14:38 PDT |
| Blockers | — |

## Source Context

- Roadmap manifest: `docs/workflow/roadmap/web-ticktick-parity.md`
- Source seed: `docs/reviews/web-console-host-router/20260521-roadmap-seed.md`
- Governing ADR: `docs/adr/0006-web-face-hybrid-reuse-boundary.md`
- Upstream host/auth/cache references:
  - `packages/web-auth-device-session/docs/{design.md,api.md}`
  - `packages/plugin-console/docs/{design.md,api.md}`
  - `packages/web-encrypted-indexeddb-cache/docs/api.md`

## Phase Plan

### Phase 1 — Router foundation and family boundaries

Status: DONE (`6bbbf14`).

File boundary:

- `apps/web/package.json`
- `apps/web/src/main.tsx`
- `apps/web/src/routes/**`
- `apps/web/src/pages/{LandingPage.tsx,AuthPage.tsx,NotFoundPage.tsx}`

Required implementation:

- add `react-router`
- replace the current pathname-switch `HostRouter`
- define `/`, `/auth/*`, `/app/*`, and not-found route families
- add route-level error boundaries

Gate:

- refresh/deep-link/browser-history semantics are owned by one real browser router

Scoped verification:

- `pnpm --filter @repo/web check-types`
- route tests for top-level families and boundaries

### Phase 2 — App shell composition and module-route seam

Status: DONE (`18a30c2`).

File boundary:

- `apps/web/src/pages/AppShellPage.tsx`
- `apps/web/src/providers/AppProviders.tsx`
- `apps/web/src/routes/app/**`
- any host-only route registry/helpers under `apps/web/src/routes/**`

Required implementation:

- mount the guarded app shell under `/app/*`
- redirect `/app` to the default module path
- freeze `/app/:moduleId/*` as the stable host-owned parent seam
- add the shared package-exported module registration contract plus host composition helper
- keep placeholder-safe module mounting while later rows stay mock-first through the same registration seam
- consume `plugin-console` shell contracts without moving business logic into the host

Gate:

- later Web module rows can add child routes by exporting registrations from their owning package without reopening the top-level host tree

Scoped verification:

- deep-link and refresh test for one `/app/:moduleId/*` route
- back/forward behavior across `/`, `/auth/*`, `/app/*`
- registration-assembly test for duplicate or missing `moduleId` child routes

### Phase 3 — Web host capabilities and unsupported-native stubs

Status: DONE (`41db694`).

File boundary:

- `apps/web/src/providers/**`
- `apps/web/src/routes/**`
- host-only capability/stub files under `apps/web/src/**`
- `packages/core/src/types/plugin.ts`
- only minimal `packages/plugin-console` touch if capability plumbing must thread through existing shell props

Required implementation:

- inject typed browser-safe host capabilities for download, notification, shortcut, DnD, settings, and search
- extend shared `ConsoleViewCapabilities` in `@repo/core` instead of introducing a long-lived parallel `WebHostCapabilities` type
- add explicit unsupported-native results for Desktop/Tauri-only actions
- add the browser-safety import/build guard at the `apps/web` host boundary and across transitive module-route exports
- ensure browser-rendered code reaches native/Desktop behavior only through the shared capability seam

Gate:

- unsupported capabilities are explicit and recoverable; native/Desktop imports do not leak into browser-rendered modules

Scoped verification:

- capability stub tests for supported and unsupported cases
- browser-safety import/lint guard

## Risks

- The host could accidentally absorb business routing/data logic if route loaders or page components grow beyond assembly concerns.
- Extending the shared `@repo/core` console contract too broadly in this row could turn a host assembly task into a general console redesign.
- URL versus local-state ownership can drift and break refresh/deep-link semantics if not frozen early.
- Capability stubs may appear to work while silently masking unsupported native/Desktop behavior unless the error/degrade contract is enforced.

## Suggested Review Focus

- Confirm React Router is the right router choice for the current repo state and roadmap requirement.
- Confirm the package-exported module registration contract is the correct stable ownership model for later rows under `/app/:moduleId/*`.
- Confirm auth remains provider/package-owned rather than moving into the router.
- Confirm extending shared `ConsoleViewCapabilities` is the right way to prevent Tauri/native leakage in browser-rendered modules.

## Review Notes

- APPROVED. The revised docs resolve the two prior blockers and leave the feature executable without planning-time ambiguity.
- `/app/:moduleId/*` child-route ownership is now frozen to one model: later module rows export `WebModuleRouteRegistration` from their package public surface, and `apps/web` composes those registrations once under the fixed host-owned parent seam.
- Web host capability ownership is now frozen to one shared model: `ConsoleViewCapabilities` remains the only public capability surface, `apps/web` owns the browser implementation plus browser-safety guard, and unsupported native/Desktop actions must be absent or return explicit typed degraded results.
- Recommendation: keep the Phase 3 `@repo/core` contract extension minimal and scoped to browser-safe host actions needed by W6 so this row does not drift into a broader Console contract redesign.

## Revision Response

- Revised: froze `/app/:moduleId/*` child-route extension as a package-exported `WebModuleRouteRegistration` contract owned by later module-row packages, composed once by the Web host, with placeholder fallbacks using the same seam.
- Revised: removed the long-lived parallel `WebHostCapabilities` assumption and froze shared `ConsoleViewCapabilities` in `@repo/core` as the single public capability surface, with the browser implementation and import/build guard owned by `apps/web`.
- Intentionally not changed: React Router remains the selected browser router, auth/session ownership stays in `@repo/web-auth-device-session`, and the hard constraints against Tauri/native imports in browser-rendered modules remain unchanged.

## Verification Notes

- PASS. Reviewed `6bbbf14`, `18a30c2`, `41db694`, `43989ee`, `6e070fc`, `5c5da73`, and `c8ce390`; commit messages are compliant and the runtime commits stayed within their declared phase or repair intent.
- Re-ran scoped verification: `pnpm --filter @repo/core check-types`, `pnpm --filter @repo/plugin-console check-types`, `pnpm --filter @repo/web check-types`, `pnpm --filter @repo/web exec vitest run src/routes/modules/buildModuleRoutes.test.ts src/host/capabilities.test.ts src/routes/router.integration.test.tsx`, `pnpm --filter @repo/web exec eslint --max-warnings 0 src`, and `pnpm --filter @repo/web build`.
- Browser-safety gate passed: `rg -n "@tauri-apps|tauri://|__TAURI__" apps/web/dist/assets` returned no matches after the fresh build, and `apps/web/src/**` imports only browser-safe `@repo/plugin-console/web` and `@repo/web-auth-device-session/web` entrypoints.
- Local mock-auth seam passed in a real browser engine (`playwright-core` against local Chrome): authenticated `/app/todos/inbox` deep-link stayed stable across reload, `/` ⇄ `/app/todos/inbox` back/forward history resolved correctly, authenticated `/auth/login` redirected into `/app/labels/inbox`, unauthenticated `/app/todos/inbox` redirected to `/auth/login?next=%2Fapp%2Ftodos%2Finbox`, and invoking the unsupported native stub kept the app shell mounted on the same route.
- Residual risk: route-family error boundaries are wired in `apps/web/src/routes/router.tsx` and `RouteErrorBoundary.tsx`, but this pass did not add a dedicated throw-path regression test for each boundary scope.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-22 11:44 PDT | feature-plan (Codex gpt-5.3-codex inline) | Fresh planning pass from the roadmap seed: created the missing Step 0 feature brief, compared current router options with official-source evidence, froze React Router plus route-level error boundaries as the browser host direction, and initialized design/api/test/dev_log for the `apps/web` host-assembly boundary and typed capability-stub contract. | — | feature-review |
| 2026-05-22 11:49 PDT | feature-review (Codex gpt-5.3-codex inline) | Review pass returned REVISE. Router choice and thin-host boundaries are acceptable, but the plan does not yet freeze the module-route registration mechanism or the ownership model for browser host capabilities versus shared Console capabilities, so build would still have to make contract decisions that belong in planning. | — | feature-plan |
| 2026-05-22 11:53 PDT | feature-plan (Codex gpt-5.3-codex inline) | Revise pass: froze package-exported module route registration ownership under a host-composed `/app/:moduleId/*` seam, collapsed the Web-only capability fork back into shared `ConsoleViewCapabilities`, documented the `apps/web` browser-safety guard location, and aligned discovery/design/api/test/dev_log without expanding scope beyond the review blockers. | — | feature-review |
| 2026-05-22 12:00 PDT | feature-review (Codex gpt-5.3-codex inline) | Second review pass APPROVED. Confirmed the revised planning artifacts now freeze one executable module-route registration model and one shared browser-safe capability ownership model, with Phase boundaries and downstream extension rules clear enough for build. | — | feature-build |
| 2026-05-22 12:06 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 1 complete: replaced manual pathname switch with React Router + RouterProvider, introduced `/`, `/auth/*`, `/app/*`, `*` route families, and added scoped route-level error boundaries. | `6bbbf14` | Phase 2 |
| 2026-05-22 12:12 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 2 complete: added shared `WebModuleRouteRegistration` types in `@repo/core`, implemented host module registration/match helpers, redirected `/app` to deterministic default module route, and mounted guarded `/app/:moduleId/*` seam with placeholder module rendering. | `18a30c2` | Phase 3 |
| 2026-05-22 12:16 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Phase 3 complete: extended shared `ConsoleViewCapabilities` with browser-safe methods, added web host capability stubs (download/notification/shortcut/DnD/native unsupported), wired capability injection into app/module placeholders, and enforced `@tauri-apps/*` import blocking for `apps/web/src/**`. | `41db694` | feature-verify |
| 2026-05-22 12:22 PDT | feature-verify (Codex gpt-5.3-codex inline) | Verify pass BLOCKED. Reviewed `6bbbf14`, `18a30c2`, `41db694`, and `43989ee`; commit messages and phase boundaries are acceptable. Ran `pnpm --filter @repo/core check-types`, `pnpm --filter @repo/plugin-console check-types`, `pnpm --filter @repo/web check-types`, `pnpm --filter @repo/web exec vitest run src/routes/modules/buildModuleRoutes.test.ts src/host/capabilities.test.ts`, `pnpm --filter @repo/web exec eslint --max-warnings 0 src`, and `pnpm --filter @repo/web build`; browser-verified `/`, `/auth/login`, and unauthenticated `/app/todos/inbox` redirect via the local Vite host. Blocked because the built web bundle still contains Tauri/native symbols and the current host/docs provide no local mock/authenticated seam to verify `/app/:moduleId/*` module rendering, capability stubs, refresh, and history behavior after guard entry. | — | feature-build |
| 2026-05-22 12:34 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Repair Phase B1 complete: eliminated transitive desktop leakage by introducing browser-safe package entrypoints (`@repo/plugin-console/web`, `@repo/web-auth-device-session/web`), migrating `apps/web` imports, and enforcing restricted root imports in `apps/web` lint rules. Evidence: `pnpm --filter @repo/web build` then `rg -n \"@tauri-apps|tauri://|__TAURI__\" apps/web/dist/assets/index-*.js` returned no matches. | `6e070fc` | Repair B2 |
| 2026-05-22 12:36 PDT | feature-auto-build (Codex gpt-5.3-codex inline) | Repair Phase B2 complete: added local authenticated verify seam via `VITE_WEB_AUTH_MODE=mock-authenticated` in `AppProviders`, added guarded-route integration coverage for deep-link/remount/history-entry routing and unsupported capability-stub interaction, and reran full scoped verification matrix. | `5c5da73` | feature-verify |
| 2026-05-22 12:44 PDT | feature-verify (Codex gpt-5.3-codex inline) | Verify retry PASS. Re-reviewed the full feature commit set through `c8ce390`, reran the scoped typecheck/lint/test/build matrix, confirmed the built bundle contains no transitive Tauri/native symbols, and browser-verified the mock-authenticated plus mock-unauthenticated guard flows, refresh/deep-link/history semantics, and unsupported-capability stub stability. | — | ship |
| 2026-05-22 14:38 PDT | ship (Codex gpt-5.3-codex inline) | Ship gate PASS. Verified `Status=READY_TO_SHIP` and `Suggested Next=ship`, confirmed local feature commits `6bbbf14`..`c8ce390` are complete and commit-message quality matches convention, pushed feature commits to `origin/main`, and reconciled feature #10 roadmap status to `SHIPPED`. | local commits `6bbbf14`..`c8ce390` + ship-state docs commit | workflow complete |
