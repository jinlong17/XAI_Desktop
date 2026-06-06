# design.md — xai-admin-users-orgs-billing

> Decision snapshot ONLY (discovery detail lives in the review doc, not here).
> Surface: `apps/admin/` (the SHIPPED isolated Web-line app — slice #1 + row #2 + row #5 all SHIPPED).
> This row WIRES the Users / Organizations / Billing pages to the typed transport seam + graduates their
> guarded mutations to RBAC+audit-gated mocks; it does NOT add new top-level pages.
> Roadmap row **#3 of 6** of `xai-admin-dashboard-system-integration`. Hard dep row #2 = SHIPPED; rows #1 + #5 = SHIPPED.
> Distinct landing — does NOT overwrite slice #1's `apps/admin/docs/{design,api,test,dev_log}.md`, row #2's
> `apps/admin/docs/data-contracts-rbac/*`, or row #5's `apps/admin/docs/audit-ops-queue/*`.

## Decision snapshot

| Field | Value |
|---|---|
| **Selected Option (read wiring, Axis R)** | **R2** — additive composed read seams in `apps/admin/src/adapters/index.ts` that delegate Users/Orgs/Billing reads to row #2's `AdminApiClient` (`getUsers`/`getUser`/`getOrgs`/`getOrg`/`getBillingMetrics`/`getPlanDistribution`/`getTransactions`); the three pages keep importing `../adapters` (TT-NO-INLINE-MOCK green). Slice #1's `usersAdapter`/`orgsAdapter`/`billingAdapter` are UNCHANGED (mirrors row #5's R-1 additive-seam precedent; slice #1 `adapters.test.ts` untouched). |
| **Selected Option (mutation wiring, Axis M)** | **M2** — swap `AdminUiContext` to inject a guarded command adapter that delegates the page-relevant families (`banUser`, `bulkBan`, `transferOwnership`) to row #5's `createAuditedMockAdminApiClient` → row #2 `canMutate` RBAC (deny → forbidden/unauthorized, ZERO audit append) + row #5 `appendThenAck` (allow → audit event + `auditId`, **`applied:false`**). This is the rewire **row #2 OQ-F + row #5 OQ-G deferred to row #3**. Slice #1's no-op `mockAdminCommandAdapter` + `TT-CMD-NOOP` left intact (audited adapter is a NEW injection target). |
| **Selected Option (Stripe gate, Axis S)** | **S2** — Billing is **READ-ONLY** this slice (display via the `AdminApiClient` read boundary). **NO billing mutation family** is added to `AdminApiClient` / `MutationFamily` / `MUTATION_PERMISSION`. The `BILLING_MANAGE` permission key (already in the row #2 catalog, super+finance) stays a catalogued-but-unwired capability. The gate is a frozen, tested deferral: a billing mutation may be minted ONLY after a server-side webhook-backed Stripe-mirror state machine (idempotent event store + reconciliation + server-authoritative RBAC + audit) exists — which it does not (D4 PAUSED; no server). |
| **Selected Option (transport)** | Reuse row #2's typed **mockable** `AdminApiClient` + row #5's **audited** variant. **NO real server deployed; NO real Stripe; NO real production write** (mutations stay `applied:false`, now carrying `auditId` for the audited families). |
| **Selected Option (doc landing)** | discovery review under `docs/reviews/xai-admin-users-orgs-billing/`; four-piece set under `apps/admin/docs/users-orgs-billing/` (co-located with the surface; does NOT overwrite slice #1 / row #2 / row #5 docs). |
| **Review Doc Path** | `docs/reviews/xai-admin-users-orgs-billing/20260606-discovery-review.md` |
| **Review Date / Version** | 2026-06-06 / v1 (discovery) |
| **Product module** | `admin` (#6) · operator-activated whole line 2026-06-06 · **row #3 only** (preserves manifest dep order; #4/#6 depend on #2/#5) |
| **Branch convention** | `codex/admin/<feature>` (planning-only at this step; no code branch; worktree `claude/frosty-nash-c4bf16`) |
| **D3 classification** | **W0 (web-only, admin-side only)** — no shared `@repo/*` seam modified; no `dev` promotion |
| **Cross-window contract impact** | NONE — no new `@repo/core/src/events` typed events; no Tauri command changes (browser-side, contract-only) |
| **syncScope** | NONE — no admin user/org/billing read model routed to cross-device persistence (ADR-0013 §D4 / `sync` line PAUSED) |

## ADR-lite records (recorded here per slice-#1 / row-#2 / row-#5 precedent; no standalone ADR infra)

- **ADR-lite #1 (read wiring through the transport seam — R2).** The three pages already satisfy the
  manifest "read through a typed adapter" gate via slice #1's mock adapters, but those bypass row #2's
  `AdminApiClient` transport (the contract a real server later implements). Row #3 binds Users/Orgs/Billing
  reads to the **async `AdminApiClient` boundary** via additive composed seams in `../adapters`, so the
  later real-server swap is a transport-only change with NO UI rewrite. Re-backing slice #1's
  `usersAdapter`/`orgsAdapter`/`billingAdapter` in place was rejected (their exact synchronous fixture
  behavior is pinned by slice #1's `adapters.test.ts`; re-backing async would break that suite). This is
  the same additive-seam decision row #5 made (R-1: composed `opsQueueReadModel`/`auditChainReadModel` in
  `../adapters` rather than re-backing `overviewAdapter`/`auditAdapter`).

- **ADR-lite #2 (guarded-mutation graduation — M2).** The three page-relevant destructive flows graduate
  from slice #1's **no-op** (`{ ok:true, noop:true }`, no RBAC, no audit) to RBAC+audit-gated mocks by
  swapping the `AdminUiContext` injection to a guarded command adapter that delegates to row #5's
  `createAuditedMockAdminApiClient`. That client already chains row #2's `canMutate` (server-shaped
  allow/deny, fail-closed) + row #5's `appendThenAck` (a granted mutation cannot ack without first
  appending an `AdminAuditEvent`; a denied mutation appends ZERO). The result is `{ applied:false,
  auditId }` — **no real write**, audit recorded. This is exactly the rewire **row #2 OQ-F** and **row #5
  OQ-G** explicitly deferred to row #3. **Boundary (R1):** proven on the contract + mock path; browser is
  advisory; the PRODUCTION guarantee is the server performing the privileged op + the audit append in one
  transaction (row #2 C2). Slice #1's `mockAdminCommandAdapter` + `TT-CMD-NOOP` are NOT mutated (the
  audited adapter is a new injection target).

- **ADR-lite #3 (Stripe gate — S2, billing read-only / no billing mutation family).** Billing write
  operations stay gated behind "webhook-backed Stripe state", which does NOT exist. Decision: Billing is
  **read-only** this slice, and **no billing mutation family is added** to `AdminApiClient` /
  `MutationFamily` / `MUTATION_PERMISSION`. Rationale (web-research-grounded, review §3): a safe admin
  billing mutation requires a server-side, webhook-synced, **idempotent** Stripe-mirror state machine
  (Stripe is the source of truth; the DB mirrors it via at-least-once webhooks whose `event.id` is stored
  UNIQUE and whose idempotency record + state mutation share one transaction) + server-authoritative RBAC
  + audit + reconciliation tooling. None of that exists (D4 PAUSED; no server; the browser holds no Stripe
  secret — already enforced by `TT-NO-SECRET-SRC/BUNDLE` over `sk_test_`/`sk_live_`). Minting even a mock
  billing family now would imply an available write path and seed an append-only permission→family binding
  before the real state machine is designed (row #2 D2 keys are append-only / hard to walk back). The gate
  is **structurally enforced**: a guard test asserts `MutationFamily` has NO `billing*` member and the
  `AdminApiClient` exposes NO billing mutation method. `BILLING_MANAGE` remains a catalogued capability for
  the future. (An inert, disabled `BILLING_MANAGE`-gated placeholder — Option S3 — is recommended OMITTED;
  build-time OQ-C.)

## Frozen assumptions (lock at plan acceptance — change requires Revise or a follow-up row)

1. **Row #3 is CONTRACT/WIRING-ONLY and fully testable WITHOUT a live backend.** "Green" = Users/Orgs/Billing
   reads bound to the `AdminApiClient` boundary + the three guarded mutation flows routed through RBAC +
   audit (mock, `applied:false`) + Billing read-only with a documented+guarded Stripe gate + the pages wired
   through `../adapters`, all unit-tested with a **mockable** transport. It does **NOT** require deploying a
   real server, real Stripe, or performing any real write. Real service-role endpoints + real
   ban/transfer/billing effects = later/production rows.
2. **All new code is admin-local under `apps/admin/src/`** (composed read seams + guarded command adapter in
   `adapters/`, page wiring in `pages/`, the `AdminUiContext` injection swap). No shared `packages/*` change;
   no logic in `packages/core`/`apps/web`; no import of `@repo/audit-log-integrity`.
3. **Additive over slice #1 + row #2 + row #5 — no fork, no break.** Slice #1's `usersAdapter`/`orgsAdapter`/
   `billingAdapter`/`mockAdminCommandAdapter` + `adapters.test.ts`/`TT-CMD-NOOP`, row #2's `AdminApiClient`/
   `createMockAdminApiClient`/`adminApi.test.ts`, and row #5's `createAuditedMockAdminApiClient`/
   `auditedMutation.test.ts`/`wiring.test.tsx` all keep working. Reuse via composition; never re-declare.
4. **Mutations are server-authoritative; browser advisory** (row #2 C2 / row #5 B2). The three guarded flows
   are proven on the mock path (`applied:false` + `auditId`); the contract documents the server as the real
   enforcer. A browser bypass cannot cause a real privileged effect (mock holds no service-role credential).
5. **Every guarded mutation appends an audit event on the allow path and ZERO on the deny path** (row #5
   invariant, inherited by the wiring). The three page flows are routed so a granted ban/bulk-ban/transfer
   produces exactly one audit event with the correct `mutationFamily`/`permissionKey`; a denied one produces
   none. `transferOwnership` is **SUPER-ONLY** (`ORG_TRANSFER_OWNER`, row #2 REC-1) — its deny tests must
   assert non-`super` roles append ZERO.
6. **Stripe gate is a frozen deferral** (ADR-lite #3 / S2): Billing read-only; NO `billing*` mutation family
   in `AdminApiClient`/`MutationFamily`/`MUTATION_PERMISSION` this row; a guard test asserts the absence; the
   precondition for minting one (server-side webhook-backed idempotent Stripe-mirror + reconciliation +
   server RBAC + audit) is documented. `BILLING_MANAGE` stays catalogued-but-unwired.
7. **No service-role / provider / Stripe secret in the browser** (hard invariant, slice #1 / row #2 / row #5),
   re-asserted by the carried `TT-NO-SECRET-SRC` + `TT-NO-SECRET-BUNDLE` over `src/` + `dist/` (they already
   match `sk_test_`/`sk_live_`/service-role). Providers stay key-status-only (not touched this row).
8. **No `syncScope` entity / no cross-device persistence** of any admin user/org/billing read model
   (ADR-0013 §D4; sync line PAUSED). **No new typed events; no Tauri changes. D3 = W0.**
9. **Zero new runtime dependencies** expected (wiring + read-display row). The hand-built `DataTable`
   primitive already serves the Users/Orgs/Billing tables; headless `@tanstack/react-table` v8 remains the
   pre-approved table upgrade path behind slice #1's `DataTable` seam if ever needed (not this row); record
   if added.
10. **Page set stays at 10** and every `src/pages/*.tsx` keeps importing `../adapters` (carried
    `TT-NO-INLINE-MOCK`); no page added/removed; mutations injected via `AdminUiContext`, reads via composed
    `../adapters` seams — pages never import the audited/mock client directly.

## Dependency overview

| Direction | Dependency | State | Mode this row |
|---|---|---|---|
| Upstream (consumes) | row #2 `apps/admin/src/contracts/adminApi.ts` (`AdminApiClient`, `createMockAdminApiClient`, read methods + `MutationAck`) | SHIPPED (this repo) | Users/Orgs/Billing reads bound to this transport via composed `../adapters` seams |
| Upstream (consumes) | row #2 `apps/admin/src/authz/{permissionKeys,rbac}.ts` (`MUTATION_PERMISSION`, `canMutate`, `BILLING_MANAGE`) | SHIPPED (this repo) | RBAC allow/deny for the 3 guarded families; `BILLING_MANAGE` stays catalogued-but-unwired |
| Upstream (consumes) | row #5 `apps/admin/src/audit/auditedMutation.ts` (`createAuditedMockAdminApiClient` → `{ client, chain }`, `appendThenAck`) | SHIPPED (this repo) | The seam the guarded command adapter delegates to (audit-on-mutation + `applied:false`) |
| Upstream (consumes) | slice #1 `apps/admin/src/adapters/{types,index}.ts` (`Users/Orgs/BillingReadModel`, mock adapters) + `pages/{UsersPage,OrgsPage,BillingPage}.tsx` + `components/AdminUiContext.tsx` | SHIPPED (this repo) | Read-model types reused; pages wired (additive); `AdminUiContext` injection swapped; slice #1 adapters UNCHANGED |
| Reused (NOT mutated) | slice #1 `apps/admin/src/adapters/commands.ts` (`mockAdminCommandAdapter`, `NoOpResult`, `TT-CMD-NOOP`) | SHIPPED (this repo) | Left intact; the audited guarded adapter is a NEW injection target (row #2 OQ-F / row #5 OQ-G now actioned) |
| Concept-only (mocked / deferred) | `@repo/plugin-web-settings-rest` (user Stripe payment-link stub) | Stable | **Concept reference only**; NOT imported/wired. Admin billing = a SEPARATE server-side webhook-backed contract (deferred) |
| Concept-only (deferred) | real service-role user/org read endpoints · real ban/transfer effects · webhook-backed Stripe state + admin billing mutations | n/a | NOT wired; real transport behind these interfaces = later rows; Stripe = OQ-E (no server, D4 PAUSED) |
| Design authority | prototype `docs/prototypes/admin-dashboard/` + INTEGRATION_PLAN §2/§4.4 | n/a | IA + guarded-mutation posture |

## Directory shape (planned — additive to the SHIPPED slice-#1 + row-#2 + row-#5 tree)

```
apps/admin/
  src/
    adapters/
      index.ts                     # EDIT (additive) — composed read seams delegating Users/Orgs/Billing
                                   #   reads to the row #2 AdminApiClient + export the guarded command
                                   #   adapter factory; slice #1 adapters above UNCHANGED
      guardedCommands.ts           # NEW (row #3) — createGuardedCommandAdapter(ctx) delegating the 3
                                   #   page-relevant families to row #5 createAuditedMockAdminApiClient
                                   #   (banUser/bulkBan/transferOwnership); applied:false + auditId on
                                   #   allow, forbidden/unauthorized + ZERO append on deny
      guardedCommands.test.ts      # TT-CMD-GUARDED-ALLOW-<family> / DENY-<family> / AUDIT-ON-MUTATION /
                                   #   APPLIED-FALSE / NO-IO / NO-BILLING-FAMILY
      usersReadSeam.test.ts        # TT-WIRE-USERS-READ (reads bound to AdminApiClient; shapes = contract)
      orgsReadSeam.test.ts         # TT-WIRE-ORGS-READ
      billingReadSeam.test.ts      # TT-WIRE-BILLING-READ + TT-BILLING-GATE-NO-MUTATION
    components/
      AdminUiContext.tsx           # EDIT — inject the guarded command adapter (default mock role via
                                   #   VITE_ADMIN_MOCK_ROLE, fail-closed) instead of the slice #1 no-op
    pages/
      UsersPage.tsx                # wired (P4) — reads via composed ../adapters seam; ban/bulk-ban via
                                   #   guarded commands (RBAC+audit); confirm flows unchanged
      OrgsPage.tsx                 # wired (P4) — reads via composed ../adapters seam; transfer-ownership
                                   #   via guarded command (SUPER-ONLY)
      BillingPage.tsx              # wired (P4) — reads via composed ../adapters seam; STRICTLY read-only
                                   #   (no mutation affordance; Stripe gate)
      wiring.users-orgs-billing.test.tsx  # TT-WIRE-USERS-PAGE / ORGS-PAGE / BILLING-PAGE (read through
                                   #   ../adapters; guarded mutation calls; billing has no mutation control)
  docs/
    users-orgs-billing/            # THIS doc set (design/api/test/dev_log) — distinct from slice #1/#2/#5
```

> Note: the `apps/admin/src/__tests__/{no-secret,no-secret-bundle,no-inline-mock,csp}.test.ts` guards from
> slice #1 already scan all of `src/`/`dist/` and assert page→`../adapters` wiring; re-run in P4 (the new
> `adapters/` modules + wired pages are covered automatically). Exact filenames/shapes are finalized in
> `feature-build`; design fixes the seams + boundaries.
