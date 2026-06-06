# api.md — xai-admin-dashboard-shell

> Interface contracts / error semantics for the isolated admin surface (slice #1).
> All contracts are **typed seams**; slice #1 ships mock implementations. Later rows swap
> implementations behind these same interfaces without UI changes.

## 1. Consumed upstream contract (read-only, unchanged)

`@repo/web-auth-device-session` (Stable, NOT modified this slice):

```ts
// from packages/web-auth-device-session/src/index.ts (existing)
useWebAuthSession(): {
  state: "loading" | "authenticated" | "unauthenticated" | "unconfigured";
  session: Session | null;        // Supabase Session (no admin claim modeled)
  deviceId: string | null;
  // ...
}
```

The admin surface consumes `state` + `session` **read-only**. No admin claim exists upstream →
the admin-claim is derived locally (mock) this slice.

## 2. Admin-claim predicate contract (NEW, admin-owned, mock-backed)

```ts
// apps/admin/src/auth/adminClaim.ts
export interface AdminClaim {
  isAdmin: boolean;
  /** opaque role label for display only; NOT an enforcement key (RBAC = row #2) */
  role?: string;
}

/** Pure predicate: derives an admin claim from the session. Fails CLOSED. */
export type AdminClaimPredicate = (session: Session | null) => AdminClaim;

/** Slice #1 mock implementation — fails closed on null/unknown. */
export const mockAdminClaimPredicate: AdminClaimPredicate;
```

**Error / edge semantics (binary, testable):**
- `session === null` → `{ isAdmin: false }` (fail closed).
- session present but no admin marker (mock reads e.g. `session.user.app_metadata?.xai_admin === true` OR a build-time `VITE_ADMIN_MOCK_CLAIM` flag) → `{ isAdmin: false }` unless explicitly marked.
- Never throws; always returns a defined `AdminClaim`.
- The predicate is **side-effect free** (no network, no storage write).

## 3. Route guard contract (NEW, composes existing guard shape)

```ts
// apps/admin/src/auth/AdminRouteGate.tsx
export interface AdminGuardResolution {
  allow: boolean;
  redirectTo?: string;            // e.g. "/auth/login?next=..." or "/forbidden"
  reason?: "auth_required" | "not_admin";
}

export function resolveAdminRouteGuard(
  state: "loading" | "authenticated" | "unauthenticated" | "unconfigured",
  claim: AdminClaim
): AdminGuardResolution;

export function AdminRouteGate(props: { children; fallback?; navigate? }): JSX.Element;
```

**Semantics:**
- `state === "loading"` → `{ allow: false }` (no redirect yet; render fallback).
- `state !== "authenticated"` → `{ allow: false, redirectTo: "/auth/login?next=...", reason: "auth_required" }`.
- authenticated AND `claim.isAdmin === false` → `{ allow: false, redirectTo: "/forbidden", reason: "not_admin" }`.
- authenticated AND `claim.isAdmin === true` → `{ allow: true }`.
- Composition mirrors the SHIPPED `resolveAppRouteGuard` shape in `guards.tsx` (auth gate) + an additional admin-claim gate layered on top.

## 4. Typed read-model interfaces (one per page, mock-backed)

Each page reads ONLY through its interface. Mock adapters port prototype fixtures. Slice #1 has
**no mutating reads**; every method is read-only and returns typed data.

```ts
// apps/admin/src/adapters/types.ts (illustrative shapes — exact fields finalized in build phase)
export interface OverviewReadModel {
  getKpis(): KpiCard[];
  getOpsQueue(): OpsQueueItem[];          // severity-ranked: risky logins, tickets, dunning, over-quota orgs, high-cost users, dormant admins
  getFeatureRanking(): FeatureRank[];
  getUsageHeatmap(featKey?: string): HeatCell[][];
}
export interface UsersReadModel {
  list(query: UserQuery): UserRow[];      // status, plan, usage, cost, risk, lastLogin
  savedViews(): SavedView[];
  get(id: string): UserDetail | null;
}
export interface OrgsReadModel { list(): OrgRow[]; get(id: string): OrgDetail | null; }   // boards / 组织·空间
export interface FeaturesReadModel { list(): FeatureFlag[]; get(key: string): FeatureDetail | null; }
export interface AiUsageReadModel { quotaPolicies(): QuotaPolicy[]; topSpenders(): SpenderRow[]; }
export interface ProvidersReadModel {
  list(): ProviderCard[];                 // key STATUS only — NEVER key material
  modelPlanMatrix(): ModelPlanCell[][];
  routingPolicies(): RoutingPolicy[];
}
export interface RolesReadModel { roles(): RoleCard[]; rbacMatrix(): RbacCell[][]; }
export interface BillingReadModel { metrics(): BillingMetrics; planDistribution(): PlanShare[]; transactions(): TxnRow[]; }
export interface AuditReadModel { query(filter: AuditFilter): AuditRow[]; }   // read-only by definition
export interface SettingsReadModel { read(): AdminSettings; }                // org info / security / webhooks (read this slice)
```

## 5. Destructive command adapters (NEW, no-op this slice)

Destructive UI affordances are preserved (type-to-confirm `ConfirmModal`) but wired to no-op mocks.

```ts
// apps/admin/src/adapters/commands.ts
export interface AdminCommandAdapter {
  banUser(input): Promise<NoOpResult>;
  bulkBan(input): Promise<NoOpResult>;
  setFeatureRollout(input): Promise<NoOpResult>;
  transferOwnership(input): Promise<NoOpResult>;
  setProviderRouting(input): Promise<NoOpResult>;
  setQuota(input): Promise<NoOpResult>;
}
export interface NoOpResult { ok: true; noop: true; reason: "slice-1-mock-no-write"; }
```

**Semantics:** every command returns `{ ok: true, noop: true, reason: "slice-1-mock-no-write" }`
WITHOUT performing any write, network call, or persistence. RBAC + audit + real mutation = rows #2–#5.

## 6. Permission / idempotency / security notes

- **Permission**: the AdminRouteGate fails closed; the admin-claim predicate is the single gate this slice.
  Real RBAC permission keys + server enforcement = row #2 (this slice has NO enforcement keys).
- **Idempotency**: read models are pure reads; command adapters are no-ops (trivially idempotent).
- **Security (hard)**: no service-role token, no provider secret, no Stripe secret key appears in
  `apps/admin/` source or the built bundle. Providers read model exposes **key status only**, never key
  material. Asserted by a bundle/source-text guard test (§test.md).
- **No new typed events** (`@repo/core/src/events` untouched); **no Tauri commands** (browser-side only).

## 7. Public surface of `apps/admin`

`apps/admin` is an **app**, not a library — it has no `index.ts` public export consumed by others.
Its "contract" is internal (the typed interfaces above) plus its deploy artifacts (`dist/`, `_headers`).
Admin modules MUST NOT be imported by `apps/web` or `packages/core` (enforced by physical separation +
the no-cross-import boundary).
