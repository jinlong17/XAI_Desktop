# api.md — xai-admin-users-orgs-billing

> Interface contracts / error semantics for wiring the admin **Users / Organizations / Billing** pages
> to the typed transport + graduating their guarded mutations (roadmap row #3).
> All contracts are **admin-local typed seams with mock impls**; row #3 ships NO real server, NO real
> Stripe, NO real mutation. The guarded-mutation invariant is proven on the **audited mock** path
> (browser advisory; server-authoritative is the real enforcer — row #2 C2 / row #5 B2).
> Builds on (does NOT redo) slice #1's `apps/admin/docs/api.md`, row #2's
> `apps/admin/docs/data-contracts-rbac/api.md`, and row #5's `apps/admin/docs/audit-ops-queue/api.md`.

## 1. Consumed upstream contracts (reused, UNCHANGED)

From **row #2** (`apps/admin/src/contracts/adminApi.ts`, SHIPPED):

```ts
export type AdminApiResult<T> = AdminApiOk<T> | AdminApiErr;   // discriminated; fail-closed friendly
export interface AdminApiError { code: AdminApiErrorCode; message: string; }
export interface MutationAck { applied: boolean; auditId?: string; }
export interface AdminApiClient {
  // 18 reads (incl. getUsers/getUser/getOrgs/getOrg/getBillingMetrics/getPlanDistribution/getTransactions)
  // 6 mutations (banUser/bulkBan/setFeatureRollout/transferOwnership/setProviderRouting/setQuota)
}
export function createMockAdminApiClient(ctx?: { role?: AdminRole }): AdminApiClient; // fail-closed, no I/O
```

From **row #2** (`apps/admin/src/authz/*`, SHIPPED):

```ts
export type MutationFamily = keyof AdminCommandAdapter;          // the 6 families
export const MUTATION_PERMISSION: Record<MutationFamily, PermissionKey>;
export function canMutate(role: AdminRole | null | undefined, family: MutationFamily): boolean; // advisory
export const PERMISSION_KEYS: { /* ... */ BILLING_MANAGE: "admin.billing.manage"; /* ... */ } as const;
```

From **row #5** (`apps/admin/src/audit/auditedMutation.ts`, SHIPPED):

```ts
export function createAuditedMockAdminApiClient(ctx?: AuditedMockContext):
  { client: AdminApiClient; chain: AdminAuditChain };
// granted mutation: appendThenAck → AdminAuditEvent appended BEFORE ack → { applied:false, auditId }
// denied mutation: forbidden/unauthorized → ZERO append
```

From **slice #1** (`apps/admin/src/adapters/types.ts`, SHIPPED — read-model contracts, NOT re-declared):

```ts
export interface UsersReadModel { list(query?: UserQuery): UserRow[]; savedViews(): SavedView[]; filterChips(): {...}[]; get(email: string): UserDetail | null; }
export interface OrgsReadModel  { list(): OrgRow[]; get(name: string): OrgDetail | null; }
export interface BillingReadModel { metrics(): BillingMetrics; planDistribution(): PlanShare[]; transactions(): TxnRow[]; }
export interface AdminCommandAdapter { banUser; bulkBan; setFeatureRollout; transferOwnership; setProviderRouting; setQuota; } // slice #1 no-op
export interface NoOpResult { ok: true; noop: true; reason: "slice-1-mock-no-write"; }
```

> Row #3 **wires** these — it reuses every contract above by **composition** and does not redefine or fork
> any of them.

## 2. Composed read seams (NEW — Axis R / R2; pages read these through `../adapters`)

Row #3 adds async read seams in `apps/admin/src/adapters/index.ts` that delegate the three pages' reads to
the row #2 `AdminApiClient`. The pages consume them through `../adapters` (TT-NO-INLINE-MOCK stays green).
Slice #1's `usersAdapter`/`orgsAdapter`/`billingAdapter` are UNCHANGED (additive; slice #1 `adapters.test.ts`
untouched — the R-1 / additive-seam precedent from row #5).

```ts
// apps/admin/src/adapters/index.ts (additive — slice #1 adapters above UNCHANGED)

/** The transport the composed seams read through (mock this row; real server later, same interface). */
export const adminApiClient: AdminApiClient; // = createMockAdminApiClient({ role: MOCK_ROLE }) — see §5

/** Users read seam — delegates to the AdminApiClient; returns are the §1 contract shapes (no fork). */
export const usersReadSeam: {
  list(query?: UserQuery): Promise<AdminApiResult<UserRow[]>>;
  get(email: string): Promise<AdminApiResult<UserDetail | null>>;
  // savedViews()/filterChips() are pure UI config — sourced from the slice #1 usersAdapter (sync, no transport)
};

/** Orgs read seam. */
export const orgsReadSeam: {
  list(): Promise<AdminApiResult<OrgRow[]>>;
  get(name: string): Promise<AdminApiResult<OrgDetail | null>>;
};

/** Billing read seam — READ-ONLY (no mutation method exists; Stripe gate §6). */
export const billingReadSeam: {
  metrics(): Promise<AdminApiResult<BillingMetrics>>;
  planDistribution(): Promise<AdminApiResult<PlanShare[]>>;
  transactions(): Promise<AdminApiResult<TxnRow[]>>;
};
```

**Semantics (binary, tested):**
- Each read returns the **§1 `AdminApiResult<T>`** envelope; `data` is the slice-#1/row-#2 contract shape
  (e.g. `UserRow[]`) — NO parallel/forked read type (row #2 REC-2 lineage).
- Reads are pure with respect to writes (no network, no storage in the mock); they resolve fixture data via
  the `AdminApiClient` mock (`createMockAdminApiClient` → `adminReadModels`).
- The **page** awaits the seam and renders `data` on `ok:true`; on `ok:false` it shows an empty/error state
  (reads do not fail in the mock, but the page handles the discriminated union so the real-server swap is
  transport-only).
- `savedViews()`/`filterChips()` (Users) and the table column configs are **UI config, not data** — they
  stay sourced from the slice #1 `usersAdapter` (sync); only row data flows through the transport.

> Exact seam ergonomics (a small async hook vs direct `await` in the page, suspense vs loading flag) are a
> build-time UI detail; the **contract** is: page row data is obtained via `AdminApiResult<T>` from the
> `AdminApiClient`-backed seam exposed on `../adapters`.

## 3. Guarded command adapter (NEW — Axis M / M2; the mutation graduation)

Row #3 swaps `AdminUiContext`'s injected `commands` from slice #1's no-op `mockAdminCommandAdapter` to a
**guarded** adapter that delegates to row #5's `createAuditedMockAdminApiClient`. Only the three
page-relevant families are wired to UI this row (`banUser`, `bulkBan`, `transferOwnership`); the other three
(`setFeatureRollout`, `setProviderRouting`, `setQuota`) keep their row #2/#5 contracts and are NOT page-wired
here (rows #4 own those pages).

```ts
// apps/admin/src/adapters/guardedCommands.ts
import { createAuditedMockAdminApiClient, type AuditedMockContext } from "../audit/auditedMutation";
import type { AdminApiResult, MutationAck } from "../contracts/adminApi";

/**
 * Guarded command adapter. Each method delegates to the row #5 audited mock AdminApiClient:
 *  - RBAC (row #2 canMutate): no role → unauthorized; role lacks key → forbidden — BOTH ZERO audit append.
 *  - allow (row #5 appendThenAck): append an AdminAuditEvent THEN ack { applied:false, auditId }.
 * Browser ADVISORY; server-authoritative is the real enforcer. NO real write, NO I/O.
 *
 * Distinct from slice #1's AdminCommandAdapter/NoOpResult (left intact + TT-CMD-NOOP untouched): this
 * returns the typed AdminApiResult<MutationAck> so the audit/RBAC outcome is observable by the UI.
 */
export interface GuardedCommandAdapter {
  banUser(input: { email: string }): Promise<AdminApiResult<MutationAck>>;
  bulkBan(input: { emails: string[] }): Promise<AdminApiResult<MutationAck>>;
  transferOwnership(input: { org: string; toMember: string }): Promise<AdminApiResult<MutationAck>>;
  // NOTE: NO billing* method — Stripe gate (§6). The other 3 families exist on the audited client but are
  // not surfaced on the guarded adapter this row (rows #4 wire feature/provider/quota pages).
}

export function createGuardedCommandAdapter(ctx?: AuditedMockContext): {
  commands: GuardedCommandAdapter;
  chain: AdminAuditChain;  // exposed so audit-on-mutation is observable/verifiable
};
```

**Error / outcome semantics (binary, tested):**
- **Deny (no role):** `{ ok:false, error:{ code:"unauthorized" } }`, **ZERO** audit append.
- **Deny (role lacks key):** `{ ok:false, error:{ code:"forbidden" } }`, **ZERO** audit append.
  (`transferOwnership` is **SUPER-ONLY** — `ORG_TRANSFER_OWNER`, row #2 REC-1 — so non-`super` is denied.)
- **Allow:** `{ ok:true, data:{ applied:false, auditId: <event hash> } }` — **`applied:false`** (NO real
  write this row, mirrors row #2/#5) + **`auditId`** set (audit recorded → row #2's `MutationAck.auditId`
  obligation fulfilled, via the row #5 chain).
- Methods never throw for an authz failure (return `ok:false`). Pure with respect to external state; no
  network/persistence (the audited mock chain lives in memory).

### 3.1 `AdminUiContext` injection (the swap)

```ts
// apps/admin/src/components/AdminUiContext.tsx
interface AdminUiContextValue {
  requestConfirm: (req: ConfirmRequest) => void;
  toast: (msg: string) => void;
  /** ROW #3: guarded command adapter (RBAC + audit-on-mutation, applied:false) — replaces the slice #1 no-op */
  commands: GuardedCommandAdapter;
}
```

- The provider builds the guarded adapter once with the mock role context (§5) and exposes it as `commands`.
- The pages' existing calls — `await commands.banUser({ email })`, `await commands.bulkBan({ emails })`,
  `await commands.transferOwnership({ org, toMember })` — are **unchanged** at the call site (they already
  `await` without inspecting the result; the toast fires after). Optionally the page may branch on
  `result.ok` to toast success vs a denied message (build-time UI polish; non-blocking).

## 4. RBAC mapping for the three guarded families (reused, UNCHANGED)

| Family | Permission key (row #2) | Allowed roles (row #2 `ROLE_GRANTS`) | Page |
|---|---|---|---|
| `banUser` | `admin.users.ban` (`USER_BAN`) | `super`, `ops` | Users |
| `bulkBan` | `admin.users.ban` (`USER_BAN`) | `super`, `ops` | Users |
| `transferOwnership` | `admin.orgs.transfer_ownership` (`ORG_TRANSFER_OWNER`, **SUPER-ONLY**, REC-1) | `super` | Orgs |

> Row #3 does NOT change `MUTATION_PERMISSION` or `ROLE_GRANTS`; it consumes them. The allow/deny tests
> (§test.md) assert the granted roles allow + at least one non-granted role denies (with ZERO audit append)
> per family — and specifically that non-`super` is denied for `transferOwnership`.

## 5. Mock role context (build-time; how allow/deny is demonstrated)

```ts
// apps/admin/src/adapters/index.ts (or a small config module)
/** Build-time mock role for the UI-injected client. Fail-closed when absent. Tests override explicitly. */
const MOCK_ROLE: AdminRole | undefined = import.meta.env.VITE_ADMIN_MOCK_ROLE as AdminRole | undefined;
```

- The UI-injected `adminApiClient` + guarded adapter carry `MOCK_ROLE` so manual smoke can exercise a
  **granted** flow (default recommended `ops` for ban/bulk-ban; note `transferOwnership` needs `super` to
  demonstrate its allow path — OQ-B).
- Absent role → fail closed (every mutation → `unauthorized`). This mirrors slice #1's `unconfigured`
  fail-closed posture.
- **Unit tests do NOT rely on the env**: they construct `createGuardedCommandAdapter({ role })` /
  `createAuditedMockAdminApiClient({ role })` with explicit roles to cover allow AND deny per family.

## 6. Billing / Stripe-gate contract (NEW — Axis S / S2; the row's distinctive constraint)

**Billing is READ-ONLY this slice.** The contract is the *absence* of a billing mutation, made explicit and
structurally guarded:

- `billingReadSeam` exposes ONLY reads (`metrics`/`planDistribution`/`transactions`) — §2.
- **NO `billing*` method exists on `AdminApiClient`** (row #2 already shipped it without one — 6 mutations,
  none billing) and **NO `billing*` member exists in `MutationFamily`/`MUTATION_PERMISSION`**. Row #3 does
  NOT add one.
- `GuardedCommandAdapter` exposes NO billing method (§3).
- `BillingPage` renders NO mutation affordance (no confirm flow, no `commands.*` call). (Optional inert
  disabled `BILLING_MANAGE`-gated placeholder = OQ-C, recommended OMITTED.)
- The `BILLING_MANAGE` permission key (`admin.billing.manage`, super+finance) remains **catalogued-but-
  unwired** — present for the future, zero mutation surface today.

**Gate precondition (documented; what must exist before a billing mutation may be minted):** a server-side,
**webhook-backed**, **idempotent** Stripe-mirror state machine — Stripe is the source of truth; the server
mirrors subscription state via at-least-once webhooks whose `event.id` is stored under a UNIQUE constraint
and whose idempotency record + state mutation share ONE transaction; plus reconciliation tooling (rebuild
from Stripe's Events API), server-authoritative RBAC (`BILLING_MANAGE`), and an audit append in the same
transaction as the billing effect. None of that exists (D4 PAUSED; no server line authorized). The browser
admin app can NEVER originate a billing write (it holds no Stripe secret — `TT-NO-SECRET-SRC/BUNDLE` already
forbid `sk_live_`/`sk_test_`). When that server state lands (a later row), a billing mutation family is
APPENDED to the catalog (row #2 D2 append-only) + the audited path + a guarded method — behind these same
seams, with NO UI rewrite.

**Structural guard (tested — `TT-BILLING-GATE-NO-MUTATION`):** assert `MutationFamily` has no member matching
`/billing/i`, `AdminApiClient` exposes no method matching `/^(set|change|update|cancel|refund).*[Bb]illing|[Bb]illing/` that returns `MutationAck`, `GuardedCommandAdapter` has no billing method, and `BillingPage` renders no element bound to a `commands.*` call. The gate cannot silently regress.

## 7. Permission / idempotency / security notes

- **Permission:** the three guarded families re-check `canMutate` server-shaped in the audited mock (row #5);
  required keys are row #2's `MUTATION_PERMISSION` (UNCHANGED). Reads are gated by `VIEW_*` server-side in the
  real impl (deferred). Browser advisory; server authoritative.
- **Idempotency:** reads are pure. Guarded mutations are `applied:false` (no real effect → trivially
  idempotent for the *write*); each granted call appends a NEW audit event (append-only ledger — distinct
  entries by design). Real write idempotency (ban-already-banned, transfer races) is defined when a real
  transport lands. Real *billing* idempotency = the Stripe `event.id`-UNIQUE webhook pattern (§6), deferred.
- **Security (hard, re-asserted):** NO service-role token, provider secret, or Stripe secret in `apps/admin/`
  source or built bundle — `TT-NO-SECRET-SRC` (src) + `TT-NO-SECRET-BUNDLE` (dist) re-run over the new
  `adapters/` modules + wired pages. Billing fixtures carry only display amounts/statuses. The guarded mock
  holds no service-role credential + does no I/O.
- **Separation / scope:** no `syncScope` entity; no cross-device persistence (ADR-0013 §D4 / PAUSED `sync`).
  No `@repo/audit-log-integrity` import (row #5 ports the pattern). No new typed events; no Tauri commands.
  **D3 = W0.**

## 8. Public surface

`apps/admin` remains an **app**, not a library (no consumed `index.ts`). The row-#3 modules
(`adapters/guardedCommands.ts`, the composed read seams in `adapters/index.ts`) are **internal** to the admin
app and MUST NOT be imported by `apps/web` or `packages/core` (enforced by physical separation + the
no-cross-import boundary). Their "contract" role is internal: the guarded-command + read-seam interfaces that
the real server in later rows must honor behind the same `AdminApiClient`.
