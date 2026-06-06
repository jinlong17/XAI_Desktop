# api.md — xai-admin-data-contracts-rbac

> Interface contracts / error semantics for the admin **data + permission** layer (roadmap row #2).
> All contracts are **typed seams with mock impls**; row #2 ships NO real server. Rows #3–#5 swap the
> mock transport for a real service-role API **behind these same interfaces** without UI change.
> Builds on (does NOT redo) slice #1's `apps/admin/docs/api.md` (read-model interfaces + claim/guard).

## 1. Consumed upstream contract (read-only, UNCHANGED — A2)

`@repo/web-auth-device-session` (Stable, **NOT modified this row**):

```ts
useWebAuthSession(): {
  state: "loading" | "authenticated" | "unauthenticated" | "unconfigured";
  session: Session | null;   // Supabase Session; session.user.app_metadata is an arbitrary record
  // ...
}
```

The production admin claim is derived **admin-side** from the JWT custom claim that the issued access token
carries on `session.user.app_metadata` (Supabase Custom Access Token Hook). No admin field is added upstream.

### 1.1 Admin-claim graduation (slice #1 seam → production, fail-closed)

Slice #1 shipped `AdminClaimPredicate` (pure, fail-closed) reading `session.user.app_metadata.xai_admin`.
Row #2 keeps the **same seam**; the production predicate reads the real custom-claim key:

```ts
// apps/admin/src/auth/adminClaim.ts (seam UNCHANGED; body graduates)
export type AdminClaimPredicate = (session: AdminSession | null) => AdminClaim;
// production impl: reads session.user.app_metadata[ADMIN_CLAIM_KEY] (+ role); fails closed; pure; never throws.
```

- `session === null` → `{ isAdmin: false }` (fail closed).
- session present, no admin claim in `app_metadata` → `{ isAdmin: false }`.
- session present with the admin claim → `{ isAdmin: true, role }`.
- The exact claim key + whether it nests under `app_metadata.<key>` vs a top-level `user_role` claim is a
  **server-config detail finalized in a later row** (OQ-C, deferred). Row #2 fixes the seam + a named
  placeholder key, not the live hook config.

## 2. Read-model contract (canonical, promoted from slice #1)

Row #2 promotes slice #1's 10 read-model interfaces (`apps/admin/src/adapters/types.ts`) to the **canonical
frozen contract** (single source — `contracts/readModels.ts` re-exports/typed-surfaces them; it does NOT
re-declare them). Rows #3–#5 implement contract-backed services against these exact interfaces.

```ts
// apps/admin/src/contracts/readModels.ts (canonical surface)
export type {
  OverviewReadModel, UsersReadModel, OrgsReadModel, FeaturesReadModel, AiUsageReadModel,
  ProvidersReadModel, RolesReadModel, BillingReadModel, AuditReadModel, SettingsReadModel,
  AdminReadModels,
} from "../adapters/types";
```

### 2.1 Live / mock / deferred annotation (per page)

> "Live" = backed by a real source today; "Mock" = slice-#1 typed mock adapter (swap target for rows #3–#5);
> "Deferred" = real source owned by a specific later row. Row #2 is contract-only → **all read models are
> Mock today**; the table records the **target row** that makes each live.

| Read model | Page | Today | Becomes live in | Notes |
|---|---|---|---|---|
| `OverviewReadModel` | dashboard | Mock | row #3 (aggregation) | KPIs/ops-queue/heatmap aggregate over users/orgs/billing — depends on #3 read sources |
| `UsersReadModel` | users | Mock | **row #3** | service-role user listing/detail (RLS-safe) |
| `OrgsReadModel` | orgs | Mock | **row #3** | org/member/seat schema or adapter |
| `BillingReadModel` | billing | Mock | **row #3** | Stripe webhook-backed state (read); mutations gated later |
| `FeaturesReadModel` | features | Mock | **row #4** | server feature-flag/entitlement service |
| `AiUsageReadModel` | ai | Mock | **row #4** | usage ledger + cost aggregation |
| `ProvidersReadModel` | providers | Mock | **row #4** | **key STATUS only**, never key material (server secret handles) |
| `RolesReadModel` | roles | Mock (display) | row #2 derivable | display matrix MAY derive from the row-#2 authz catalog (see §4.4); enforcement stays in `authz/` |
| `AuditReadModel` | audit | Mock | **row #5** | immutable admin audit query endpoint |
| `SettingsReadModel` | settings | Mock | row #6 | versioned settings schema |

## 3. Permission-key catalog (NEW, immutable + append-only — D2)

```ts
// apps/admin/src/authz/permissionKeys.ts
/** Immutable, APPEND-ONLY. Never rename, renumber, or reuse a key. Dotted namespaced strings. */
export const PERMISSION_KEYS = {
  // reads / views
  VIEW_DASHBOARD:      "admin.dashboard.view",
  VIEW_AUDIT:          "admin.audit.view",
  // user lifecycle
  USER_MANAGE:         "admin.users.manage",
  USER_BAN:            "admin.users.ban",
  USER_IMPERSONATE:    "admin.users.impersonate",
  // feature / quota
  FEATURE_ROLLOUT:     "admin.features.rollout",
  QUOTA_SET:           "admin.quota.set",
  // org
  ORG_TRANSFER_OWNER:  "admin.orgs.transfer_ownership",
  // provider / model
  PROVIDER_ROUTING:    "admin.providers.routing",
  // billing
  BILLING_MANAGE:      "admin.billing.manage",
  // rbac / settings (super-only family)
  ROLE_MANAGE:         "admin.roles.manage",
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];
```

### 3.1 Mutation-family → permission-key map (every command maps to exactly one key)

The 6 destructive command families from slice #1 (`apps/admin/src/adapters/commands.ts`) each require exactly
one permission key. This map is the join between the API mutation contract (§4) and RBAC (§4.x):

```ts
// apps/admin/src/authz/permissionKeys.ts
export const MUTATION_PERMISSION: Record<MutationFamily, PermissionKey> = {
  banUser:           PERMISSION_KEYS.USER_BAN,
  bulkBan:           PERMISSION_KEYS.USER_BAN,
  setFeatureRollout: PERMISSION_KEYS.FEATURE_ROLLOUT,
  transferOwnership: PERMISSION_KEYS.ORG_TRANSFER_OWNER,
  setProviderRouting:PERMISSION_KEYS.PROVIDER_ROUTING,
  setQuota:          PERMISSION_KEYS.QUOTA_SET,
} as const;
// MutationFamily = keyof AdminCommandAdapter (banUser | bulkBan | setFeatureRollout | transferOwnership | setProviderRouting | setQuota)
```

**Invariants (tested):** keys unique (`TT-PERMKEY-UNIQUE`); every value matches `^admin\.[a-z_]+(\.[a-z_]+)*$`
(`TT-PERMKEY-PATTERN`); every `MutationFamily` has exactly one mapped key (`TT-PERMKEY-MUTATION-COVERAGE`);
the catalog is `as const` + an append-only doc rule + a snapshot guard (`TT-PERMKEY-APPEND-ONLY`).

## 4. RBAC model + predicate (NEW — normalized from prototype; advisory in browser)

### 4.1 Roles (normalized from prototype `ROLES`)
`super` (超级管理员), `ops` (运营), `support` (客服), `finance` (财务), `audit` (只读审计).

### 4.2 Role → permission grant map (normalized from prototype `RBAC`)

```ts
// apps/admin/src/authz/rbac.ts
export type AdminRole = "super" | "ops" | "support" | "finance" | "audit";

export const ROLE_GRANTS: Record<AdminRole, ReadonlySet<PermissionKey>> = {
  super:   /* ALL keys */,
  ops:     /* VIEW_DASHBOARD, USER_MANAGE, USER_BAN, FEATURE_ROLLOUT, QUOTA_SET */,
  support: /* VIEW_DASHBOARD, USER_MANAGE, USER_IMPERSONATE */,
  finance: /* VIEW_DASHBOARD, BILLING_MANAGE */,
  audit:   /* VIEW_DASHBOARD, VIEW_AUDIT */,   // read-only
} as const;
```

> Grants are normalized 1:1 from the prototype matrix (`docs/prototypes/admin-dashboard` `RBAC`):
> e.g. 封禁用户 → `super,ops`; 模拟登录 → `super,support`; Provider/模型配置 → `super`; 计费管理 →
> `super,finance`; 角色与权限管理 → `super`; 查看审计日志 → `super,audit`.

### 4.3 Predicate API (pure; **browser-advisory only**)

```ts
// apps/admin/src/authz/rbac.ts
/** Pure RBAC check. Browser use is ADVISORY/UX only — NOT the security boundary (server re-checks). */
export function can(role: AdminRole | null | undefined, key: PermissionKey): boolean;
export function canMutate(role: AdminRole | null | undefined, family: MutationFamily): boolean;
```

- `can(null, key)` / `can(undefined, key)` → `false` (fail closed).
- `can(role, key)` → `ROLE_GRANTS[role].has(key)`.
- `canMutate(role, family)` → `can(role, MUTATION_PERMISSION[family])`.
- Pure; never throws; no I/O.

**Security note (hard, documented + tested via `TT-RBAC-ADVISORY-NOTE`):** the browser predicate decides only
whether to **render/enable** a control. The **authoritative** RBAC decision is made **server-side** by the
admin API (§4.4). A browser bypass of `can()` must NOT be able to cause a privileged effect — because the
server re-authorizes and the browser holds no service-role credential.

### 4.4 Display RBAC vs enforcement RBAC (R6)
`RolesReadModel.rbacMatrix()` (slice #1, display) MAY derive its rows from `PERMISSION_KEYS` + `ROLE_GRANTS`
so the page shows the same data — but the **authz module is the single source of truth**; the read-model
never becomes the enforcement source. Direction is one-way: authz → display.

## 5. Admin API-boundary contract (NEW — typed mockable transport; NO real server this row)

```ts
// apps/admin/src/contracts/adminApi.ts
export interface AdminApiOk<T>   { ok: true;  data: T; }
export interface AdminApiErr     { ok: false; error: AdminApiError; }
export type AdminApiResult<T> = AdminApiOk<T> | AdminApiErr;

export type AdminApiErrorCode =
  | "unauthorized"      // no/invalid session (401-shaped)
  | "forbidden"         // authenticated but RBAC denies server-side (403-shaped)
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "server_error";
export interface AdminApiError { code: AdminApiErrorCode; message: string; }

/** Injectable transport. Row #2 ships a MOCK impl; rows #3–#5 provide a real service-role-API-backed impl. */
export interface AdminApiClient {
  // reads (typed to the §2 read models; mock returns slice-#1 fixtures)
  getUsers(query?: UserQuery): Promise<AdminApiResult<UserRow[]>>;
  getOverview(): Promise<AdminApiResult<OverviewPayload>>;
  // ... one read method per page read model (shapes = §2 contract)

  // mutations (the 6 families) — server RE-AUTHORIZES before any effect
  banUser(input: { email: string }): Promise<AdminApiResult<MutationAck>>;
  bulkBan(input: { emails: string[] }): Promise<AdminApiResult<MutationAck>>;
  setFeatureRollout(input: { key: string; rollout: number }): Promise<AdminApiResult<MutationAck>>;
  transferOwnership(input: { org: string; toMember: string }): Promise<AdminApiResult<MutationAck>>;
  setProviderRouting(input: { plan: PlanTier; model: string }): Promise<AdminApiResult<MutationAck>>;
  setQuota(input: { subject: string; quota: number }): Promise<AdminApiResult<MutationAck>>;
}

export interface MutationAck { applied: boolean; auditId?: string; }  // auditId is row #5's obligation
```

### 5.1 Server-authoritative contract (documented invariant — `TT-API-SERVER-AUTHORITATIVE`)
Every mutation method's contract states: the **server** extracts the JWT, validates the session
(`getUser()`-equivalent), checks the required permission key (`MUTATION_PERMISSION[family]`) **server-side**,
and only then performs the privileged op via a service-role client. The browser-side `canMutate()` is a
pre-filter for UX; it is **not trusted** by the server. (Supabase pattern: service_role bypasses RLS, so the
explicit server authz check + RLS defense-in-depth is the boundary.)

### 5.2 Fail-closed error semantics (documented + `TT-API-FAILCLOSED`)
- No/invalid session → `{ ok:false, error:{ code:"unauthorized" } }`.
- Authenticated but role lacks the permission key → `{ ok:false, error:{ code:"forbidden" } }`.
- The **mock impl fails closed by default** (returns `unauthorized`/`forbidden` unless explicitly given an
  admin role context in the mock), so the seam can be exercised in tests without granting access.
- Errors are typed `AdminApiError`; methods never throw for an authz failure (they return `ok:false`).

### 5.3 Mock impl (row #2 deliverable)
`createMockAdminApiClient(ctx?: { role?: AdminRole })`:
- reads → return slice-#1 fixtures (no network, no storage).
- mutations → if `canMutate(ctx.role, family)` is false → `{ ok:false, error:{ code:"forbidden" } }`; else
  `{ ok:true, data:{ applied:false } }` (**`applied:false`** — still no real write this row; mirrors
  slice-#1 `NoOpResult` semantics behind the new typed result shape).
- Performs **no** write/network/persistence (spy-asserted). Slice #1's no-op `AdminCommandAdapter` may later
  delegate to this client.

## 6. Permission / idempotency / security notes

- **Permission**: server-authoritative RBAC (§5.1); browser advisory (§4.3). The required key per mutation is
  fixed by `MUTATION_PERMISSION` (§3.1). Reads are gated by `VIEW_*` keys server-side in the real impl.
- **Idempotency**: reads are pure; row-#2 mutation mock returns `applied:false` (no effect → trivially
  idempotent). Real idempotency (e.g. ban already-banned) is defined when a real transport lands (rows #3–#5).
- **Security (hard, re-asserted from slice #1)**: NO service-role token, NO provider secret, NO Stripe secret
  in `apps/admin/` source or built bundle — asserted by `TT-NO-SECRET-SRC` (src) + `TT-NO-SECRET-BUNDLE`
  (dist). Providers read model stays **key-status-only**. The new `authz/`+`contracts/` modules are covered
  by these existing whole-`src`/`dist` guards.
- **No new typed events** (`@repo/core/src/events` untouched); **no Tauri commands**; **no `syncScope`
  entity** (ADR-0013 §D4 out of scope). **D3 = W0.**

## 7. Public surface

`apps/admin` remains an **app**, not a library (no consumed `index.ts`). The row-#2 contracts
(`authz/*`, `contracts/*`) are **internal** to the admin app and MUST NOT be imported by `apps/web` or
`packages/core` (enforced by physical separation + the no-cross-import boundary). Their "contract" role is
internal: the frozen interfaces that rows #3–#5 implement against.
