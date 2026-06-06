# test.md — xai-admin-data-contracts-rbac

> Validation strategy / mock strategy / acceptance criteria for the admin data + permission layer (row #2).
> Runner: Vitest (`pnpm --filter @repo/admin test`). Build gate: `pnpm --filter @repo/admin build` (vite).
> Row #2 is **contract-only**: every gate is a unit/contract test with a **mockable transport** — NO server
> deploy is required for "green". Builds on slice #1's test suite (must remain green + unaffected).

## 0. Acceptance criteria (binary, testable) — derived from manifest row #2 + INTEGRATION_PLAN §2–§4

| AC | Criterion | Test(s) | Phase |
|---|---|---|---|
| **AC-1** | Admin read models are formalized as a canonical, stable contract; every page's read model is annotated live/mock/deferred | `TT-READMODEL-CONTRACT`, `TT-READMODEL-ANNOTATION` | P1 |
| **AC-2** | An immutable, append-only set of admin permission keys exists; keys are unique, pattern-valid, and never reused | `TT-PERMKEY-UNIQUE`, `TT-PERMKEY-PATTERN`, `TT-PERMKEY-APPEND-ONLY` | P2 |
| **AC-3** | Every mutation family maps to exactly one permission key | `TT-PERMKEY-MUTATION-COVERAGE` | P2 |
| **AC-4** | RBAC role×permission model + predicate with **allow/deny tests for every mutation family** | `TT-RBAC-ALLOW-<family>` + `TT-RBAC-DENY-<family>` (×6), `TT-RBAC-READ-GRANTS` | P3 |
| **AC-5** | RBAC is server-enforceable; browser predicate documented + tested as **advisory only** (fail-closed) | `TT-RBAC-FAILCLOSED`, `TT-RBAC-ADVISORY-NOTE` | P3 |
| **AC-6** | Admin API boundary is a typed contract (reads + 6 mutations) with **fail-closed** error semantics and a **server-authoritative** rule, exercised via a **mock transport** (no server) | `TT-API-CONTRACT-SHAPE`, `TT-API-FAILCLOSED`, `TT-API-SERVER-AUTHORITATIVE` | P4 |
| **AC-7** | No service-role token / provider secret in admin src or built bundle (carried invariant; covers new modules) | `TT-NO-SECRET-SRC`, `TT-NO-SECRET-BUNDLE` (slice-#1 guards, re-run) | P4 |
| **AC-8** | `apps/admin` builds green + all tests (slice #1 + row #2) pass; slice #1 behavior unaffected | `TT-BUILD`, full `vitest run` | P4 |

## 1. Unit coverage

### Permission keys (`authz/permissionKeys.ts`)
- **TT-PERMKEY-UNIQUE**: all `PERMISSION_KEYS` values are distinct (no duplicate string).
- **TT-PERMKEY-PATTERN**: every value matches `^admin\.[a-z_]+(\.[a-z_]+)*$` (dotted, namespaced, lowercase).
- **TT-PERMKEY-MUTATION-COVERAGE**: `MUTATION_PERMISSION` has an entry for **every** `MutationFamily`
  (`banUser, bulkBan, setFeatureRollout, transferOwnership, setProviderRouting, setQuota`), each value is a
  member of `PERMISSION_KEYS`, and the set of `MutationFamily` keys exactly equals `keyof AdminCommandAdapter`.
- **TT-PERMKEY-APPEND-ONLY**: a frozen snapshot (inline expected array) asserts the current key set is a
  **superset** of the snapshot (keys may be added, never removed/renamed) + a documented append-only rule;
  catalog is `as const` (compile-time readonly).

### RBAC (`authz/rbac.ts`)
- **TT-RBAC-READ-GRANTS**: `audit` role can `VIEW_DASHBOARD` + `VIEW_AUDIT` and **cannot** `USER_BAN` /
  `FEATURE_ROLLOUT` / `BILLING_MANAGE` (read-only role proven). `super` has every key.
- **TT-RBAC-ALLOW-<family>** (×6) — for each mutation family, the role(s) granted in the prototype matrix
  return `canMutate(role, family) === true`:
  - `banUser`/`bulkBan` → `super`, `ops` allow.
  - `setFeatureRollout` → `super`, `ops` allow.
  - `setQuota` → `super`, `ops` allow.
  - `transferOwnership` → `super` allow (+ any org-owner role per normalized matrix).
  - `setProviderRouting` → `super` allow.
- **TT-RBAC-DENY-<family>** (×6) — for each mutation family, at least one role that is **not** granted returns
  `false` (e.g. `support`/`finance`/`audit` cannot `banUser`; `ops`/`support`/`finance`/`audit` cannot
  `setProviderRouting`; non-finance cannot `BILLING_MANAGE`). **Mandatory negatives.**
- **TT-RBAC-FAILCLOSED**: `can(null, key)` and `can(undefined, key)` → `false`; `canMutate(null, family)` →
  `false`. Predicate never throws on unknown role.
- **TT-RBAC-ADVISORY-NOTE**: an assertion/doc-test that the predicate module + `api.md` document the browser
  check as **advisory only** and name the server as authoritative (guards R1 from regressing into
  browser-as-boundary). Implemented as a source-text/doc presence check on the documented invariant.

### Read-model contract (`contracts/readModels.ts`)
- **TT-READMODEL-CONTRACT**: the canonical contract surfaces all **10** read models
  (`Overview/Users/Orgs/Features/AiUsage/Providers/Roles/Billing/Audit/Settings` + `AdminReadModels`) and is
  the **same type** as slice #1's `adapters/types.ts` (stability: a type-level + structural check that the
  contract re-exports, not re-declares — e.g. `adminReadModels` still satisfies the canonical `AdminReadModels`).
- **TT-READMODEL-ANNOTATION**: the live/mock/deferred table in `api.md` covers **exactly** the 10 page read
  models (no page missing, none extra); structural check that each read-model key has a target-row annotation.

### Admin API boundary (`contracts/adminApi.ts`)
- **TT-API-CONTRACT-SHAPE**: `AdminApiClient` exposes a read method per page read model + the **6** mutation
  methods whose inputs match slice #1's command-adapter inputs; `AdminApiResult<T>` is the discriminated
  `ok:true|false` union; `AdminApiError.code` is the documented union.
- **TT-API-FAILCLOSED**: `createMockAdminApiClient()` (no role) → every mutation returns
  `{ ok:false, error:{ code:"forbidden" } }` (or `unauthorized` for the no-session path); reads succeed but
  carry only fixture data. With `ctx.role:"audit"` → `banUser` still `forbidden`.
- **TT-API-SERVER-AUTHORITATIVE**: with `ctx.role:"super"`, a granted mutation returns
  `{ ok:true, data:{ applied:false } }` and performs **no** write/network/persistence (spy assertions on
  `fetch`/storage) — proving the mock is a **no-write seam** AND that the *contract* (doc + types) names the
  server as the authoritative re-checker (the browser path alone never applies an effect).

### Command-family ↔ mock-API delegation (boundary check)
- **TT-CMD-DELEGATION (optional/REC):** if slice #1's `mockAdminCommandAdapter` is rewired to delegate to the
  mock `AdminApiClient`, assert it still satisfies slice #1's `TT-CMD-NOOP` (returns no-write result). If not
  rewired this row, this test is deferred — record the choice. (Keeps slice-#1's AC-4 intact either way.)

## 2. Contract / source-text guard coverage (carried from slice #1; covers new modules)

- **TT-NO-SECRET-SRC**: slice #1's `apps/admin/src/__tests__/no-secret.test.ts` scans **all** of
  `apps/admin/src/**` — the new `authz/`+`contracts/` modules are covered automatically. Re-run; must stay green.
- **TT-NO-SECRET-BUNDLE**: slice #1's `apps/admin/src/__tests__/no-secret-bundle.test.ts` (self-building)
  scans `dist/**` — the new modules' compiled output is covered. Re-run; must stay green.
- **TT-CSP-GUARD**: unchanged (no `_headers` change this row); re-run to confirm no regression.

## 3. Mock strategy (Typed Contract Mock — recap + extension)

- **The interface is the seam.** Row #2 promotes the read-model interfaces to the canonical contract and adds
  two new seams: the **permission-key catalog/RBAC predicate** (pure, no transport) and the **`AdminApiClient`
  transport** (mock impl now; real service-role-API impl in rows #3–#5). Tests target the *interface contract*
  so later swaps inherit the same test surface.
- **No real server, no real auth secret, no real mutation** in any test. The mock `AdminApiClient` fails
  closed and performs no I/O. Permission keys/RBAC are pure data + pure functions.
- **Fixtures** reused from slice #1 (`apps/admin/src/fixtures`) for read methods; **no new fixtures with
  secret-shaped strings** (providers stay key-status-only).

## 4. Build / regression

- **TT-BUILD**: `pnpm --filter @repo/admin build` exits 0; `dist/` produced; no `.map` emitted (slice-#1
  `sourcemap:false` retained).
- **Full suite**: `pnpm --filter @repo/admin test` → slice #1's 96 tests + row #2's new tests all pass.
- **Regression boundary**: `pnpm --filter @repo/web build` green + unaffected (admin is a separate app; row #2
  adds no shared module). No `@repo/web-auth-device-session` change → that package's tests unaffected.
- **`tsc --noEmit`**: clean (the canonical contract + `as const` catalog + predicate types all compile).

## 5. Out of scope for row #2 tests (deferred by row — explicit)

- Real service-role API integration test (real JWT → server authz → DB) → rows #3–#5 (when a real transport lands).
- Audit-append-on-mutation integration test → **row #5** (row #2 only types `MutationAck.auditId` as the obligation).
- Real Stripe webhook billing state → **row #3**. Real provider secret-handle/RLS boundary → **row #4**.
- Real admin-claim negative tests against a production JWT hook (live claim key) → finalized when a real
  backend lands (OQ-C). Row #2 tests the predicate **seam** + placeholder claim key only.
- Two-device / cross-device sync of any admin read model → ADR-0013 §D4 / PAUSED `sync` line — **never** in
  this row (no `syncScope` entity added).
- Manual browser smoke (tables/filters/drawers/type-to-confirm/focus/mobile) → unchanged from slice #1;
  row #2 adds no new page, so re-smoke only if a page derives its display from the new authz catalog (§api 4.4).
