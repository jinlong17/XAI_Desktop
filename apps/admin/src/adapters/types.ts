/**
 * apps/admin/src/adapters/types.ts — typed admin read-model interfaces (Phase 3).
 *
 * Each of the 10 prototype pages reads ONLY through its typed read-model
 * interface (api.md §4). Slice #1 ships MOCK adapters that port the prototype's
 * inline fixtures; later rows swap the implementation behind these same
 * interfaces with NO UI change (Typed Contract Mock — design.md, test.md §4).
 *
 * Slice #1 has NO mutating reads: every read-model method is read-only and
 * returns typed data. Destructive intent is expressed only through the no-op
 * command adapter (see `commands.ts`).
 *
 * Security (api.md §6): the Providers read-model exposes key STATUS only and
 * NEVER key material — there is no `keyMask` / key-string field anywhere here.
 */

/* ------------------------------------------------------------------ *
 * Shared value types
 * ------------------------------------------------------------------ */

export type PlanTier = "Free" | "Pro" | "Team" | "Enterprise";
export type UserStatus = "活跃" | "待验证" | "已封禁" | "休眠";
export type RiskLevel = "high" | "watch" | null;
export type FeatureCategory = "AI" | "效率" | "生活";
export type FeatureStatus = "on" | "beta" | "off";
export type Tone = "danger" | "warning" | "info" | "muted";

/* ------------------------------------------------------------------ *
 * 1. Overview / dashboard (总览看板)
 * ------------------------------------------------------------------ */

export interface KpiCard {
  key: string;
  label: string;
  value: string;
  /** sparkline series (relative magnitudes) */
  spark: number[];
  /** positive trend uses the "success" accent, else the default accent */
  positive?: boolean;
}

export interface OpsQueueRow {
  /** primary subject (org / user / ticket id) */
  title: string;
  /** one-line context */
  detail: string;
  /** trailing meta (age / amount / "live") */
  meta: string;
}

export interface OpsQueueItem {
  key: string;
  icon: string;
  tone: Tone;
  title: string;
  sub: string;
  count: number;
  rows: OpsQueueRow[];
}

export interface FeatureRank {
  key: string;
  icon: string;
  name: string;
  category: FeatureCategory;
  uses: number;
  users: number;
  /** penetration % vs active base */
  penetration: number;
  /** signed weekly trend % */
  trend: number;
}

/** A single heatmap cell intensity 0..4. */
export type HeatCell = number;

export interface OverviewReadModel {
  getKpis(): KpiCard[];
  getOpsQueue(): OpsQueueItem[];
  getFeatureRanking(): FeatureRank[];
  /** day-rows x slot-cols intensity grid; optional feature key reshapes it deterministically */
  getUsageHeatmap(featKey?: string): HeatCell[][];
}

/* ------------------------------------------------------------------ *
 * 2. Users (用户管理)
 * ------------------------------------------------------------------ */

export interface UserRow {
  name: string;
  email: string;
  status: UserStatus;
  plan: PlanTier;
  /** usage in millions of tokens */
  usageM: number;
  /** avatar gradient seed color */
  color: string;
  lastActive: string;
  /** days since last login */
  daysInactive: number;
  /** 30-day cost in USD */
  cost: number;
  mfa: boolean;
  risk: RiskLevel;
  role: string;
  over?: boolean;
}

export interface SavedView {
  key: string;
  label: string;
  /** predicate over a UserRow (ported from prototype VIEWS) */
  pred: (u: UserRow) => boolean;
}

export interface UserQuery {
  /** free-text over name + email */
  text?: string;
  /** saved-view key (defaults to "all") */
  view?: string;
  /** active filter chips (Pro / Enterprise / admin / risk / nomfa) */
  chips?: string[];
}

export interface UserDetail extends UserRow {
  userId: string;
  workspaces: number;
  devices: number;
}

export interface UsersReadModel {
  list(query?: UserQuery): UserRow[];
  savedViews(): SavedView[];
  filterChips(): { key: string; label: string }[];
  get(email: string): UserDetail | null;
}

/* ------------------------------------------------------------------ *
 * 3. Orgs / spaces (组织 / 空间 — "boards")
 * ------------------------------------------------------------------ */

export type OrgStatus = "active" | "overage" | "dunning";

export interface OrgRow {
  name: string;
  short: string;
  plan: PlanTier;
  seatsUsed: number;
  seatsCap: number;
  cost: string;
  status: OrgStatus;
  owner: string;
  color: string;
  created: string;
  requests: string;
  tokens: string;
}

export interface OrgDetail extends OrgRow {
  orgId: string;
}

export interface OrgsReadModel {
  list(): OrgRow[];
  get(name: string): OrgDetail | null;
}

/* ------------------------------------------------------------------ *
 * 4. Features (功能管理)
 * ------------------------------------------------------------------ */

export interface FeatureQuota {
  /** -1 = unlimited, 0 = none, n = n/month */
  free: number;
  pro: number;
  team: number;
}

export interface FeatureFlag {
  key: string;
  icon: string;
  name: string;
  category: FeatureCategory;
  status: FeatureStatus;
  /** rollout percentage 0..100 */
  rollout: number;
  uses: number;
  users: number;
  trend: number;
  quota: FeatureQuota;
}

export interface FeatureDetail extends FeatureFlag {
  penetration: number;
  /** avg uses per user */
  avgPerUser: number;
}

export interface FeaturesReadModel {
  list(query?: { text?: string; category?: FeatureCategory | "" }): FeatureFlag[];
  get(key: string): FeatureDetail | null;
  categories(): FeatureCategory[];
}

/* ------------------------------------------------------------------ *
 * 5. AI usage & quota (AI 用量 & 配额)
 * ------------------------------------------------------------------ */

export interface SpenderRow {
  name: string;
  plan: PlanTier;
  /** used millions of tokens */
  usedM: number;
  /** quota millions of tokens */
  quotaM: number;
  cost: string;
  color: string;
}

export interface QuotaPolicy {
  plan: PlanTier;
  model: string;
  fallback: string;
  cap: string;
  requests: string;
  /** over-limit behavior */
  overage: "block" | "throttle" | "alert";
}

export interface AiUsageReadModel {
  quotaPolicies(): QuotaPolicy[];
  topSpenders(): SpenderRow[];
}

/* ------------------------------------------------------------------ *
 * 6. Providers (Provider 配置) — KEY STATUS ONLY, never key material
 * ------------------------------------------------------------------ */

export type ProviderKeyStatus = "configured" | "not-configured";

export interface ProviderModel {
  id: string;
  tag: string;
  tiers: { free: 0 | 1; pro: 0 | 1; team: 0 | 1 };
}

export interface ProviderCard {
  key: string;
  name: string;
  color: string;
  enabled: boolean;
  /**
   * Key STATUS only — NEVER the key, mask, or any key-shaped string.
   * (Real secret handles live server-side; row #4.)
   */
  keyStatus: ProviderKeyStatus;
  usage: string;
  cost: string;
  defaultModel: string;
  models: ProviderModel[];
}

export interface ModelPlanCell {
  modelId: string;
  providerName: string;
  providerColor: string;
  tag: string;
  tiers: { free: 0 | 1; pro: 0 | 1; team: 0 | 1 };
}

export interface ProvidersReadModel {
  list(): ProviderCard[];
  modelPlanMatrix(): ModelPlanCell[];
}

/**
 * Opaque, NON-secret provider secret-handle status (row #4). Holds NO key/secret material.
 * The browser receives a handle + status + non-secret metadata ONLY; real secret storage is
 * server-side (a vault / one-way hash). There is intentionally NO maskedTail / key / secret field.
 */
export interface ProviderSecretHandle {
  /** provider key (matches ProviderCard.key), e.g. "gemini" — a SLUG, not a secret */
  provider: string;
  /** opaque NON-secret reference id (a handle, NOT the key), e.g. "pk_ref_gemini_01" */
  handleId: string;
  /** configured status only (the slice #1 keyStatus, retained) */
  status: ProviderKeyStatus;
  /** optional ISO date of last rotation (non-secret metadata) */
  lastRotated?: string;
  /** vault/reference LABEL (non-secret path label), e.g. "vault:admin/providers/gemini" — NOT a secret value */
  vaultRef?: string;
}

/* ------------------------------------------------------------------ *
 * 7. Roles & permissions (角色与权限 RBAC)
 * ------------------------------------------------------------------ */

export interface RoleCard {
  key: string;
  name: string;
  members: number;
  color: string;
  icon: string;
  description: string;
}

export interface RbacRow {
  permission: string;
  /** role-key → granted (0/1), ported from prototype PERMS */
  grants: Record<string, 0 | 1>;
}

export interface RolesReadModel {
  roles(): RoleCard[];
  rbacMatrix(): RbacRow[];
}

/* ------------------------------------------------------------------ *
 * 8. Billing (订阅 / 计费)
 * ------------------------------------------------------------------ */

export interface BillingMetrics {
  mrr: string;
  activeOrgs: number;
  failedPayments: number;
  arpu: string;
}

export interface PlanShare {
  plan: PlanTier;
  share: number;
}

export type TxnStatus = "已付" | "失败" | "重试中";

export interface TxnRow {
  org: string;
  plan: PlanTier;
  amount: string;
  status: TxnStatus;
  date: string;
}

export interface BillingReadModel {
  metrics(): BillingMetrics;
  planDistribution(): PlanShare[];
  transactions(): TxnRow[];
}

/* ------------------------------------------------------------------ *
 * 9. Audit log (审计日志) — read-only by definition
 * ------------------------------------------------------------------ */

export type AuditType = "create" | "config" | "danger" | "auth" | "billing";

export interface AuditRow {
  time: string;
  who: string;
  type: AuditType;
  action: string;
  object: string;
  ip: string;
  ok: boolean;
}

export interface AuditFilter {
  text?: string;
  type?: AuditType | "";
  range?: "today" | "7d" | "30d" | "";
}

export interface AuditReadModel {
  query(filter?: AuditFilter): AuditRow[];
}

/* ------------------------------------------------------------------ *
 * 10. Settings (系统设置) — read this slice
 * ------------------------------------------------------------------ */

export interface AdminSettingToggle {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface AdminSettings {
  orgName: string;
  supportEmail: string;
  toggles: AdminSettingToggle[];
}

export interface SettingsReadModel {
  read(): AdminSettings;
}

/* ------------------------------------------------------------------ *
 * Destructive command adapter (NO-OP this slice) — api.md §5
 * ------------------------------------------------------------------ */

export interface NoOpResult {
  ok: true;
  noop: true;
  reason: "slice-1-mock-no-write";
}

export interface AdminCommandAdapter {
  banUser(input: { email: string }): Promise<NoOpResult>;
  bulkBan(input: { emails: string[] }): Promise<NoOpResult>;
  setFeatureRollout(input: { key: string; rollout: number }): Promise<NoOpResult>;
  transferOwnership(input: { org: string; toMember: string }): Promise<NoOpResult>;
  setProviderRouting(input: { plan: PlanTier; model: string }): Promise<NoOpResult>;
  setQuota(input: { subject: string; quota: number }): Promise<NoOpResult>;
}

/* ------------------------------------------------------------------ *
 * Aggregate read-model registry (one typed entry per page)
 * ------------------------------------------------------------------ */

export interface AdminReadModels {
  overview: OverviewReadModel;
  users: UsersReadModel;
  orgs: OrgsReadModel;
  features: FeaturesReadModel;
  aiUsage: AiUsageReadModel;
  providers: ProvidersReadModel;
  roles: RolesReadModel;
  billing: BillingReadModel;
  audit: AuditReadModel;
  settings: SettingsReadModel;
}
