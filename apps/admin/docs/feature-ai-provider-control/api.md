# api.md — xai-admin-feature-ai-provider-control

> Interface contracts / error semantics for wiring the admin **Feature management / AI usage & quota /
> Provider config** pages to the typed transport, graduating their three CONFIG mutations, extending the
> providers read model to a **secret-handle status** shape, and adding an explicit provider-key no-leak
> guard (roadmap row #4).
> All contracts are **admin-local typed seams with mock impls**; row #4 ships NO real server, NO real
> provider calls, NO real secret material, NO real mutation. The guarded-mutation invariant is proven on
> the **audited mock** path (browser advisory; server-authoritative is the real enforcer — row #2 C2 /
> row #5 B2).
> Builds on (does NOT redo) slice #1's `apps/admin/docs/api.md`, row #2's
> `apps/admin/docs/data-contracts-rbac/api.md`, row #5's `apps/admin/docs/audit-ops-queue/api.md`, and
> row #3's `apps/admin/docs/users-orgs-billing/api.md`.

## 1. Consumed upstream contracts (reused, UNCHANGED — except the additive providers read-model extension)

From **row #2** (`apps/admin/src/contracts/adminApi.ts`, SHIPPED):

```ts
export type AdminApiResult<T> = AdminApiOk<T> | AdminApiErr;   // discriminated; fail-closed friendly
export interface AdminApiError { code: AdminApiErrorCode; message: string; }
export interface MutationAck { applied: boolean; auditId?: string; }
export interface AdminApiClient {
  // reads incl. getFeatures/getFeature/getQuotaPolicies/getTopSpenders/getProviders/getModelPlanMatrix
  // mutations incl. setFeatureRollout/setQuota/setProviderRouting (the 3 THIS row graduates) + the 3 row-#3 families
}
export function createMockAdminApiClient(ctx?: { role?: AdminRole }): AdminApiClient; // fail-closed, no I/O
```

> Verified: the `AdminApiClient` already exposes all six reads + the three CONFIG mutations this row needs.
> **Row #4 adds NO new transport method.**

From **row #2** (`apps/admin/src/authz/*`, SHIPPED):

```ts
export type MutationFamily = keyof AdminCommandAdapter;          // the 6 families
export const MUTATION_PERMISSION: Record<MutationFamily, PermissionKey>;
// setFeatureRollout → FEATURE_ROLLOUT (super+ops); setQuota → QUOTA_SET (super+ops);
// setProviderRouting → PROVIDER_ROUTING (super-only).
export function canMutate(role: AdminRole | null | undefined, family: MutationFamily): boolean; // advisory
```

From **row #5** (`apps/admin/src/audit/auditedMutation.ts`, SHIPPED):

```ts
export function createAuditedMockAdminApiClient(ctx?: AuditedMockContext):
  { client: AdminApiClient; chain: AdminAuditChain };
// FAMILY_ACTION already maps: setFeatureRollout→"features.rollout", setProviderRouting→"providers.routing",
//   setQuota→"quota.set". granted → append AdminAuditEvent THEN ack {applied:false, auditId}; denied → ZERO.
```

From **row #3** (`apps/admin/src/adapters/guardedCommands.ts` + `components/AdminUiContext.tsx`, SHIPPED):

```ts
export interface GuardedCommandAdapter {            // EXTENDED this row to all six families (§3)
  banUser; bulkBan; transferOwnership;              // row #3 (UNCHANGED)
}
export function createGuardedCommandAdapter(ctx?: AuditedMockContext): { commands; chain };
// AdminUiContext.AdminCommands ALREADY = guarded(ban/bulk/transfer) + no-op(setFeatureRollout/setProviderRouting/setQuota);
//   row #4 FLIPS the latter three to guarded (§3.1).
```

From **slice #1** (`apps/admin/src/adapters/types.ts`, SHIPPED — read-model contracts, NOT re-declared):

```ts
export interface FeaturesReadModel { list(query?): FeatureFlag[]; get(key): FeatureDetail | null; categories(): FeatureCategory[]; }
export interface AiUsageReadModel  { quotaPolicies(): QuotaPolicy[]; topSpenders(): SpenderRow[]; }
export interface ProvidersReadModel { list(): ProviderCard[]; modelPlanMatrix(): ModelPlanCell[]; }
export interface ProviderCard { key; name; color; enabled; keyStatus: "configured"|"not-configured"; usage; cost; defaultModel; models; }
export interface AdminCommandAdapter { ...; setFeatureRollout; setProviderRouting; setQuota; } // slice #1 no-op
```

> Row #4 **wires + graduates** these — it reuses every contract above by **composition + extension** and
> does not redefine or fork any of them.

## 2. Composed read seams (NEW — Axis R / R2; pages read these through `../adapters`)

Row #4 adds async read seams in `apps/admin/src/adapters/index.ts` that delegate the three pages' reads to
the row #2 `AdminApiClient`. The pages consume them through `../adapters` (TT-NO-INLINE-MOCK stays green).
Slice #1's `featuresAdapter`/`aiUsageAdapter`/`providersAdapter` are UNCHANGED (additive; the row #3 /
row #5 R-1 precedent — the same `../adapters` file already carries `usersReadSeam`/`orgsReadSeam`/
`billingReadSeam` from row #3, plus the row #5 composed seams).

```ts
// apps/admin/src/adapters/index.ts (additive — slice #1 + row #5 + row #3 blocks above UNCHANGED)

/** Features read seam — delegates to the AdminApiClient; returns the §1 contract shapes (no fork). */
export const featuresReadSeam: {
  list(query?: { text?: string; category?: FeatureCategory | "" }): Promise<AdminApiResult<FeatureFlag[]>>;
  get(key: string): Promise<AdminApiResult<FeatureDetail | null>>;
  // categories() stays pure UI config — sourced from the slice #1 featuresAdapter (sync, no transport)
};

/** AI usage / quota read seam. */
export const aiUsageReadSeam: {
  quotaPolicies(): Promise<AdminApiResult<QuotaPolicy[]>>;
  topSpenders(): Promise<AdminApiResult<SpenderRow[]>>;
};

/** Providers read seam — secret-handle / status ONLY (no key material; §4). */
export const providersReadSeam: {
  list(): Promise<AdminApiResult<ProviderCard[]>>;
  modelPlanMatrix(): Promise<AdminApiResult<ModelPlanCell[]>>;
  // secretHandles() (§4) is OPTIONAL — if surfaced, returns ProviderSecretHandle[] (status/handle/metadata only)
};
```

**Semantics (binary, tested):**
- Each read returns the **§1 `AdminApiResult<T>`** envelope; `data` is the slice-#1/row-#2 contract shape
  (e.g. `FeatureFlag[]`) — NO parallel/forked read type.
- Reads are pure with respect to writes (no network, no storage in the mock); they resolve fixture data via
  the shared `adminApiClient` mock (row #3's `adminApiClient = createMockAdminApiClient({...})`, reused).
- The **page** awaits the seam and renders `data` on `ok:true`; on `ok:false` it shows an empty/error state
  (reads do not fail in the mock, but the page handles the discriminated union so the real-server swap is
  transport-only).
- `categories()` (Features) and the table column configs are **UI config, not data** — they stay sourced
  from the slice #1 `featuresAdapter` (sync); only row data flows through the transport (the row #3
  `savedViews`/`filterChips` sync-config split precedent).

> Exact seam ergonomics (a small async hook vs direct `await` in the page, suspense vs loading flag) are a
> build-time UI detail; the **contract** is: page row data is obtained via `AdminApiResult<T>` from the
> `AdminApiClient`-backed seam exposed on `../adapters`. Reuse the shared `adminApiClient` from row #3.

## 3. Guarded command adapter — extension to the 3 CONFIG families (NEW — Axis M / M2 / M2a)

Row #4 EXTENDS row #3's `GuardedCommandAdapter` to all six families by adding the three CONFIG families,
each delegating to row #5's `createAuditedMockAdminApiClient`. The audited client already audits all six
families (verified) — this row only *surfaces* and *wires* the three CONFIG ones.

```ts
// apps/admin/src/adapters/guardedCommands.ts (EXTENDED — row #3 ban/bulk/transfer UNCHANGED)
export interface GuardedCommandAdapter {
  banUser(input: { email: string }): Promise<AdminApiResult<MutationAck>>;            // row #3
  bulkBan(input: { emails: string[] }): Promise<AdminApiResult<MutationAck>>;          // row #3
  transferOwnership(input: { org: string; toMember: string }): Promise<AdminApiResult<MutationAck>>; // row #3
  // ---- row #4 additions (the 3 CONFIG families) ----
  setFeatureRollout(input: { key: string; rollout: number }): Promise<AdminApiResult<MutationAck>>;
  setQuota(input: { subject: string; quota: number }): Promise<AdminApiResult<MutationAck>>;
  setProviderRouting(input: { plan: PlanTier; model: string }): Promise<AdminApiResult<MutationAck>>;
}
// createGuardedCommandAdapter(ctx?) now wires all six methods to the row #5 audited client (same factory).
```

**Error / outcome semantics (binary, tested) — per CONFIG family:**
- **Deny (no role):** `{ ok:false, error:{ code:"unauthorized" } }`, **ZERO** audit append.
- **Deny (role lacks key):** `{ ok:false, error:{ code:"forbidden" } }`, **ZERO** audit append.
  - `setFeatureRollout` / `setQuota` are **super+ops** → `support`/`finance`/`audit` denied (ZERO append).
  - `setProviderRouting` is **SUPER-ONLY** (`PROVIDER_ROUTING`) → `ops`/`support`/`finance`/`audit` denied (ZERO append).
- **Allow:** `{ ok:true, data:{ applied:false, auditId: <event hash> } }` — **`applied:false`** (NO real
  write this row) + **`auditId`** set (audit recorded via the row #5 chain; `permissionKey` =
  `MUTATION_PERMISSION[family]`, `mutationFamily` = family, `action` = `FAMILY_ACTION[family]`).
- Methods never throw for an authz failure (return `ok:false`). Pure with respect to external state; no
  network/persistence (the audited mock chain lives in memory). NO provider/service-role credential held.

### 3.1 `AdminUiContext` injection flip (the swap)

```ts
// apps/admin/src/components/AdminUiContext.tsx — AdminCommands (combined surface, row #3) UNCHANGED in shape;
//   row #4 FLIPS the source of the 3 CONFIG families from no-op to guarded.
export type AdminCommands = GuardedCommandAdapter;   // all six families now guarded (was: 3 guarded + 3 no-op)
```

- The provider builds the guarded adapter once with the mock role context (§5) and exposes ALL six families
  as `commands` (the three row #3 families keep their existing guarded binding).
- The CONFIG pages' existing calls — `await commands.setFeatureRollout({ key, rollout })` (FeaturesPage),
  `await commands.setQuota({ subject, quota })` (AiUsagePage), and the NEW
  `await commands.setProviderRouting({ plan, model })` (ProvidersPage) — now reach the guarded path
  (RBAC + audit-on-mutation + `applied:false`). FeaturesPage/AiUsagePage call sites are **unchanged** (they
  already `await commands.*()` without inspecting the result; verified). ProvidersPage gains the
  routing-mutation affordance (§4.2). Slice #1's `mockAdminCommandAdapter` + `TT-CMD-NOOP` remain intact
  (the no-op adapter is simply no longer the injection source for these three families).

## 4. Provider secret-handle read model (NEW — Axis P / P2; the row's distinctive contract)

Row #4 EXTENDS the providers read path with a typed, additive **secret-handle status** shape. The browser
receives an opaque handle + status + non-secret metadata ONLY — **never** a key, secret, or decryptable
material. This is the explicit form of the manifest "provider secret handles, browser receives
handles/status only".

```ts
// apps/admin/src/adapters/types.ts (additive — slice #1 ProviderCard / ProvidersReadModel UNCHANGED)

/** Opaque, NON-secret provider secret-handle status. Holds NO key/secret material. */
export interface ProviderSecretHandle {
  /** provider key (matches ProviderCard.key), e.g. "gemini" */
  provider: string;
  /** opaque NON-secret reference id (a handle, NOT the key), e.g. "pk_ref_gemini_01" */
  handleId: string;
  /** configured status only (the slice #1 keyStatus, retained) */
  status: "configured" | "not-configured";
  /** optional ISO date of last rotation (non-secret metadata) */
  lastRotated?: string;
  /** vault/reference label (non-secret), e.g. "vault:admin/providers/gemini" — NOT the secret path's value */
  vaultRef?: string;
  // NOTE (OQ-C): a non-secret display token (plain last-4/prefix, e.g. "gem_…") MAY be added, but MUST be
  // non-reversible AND MUST NOT use the bullet-mask shape (xxx••••) the bundle guard forbids. Recommend OMIT.
}
```

### 4.1 Where it surfaces
- Either as an OPTIONAL `secretHandles(): ProviderSecretHandle[]` on the providers read seam (§2), or as an
  additive field set folded into the `ProviderCard` view the page already renders. **Recommend:** a separate
  `secretHandles()` projection so `ProviderCard` (slice #1, pinned by `adapters.test.ts`) stays UNCHANGED.
  Build-time choice; either way **no key field** is introduced. The mock sources it from the providers
  fixtures' existing `keyStatus` (status) + a derived opaque `handleId` (e.g. `pk_ref_<provider>_01`); NO
  secret material is read or stored.

### 4.2 Provider routing mutation affordance (ProvidersPage)
- The previously-inert "管理限速与默认模型" path is wired to `commands.setProviderRouting({ plan, model })`
  (guarded, **super-only**), with type-to-confirm via the existing `ConfirmModal`. The input is a
  `{ plan: PlanTier; model: string }` (model identifiers only — NO key, NO secret). On a granted call:
  `{ applied:false, auditId }` + a toast; on a denied call (non-super): `forbidden`, no effect. The page
  renders the secret-handle **status** (configured / last-rotated / handle id) but **never** key material.

### 4.3 Hard contract: NO key material on the providers path
- `ProviderCard`, `ProviderSecretHandle`, the providers fixtures, and the providers page render carry NO
  field whose name implies key material (`key`/`secret`/`apiKey`/`token`/`credential` as a *secret value*
  — note `ProviderCard.key` is the provider SLUG, not a secret, and is retained) and NO key-shaped string.
  Real secret storage is server-side (a vault / one-way hash); the admin browser holds only handles/status.
  Asserted by `TT-PROVIDER-NO-KEY-MATERIAL` (§ test.md).

## 5. Mock role context (build-time; how allow/deny is demonstrated)

```ts
// apps/admin/src/adapters/index.ts (reuse the row #3 shared client) + AdminUiContext.tsx
const MOCK_ROLE: AdminRole | undefined = import.meta.env.VITE_ADMIN_MOCK_ROLE as AdminRole | undefined;
```

- The UI-injected guarded adapter carries `MOCK_ROLE` so manual smoke can exercise a **granted** flow.
  `setFeatureRollout`/`setQuota` need `ops` or `super`; **`setProviderRouting` needs `super`** (super-only).
  **Recommend default `super`** for the routing smoke (covers all three); note `ops` suffices for
  rollout/quota.
- Absent role → fail closed (every mutation → `unauthorized`). Mirrors the slice #1 / row #3 fail-closed
  posture.
- **Unit tests do NOT rely on the env**: they construct `createGuardedCommandAdapter({ role })` /
  `createAuditedMockAdminApiClient({ role })` with explicit roles to cover allow AND deny per CONFIG family
  (including `setProviderRouting` super-only deny for `ops`/`support`/`finance`/`audit`).

## 6. RBAC mapping for the three CONFIG families (reused, UNCHANGED)

| Family | Permission key (row #2) | Allowed roles (row #2 `ROLE_GRANTS`) | Page |
|---|---|---|---|
| `setFeatureRollout` | `admin.features.rollout` (`FEATURE_ROLLOUT`) | `super`, `ops` | Features |
| `setQuota` | `admin.quota.set` (`QUOTA_SET`) | `super`, `ops` | AI usage & quota |
| `setProviderRouting` | `admin.providers.routing` (`PROVIDER_ROUTING`, **SUPER-ONLY**) | `super` | Providers |

> Row #4 does NOT change `MUTATION_PERMISSION` or `ROLE_GRANTS`; it consumes them. The allow/deny tests
> (§ test.md) assert the granted roles allow + every non-granted role denies (with ZERO audit append) per
> family — and specifically that non-`super` is denied for `setProviderRouting`.

## 7. Permission / idempotency / security notes

- **Permission:** the three CONFIG families re-check `canMutate` server-shaped in the audited mock (row #5);
  required keys are row #2's `MUTATION_PERMISSION` (UNCHANGED). Reads are gated by `VIEW_*` server-side in
  the real impl (deferred). Browser advisory; server authoritative.
- **Idempotency:** reads are pure. Guarded mutations are `applied:false` (no real effect → trivially
  idempotent for the *write*); each granted call appends a NEW audit event (append-only ledger). Real write
  idempotency (rollout/quota races, routing change ordering) is defined when a real transport lands. Real
  provider secret-handle rotation/idempotency = the server-side vault pattern (§ review §7), deferred.
- **Security (hard, re-asserted + EXTENDED):** NO service-role token, provider secret, or Stripe secret in
  `apps/admin/` source or built bundle — `TT-NO-SECRET-SRC` (src) + `TT-NO-SECRET-BUNDLE` (dist) re-run over
  the new `adapters/` modules + wired pages + the `ProviderSecretHandle` type. **PLUS the NEW, explicit
  `TT-PROVIDER-NO-KEY-MATERIAL`** proving the providers read model + fixtures + bundle carry no provider key
  material (the row's headline deliverable). The guarded mock holds no service-role OR provider credential
  + does no I/O. Providers stay handle/status-only.
- **Separation / scope:** no `syncScope` entity; no cross-device persistence (ADR-0013 §D4 / PAUSED `sync`).
  No `@repo/audit-log-integrity` import (row #5 ported the pattern). No `@repo/web-auth-device-session` or
  shared `@repo/*` change. No new typed events; no Tauri commands. **D3 = W0.**

## 8. Public surface

`apps/admin` remains an **app**, not a library (no consumed `index.ts`). The row-#4 modules (the composed
read seams + the extended `guardedCommands.ts` + the `ProviderSecretHandle` type + `no-provider-key.test.ts`)
are **internal** to the admin app and MUST NOT be imported by `apps/web` or `packages/core` (enforced by
physical separation + the no-cross-import boundary). Their "contract" role is internal: the read-seam +
guarded-command + secret-handle interfaces that the real server in later rows must honor behind the same
`AdminApiClient` — with the hard guarantee that the browser path never carries provider key material.
