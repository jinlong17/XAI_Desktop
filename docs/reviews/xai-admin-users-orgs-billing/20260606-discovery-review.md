# Discovery Review — xai-admin-users-orgs-billing (roadmap row #3 of 6)

> Human-review doc. Discovery detail lives HERE, not in `design.md` (design.md = decision snapshot only).
> Roadmap: `docs/workflow/roadmap/xai-admin-dashboard-system-integration.md` row **#3**.
> Surface: `apps/admin/` (the SHIPPED isolated Web-line app — slice #1 + row #2 + row #5 all SHIPPED).
> Date: 2026-06-06 · v1 (discovery) · Executor: claude-opus-4-8 (feature-plan)

---

## 1. Problem framing

Manifest row #3 (`xai-admin-users-orgs-billing`, hard-dep on row #2 = SHIPPED):

> "Connect Users, Organizations, and Billing pages to typed adapters/endpoints. Keep billing
> mutations gated until webhook-backed Stripe state exists."

INTEGRATION_PLAN §2 (the three target rows) + §4.4 (guarded mutations) refine this into three jobs:

1. **Wire the three read-heavy pages to typed read-model adapters.** Today `UsersPage` /
   `OrgsPage` / `BillingPage` already read through slice #1's mock adapters (`usersAdapter` /
   `orgsAdapter` / `billingAdapter`) — but those adapters bypass the row #2 **`AdminApiClient`
   transport seam** (the contract rows #3–#5 must implement against). Row #3 formalizes the
   read-model contracts these pages consume **through the `AdminApiClient` async boundary**,
   backed by a mock adapter (the `../adapters` seam), so the swap-to-real-server later is an
   implementation change, not a UI change. `TT-NO-INLINE-MOCK` stays green (pages keep importing
   `../adapters`).

2. **Graduate the guarded mutation families for these pages from no-op to RBAC+audit-gated mock.**
   The three page-relevant destructive actions — `banUser`, `bulkBan` (Users) and
   `transferOwnership` (Orgs) — are currently wired to slice #1's **no-op** `mockAdminCommandAdapter`
   (`{ ok:true, noop:true }`, no RBAC, no audit). Row #3 routes them through row #5's
   **`createAuditedMockAdminApiClient`**, which already chains row #2's `canMutate` (RBAC allow/deny)
   + row #5's `appendThenAck` (audit-on-mutation → `{ applied:false, auditId }`). This is exactly the
   rewire that **row #2 OQ-F and row #5 OQ-G explicitly deferred "to row #3"**. Still NO real write
   (`applied:false`); browser advisory, server-authoritative.

3. **Document + structurally enforce the Stripe gate.** Billing write operations stay **gated behind
   "webhook-backed Stripe state"** — which does NOT exist. So billing is **read-only** this slice
   (the `BillingPage` displays metrics/plan-distribution/transactions via a mock adapter through the
   `AdminApiClient` read boundary), and **no billing mutation family is added** to `AdminApiClient` /
   `MutationFamily` this row. The gate is documented as a frozen deferral with a clear "what must
   exist before a billing mutation may be minted" precondition.

### Why this is a Fresh plan (not Continue/Revise/Increment)

Verified on disk: no `docs/reviews/xai-admin-users-orgs-billing/` and no
`apps/admin/docs/users-orgs-billing/` existed before this run; no `_intake/` brief for this slug.
Requirement delivered inline as manifest row #3. Hard dep row #2 = SHIPPED
(`apps/admin/docs/data-contracts-rbac/dev_log.md` Status = SHIPPED); rows #1 + #5 also SHIPPED
(`apps/admin/docs/dev_log.md`, `apps/admin/docs/audit-ops-queue/dev_log.md`). Both #2 and #5 dev_logs
record `Suggested Next = feature-plan (row #3 xai-admin-users-orgs-billing)`. Operator activated the
whole admin line 2026-06-06 and instructed: **plan row #3 ONLY** (preserve manifest dep order for #4/#6).

---

## 2. Ground-truth inventory (what is already SHIPPED that row #3 builds on)

Read directly from source, not docs:

| Asset | Path | Role for row #3 |
|---|---|---|
| Read-model interfaces (10) | `apps/admin/src/adapters/types.ts` | `UsersReadModel` / `OrgsReadModel` / `BillingReadModel` are the three contracts row #3 formalizes through the API boundary |
| Mock read adapters | `apps/admin/src/adapters/index.ts` | `usersAdapter` / `orgsAdapter` / `billingAdapter` (fixture-backed, pure); row #5 added composed seams (`opsQueueReadModel`, `auditChainReadModel`) here as the precedent wiring pattern |
| Canonical read-model contract | `apps/admin/src/contracts/readModels.ts` (row #2) | re-export single source; row #3 binds the three pages' reads to these exact types (no fork) |
| Typed transport seam | `apps/admin/src/contracts/adminApi.ts` (row #2) | `AdminApiClient` (18 reads + 6 mutations) + `createMockAdminApiClient(ctx)`; reads return §2 contract shapes; mutations `{ applied:false }` server-shaped allow/deny |
| Permission keys + RBAC | `apps/admin/src/authz/{permissionKeys,rbac}.ts` (row #2) | `MUTATION_PERMISSION` (banUser/bulkBan→`USER_BAN`; transferOwnership→`ORG_TRANSFER_OWNER` super-only) + `canMutate` (advisory). `BILLING_MANAGE` key EXISTS but has NO mutation family. |
| Audited mock client | `apps/admin/src/audit/auditedMutation.ts` (row #5) | `createAuditedMockAdminApiClient(ctx)` → `{ client, chain }`; granted mutation `appendThenAck` (audit event + `auditId`, `applied:false`); denied → ZERO append. The exact seam row #3 routes page mutations through. |
| Pages (wiring targets) | `apps/admin/src/pages/{UsersPage,OrgsPage,BillingPage}.tsx` | already read through `../adapters`; Users/Orgs call `commands.*` from `useAdminUi()`; Billing is display-only |
| UI service context | `apps/admin/src/components/AdminUiContext.tsx` | injects `commands: mockAdminCommandAdapter` (slice #1 no-op) — **this injection is what row #3 graduates** |
| No-op command adapter | `apps/admin/src/adapters/commands.ts` | slice #1 `mockAdminCommandAdapter` (`NoOpResult`); row #2 OQ-F / row #5 OQ-G deferred its rewire to **row #3** |
| Carried guards | `apps/admin/src/__tests__/{no-inline-mock,no-secret,no-secret-bundle,csp}.test.ts` | `TT-NO-INLINE-MOCK` (pages import `../adapters`, never `../fixtures`, 10 pages); `TT-NO-SECRET-SRC/BUNDLE` already guard `sk_test_`/`sk_live_`/service-role over all of `src/`+`dist/` |

**Critical seam fact:** `AdminUiContext` currently does `commands: mockAdminCommandAdapter`. Row #3's
mutation graduation is a **single injection swap** there (no-op adapter → an adapter that delegates to
`createAuditedMockAdminApiClient`), plus exposing that audited client through `../adapters` so the seam
stays consistent with the row #5 precedent. No page structural rewrite required for mutations — the
pages already call `commands.banUser` / `commands.bulkBan` / `commands.transferOwnership`.

---

## 3. The Stripe-gate question (the row's distinctive constraint)

### Candidate options for "how to handle billing mutations this slice"

- **Option S1 — Mint a `setPlan` / billing mutation family now, mock it `applied:false` like the
  others.** Rejected. The manifest is explicit: "Keep billing mutations gated until webhook-backed
  Stripe state exists." Minting a billing mutation family (even mock) would (a) imply a billing write
  path is contractually available, (b) require a billing permission→family map entry that downstream
  rows would bind to before the real state machine is designed, and (c) violate the manifest
  Implementation-Order rule "add mutation flows only when the [backing] contract is covered". The
  append-only permission catalog (row #2 D2) means a prematurely-shaped billing family is hard to walk
  back.

- **Option S2 — Billing is READ-ONLY this slice; NO billing mutation family is added; the gate is a
  documented, tested deferral.** **SELECTED.** `BillingPage` displays MRR/ARPPU/plan-distribution/
  transactions through the `AdminApiClient` read boundary (mock-backed). No `billing*` method joins
  `AdminApiClient`; no `billing*` family joins `MutationFamily`/`MUTATION_PERMISSION`. The
  `BILLING_MANAGE` permission key (already in the row #2 catalog, super+finance) stays a **catalogued-
  but-unwired** capability — present for the future, with zero mutation surface today. A guard test
  asserts no billing mutation family exists, so the gate cannot silently regress.

- **Option S3 — Render a disabled "manage billing" affordance gated on `can(role, BILLING_MANAGE)`.**
  Deferred (optional, non-blocking). A *disabled, non-functional* button gated on the existing
  `BILLING_MANAGE` advisory predicate is defensible as a UX placeholder, but it risks implying a
  mutation exists. If included at all, it must be inert (no `commands.*` call, no `AdminApiClient`
  method) and clearly labelled "requires webhook-backed Stripe state (deferred)". Default recommendation:
  **do NOT add it**; keep Billing strictly read-only. Recorded as a build-time OQ.

### Web research — why the gate is correct (not just process ceremony)

Searched current (2026) Stripe billing-architecture guidance to confirm the gate reflects a real
engineering constraint, not bureaucracy. Findings (sources below):

- **Stripe is the source of truth for billing/subscription state; your DB *mirrors* it via webhook
  events, not API polling.** You should not store plan/price as local truth.
- **Webhooks are at-least-once with up-to-72h retries → handlers must be idempotent** (store each
  `event.id` under a UNIQUE constraint; short-circuit duplicates).
- **The idempotency record and the state mutation must be in the SAME transaction** — otherwise a
  crash between them double-fulfills on retry.
- **Admin billing actions require reconciliation tooling** that rebuilds local state from Stripe's
  Events API; signature verification + background-queue processing are table stakes.

Implication for row #3: a *safe* admin billing mutation (e.g. change-plan, refund, cancel) is only
possible **on top of** a server-side, webhook-synced, idempotent Stripe-mirror state machine with
server-authoritative RBAC + audit. None of that exists (and `sync`/server lines are out of scope, D4
PAUSED). Therefore billing mutations are correctly **deferred** — and the browser-side admin app can
*never* be the place a billing write originates (it holds no Stripe secret; the no-secret guard already
forbids `sk_live_`/`sk_test_` in `src/`+`dist/`). The gate is a real-architecture gate. Option S2 is
the only correct posture for a contract-only, no-backend slice.

> This is the only part of row #3 that involved external technology research; the Users/Orgs read +
> mutation wiring is purely internal (reuses the SHIPPED row #2/#5 seams) and required no web research.

---

## 4. Read-wiring options (Users / Orgs / Billing reads)

- **Option R1 — Leave pages reading slice #1's `usersAdapter`/`orgsAdapter`/`billingAdapter` directly
  (synchronous fixture reads), call it "wired".** Rejected. That bypasses the row #2 `AdminApiClient`
  transport seam — the contract rows #3–#5 must implement against. The manifest Verification Gate
  "Contract coverage: every UI page reads through a typed adapter, not inline mock globals" is *already*
  satisfied by slice #1, but row #3's job is to bind reads to the **async `AdminApiClient` boundary** so
  the later real-server swap is transport-only.

- **Option R2 — Introduce per-page read adapters that delegate to `createMockAdminApiClient` (row #2)
  through the `../adapters` seam; pages consume those.** **SELECTED.** Mirrors the row #5 precedent
  (which exposed `opsQueueReadModel`/`auditChainReadModel` through `../adapters` and routed
  Dashboard/Audit through them, keeping `TT-NO-INLINE-MOCK` green). Row #3 adds composed
  read seams for Users/Orgs/Billing that call the `AdminApiClient` reads (`getUsers`/`getUser`/
  `getOrgs`/`getOrg`/`getBillingMetrics`/`getPlanDistribution`/`getTransactions`). The pages keep
  importing `../adapters`. The async boundary is honored; the swap-to-real-server is an impl change.

- **Option R3 — Re-back slice #1's `usersAdapter`/`orgsAdapter`/`billingAdapter` in place to call the
  `AdminApiClient`.** Rejected (regression risk). Slice #1's `adapters.test.ts` pins those adapters'
  exact synchronous fixture behavior (e.g. specific row counts/filters). Re-backing them async would
  break slice #1's suite. Row #5 hit the same constraint (R-1 finding) and correctly chose **additive
  composed seams** over re-backing. Row #3 follows that precedent: slice #1 adapters UNCHANGED;
  additive composed read seams added.

---

## 5. Mutation-wiring options (ban / bulk-ban / transfer-ownership)

- **Option M1 — Keep `AdminUiContext` injecting the slice #1 no-op `mockAdminCommandAdapter`.**
  Rejected. That is the slice #1 posture (no RBAC, no audit); row #3's whole job (INTEGRATION_PLAN §4.4)
  is to route guarded mutations through RBAC + audit.

- **Option M2 — Swap `AdminUiContext` to inject an adapter that delegates the 6 families (the 3
  page-relevant + the 3 others) to row #5's `createAuditedMockAdminApiClient`.** **SELECTED.** This is
  the exact rewire row #2 OQ-F + row #5 OQ-G deferred to row #3. The audited client already enforces
  `canMutate` (deny → `forbidden`/`unauthorized`, ZERO audit append) and `appendThenAck` (allow → audit
  event + `auditId`, `applied:false`). The page mutation calls (`commands.banUser` etc.) are unchanged.
  The `AdminCommandAdapter` return type widens from `NoOpResult` to the `AdminApiResult<MutationAck>`
  shape (or a thin mapping) — recorded as a build-time contract detail (OQ-A). Slice #1's
  `mockAdminCommandAdapter` + its `TT-CMD-NOOP` test are left intact (the audited adapter is a NEW
  injection target, not a mutation of the no-op one).

- **Option M3 — Pages import `createAuditedMockAdminApiClient` directly.** Rejected. Pages must read
  through `../adapters` (`TT-NO-INLINE-MOCK`); the audited client is exposed via `../adapters` and
  injected through `AdminUiContext`, never imported page-side.

### RBAC role context for the mock (how allow/deny is exercised)

The audited client takes `ctx.role`. Slice #1's posture is `mock-authenticated` / `unconfigured`
(fail-closed). Row #3 must decide what role the UI's injected client carries for the mock: a
**build-time `VITE_ADMIN_MOCK_ROLE`** (defaulting to a role that demonstrates the allow path, e.g.
`super` or `ops`) so the type-to-confirm flows can be manually smoke-tested, while the **unit tests**
exercise allow AND deny per family by constructing the audited client with explicit roles. Recorded as
OQ-B (build-time). The advisory `can()` may also drive *disabled* states on destructive buttons
(non-blocking polish).

---

## 6. Recommendation (summary)

- **Reads (R2):** additive composed read seams in `../adapters` that delegate Users/Orgs/Billing reads
  to the row #2 `AdminApiClient`; pages keep importing `../adapters`; slice #1 adapters unchanged.
- **Mutations (M2):** swap `AdminUiContext` to inject an audited command adapter delegating to row #5's
  `createAuditedMockAdminApiClient` → RBAC allow/deny + audit-on-mutation + `applied:false`; ban / bulk-ban
  / transfer-ownership become guarded. Slice #1 no-op adapter + `TT-CMD-NOOP` untouched.
- **Billing (S2):** read-only via the `AdminApiClient` read boundary; NO billing mutation family added;
  Stripe gate documented + structurally guarded (a test asserts no `billing*` mutation family exists).
- **Boundary:** W0 (admin-side only) — no shared `@repo/*` change, no `@repo/core/src/events`, no Tauri,
  no `@repo/audit-log-integrity` import, no `syncScope` entity, browser holds no secret, no real write.
- **No new runtime dependency** (hand-built `DataTable` already serves the three tables; the three pages
  are read-display + existing confirm flows). `@tanstack/react-table` v8 stays the pre-approved upgrade
  path behind the `DataTable` seam if a future row needs sort/virtualize — not this row.

Phasing (one phase per `feature-build` run, each independently unit-verifiable with a mock transport —
no server deploy): **P1 Users read+mutations → P2 Organizations read+owner-transfer → P3 Billing
read-only + explicit Stripe-gate deferral → P4 wire pages to adapters/RBAC/audit + carried-guard
re-run**. (See design.md / dev_log.md for the full phase table + rationale.)

---

## 7. Risks & open questions

### Risks (carried into review; full list in dev_log.md)

- **R1 (HIGH) — browser-as-security-boundary / "real mutation" overclaim.** Mitigated: reuse row #2 C2
  + row #5 B2 — browser advisory, server-authoritative; mock `applied:false`; audited client holds no
  service-role credential + does no I/O; documented + tested (advisory-note + no-io).
- **R2 (HIGH) — Stripe gate silently regressing** (a billing mutation sneaking in). Mitigated: S2 — no
  billing mutation family added; a guard test asserts `MutationFamily` has no `billing*` member and the
  `AdminApiClient` exposes no billing mutation method; the gate precondition is frozen in design/api.
- **R3 (HIGH) — breaking slice #1 / row #2 / row #5 suites.** Mitigated: additive composed seams
  (R2/M2 follow the row #5 R-1 precedent); slice #1 `adapters.test.ts`/`pages.smoke`, row #2
  `adminApi.test.ts`, row #5 `auditedMutation.test.ts`/`wiring.test.tsx` must all stay green; slice #1's
  `mockAdminCommandAdapter` + `TT-CMD-NOOP` untouched.
- **R4 (MED) — `TT-NO-INLINE-MOCK` regression** (pages dropping the `../adapters` import or page count
  ≠ 10). Mitigated: route everything through `../adapters`; no page added/removed; add `TT-NO-INLINE-MOCK`
  to the P4 gate.
- **R5 (MED) — scope bleed into rows #4/#6** (provider/feature mutations, real server, deploy). Mitigated:
  row #3 touches only Users/Orgs/Billing; `setFeatureRollout`/`setProviderRouting`/`setQuota` keep their
  row #2/#5 contracts but are not page-wired here (the audited adapter exposes all 6 for the injection,
  but only the 3 page-relevant flows are wired to UI this row); real server/deploy = rows #4/#6.
- **R6 (MED) — `AdminCommandAdapter` return-type change rippling.** The no-op adapter returns
  `NoOpResult`; the audited path returns `AdminApiResult<MutationAck>`. Mitigated: the injected audited
  adapter conforms to a typed command contract; pages already `await commands.*()` without inspecting the
  result, so widening is low-risk — recorded as OQ-A to fix cleanly (a `GuardedCommandAdapter` type or a
  thin map preserving `await`-only call sites).
- **R7 (LOW) — secret material in billing fixtures/transactions.** Mitigated: carried
  `TT-NO-SECRET-SRC/BUNDLE` (already guard `sk_*`/service-role over all `src/`+`dist/`); billing fixtures
  carry only display amounts/statuses, no key material.
- **R8 (LOW) — `syncScope`/cross-device temptation for user/org/billing data.** Mitigated: no `syncScope`
  entity; ADR-0013 §D4 / PAUSED `sync` line out of scope.

### Open questions for feature-review

- **OQ-A (resolve/confirm — build-time contract):** the guarded command adapter's return type
  (`AdminApiResult<MutationAck>` vs a mapped shape) and whether to introduce a `GuardedCommandAdapter`
  type distinct from slice #1's `AdminCommandAdapter`/`NoOpResult`. **Recommend:** inject an adapter that
  conforms to a typed guarded-command contract returning `AdminApiResult<MutationAck>`; keep slice #1's
  `mockAdminCommandAdapter`/`NoOpResult`/`TT-CMD-NOOP` UNCHANGED (additive). Record the chosen shape in P1.
- **OQ-B (resolve/confirm — mock role context):** what role the UI-injected audited client carries
  (`VITE_ADMIN_MOCK_ROLE`, default demonstrating the allow path) so manual smoke can exercise a granted
  flow, while unit tests construct explicit roles for allow AND deny per family. **Recommend:** a
  build-time mock role env (default `ops` for user actions; note `transferOwnership` is SUPER-ONLY so its
  allow-path smoke needs `super`). Fail-closed when absent.
- **OQ-C (resolve/confirm — Stripe gate posture):** confirm Option S2 (Billing strictly read-only; NO
  billing mutation family). Sub-question: include an *inert, disabled* `BILLING_MANAGE`-gated placeholder
  affordance (Option S3) or omit entirely. **Recommend:** omit (strictly read-only); revisit when
  webhook-backed state lands.
- **OQ-D (defer to row, noted):** the **real** Users/Orgs service-role read endpoints + real
  ban/transfer effects (server performs the privileged op + audit append in one transaction) = the real
  transport behind these same interfaces, rows #3-real/#4. Row #3 fixes the contract + mock + test surface.
- **OQ-E (defer to row, noted):** webhook-backed Stripe state machine (idempotent event store + Stripe
  mirror + reconciliation) + admin billing mutations on top of it = a later row, only after a server line
  is authorized. Out of scope here (D4 PAUSED; no server).
- **OQ-F (out of scope, noted):** cross-device persistence of any admin user/org/billing read model
  (ADR-0013 §D4 / PAUSED `sync`). No `syncScope` entity added.

---

## 8. Sources

- [Stripe Webhooks: Complete Implementation Guide (2026)](https://www.hooklistener.com/learn/stripe-webhooks-implementation)
- [Receive Stripe events in your webhook endpoint | Stripe Documentation](https://docs.stripe.com/webhooks)
- [Handling Payment Webhooks Reliably (Idempotency, Retries, Validation)](https://medium.com/@sohail_saifii/handling-payment-webhooks-reliably-idempotency-retries-validation-69b762720bf5)
- [Stripe Webhook Best Practices: Raw Body, Signatures & Retries | HookRay](https://hookray.com/blog/stripe-webhook-best-practices-2026)
- [SaaS Stripe Integration: Billing Made Simple (2026)](https://designrevision.com/blog/saas-stripe-integration)
