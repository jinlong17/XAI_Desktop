import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import type { QuotaPolicy, SpenderRow } from "./types";
import {
  adminApiClient,
  aiUsageAdapter,
  aiUsageReadSeam,
} from "./index";

describe("TT-WIRE-AIUSAGE-READ", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("quotaPolicies() delegates to adminApiClient.getQuotaPolicies and returns fixture-backed QuotaPolicy[]", async () => {
    const getQuotaPoliciesSpy = vi.spyOn(adminApiClient, "getQuotaPolicies");

    const res = await aiUsageReadSeam.quotaPolicies();

    expect(getQuotaPoliciesSpy).toHaveBeenCalledTimes(1);
    expect(getQuotaPoliciesSpy).toHaveBeenCalledWith();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<QuotaPolicy[]>();
      expect(res.data).toEqual(aiUsageAdapter.quotaPolicies());
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            plan: expect.any(String),
            model: expect.any(String),
            overage: expect.stringMatching(/^(block|throttle|alert)$/),
          }),
        ]),
      );
    }
  });

  it("topSpenders() delegates to adminApiClient.getTopSpenders and returns fixture-backed SpenderRow[]", async () => {
    const getTopSpendersSpy = vi.spyOn(adminApiClient, "getTopSpenders");

    const res = await aiUsageReadSeam.topSpenders();

    expect(getTopSpendersSpy).toHaveBeenCalledTimes(1);
    expect(getTopSpendersSpy).toHaveBeenCalledWith();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<SpenderRow[]>();
      expect(res.data).toEqual(aiUsageAdapter.topSpenders());
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            plan: expect.any(String),
            usedM: expect.any(Number),
            quotaM: expect.any(Number),
          }),
        ]),
      );
    }
  });
});

describe("TT-READ-NO-IO", () => {
  let setItemSpy: ReturnType<typeof vi.spyOn> | null;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setItemSpy = null;
  });

  it("performs no fetch and no localStorage.setItem during AI usage reads", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    await aiUsageReadSeam.quotaPolicies();
    await aiUsageReadSeam.topSpenders();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
