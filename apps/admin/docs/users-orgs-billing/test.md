# test.md — xai-admin-users-orgs-billing

> Validation strategy / mock strategy / acceptance criteria for wiring the admin **Users / Organizations /
> Billing** pages + graduating their guarded mutations (row #3).
> Runner: Vitest (`pnpm --filter @repo/admin test`). Build gate: `pnpm --filter @repo/admin build` (vite).
> Row #3 is **wiring/contract-only**: every gate is a unit/contract/component test with a **mockable
> transport** — NO server deploy, NO real Stripe, and NO real mutation are required for "green".
> Builds on slice #1's + row #2's + row #5's suites (must remain green + unaffected — last known green
> baseline: **284 passed / 21 files**).

## 0. Acceptance criteria (binary, testable) — derived from manifest row #3 + INTEGRATION_PLAN §2/§4.4

| AC | Criterion | Test(s) | Phase |
|---|---|---|---|
| **AC-1** | Users page reads (`list`/`get`) are bound to the `AdminApiClient` transport via a composed `../adapters` seam; returns are the §1 contract shapes (no fork); reads are no-I/O | `TT-WIRE-USERS-READ`, `TT-READ-NO-IO` | P1 |
| **AC-2** | Users guarded mutations (`banUser`, `bulkBan`) route through RBAC + audit-on-mutation: granted → `applied:false` + resolving `auditId` (exactly one audit event); denied → `forbidden`/`unauthorized` + ZERO append | `TT-CMD-GUARDED-ALLOW-banUser`, `-bulkBan`, `TT-CMD-GUARDED-DENY-banUser`, `-bulkBan`, `TT-CMD-AUDIT-ON-MUTATION-banUser`, `-bulkBan`, `TT-CMD-APPLIED-FALSE` | P1 |
| **AC-3** | Orgs page reads (`list`/`get`) are bound to the `AdminApiClient` transport via a composed `../adapters` seam; returns are the §1 contract shapes | `TT-WIRE-ORGS-READ` | P2 |
| **AC-4** | Orgs guarded `transferOwnership` routes through RBAC (**SUPER-ONLY**) + audit: `super` → `applied:false` + `auditId` (one event); non-`super` → `forbidden` + ZERO append | `TT-CMD-GUARDED-ALLOW-transferOwnership`, `TT-CMD-GUARDED-DENY-transferOwnership`, `TT-CMD-AUDIT-ON-MUTATION-transferOwnership` | P2 |
| **AC-5** | Billing page reads (`metrics`/`planDistribution`/`transactions`) are bound to the `AdminApiClient` transport via a composed `../adapters` seam; **read-only** | `TT-WIRE-BILLING-READ` | P3 |
| **AC-6** | **Stripe gate:** NO billing mutation family exists (no `billing*` in `MutationFamily`/`MUTATION_PERMISSION`/`AdminApiClient` returning `MutationAck`; no billing method on `GuardedCommandAdapter`; `BillingPage` renders no `commands.*`-bound control); `BILLING_MANAGE` stays catalogued-but-unwired | `TT-BILLING-GATE-NO-MUTATION`, `TT-BILLING-KEY-CATALOGUED-UNWIRED` | P3 |
| **AC-7** | Guarded command adapter performs NO network/persistence across reads + mutations (no-write seam); audited mutation `chain.verify()` stays green after N mixed allow/deny | `TT-CMD-NO-IO`, `TT-CMD-CHAIN-AFTER-N` | P1/P2 |
| **AC-8** | Mutations are documented + tested as **server-authoritative; browser advisory** (mock proves the obligation shape; no real write) | `TT-CMD-ADVISORY-NOTE` | P1 |
| **AC-9** | `UsersPage` / `OrgsPage` / `BillingPage` read through `../adapters` (no inline mock; no `../fixtures`); guarded mutation calls fire via `useAdminUi().commands`; Billing has NO mutation control | `TT-WIRE-USERS-PAGE`, `TT-WIRE-ORGS-PAGE`, `TT-WIRE-BILLING-PAGE`, `TT-NO-INLINE-MOCK` | P4 |
| **AC-10** | Slice #1's no-op `mockAdminCommandAdapter` + `TT-CMD-NOOP` are UNCHANGED; the guarded adapter is a NEW injection (additive) | `TT-CMD-NOOP` (slice #1, re-run), `TT-CMD-GUARDED-IS-ADDITIVE` | P1/P4 |
| **AC-11** | No service-role / provider / Stripe secret in admin src or built bundle (carried invariant; covers new modules) | `TT-NO-SECRET-SRC`, `TT-NO-SECRET-BUNDLE` (slice-#1 guards, re-run) | P4 |
| **AC-12** | `apps/admin` builds green + all tests (slice #1 + row #2 + row #5 + row #3) pass; prior behavior unaffected; `@repo/web` build unaffected | `TT-BUILD`, full `vitest run`, `@repo/web` build | P4 |

## 1. Unit / contract coverage

### Composed read seams (`adapters/index.ts` + `adapters/*ReadSeam.test.ts`)
- **TT-WIRE-USERS-READ**: `usersReadSeam.list(query)` and `.get(email)` resolve `AdminApiResult<T>` whose
  `data` matches the slice-#1/row-#2 contract shapes (`UserRow[]` / `UserDetail | null`); the seam calls the
  `AdminApiClient` (`getUsers`/`getUser`) — assert via a spy/stub `AdminApiClient` that the seam delegates to
  it (no direct fixture read); data equals the fixture-backed mock result.
- **TT-WIRE-ORGS-READ**: `orgsReadSeam.list()` / `.get(name)` resolve `AdminApiResult<OrgRow[]>` /
  `<OrgDetail | null>` via the `AdminApiClient` (`getOrgs`/`getOrg`); shapes = contract.
- **TT-WIRE-BILLING-READ**: `billingReadSeam.metrics()`/`.planDistribution()`/`.transactions()` resolve
  `AdminApiResult<BillingMetrics>`/`<PlanShare[]>`/`<TxnRow[]>` via the `AdminApiClient`
  (`getBillingMetrics`/`getPlanDistribution`/`getTransactions`); read-only (the seam exposes no mutation).
- **TT-READ-NO-IO**: spies on `fetch` + `Storage.prototype.setItem` assert the read seams perform NO
  network/persistence (the mock transport is fixture-only).

### Guarded command adapter (`adapters/guardedCommands.ts` + `guardedCommands.test.ts`)
- **TT-CMD-GUARDED-ALLOW-<family>** (×3 — `banUser`, `bulkBan`, `transferOwnership`): with a **granted** role
  (`ops` for ban/bulk-ban; `super` for transfer), the method returns `{ ok:true, data:{ applied:false,
  auditId } }` and the backing chain length grows by exactly 1.
- **TT-CMD-GUARDED-DENY-<family>** (×3 — **mandatory negatives**): with a role that lacks the family's key
  (and the no-role path) the method returns `{ ok:false, error:{ code:"forbidden" } }` (or `"unauthorized"`
  for no role) and the chain length is UNCHANGED (ZERO append). Specifically: `support`/`finance`/`audit`
  cannot `banUser`/`bulkBan`; **non-`super` (`ops`/`support`/`finance`/`audit`) cannot `transferOwnership`**
  (REC-1 SUPER-ONLY).
- **TT-CMD-AUDIT-ON-MUTATION-<family>** (×3): a granted call appends exactly one `AdminAuditEvent` whose
  `mutationFamily === family`, `permissionKey === MUTATION_PERMISSION[family]`, `result === "ok"`, `target`
  derived from the input.
- **TT-CMD-APPLIED-FALSE**: every granted family returns `applied:false` (NO real write this row) while
  `auditId` is set (audit recorded → row #2 obligation fulfilled).
- **TT-CMD-CHAIN-AFTER-N**: after a mixed sequence of N granted + denied guarded calls, `chain.verify()` is
  green and chain length === number of **granted** calls (denials did not append).
- **TT-CMD-NO-IO**: spies on `fetch` + `Storage.prototype.setItem` assert the guarded adapter performs NO
  network/persistence across allow + deny (no-write seam; mirrors row #5 `TT-AUDIT-NO-IO`).
- **TT-CMD-ADVISORY-NOTE**: a doc/source-presence assertion that `guardedCommands.ts` + this api.md document
  the browser path as the **contract/mock** obligation and name the **server** as the real enforcer
  (privileged op + audit append in one transaction) — guards R1 from regressing into browser-as-boundary.
- **TT-CMD-GUARDED-IS-ADDITIVE**: assert slice #1's `mockAdminCommandAdapter` still exists and returns
  `NoOpResult` (`{ ok:true, noop:true, reason:"slice-1-mock-no-write" }`) UNCHANGED; the guarded adapter is a
  distinct export returning `AdminApiResult<MutationAck>`.
- **TT-CMD-NO-BILLING-FAMILY** (part of the gate, see below): the `GuardedCommandAdapter` exposes no billing
  method.

### Stripe gate (`adapters/billingReadSeam.test.ts` / a dedicated gate test)
- **TT-BILLING-GATE-NO-MUTATION** (AC-6, **hard gate**):
  - `MutationFamily` (= `keyof AdminCommandAdapter`) has NO member matching `/billing/i`.
  - `MUTATION_PERMISSION` has no key whose family or value involves billing mutation (its only billing-related
    key, `BILLING_MANAGE`, is NOT mapped from any mutation family).
  - `AdminApiClient` exposes no method returning `Promise<AdminApiResult<MutationAck>>` whose name involves
    billing (structural/type-level check; the 6 mutation methods are the fixed allowlist).
  - `GuardedCommandAdapter` has no billing method.
  - `BillingPage` (rendered) contains no element wired to a `commands.*` call (no confirm/mutation affordance).
- **TT-BILLING-KEY-CATALOGUED-UNWIRED**: `PERMISSION_KEYS.BILLING_MANAGE === "admin.billing.manage"` still
  present in the catalog (append-only, row #2) AND not referenced by any `MUTATION_PERMISSION` value — i.e.
  catalogued but unwired to a mutation this row.

## 2. Component / page wiring coverage (P4) — `pages/wiring.users-orgs-billing.test.tsx`
- **TT-WIRE-USERS-PAGE**: `UsersPage` renders rows obtained through the composed `../adapters` read seam (no
  inline mock); invoking the ban / bulk-ban confirm flow fires `useAdminUi().commands.banUser` /
  `.bulkBan` (assert via a spy guarded adapter in the provider) — the call path reaches the guarded adapter.
- **TT-WIRE-ORGS-PAGE**: `OrgsPage` renders rows through the `../adapters` read seam; the transfer-ownership
  confirm flow fires `commands.transferOwnership`.
- **TT-WIRE-BILLING-PAGE**: `BillingPage` renders metrics/plan-distribution/transactions through the
  `../adapters` read seam and contains **NO** mutation control (no button bound to `commands.*`).
- **TT-NO-INLINE-MOCK** (carried, AC-9): every `src/pages/*.tsx` imports from `../adapters` and NOT from
  `../fixtures`; `files.length === 10` (unchanged). **Add to the P4 gate** (R4 mitigation — same precaution
  row #5 R-1 flagged). The three wired pages must keep their `../adapters` import and must NOT import the
  guarded/audited/mock client directly.

> Note on async + RTL: the read seams are async (`AdminApiResult` Promises). The page wiring tests use
> `findBy*`/`await waitFor` to assert rows render after the seam resolves. Keep the mock transport
> synchronous-resolving (microtask) so tests stay fast and deterministic (mirrors slice #1's smoke timing;
> avoid the known slice #1 `pages.smoke` users-flake by not over-parallelizing heavy renders).

## 3. Contract / source-text guard coverage (carried from slice #1; covers new modules)
- **TT-NO-SECRET-SRC**: slice #1's `apps/admin/src/__tests__/no-secret.test.ts` scans **all** of
  `apps/admin/src/**` (already matches `sk_test_`/`sk_live_`/service-role) — the new `adapters/` modules +
  wired pages are covered automatically. Re-run; must stay green.
- **TT-NO-SECRET-BUNDLE**: slice #1's self-building `dist/**` guard — the new modules' compiled output is
  covered. Re-run; must stay green. (This is the structural enforcement that the browser holds no Stripe
  secret — the Stripe gate's security half.)
- **TT-CSP-GUARD**: unchanged (no `_headers` change this row); re-run to confirm no regression.

## 4. Mock strategy (Typed Contract Mock — recap + extension)
- **The interface is the seam.** Row #3 adds: composed **read seams** over row #2's `AdminApiClient` mock,
  and a **guarded command adapter** over row #5's `createAuditedMockAdminApiClient`. Tests target the
  *interface/contract* so the later real-server swap inherits the same test surface.
- **No real server, no real Stripe, no real mutation, no real audit store** in any test. The mock transport
  is fixture-only + no-I/O; guarded mutations are `applied:false` with an in-memory audit chain. RBAC + the
  permission catalog are pure data + pure functions (row #2).
- **Role context is explicit in tests** (not env): construct `createGuardedCommandAdapter({ role })` /
  `createAuditedMockAdminApiClient({ role })` per case to cover allow AND deny for all three families.
- **Fixtures** reused from slice #1 (`USERS`, `ORGS`, `BILLING*`) via the `AdminApiClient` mock — no new
  fixtures with secret-shaped strings; billing fixtures stay display-only.
- **Page tests** inject a **spy guarded adapter** through a test `AdminUiProvider` (or a prop seam) so the
  call path page→`commands.*`→guarded adapter is observable without real effects.

## 5. Build / regression
- **TT-BUILD**: `pnpm --filter @repo/admin build` exits 0; `dist/` produced; no `.map` emitted (slice-#1
  `sourcemap:false` retained).
- **Full suite**: `pnpm --filter @repo/admin test` → slice #1 + row #2 + row #5 (**284 baseline**) + row #3's
  new tests all pass. Slice #1 `adapters.test.ts` (18) + `TT-CMD-NOOP` + `pages.smoke` (11), row #2
  `adminApi.test.ts` (14), row #5 `auditedMutation.test.ts` + `wiring.test.tsx` must stay green.
- **Regression boundary**: `pnpm --filter @repo/web build` green + unaffected (admin is a separate app; row
  #3 adds no shared module; no `@repo/web-auth-device-session` / `@repo/audit-log-integrity` change).
- **`tsc --noEmit`**: clean (the read seams + guarded adapter + `AdminUiContext` change + page wiring all
  compile; the `GuardedCommandAdapter` type is distinct from slice #1's `AdminCommandAdapter`).
- **Known flake (carried, non-blocking):** slice #1's `pages.smoke.test.tsx > 用户管理 (users)` can time out
  under heavy parallel load (5s default) — pre-existing slice #1 behavior, not row #3; re-run isolated if hit.

## 6. Out of scope for row #3 tests (deferred by row — explicit)
- Real service-role Users/Orgs read endpoints + real ban/transfer effects (server performs the privileged op
  + audit append in one transaction) → the real transport behind these interfaces, later rows. Row #3 tests
  the composed seam + audited mock only; mutations are `applied:false`.
- **Real webhook-backed Stripe state + admin billing mutations** (idempotent `event.id`-UNIQUE event store +
  Stripe mirror + reconciliation + server RBAC + audit) → a later row, only after a server line is
  authorized. Row #3 tests the gate's **absence-of-mutation** + secret-free bundle, NOT a billing write.
- Wiring of `setFeatureRollout` / `setProviderRouting` / `setQuota` to UI (Feature/Provider/AI pages) →
  **row #4**. Row #3 surfaces only the three Users/Orgs families on the guarded adapter.
- Real admin-claim negative tests against a production JWT hook (live claim key) → finalized when a real
  backend lands (row #2 OQ-C). Row #3 uses the mock role context.
- Two-device / cross-device sync of any admin user/org/billing read model → ADR-0013 §D4 / PAUSED `sync` line
  — **never** in this row (no `syncScope` entity).
- Manual browser smoke (tables/filters/drawers/type-to-confirm/focus/mobile) → re-smoke the three wired pages
  only (Users ban+bulk-ban confirm, Orgs transfer confirm, Billing read-only) on real hardware before ship.
