# test.md — xai-admin-dashboard-shell

> Validation strategy / mock strategy / acceptance criteria for the isolated admin surface (slice #1).
> Runner: Vitest (`pnpm --filter @repo/admin test`). Build gate: `pnpm --filter @repo/admin build` (vite).
> Cross-vendor manual browser smoke: per roadmap manifest "Browser smoke" gate (tables/filters/drawers/
> dialogs/type-to-confirm/focus traps/mobile) — collected at `feature-verify`.

## 1. Acceptance criteria → test mapping (binary, testable)

| AC | Criterion (from brief) | Test(s) |
|---|---|---|
| AC-1 | Non-admin authenticated user cannot load any `apps/admin` route; admin-claim user can | TT-GUARD-DENY (negative), TT-GUARD-ALLOW (positive), TT-GUARD-LOADING, TT-GUARD-UNAUTH |
| AC-2 | All 10 pages render via a typed mock adapter / read-model interface (no inline mock globals) | TT-ADAPTER-* (one per page) + TT-NO-INLINE-MOCK (source-text: pages import from `adapters/`, no inline fixture literals) |
| AC-3 | No service-role token / provider secret in the built admin bundle | TT-NO-SECRET-SRC (source-text over `src/`), TT-NO-SECRET-BUNDLE (source-text over `dist/` after build) |
| AC-4 | No production write from any admin action; destructive UI = no-op mock | TT-CMD-NOOP (every command adapter returns `{ok,noop}` and performs no write), TT-CONFIRM-RENDERS (type-to-confirm UI present) |
| AC-5 | `apps/admin` builds + deploys on its own target with independent CSP/env/deploy | TT-CSP-GUARD (admin `_headers` source-text), TT-BUILD (vite build green), config review: own `wrangler.toml` + `_headers`, not in `apps/web` rail |
| AC-6 | Unit tests for every adapter + the admin-claim predicate; vite build + vitest green | TT-PREDICATE-*, TT-ADAPTER-* + green CI |

## 2. Unit coverage

### Admin-claim predicate (`adminClaim.ts`)
- **TT-PREDICATE-NULL**: `predicate(null)` → `{ isAdmin: false }` (fail closed). MANDATORY negative.
- **TT-PREDICATE-NON-ADMIN**: session present, no admin marker → `{ isAdmin: false }`. MANDATORY negative.
- **TT-PREDICATE-ADMIN**: session present with admin marker → `{ isAdmin: true }`. Positive.
- **TT-PREDICATE-NO-THROW**: never throws on malformed session; always returns defined `AdminClaim`.
- **TT-PREDICATE-PURE**: no network / no storage side effects (spy assertions).

### Route guard (`resolveAdminRouteGuard` / `AdminRouteGate`)
- **TT-GUARD-LOADING**: `state="loading"` → `{ allow: false }`, no redirect.
- **TT-GUARD-UNAUTH**: `state="unauthenticated"` → `{ allow:false, redirectTo:"/auth/login?next=...", reason:"auth_required" }`.
- **TT-GUARD-DENY**: authenticated + `isAdmin:false` → `{ allow:false, redirectTo:"/forbidden", reason:"not_admin" }`. **Core negative test (AC-1).**
- **TT-GUARD-ALLOW**: authenticated + `isAdmin:true` → `{ allow:true }`. **Core positive test (AC-1).**
- Component-level: `AdminRouteGate` renders children only when allowed; renders fallback + fires `navigate` otherwise (Testing Library).

### Read-model adapters (one per page, 10 pages)
- **TT-ADAPTER-OVERVIEW / USERS / ORGS / FEATURES / AI / PROVIDERS / ROLES / BILLING / AUDIT / SETTINGS**:
  each mock adapter returns typed, non-empty fixture data matching its read-model interface; shape
  assertions (types compile + runtime field presence); filters/saved-views/queries return expected
  subsets (e.g. Users `list(query)` filters by status/plan/over-quota chip predicates ported from prototype).
- **TT-PROVIDERS-NO-KEY**: ProvidersReadModel exposes key **status** only — assert no field carries key
  material / no secret-shaped string in provider fixtures.

### Command adapters (no-op)
- **TT-CMD-NOOP**: each of `banUser / bulkBan / setFeatureRollout / transferOwnership / setProviderRouting /
  setQuota` resolves `{ ok:true, noop:true, reason:"slice-1-mock-no-write" }` and triggers no write/network
  (spy assertions on any storage/fetch).

## 3. Contract / source-text guard coverage

- **TT-NO-INLINE-MOCK**: source-text scan of `src/pages/**` asserts pages import from `../adapters` and
  contain no inline mock data arrays (enforces AC-2 "no inline mock globals").
- **TT-NO-SECRET-SRC**: source-text scan of `apps/admin/src/**` asserts no `sk_`/service-role/`SUPABASE_SERVICE_ROLE`/
  provider-key-shaped literals (mirrors the `apps/web` `no-stripe-secret-key.test.ts` precedent).
- **TT-NO-SECRET-BUNDLE**: after `vite build`, source-text scan of `apps/admin/dist/**` (`.js`/`.css`/
  `.html`) asserts no service-role / provider-secret / Stripe-secret / provider-key-shaped / masked-key
  literal is present (enforces AC-3 — the build-output guard). The guard is **self-building** (runs
  `vite build` in a `beforeAll` if `dist/` is absent, so a fresh checkout / CI-before-build still scans a
  real bundle). **P5 hardening:** the admin production build sets `sourcemap: false` (was `"hidden"`) so no
  `.map` artifact is emitted — a sourcemap would embed full original source (comments / fixtures / the
  guard's own pattern strings) and be publicly fetchable from the admin Cloudflare Pages origin even when
  unreferenced. Removing it eliminates that disclosure surface and lets the guard scan `dist/**` uniformly.
- **TT-CSP-GUARD**: source-text scan of `apps/admin/public/_headers` asserts the CSP is present, is
  fail-tight (`connect-src` limited to `'self'` + at most the Supabase session host), and carries the
  ADR-0008-parity non-CSP headers (HSTS/nosniff/DENY/Referrer/Permissions). Cloned from
  `apps/web/src/__tests__/csp.test.ts` pattern. Binding precedent for future admin `_headers` extensions.

## 4. Mock strategy (Typed Contract Mock — recap)

- The **interface is the seam**; the mock adapter is one implementation. Tests target the interface
  contract so row #2–#5 swaps (mock → contract-backed service) inherit the same test surface.
- Fixtures are **typed exports** ported from the prototype's inline `const` arrays
  (`USERS`, `FEATURES`, `VIEWS`, provider cards, RBAC matrix, transactions, audit rows, settings, KPI/ops-queue).
- **No production data, no network, no real auth secret** in any test or fixture.

## 5. Build / E2E / regression

- **TT-BUILD**: `pnpm --filter @repo/admin build` exits 0; `dist/` produced; nonce placeholder (if cloned
  from apps/web) stripped from `dist/index.html`.
- **Manual browser smoke (feature-verify gate)**: all 10 pages reachable behind the guard; dense tables
  scroll/filter; user-detail drawer ↔ full-page; type-to-confirm modal unlocks on exact word; focus trap;
  mobile/responsive layout. Recorded at `feature-verify` per roadmap "Browser smoke" gate (cross-vendor: yes).
- **Regression boundary**: building/running `apps/admin` does NOT affect `apps/web` (separate Vite app /
  Pages project); a smoke check confirms `apps/web` build is unchanged (no shared module rail).

## 6. Out of scope for slice #1 tests (deferred by row)

- RBAC allow/deny permission-key tests for every mutation family → row #2.
- Audit-append-on-mutation integration test → row #5.
- Real Stripe webhook billing state → row #3.
- Server-side provider secret-handle boundary (RLS/service-role) → row #4.
- Real admin-claim source negative tests against the production claim → row #2.
