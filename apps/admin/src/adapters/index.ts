/**
 * apps/admin/src/adapters/index.ts — mock read-model adapters (Phase 3).
 *
 * One mock adapter per page, each implementing its typed read-model interface
 * (`types.ts`) by reading the typed fixtures (`../fixtures`). These are the
 * slice-1 implementations of the Typed Contract Mock seam: later rows replace
 * each adapter with a contract-backed service WITHOUT changing the interface or
 * the pages (design.md, test.md §4).
 *
 * All reads are pure (no network, no storage). Destructive intent flows only
 * through the no-op command adapter (`commands.ts`).
 */
import type {
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
  UserRow,
  UserQuery,
  UserDetail,
  OrgDetail,
  FeatureDetail,
  HeatCell,
  ModelPlanCell,
  FeatureCategory,
} from "./types";
import {
  KPIS,
  QUEUES,
  FEATURES,
  ACTIVE_BASE,
  USERS,
  USER_VIEWS,
  USER_CHIPS,
  ORGS,
  AI_CONSUMERS,
  ROUTING,
  PROVIDERS,
  ROLES,
  RBAC,
  BILLING_METRICS,
  PLAN_DISTRIBUTION,
  BILLING,
  AUDIT,
  SETTINGS,
} from "../fixtures";

/* ------------------------------------------------------------------ *
 * 1. Overview
 * ------------------------------------------------------------------ */

/** Deterministic heatmap, ported from the prototype `renderHeat(featKey)`. */
function buildHeatmap(featKey?: string): HeatCell[][] {
  const seed = featKey
    ? [...featKey].reduce((a, c) => a + c.charCodeAt(0), 0)
    : 0;
  const grid: HeatCell[][] = [];
  for (let d = 0; d < 7; d++) {
    const row: HeatCell[] = [];
    for (let s = 0; s < 8; s++) {
      let base = [0, 0, 1, 3, 4, 4, 3, 1][s] ?? 0;
      if (d >= 5) base = Math.max(0, base - 2);
      const bump = (d * 3 + s + seed) % 4 === 0 ? 1 : 0;
      const dip = seed % 5 === 0 && s < 2 ? 1 : 0;
      row.push(Math.min(4, Math.max(0, base + bump - dip)));
    }
    grid.push(row);
  }
  return grid;
}

export const overviewAdapter: OverviewReadModel = {
  getKpis: () => KPIS.map((k) => ({ ...k })),
  getOpsQueue: () => QUEUES.map((q) => ({ ...q, rows: q.rows.map((r) => ({ ...r })) })),
  getFeatureRanking: () =>
    FEATURES.slice()
      .sort((a, b) => b.uses - a.uses)
      .map((f) => ({
        key: f.key,
        icon: f.icon,
        name: f.name,
        category: f.category,
        uses: f.uses,
        users: f.users,
        penetration: Math.round((f.users / ACTIVE_BASE) * 100),
        trend: f.trend,
      })),
  getUsageHeatmap: (featKey) => buildHeatmap(featKey),
};

/* ------------------------------------------------------------------ *
 * 2. Users — filtering ported from prototype VIEWS + chipPass
 * ------------------------------------------------------------------ */

function chipPass(u: UserRow, chips: string[]): boolean {
  const plans: string[] = chips.filter((c) => c === "Pro" || c === "Enterprise");
  if (plans.length && !plans.includes(u.plan)) return false;
  if (chips.includes("admin") && !(u.role === "管理员" || u.role === "所有者")) return false;
  if (chips.includes("risk") && u.risk !== "high") return false;
  if (chips.includes("nomfa") && u.mfa !== false) return false;
  return true;
}

export const usersAdapter: UsersReadModel = {
  list: (query?: UserQuery) => {
    const text = (query?.text ?? "").toLowerCase();
    const viewKey = query?.view ?? "all";
    const chips = query?.chips ?? [];
    const view = USER_VIEWS.find((v) => v.key === viewKey) ?? USER_VIEWS[0]!;
    return USERS.filter(
      (u) =>
        (!text ||
          u.name.toLowerCase().includes(text) ||
          u.email.toLowerCase().includes(text)) &&
        view.pred(u) &&
        chipPass(u, chips),
    ).map((u) => ({ ...u }));
  },
  savedViews: () => USER_VIEWS.map((v) => ({ ...v })),
  filterChips: () => USER_CHIPS.map((c) => ({ ...c })),
  get: (email: string): UserDetail | null => {
    const u = USERS.find((x) => x.email === email);
    if (!u) return null;
    return {
      ...u,
      userId: `usr_${(4096 + u.name.length * 7).toString(16)}`,
      workspaces: 3,
      devices: 2,
    };
  },
};

/* ------------------------------------------------------------------ *
 * 3. Orgs
 * ------------------------------------------------------------------ */

export const orgsAdapter: OrgsReadModel = {
  list: () => ORGS.map((o) => ({ ...o })),
  get: (name: string): OrgDetail | null => {
    const o = ORGS.find((x) => x.name === name);
    if (!o) return null;
    return { ...o, orgId: `org_${o.short.toLowerCase()}${o.seatsCap}` };
  },
};

/* ------------------------------------------------------------------ *
 * 4. Features
 * ------------------------------------------------------------------ */

export const featuresAdapter: FeaturesReadModel = {
  list: (query) => {
    const text = (query?.text ?? "").toLowerCase();
    const cat = query?.category ?? "";
    return FEATURES.filter(
      (f) =>
        (!text || f.name.toLowerCase().includes(text) || f.key.includes(text)) &&
        (!cat || f.category === cat),
    ).map((f) => ({ ...f, quota: { ...f.quota } }));
  },
  get: (key: string): FeatureDetail | null => {
    const f = FEATURES.find((x) => x.key === key);
    if (!f) return null;
    return {
      ...f,
      quota: { ...f.quota },
      penetration: Math.round((f.users / ACTIVE_BASE) * 100),
      avgPerUser: Number((f.uses / f.users).toFixed(1)),
    };
  },
  categories: (): FeatureCategory[] => ["AI", "效率", "生活"],
};

/* ------------------------------------------------------------------ *
 * 5. AI usage
 * ------------------------------------------------------------------ */

export const aiUsageAdapter: AiUsageReadModel = {
  quotaPolicies: () => ROUTING.map((r) => ({ ...r })),
  topSpenders: () => AI_CONSUMERS.map((s) => ({ ...s })),
};

/* ------------------------------------------------------------------ *
 * 6. Providers — key STATUS only
 * ------------------------------------------------------------------ */

export const providersAdapter: ProvidersReadModel = {
  list: () => PROVIDERS.map((p) => ({ ...p, models: p.models.map((m) => ({ ...m, tiers: { ...m.tiers } })) })),
  modelPlanMatrix: (): ModelPlanCell[] =>
    PROVIDERS.flatMap((p) =>
      p.models.map((m) => ({
        modelId: m.id,
        providerName: p.name,
        providerColor: p.color,
        tag: m.tag,
        tiers: { ...m.tiers },
      })),
    ),
};

/* ------------------------------------------------------------------ *
 * 7. Roles & RBAC
 * ------------------------------------------------------------------ */

export const rolesAdapter: RolesReadModel = {
  roles: () => ROLES.map((r) => ({ ...r })),
  rbacMatrix: () => RBAC.map((r) => ({ ...r, grants: { ...r.grants } })),
};

/* ------------------------------------------------------------------ *
 * 8. Billing
 * ------------------------------------------------------------------ */

export const billingAdapter: BillingReadModel = {
  metrics: () => ({ ...BILLING_METRICS }),
  planDistribution: () => PLAN_DISTRIBUTION.map((p) => ({ ...p })),
  transactions: () => BILLING.map((t) => ({ ...t })),
};

/* ------------------------------------------------------------------ *
 * 9. Audit — query ported from prototype renderAudit filters
 * ------------------------------------------------------------------ */

export const auditAdapter: AuditReadModel = {
  query: (filter) => {
    const text = (filter?.text ?? "").toLowerCase();
    const type = filter?.type ?? "";
    const range = filter?.range ?? "";
    const dayOk = (timeStr: string): boolean => {
      if (!range) return true;
      const d = Number(timeStr.slice(8, 10));
      if (range === "today") return d === 30;
      if (range === "7d") return d >= 23;
      if (range === "30d") return d >= 1;
      return true;
    };
    return AUDIT.filter(
      (a) =>
        (!text ||
          a.who.toLowerCase().includes(text) ||
          a.action.includes(text) ||
          a.object.toLowerCase().includes(text)) &&
        (!type || a.type === type) &&
        dayOk(a.time),
    ).map((a) => ({ ...a }));
  },
};

/* ------------------------------------------------------------------ *
 * 10. Settings
 * ------------------------------------------------------------------ */

export const settingsAdapter: SettingsReadModel = {
  read: () => ({ ...SETTINGS, toggles: SETTINGS.toggles.map((t) => ({ ...t })) }),
};

/* ------------------------------------------------------------------ *
 * Aggregate registry — the single typed seam the pages consume
 * ------------------------------------------------------------------ */

export const adminReadModels: AdminReadModels = {
  overview: overviewAdapter,
  users: usersAdapter,
  orgs: orgsAdapter,
  features: featuresAdapter,
  aiUsage: aiUsageAdapter,
  providers: providersAdapter,
  roles: rolesAdapter,
  billing: billingAdapter,
  audit: auditAdapter,
  settings: settingsAdapter,
};

export type { AdminReadModels } from "./types";
