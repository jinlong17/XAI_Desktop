/**
 * TT-API-* — admin API-boundary contract + mock transport (row #2, P4).
 *
 * Proves the typed `AdminApiClient` contract shape (reads bound to §2 + 6 mutations with
 * slice #1 inputs), fail-closed error semantics, and the server-authoritative no-write seam
 * (mock performs NO network/storage — spy-asserted).
 *
 * Test strategy: apps/admin/docs/data-contracts-rbac/test.md §1 (AC-6).
 */
import { describe, it, expect, expectTypeOf, vi, beforeEach, afterEach } from "vitest";

import {
  createMockAdminApiClient,
  type AdminApiClient,
  type AdminApiResult,
  type AdminApiError,
  type AdminApiErrorCode,
  type MutationAck,
  type OverviewPayload,
} from "./adminApi";
import type { AdminCommandAdapter } from "../adapters/types";
import type {
  UserRow,
  ProviderCard,
  ModelPlanCell,
  RbacRow,
  AdminSettings,
} from "./readModels";

const READ_METHODS = [
  "getOverview",
  "getUsers",
  "getUser",
  "getOrgs",
  "getOrg",
  "getFeatures",
  "getFeature",
  "getQuotaPolicies",
  "getTopSpenders",
  "getProviders",
  "getModelPlanMatrix",
  "getRoles",
  "getRbacMatrix",
  "getBillingMetrics",
  "getPlanDistribution",
  "getTransactions",
  "getAudit",
  "getSettings",
] as const;

const MUTATION_METHODS = [
  "banUser",
  "bulkBan",
  "setFeatureRollout",
  "transferOwnership",
  "setProviderRouting",
  "setQuota",
] as const;

describe("TT-API-CONTRACT-SHAPE: typed contract (reads bound to §2 + 6 mutations)", () => {
  it("the 6 mutation methods exactly equal keyof AdminCommandAdapter (slice #1 families)", () => {
    // Compile-time: every mutation family on AdminApiClient corresponds to a slice #1 command.
    expectTypeOf<(typeof MUTATION_METHODS)[number]>().toEqualTypeOf<keyof AdminCommandAdapter>();
    expect([...MUTATION_METHODS].sort()).toEqual(
      (["banUser", "bulkBan", "setFeatureRollout", "transferOwnership", "setProviderRouting", "setQuota"] as const)
        .slice()
        .sort(),
    );
  });

  it("the mock exposes every read method + every mutation method", () => {
    const client = createMockAdminApiClient({ role: "super" });
    for (const m of READ_METHODS) {
      expect(typeof (client as unknown as Record<string, unknown>)[m]).toBe("function");
    }
    for (const m of MUTATION_METHODS) {
      expect(typeof (client as unknown as Record<string, unknown>)[m]).toBe("function");
    }
  });

  it("REC-2: read returns bind to the §2 read-model contract shapes (no fork)", async () => {
    const client = createMockAdminApiClient({ role: "super" });
    const users = await client.getUsers();
    const providers = await client.getProviders();
    const matrix = await client.getModelPlanMatrix();
    const rbac = await client.getRbacMatrix();
    const settings = await client.getSettings();
    if (users.ok) expectTypeOf(users.data).toEqualTypeOf<UserRow[]>();
    if (providers.ok) expectTypeOf(providers.data).toEqualTypeOf<ProviderCard[]>();
    // 1-D shapes (REC-3 carried): ModelPlanCell[] / RbacRow[], not [][].
    if (matrix.ok) expectTypeOf(matrix.data).toEqualTypeOf<ModelPlanCell[]>();
    if (rbac.ok) expectTypeOf(rbac.data).toEqualTypeOf<RbacRow[]>();
    if (settings.ok) expectTypeOf(settings.data).toEqualTypeOf<AdminSettings>();
    // value-level: reads return fixture data
    expect(users.ok && Array.isArray(users.data)).toBe(true);
    expect(matrix.ok && Array.isArray(matrix.data) && !Array.isArray(matrix.data[0])).toBe(true);
  });

  it("getOverview returns the OverviewPayload composite bound to OverviewReadModel returns", async () => {
    const client = createMockAdminApiClient({ role: "super" });
    const res = await client.getOverview();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<OverviewPayload>();
      expect(Array.isArray(res.data.kpis)).toBe(true);
      expect(Array.isArray(res.data.usageHeatmap)).toBe(true); // heatmap stays HeatCell[][]
    }
  });

  it("AdminApiResult is a discriminated ok:true|false union; AdminApiError.code is the documented union", () => {
    const okRes: AdminApiResult<number> = { ok: true, data: 1 };
    const errRes: AdminApiResult<number> = { ok: false, error: { code: "forbidden", message: "x" } };
    expect(okRes.ok).toBe(true);
    expect(errRes.ok).toBe(false);
    const codes: AdminApiErrorCode[] = [
      "unauthorized",
      "forbidden",
      "not_found",
      "conflict",
      "rate_limited",
      "server_error",
    ];
    expect(codes).toHaveLength(6);
    expectTypeOf<AdminApiError["code"]>().toEqualTypeOf<AdminApiErrorCode>();
  });

  it("mutation inputs match slice #1 AdminCommandAdapter EXACTLY (compile-time)", () => {
    const client = createMockAdminApiClient({ role: "super" });
    // Parameter-type identity with the shipped command adapter.
    expectTypeOf(client.banUser).parameter(0).toEqualTypeOf<Parameters<AdminCommandAdapter["banUser"]>[0]>();
    expectTypeOf(client.bulkBan).parameter(0).toEqualTypeOf<Parameters<AdminCommandAdapter["bulkBan"]>[0]>();
    expectTypeOf(client.setFeatureRollout).parameter(0).toEqualTypeOf<Parameters<AdminCommandAdapter["setFeatureRollout"]>[0]>();
    expectTypeOf(client.transferOwnership).parameter(0).toEqualTypeOf<Parameters<AdminCommandAdapter["transferOwnership"]>[0]>();
    expectTypeOf(client.setProviderRouting).parameter(0).toEqualTypeOf<Parameters<AdminCommandAdapter["setProviderRouting"]>[0]>();
    expectTypeOf(client.setQuota).parameter(0).toEqualTypeOf<Parameters<AdminCommandAdapter["setQuota"]>[0]>();
  });
});

describe("TT-API-FAILCLOSED: mock fails closed without an authorized role", () => {
  it("no role context → every mutation returns unauthorized", async () => {
    const client = createMockAdminApiClient(); // no ctx
    for (const m of MUTATION_METHODS) {
      const res = await (client[m] as (i: unknown) => Promise<AdminApiResult<MutationAck>>)({});
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("unauthorized");
    }
  });

  it("authenticated but unprivileged role → forbidden (audit cannot banUser)", async () => {
    const client = createMockAdminApiClient({ role: "audit" });
    const res = await client.banUser({ email: "x@y.z" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("forbidden");
  });

  it("reads succeed but carry only fixture data (even with no role)", async () => {
    const client = createMockAdminApiClient();
    const users = await client.getUsers();
    expect(users.ok).toBe(true);
    if (users.ok) expect(users.data.length).toBeGreaterThan(0);
  });

  it("methods never throw on an authz failure (they return ok:false)", async () => {
    const client = createMockAdminApiClient({ role: "finance" });
    await expect(client.setProviderRouting({ plan: "Pro", model: "x" })).resolves.toMatchObject({
      ok: false,
      error: { code: "forbidden" },
    });
  });
});

describe("TT-API-SERVER-AUTHORITATIVE: granted mutation is applied:false + NO write/network/persistence", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let setItemSpy: ReturnType<typeof vi.spyOn> | null = null;

  beforeEach(() => {
    fetchSpy = vi.fn(() => Promise.reject(new Error("network not allowed in mock")));
    vi.stubGlobal("fetch", fetchSpy);
    if (typeof localStorage !== "undefined") {
      setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    }
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    setItemSpy?.mockRestore();
    setItemSpy = null;
  });

  it("super (granted) → { ok:true, data:{ applied:false } } for every mutation", async () => {
    const client = createMockAdminApiClient({ role: "super" });
    const inputs: Record<(typeof MUTATION_METHODS)[number], unknown> = {
      banUser: { email: "a@b.c" },
      bulkBan: { emails: ["a@b.c"] },
      setFeatureRollout: { key: "ai-write", rollout: 50 },
      transferOwnership: { org: "Acme Robotics", toMember: "x@y.z" },
      setProviderRouting: { plan: "Team", model: "gpt-4o" },
      setQuota: { subject: "a@b.c", quota: 100 },
    };
    for (const m of MUTATION_METHODS) {
      const res = await (client[m] as (i: unknown) => Promise<AdminApiResult<MutationAck>>)(inputs[m]);
      expect(res.ok, `${m} should be allowed for super`).toBe(true);
      if (res.ok) {
        expect(res.data.applied, `${m} must NOT apply a real write this row`).toBe(false);
        expect(res.data.auditId).toBeUndefined(); // row #5 obligation
      }
    }
  });

  it("ops (granted ban+rollout+quota) → applied:false; (denied transfer/provider) → forbidden", async () => {
    const client = createMockAdminApiClient({ role: "ops" });
    const ban = await client.banUser({ email: "a@b.c" });
    const rollout = await client.setFeatureRollout({ key: "ai-write", rollout: 10 });
    const transfer = await client.transferOwnership({ org: "Acme", toMember: "x@y.z" });
    const provider = await client.setProviderRouting({ plan: "Pro", model: "x" });
    expect(ban.ok && ban.data.applied).toBe(false);
    expect(rollout.ok && rollout.data.applied).toBe(false);
    expect(transfer.ok).toBe(false);
    expect(provider.ok).toBe(false);
  });

  it("performs NO network (fetch) and NO persistence (localStorage.setItem) across reads + mutations", async () => {
    const client = createMockAdminApiClient({ role: "super" });
    await client.getOverview();
    await client.getUsers();
    await client.getAudit();
    await client.banUser({ email: "a@b.c" });
    await client.transferOwnership({ org: "Acme", toMember: "x@y.z" });
    expect(fetchSpy).not.toHaveBeenCalled();
    if (setItemSpy) expect(setItemSpy).not.toHaveBeenCalled();
  });

  it("OQ-F: slice #1 mockAdminCommandAdapter is NOT rewired this row (still its own no-op)", async () => {
    // Deferred to row #3 (keep row #2 purely additive). The slice #1 adapter remains the
    // NoOpResult shape; this contract is independent. We assert the new client does not
    // import or mutate the slice #1 command adapter by confirming its mutation shape is the
    // new typed result (MutationAck), not slice #1's NoOpResult.
    const client = createMockAdminApiClient({ role: "super" });
    const res = await client.banUser({ email: "a@b.c" });
    expect(res.ok && "applied" in res.data).toBe(true);
    // NoOpResult had { noop: true, reason }; the new result must NOT carry those.
    if (res.ok) expect((res.data as unknown as Record<string, unknown>).noop).toBeUndefined();
  });
});
