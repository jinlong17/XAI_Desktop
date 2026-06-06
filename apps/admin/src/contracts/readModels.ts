/**
 * apps/admin/src/contracts/readModels.ts — canonical read-model contract (row #2, P1).
 *
 * Roadmap row #2 (`xai-admin-data-contracts-rbac`) PROMOTES slice #1's 10 read-model
 * interfaces (`../adapters/types.ts`) to the canonical, frozen contract surface that
 * rows #3–#5 implement contract-backed services against.
 *
 * SINGLE SOURCE (api.md §2, REC-3): this module is a RE-EXPORT of the slice #1 types,
 * NOT a re-declaration. The interfaces continue to live in `../adapters/types.ts`; this
 * file is the stable import path the later rows depend on so the contract identity is
 * preserved (TT-READMODEL-CONTRACT asserts `adminReadModels` still satisfies the canonical
 * `AdminReadModels` — i.e. the re-exported type IS the slice #1 type, never a fork).
 *
 * Why re-export, not re-declare:
 *   - the slice #1 `adapters/types.ts` is SHIPPED and is the implemented contract; forking
 *     it here would create two drifting definitions (R3). The real return shapes are 1-D
 *     (`ModelPlanCell[]` / `RbacRow[]`); a hand-copied `[][]` (as in slice #1's stale *doc*)
 *     would silently diverge. Re-exporting makes that drift a compile error.
 *
 * Boundary (design.md, W0): contract-only, browser-side; no shared `@repo/*` change,
 * no typed events, no Tauri command, no `syncScope` entity.
 *
 * Test strategy: apps/admin/docs/data-contracts-rbac/test.md §1 (TT-READMODEL-CONTRACT,
 * TT-READMODEL-ANNOTATION).
 */

/* ------------------------------------------------------------------ *
 * Canonical read-model contract — re-export (single source of truth)
 * ------------------------------------------------------------------ */

export type {
  OverviewReadModel,
  UsersReadModel,
  OrgsReadModel,
  FeaturesReadModel,
  AiUsageReadModel,
  ProvidersReadModel,
  RolesReadModel,
  BillingReadModel,
  AuditReadModel,
  SettingsReadModel,
  AdminReadModels,
} from "../adapters/types";

// Supporting value/shape types that the read models return — re-exported so contract
// consumers (rows #3–#5, the AdminApiClient in P4) bind to the SAME shapes, never a fork
// (REC-2: AdminApiClient read returns reuse these, no parallel `OverviewPayload`).
export type {
  // overview
  KpiCard,
  OpsQueueItem,
  OpsQueueRow,
  FeatureRank,
  HeatCell,
  // users
  UserRow,
  UserQuery,
  UserDetail,
  SavedView,
  // orgs
  OrgRow,
  OrgDetail,
  // features
  FeatureFlag,
  FeatureDetail,
  FeatureQuota,
  // ai usage
  SpenderRow,
  QuotaPolicy,
  // providers (key STATUS only — never key material)
  ProviderCard,
  ProviderModel,
  ProviderKeyStatus,
  ModelPlanCell,
  // roles (display read model; enforcement lives in ../authz)
  RoleCard,
  RbacRow,
  // billing
  BillingMetrics,
  PlanShare,
  TxnRow,
  // audit
  AuditRow,
  AuditFilter,
  // settings
  AdminSettings,
  AdminSettingToggle,
  // shared enums
  PlanTier,
  UserStatus,
  RiskLevel,
  FeatureCategory,
  FeatureStatus,
} from "../adapters/types";

/* ------------------------------------------------------------------ *
 * Read-model registry keys + live/mock/deferred annotation (api.md §2.1)
 * ------------------------------------------------------------------ */

/**
 * The 10 canonical page read-model keys — exactly the keys of `AdminReadModels`.
 * Frozen `as const` so `TT-READMODEL-ANNOTATION` can structurally assert the
 * live/mock/deferred map covers every page read model (none missing, none extra).
 */
export const READ_MODEL_KEYS = [
  "overview",
  "users",
  "orgs",
  "features",
  "aiUsage",
  "providers",
  "roles",
  "billing",
  "audit",
  "settings",
] as const;

export type ReadModelKey = (typeof READ_MODEL_KEYS)[number];

/** Source posture of a read model today and the row that makes it live. */
export type ReadModelSourceState = "live" | "mock" | "deferred";

export interface ReadModelAnnotation {
  /** registry key on `AdminReadModels` */
  key: ReadModelKey;
  /** prototype page slug */
  page: string;
  /** posture TODAY — row #2 is contract-only, so every read model is mock today */
  today: ReadModelSourceState;
  /** roadmap row that swaps the mock for a live source (null once already derivable) */
  becomesLiveIn: string | null;
  notes: string;
}

/**
 * Live / mock / deferred annotation per page (mirrors api.md §2.1).
 *
 * Row #2 is CONTRACT-ONLY → every read model is `mock` today; the table records the
 * target row that makes each live. The `roles` display matrix MAY derive from the
 * row-#2 authz catalog (api.md §4.4) — but enforcement stays in `../authz`, never here.
 */
export const READ_MODEL_ANNOTATIONS: readonly ReadModelAnnotation[] = [
  { key: "overview", page: "dashboard", today: "mock", becomesLiveIn: "row #3", notes: "KPIs/ops-queue/heatmap aggregate over users/orgs/billing — depends on #3 read sources" },
  { key: "users", page: "users", today: "mock", becomesLiveIn: "row #3", notes: "service-role user listing/detail (RLS-safe)" },
  { key: "orgs", page: "orgs", today: "mock", becomesLiveIn: "row #3", notes: "org/member/seat schema or adapter" },
  { key: "features", page: "features", today: "mock", becomesLiveIn: "row #4", notes: "server feature-flag/entitlement service" },
  { key: "aiUsage", page: "ai", today: "mock", becomesLiveIn: "row #4", notes: "usage ledger + cost aggregation" },
  { key: "providers", page: "providers", today: "mock", becomesLiveIn: "row #4", notes: "key STATUS only, never key material (server secret handles)" },
  { key: "roles", page: "roles", today: "mock", becomesLiveIn: "row #2 derivable", notes: "display matrix MAY derive from the row-#2 authz catalog (api.md §4.4); enforcement stays in authz/" },
  { key: "billing", page: "billing", today: "mock", becomesLiveIn: "row #3", notes: "Stripe webhook-backed state (read); mutations gated later" },
  { key: "audit", page: "audit", today: "mock", becomesLiveIn: "row #5", notes: "immutable admin audit query endpoint" },
  { key: "settings", page: "settings", today: "mock", becomesLiveIn: "row #6", notes: "versioned settings schema" },
] as const;
