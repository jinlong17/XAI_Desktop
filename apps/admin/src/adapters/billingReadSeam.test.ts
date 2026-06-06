import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { MUTATION_PERMISSION, PERMISSION_KEYS } from "../authz/permissionKeys";
import { createMockAdminApiClient } from "../contracts/adminApi";
import type { MutationFamily } from "../authz/permissionKeys";
import type { AdminCommandAdapter, BillingMetrics, PlanShare, TxnRow } from "./types";
import { createGuardedCommandAdapter } from "./guardedCommands";
import type { GuardedCommandAdapter } from "./guardedCommands";
import {
  adminApiClient,
  billingAdapter,
  billingReadSeam,
} from "./index";

const BILLING_RE = /billing/i;
const MUTATION_NAME_RE = /^(ban|bulkBan|set|transfer|cancel|refund|charge|invoice|update|change|mutat)/i;
const FORBIDDEN_BILLING_WRITE_RE = /set|change|update|cancel|refund|charge|invoice|subscri|mutat/i;

const ALLOWED_ADMIN_API_MUTATIONS = [
  "banUser",
  "bulkBan",
  "setFeatureRollout",
  "transferOwnership",
  "setProviderRouting",
  "setQuota",
] as const;

describe("TT-WIRE-BILLING-READ", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("metrics() delegates to adminApiClient.getBillingMetrics and returns fixture-backed BillingMetrics", async () => {
    const getBillingMetricsSpy = vi.spyOn(adminApiClient, "getBillingMetrics");

    const res = await billingReadSeam.metrics();

    expect(getBillingMetricsSpy).toHaveBeenCalledTimes(1);
    expect(getBillingMetricsSpy).toHaveBeenCalledWith();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<BillingMetrics>();
      expect(res.data).toEqual(billingAdapter.metrics());
      expect(res.data).toMatchObject({
        mrr: expect.any(String),
        activeOrgs: expect.any(Number),
        failedPayments: expect.any(Number),
        arpu: expect.any(String),
      });
    }
  });

  it("planDistribution() delegates to adminApiClient.getPlanDistribution and returns fixture-backed PlanShare[]", async () => {
    const getPlanDistributionSpy = vi.spyOn(adminApiClient, "getPlanDistribution");

    const res = await billingReadSeam.planDistribution();

    expect(getPlanDistributionSpy).toHaveBeenCalledTimes(1);
    expect(getPlanDistributionSpy).toHaveBeenCalledWith();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<PlanShare[]>();
      expect(res.data).toEqual(billingAdapter.planDistribution());
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0]).toMatchObject({
        plan: expect.any(String),
        share: expect.any(Number),
      });
    }
  });

  it("transactions() delegates to adminApiClient.getTransactions and returns fixture-backed TxnRow[]", async () => {
    const getTransactionsSpy = vi.spyOn(adminApiClient, "getTransactions");

    const res = await billingReadSeam.transactions();

    expect(getTransactionsSpy).toHaveBeenCalledTimes(1);
    expect(getTransactionsSpy).toHaveBeenCalledWith();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<TxnRow[]>();
      expect(res.data).toEqual(billingAdapter.transactions());
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0]).toMatchObject({
        org: expect.any(String),
        plan: expect.any(String),
        amount: expect.any(String),
        status: expect.any(String),
        date: expect.any(String),
      });
    }
  });

  it("exposes only read methods and no Stripe/write-shaped method names", () => {
    const seamKeys = Object.keys(billingReadSeam);

    expect(seamKeys).toEqual(["metrics", "planDistribution", "transactions"]);
    expect(seamKeys.some((key) => FORBIDDEN_BILLING_WRITE_RE.test(key))).toBe(false);
  });
});

describe("TT-BILLING-GATE-NO-MUTATION", () => {
  it("AdminApiClient has billing reads but no billing mutation family", () => {
    const client = createMockAdminApiClient({ role: "super" });
    const clientKeys = Object.keys(client);
    const mutationKeys = clientKeys.filter((key) => MUTATION_NAME_RE.test(key));

    expect(clientKeys).toEqual(
      expect.arrayContaining([
        "getBillingMetrics",
        "getPlanDistribution",
        "getTransactions",
      ]),
    );
    expect(mutationKeys.every((key) => ALLOWED_ADMIN_API_MUTATIONS.includes(key as (typeof ALLOWED_ADMIN_API_MUTATIONS)[number]))).toBe(true);
    expect(mutationKeys.some((key) => BILLING_RE.test(key))).toBe(false);
  });

  it("MUTATION_PERMISSION has no billing family and does not wire BILLING_MANAGE", () => {
    expect(Object.keys(MUTATION_PERMISSION).some((key) => BILLING_RE.test(key))).toBe(false);
    expect(Object.values(MUTATION_PERMISSION)).not.toContain("admin.billing.manage");
  });

  it("GuardedCommandAdapter exposes only the guarded non-billing mutation subset", () => {
    const { commands } = createGuardedCommandAdapter({ role: "super" });
    const commandKeys = Object.keys(commands).sort();

    expect(commandKeys).toEqual(
      ["banUser", "bulkBan", "setFeatureRollout", "transferOwnership"].sort(),
    );
    expect(commandKeys.some((key) => BILLING_RE.test(key))).toBe(false);
  });

  it("type-level guard excludes billing from guarded commands and mutation families", () => {
    expectTypeOf<keyof GuardedCommandAdapter>().toEqualTypeOf<
      "banUser" | "bulkBan" | "setFeatureRollout" | "transferOwnership"
    >();
    expectTypeOf<MutationFamily>().toEqualTypeOf<
      | "banUser"
      | "bulkBan"
      | "setFeatureRollout"
      | "transferOwnership"
      | "setProviderRouting"
      | "setQuota"
    >();
    expectTypeOf<keyof AdminCommandAdapter>().toEqualTypeOf<MutationFamily>();
  });
});

describe("TT-BILLING-KEY-CATALOGUED-UNWIRED", () => {
  it("keeps BILLING_MANAGE catalogued but unwired from mutation permissions", () => {
    expect(PERMISSION_KEYS.BILLING_MANAGE).toBe("admin.billing.manage");
    expect(Object.values(MUTATION_PERMISSION).includes("admin.billing.manage")).toBe(false);
  });
});
