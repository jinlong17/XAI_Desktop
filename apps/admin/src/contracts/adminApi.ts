/**
 * apps/admin/src/contracts/adminApi.ts — admin API-boundary contract (row #2, P4).
 *
 * The typed transport seam between the admin browser app and the (future) service-role
 * admin API. Row #2 ships ONLY this interface + a MOCK impl; rows #3–#5 swap the mock for
 * a real service-role-API-backed impl BEHIND THIS SAME INTERFACE without any UI change.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────────────┐
 * │ SERVER-AUTHORITATIVE (C2, §5.1): every mutation's contract is that the SERVER extracts │
 * │ the JWT, validates the session, checks the required permission key                     │
 * │ (MUTATION_PERMISSION[family]) SERVER-SIDE, and only then performs the privileged op via │
 * │ a service-role client. The browser-side canMutate() is a UX pre-filter and is NOT       │
 * │ trusted by the server.                                                                 │
 * │                                                                                        │
 * │ HARD SECRET INVARIANT (slice #1, re-asserted): the browser NEVER receives a            │
 * │ service-role credential or any provider/Stripe secret. This module holds none; the     │
 * │ mock performs NO network/storage. Providers stay key-STATUS-only.                      │
 * └─────────────────────────────────────────────────────────────────────────────────────┘
 *
 * Boundary (design.md, W0): contract-only, browser-side; no shared `@repo/*` change, no
 * typed events, no Tauri command, no `syncScope` entity, no real server, no real mutation.
 *
 * Test strategy: apps/admin/docs/data-contracts-rbac/test.md §1
 * (TT-API-CONTRACT-SHAPE / FAILCLOSED / SERVER-AUTHORITATIVE).
 */
import { adminReadModels } from "../adapters/index";
import { canMutate, type AdminRole } from "../authz/rbac";
import type { MutationFamily } from "../authz/permissionKeys";
// REC-2: read returns bind to the §2 read-model CONTRACT types (single source) — NOT a fork.
import type {
  KpiCard,
  OpsQueueItem,
  FeatureRank,
  HeatCell,
  UserRow,
  UserQuery,
  UserDetail,
  OrgRow,
  OrgDetail,
  FeatureFlag,
  FeatureDetail,
  FeatureCategory,
  SpenderRow,
  QuotaPolicy,
  ProviderCard,
  ModelPlanCell,
  RoleCard,
  RbacRow,
  BillingMetrics,
  PlanShare,
  TxnRow,
  AuditRow,
  AuditFilter,
  AdminSettings,
  PlanTier,
} from "./readModels";

/* ------------------------------------------------------------------ *
 * Result / error envelope (discriminated union; fail-closed friendly)
 * ------------------------------------------------------------------ */

export interface AdminApiOk<T> {
  ok: true;
  data: T;
}
export interface AdminApiErr {
  ok: false;
  error: AdminApiError;
}
export type AdminApiResult<T> = AdminApiOk<T> | AdminApiErr;

export type AdminApiErrorCode =
  | "unauthorized" // no/invalid session (401-shaped)
  | "forbidden" // authenticated but RBAC denies server-side (403-shaped)
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "server_error";

export interface AdminApiError {
  code: AdminApiErrorCode;
  message: string;
}

/** Mutation acknowledgement. `auditId` is row #5's obligation (audit-on-mutation). */
export interface MutationAck {
  applied: boolean;
  auditId?: string;
}

/**
 * Composite overview read payload — bound to the §2 `OverviewReadModel` method RETURNS
 * (REC-2: NOT a parallel/forked shape). If `OverviewReadModel` changes upstream, these
 * field types change with it (they are derived via `ReturnType`-equivalent aliases).
 */
export interface OverviewPayload {
  kpis: KpiCard[];
  opsQueue: OpsQueueItem[];
  featureRanking: FeatureRank[];
  usageHeatmap: HeatCell[][];
}

/* ------------------------------------------------------------------ *
 * The injectable transport contract
 * ------------------------------------------------------------------ */

/**
 * Injectable admin API transport. Row #2 ships `createMockAdminApiClient`; rows #3–#5
 * provide a real service-role-API-backed impl with the SAME signatures.
 *
 * Reads — one method per page read model; return types ARE the §2 contract shapes (REC-2).
 * Mutations — the 6 families from slice #1's `AdminCommandAdapter`; inputs match EXACTLY;
 * the server RE-AUTHORIZES (MUTATION_PERMISSION[family]) before any effect.
 */
export interface AdminApiClient {
  /* reads (typed to the §2 read models) */
  getOverview(): Promise<AdminApiResult<OverviewPayload>>;
  getUsers(query?: UserQuery): Promise<AdminApiResult<UserRow[]>>;
  getUser(email: string): Promise<AdminApiResult<UserDetail | null>>;
  getOrgs(): Promise<AdminApiResult<OrgRow[]>>;
  getOrg(name: string): Promise<AdminApiResult<OrgDetail | null>>;
  getFeatures(query?: {
    text?: string;
    category?: FeatureCategory | "";
  }): Promise<AdminApiResult<FeatureFlag[]>>;
  getFeature(key: string): Promise<AdminApiResult<FeatureDetail | null>>;
  getQuotaPolicies(): Promise<AdminApiResult<QuotaPolicy[]>>;
  getTopSpenders(): Promise<AdminApiResult<SpenderRow[]>>;
  getProviders(): Promise<AdminApiResult<ProviderCard[]>>;
  getModelPlanMatrix(): Promise<AdminApiResult<ModelPlanCell[]>>;
  getRoles(): Promise<AdminApiResult<RoleCard[]>>;
  getRbacMatrix(): Promise<AdminApiResult<RbacRow[]>>;
  getBillingMetrics(): Promise<AdminApiResult<BillingMetrics>>;
  getPlanDistribution(): Promise<AdminApiResult<PlanShare[]>>;
  getTransactions(): Promise<AdminApiResult<TxnRow[]>>;
  getAudit(filter?: AuditFilter): Promise<AdminApiResult<AuditRow[]>>;
  getSettings(): Promise<AdminApiResult<AdminSettings>>;

  /* mutations (the 6 families) — server RE-AUTHORIZES before any effect (inputs = slice #1 EXACTLY) */
  banUser(input: { email: string }): Promise<AdminApiResult<MutationAck>>;
  bulkBan(input: { emails: string[] }): Promise<AdminApiResult<MutationAck>>;
  setFeatureRollout(input: {
    key: string;
    rollout: number;
  }): Promise<AdminApiResult<MutationAck>>;
  transferOwnership(input: {
    org: string;
    toMember: string;
  }): Promise<AdminApiResult<MutationAck>>;
  setProviderRouting(input: {
    plan: PlanTier;
    model: string;
  }): Promise<AdminApiResult<MutationAck>>;
  setQuota(input: {
    subject: string;
    quota: number;
  }): Promise<AdminApiResult<MutationAck>>;
}

/* ------------------------------------------------------------------ *
 * Mock impl (row #2 deliverable) — fail-closed, NO I/O, applied:false
 * ------------------------------------------------------------------ */

/**
 * Optional mock context. A `role` simulates a *server-side* authorized role for testing
 * the seam; omitting it models the unauthenticated/unauthorized path (fails closed).
 */
export interface MockAdminApiContext {
  /** simulated server-validated role; absent → unauthorized (fail closed) */
  role?: AdminRole;
}

const ok = <T>(data: T): AdminApiResult<T> => ({ ok: true, data });
const err = (code: AdminApiErrorCode, message: string): AdminApiErr => ({
  ok: false,
  error: { code, message },
});

/**
 * Build a fail-closed mock `AdminApiClient`.
 *
 * - reads → return slice-#1 fixtures via `adminReadModels` (pure; no network, no storage).
 * - mutations → if no role context → `unauthorized`; else if `canMutate(role, family)` is
 *   false → `forbidden`; else `{ ok:true, data:{ applied:false } }` (**applied:false** — NO
 *   real write this row; mirrors slice-#1 `NoOpResult` behind the typed result shape).
 * - performs NO write / network / persistence (spy-asserted by TT-API-SERVER-AUTHORITATIVE).
 *
 * The mock models the SERVER's decision (the browser canMutate is only a UX pre-filter):
 * even with a role, the result is the server-shaped allow/deny + `applied:false`.
 */
export function createMockAdminApiClient(
  ctx?: MockAdminApiContext,
): AdminApiClient {
  const role = ctx?.role;

  /** Server-authoritative gate for a mutation family (fail-closed). */
  function authorizeMutation(family: MutationFamily): AdminApiErr | null {
    if (!role) return err("unauthorized", "no admin session");
    if (!canMutate(role, family)) {
      return err("forbidden", `role "${role}" lacks permission for "${family}"`);
    }
    return null;
  }

  /** No-op applied:false ack for an authorized mutation (no real write this row). */
  function ackOrDeny(
    family: MutationFamily,
  ): AdminApiResult<MutationAck> {
    const denied = authorizeMutation(family);
    if (denied) return denied;
    return ok<MutationAck>({ applied: false });
  }

  return {
    /* reads — fixtures only, no I/O */
    getOverview: async () =>
      ok<OverviewPayload>({
        kpis: adminReadModels.overview.getKpis(),
        opsQueue: adminReadModels.overview.getOpsQueue(),
        featureRanking: adminReadModels.overview.getFeatureRanking(),
        usageHeatmap: adminReadModels.overview.getUsageHeatmap(),
      }),
    getUsers: async (query?: UserQuery) => ok(adminReadModels.users.list(query)),
    getUser: async (email: string) => ok(adminReadModels.users.get(email)),
    getOrgs: async () => ok(adminReadModels.orgs.list()),
    getOrg: async (name: string) => ok(adminReadModels.orgs.get(name)),
    getFeatures: async (query) => ok(adminReadModels.features.list(query)),
    getFeature: async (key: string) => ok(adminReadModels.features.get(key)),
    getQuotaPolicies: async () => ok(adminReadModels.aiUsage.quotaPolicies()),
    getTopSpenders: async () => ok(adminReadModels.aiUsage.topSpenders()),
    getProviders: async () => ok(adminReadModels.providers.list()),
    getModelPlanMatrix: async () => ok(adminReadModels.providers.modelPlanMatrix()),
    getRoles: async () => ok(adminReadModels.roles.roles()),
    getRbacMatrix: async () => ok(adminReadModels.roles.rbacMatrix()),
    getBillingMetrics: async () => ok(adminReadModels.billing.metrics()),
    getPlanDistribution: async () => ok(adminReadModels.billing.planDistribution()),
    getTransactions: async () => ok(adminReadModels.billing.transactions()),
    getAudit: async (filter?: AuditFilter) => ok(adminReadModels.audit.query(filter)),
    getSettings: async () => ok(adminReadModels.settings.read()),

    /* mutations — server-authoritative gate + applied:false (no real write) */
    banUser: async () => ackOrDeny("banUser"),
    bulkBan: async () => ackOrDeny("bulkBan"),
    setFeatureRollout: async () => ackOrDeny("setFeatureRollout"),
    transferOwnership: async () => ackOrDeny("transferOwnership"),
    setProviderRouting: async () => ackOrDeny("setProviderRouting"),
    setQuota: async () => ackOrDeny("setQuota"),
  };
}
