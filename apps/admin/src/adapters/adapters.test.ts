/**
 * TT-ADAPTER-* + TT-PROVIDERS-NO-KEY — read-model adapter tests (Phase 3).
 *
 * One test block per page adapter. Each asserts the mock adapter returns typed,
 * non-empty fixture data matching its read-model interface, and that the ported
 * filter / query / saved-view behaviors return the expected subsets (test.md §2).
 *
 * Design authority: apps/admin/docs/api.md §4, apps/admin/docs/test.md §2.
 * Phase: P3 (typed read-model interfaces + mock adapters + fixtures).
 */
import { describe, it, expect } from "vitest";
import {
  overviewAdapter,
  usersAdapter,
  orgsAdapter,
  featuresAdapter,
  aiUsageAdapter,
  providersAdapter,
  rolesAdapter,
  billingAdapter,
  auditAdapter,
  settingsAdapter,
  adminReadModels,
} from "./index";

describe("TT-ADAPTER-OVERVIEW", () => {
  it("returns KPIs, ops queue, feature ranking, and a 7x8 heatmap", () => {
    expect(overviewAdapter.getKpis().length).toBeGreaterThan(0);
    expect(overviewAdapter.getOpsQueue().length).toBe(6);
    const rank = overviewAdapter.getFeatureRanking();
    expect(rank.length).toBeGreaterThan(0);
    // ranking is sorted by uses desc
    for (let i = 1; i < rank.length; i++) {
      expect(rank[i - 1]!.uses).toBeGreaterThanOrEqual(rank[i]!.uses);
    }
    const heat = overviewAdapter.getUsageHeatmap();
    expect(heat.length).toBe(7);
    expect(heat[0]!.length).toBe(8);
    // cells are bounded 0..4
    for (const row of heat) for (const c of row) expect(c).toBeGreaterThanOrEqual(0), expect(c).toBeLessThanOrEqual(4);
  });
  it("heatmap is deterministic and feature-key reshapes it", () => {
    expect(overviewAdapter.getUsageHeatmap("ai-write")).toEqual(overviewAdapter.getUsageHeatmap("ai-write"));
    expect(overviewAdapter.getUsageHeatmap("ai-write")).not.toEqual(overviewAdapter.getUsageHeatmap());
  });
});

describe("TT-ADAPTER-USERS", () => {
  it("list() returns all users by default", () => {
    expect(usersAdapter.list().length).toBe(10);
  });
  it("saved view 'banned' filters to banned users", () => {
    const banned = usersAdapter.list({ view: "banned" });
    expect(banned.length).toBe(1);
    expect(banned[0]!.status).toBe("已封禁");
  });
  it("saved view 'highcost' filters cost>=100", () => {
    const hc = usersAdapter.list({ view: "highcost" });
    expect(hc.length).toBeGreaterThan(0);
    expect(hc.every((u) => u.cost >= 100)).toBe(true);
  });
  it("chip 'nomfa' filters users without MFA", () => {
    const nomfa = usersAdapter.list({ chips: ["nomfa"] });
    expect(nomfa.length).toBeGreaterThan(0);
    expect(nomfa.every((u) => u.mfa === false)).toBe(true);
  });
  it("text query filters by name/email", () => {
    const r = usersAdapter.list({ text: "diego" });
    expect(r.length).toBe(1);
    expect(r[0]!.name).toBe("Diego Vega");
  });
  it("savedViews + filterChips are non-empty; get() returns detail or null", () => {
    expect(usersAdapter.savedViews().length).toBe(7);
    expect(usersAdapter.filterChips().length).toBe(5);
    const detail = usersAdapter.get("diego@acme.io");
    expect(detail).not.toBeNull();
    expect(detail!.userId).toMatch(/^usr_/);
    expect(usersAdapter.get("nobody@nowhere")).toBeNull();
  });
});

describe("TT-ADAPTER-ORGS", () => {
  it("list() non-empty; get() returns detail with orgId or null", () => {
    expect(orgsAdapter.list().length).toBe(7);
    const d = orgsAdapter.get("Acme Robotics");
    expect(d).not.toBeNull();
    expect(d!.orgId).toMatch(/^org_/);
    expect(orgsAdapter.get("Ghost Inc")).toBeNull();
  });
});

describe("TT-ADAPTER-FEATURES", () => {
  it("list() non-empty; category filter works; get() returns detail", () => {
    expect(featuresAdapter.list().length).toBe(11);
    const ai = featuresAdapter.list({ category: "AI" });
    expect(ai.length).toBeGreaterThan(0);
    expect(ai.every((f) => f.category === "AI")).toBe(true);
    expect(featuresAdapter.categories()).toContain("生活");
    const detail = featuresAdapter.get("ai-write");
    expect(detail).not.toBeNull();
    expect(detail!.avgPerUser).toBeGreaterThan(0);
    expect(featuresAdapter.get("nope")).toBeNull();
  });
});

describe("TT-ADAPTER-AI", () => {
  it("quotaPolicies + topSpenders are typed and non-empty", () => {
    expect(aiUsageAdapter.quotaPolicies().length).toBe(4);
    const spenders = aiUsageAdapter.topSpenders();
    expect(spenders.length).toBeGreaterThan(0);
    expect(spenders.every((s) => typeof s.usedM === "number" && typeof s.quotaM === "number")).toBe(true);
  });
});

describe("TT-ADAPTER-PROVIDERS", () => {
  it("list() + modelPlanMatrix() are non-empty and typed", () => {
    const cards = providersAdapter.list();
    expect(cards.length).toBe(4);
    expect(cards.every((c) => c.keyStatus === "configured" || c.keyStatus === "not-configured")).toBe(true);
    const matrix = providersAdapter.modelPlanMatrix();
    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix.every((m) => typeof m.modelId === "string")).toBe(true);
  });
});

describe("TT-PROVIDERS-NO-KEY", () => {
  it("provider cards expose key STATUS only — no key material / secret-shaped strings", () => {
    const cards = providersAdapter.list();
    // 1. structural: the only key-related field is keyStatus (a status enum).
    for (const c of cards) {
      expect(c.keyStatus === "configured" || c.keyStatus === "not-configured").toBe(true);
      // no `keyMask` (or any key-string field) survived the port
      const bag = c as unknown as Record<string, unknown>;
      expect(bag.keyMask).toBeUndefined();
      expect(bag.apiKey).toBeUndefined();
      expect(bag.secret).toBeUndefined();
    }
    // 2. value-level: no provider fixture value contains a key-shaped literal.
    const serialized = JSON.stringify(cards) + JSON.stringify(providersAdapter.modelPlanMatrix());
    const KEY_SHAPES = [/sk-[A-Za-z0-9]/, /sk_(test|live)_/, /AIza[A-Za-z0-9]/, /•{3,}/, /service_role/];
    for (const re of KEY_SHAPES) {
      expect(re.test(serialized), `provider read-model leaked a key-shaped string matching ${re}`).toBe(false);
    }
  });
});

describe("TT-ADAPTER-ROLES", () => {
  it("roles + rbacMatrix non-empty; every permission grants all role keys", () => {
    const roles = rolesAdapter.roles();
    expect(roles.length).toBe(5);
    const matrix = rolesAdapter.rbacMatrix();
    expect(matrix.length).toBe(10);
    const roleKeys = roles.map((r) => r.key);
    for (const row of matrix) {
      for (const k of roleKeys) expect(row.grants[k] === 0 || row.grants[k] === 1).toBe(true);
    }
  });
});

describe("TT-ADAPTER-BILLING", () => {
  it("metrics + planDistribution + transactions are typed and non-empty", () => {
    expect(billingAdapter.metrics().mrr).toBeTruthy();
    expect(billingAdapter.planDistribution().length).toBe(4);
    expect(billingAdapter.transactions().length).toBeGreaterThan(0);
  });
});

describe("TT-ADAPTER-AUDIT", () => {
  it("query() non-empty; type filter + text filter narrow results", () => {
    expect(auditAdapter.query().length).toBe(12);
    const danger = auditAdapter.query({ type: "danger" });
    expect(danger.length).toBeGreaterThan(0);
    expect(danger.every((a) => a.type === "danger")).toBe(true);
    const txt = auditAdapter.query({ text: "封禁" });
    expect(txt.length).toBeGreaterThan(0);
  });
});

describe("TT-ADAPTER-SETTINGS", () => {
  it("read() returns settings with non-empty toggles", () => {
    const s = settingsAdapter.read();
    expect(s.orgName).toBeTruthy();
    expect(s.toggles.length).toBeGreaterThan(0);
    expect(s.toggles.every((t) => typeof t.enabled === "boolean")).toBe(true);
  });
});

describe("TT-ADAPTER-REGISTRY", () => {
  it("adminReadModels exposes exactly the 10 page read-models", () => {
    const keys = Object.keys(adminReadModels).sort();
    expect(keys).toEqual(
      ["aiUsage", "audit", "billing", "features", "orgs", "overview", "providers", "roles", "settings", "users"].sort(),
    );
  });
});
