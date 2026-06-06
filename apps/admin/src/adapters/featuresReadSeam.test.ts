import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import type { FeatureDetail, FeatureFlag } from "./types";
import {
  adminApiClient,
  featuresAdapter,
  featuresReadSeam,
} from "./index";

describe("TT-WIRE-FEATURES-READ", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("list() delegates to adminApiClient.getFeatures and returns fixture-backed FeatureFlag data", async () => {
    const query = { text: "AI", category: "AI" as const };
    const getFeaturesSpy = vi.spyOn(adminApiClient, "getFeatures");

    const res = await featuresReadSeam.list(query);

    expect(getFeaturesSpy).toHaveBeenCalledTimes(1);
    expect(getFeaturesSpy).toHaveBeenCalledWith(query);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<FeatureFlag[]>();
      expect(res.data).toEqual(featuresAdapter.list(query));
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data.every((row) => row.category === "AI")).toBe(true);
      expect(res.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: expect.any(String),
            name: expect.any(String),
            status: expect.any(String),
            rollout: expect.any(Number),
            quota: expect.objectContaining({
              free: expect.any(Number),
              pro: expect.any(Number),
              team: expect.any(Number),
            }),
          }),
        ]),
      );
    }
  });

  it("get() delegates to adminApiClient.getFeature and returns FeatureDetail|null", async () => {
    const key = "ai-write";
    const getFeatureSpy = vi.spyOn(adminApiClient, "getFeature");

    const res = await featuresReadSeam.get(key);
    const missing = await featuresReadSeam.get("__missing__");

    expect(getFeatureSpy).toHaveBeenCalledTimes(2);
    expect(getFeatureSpy).toHaveBeenNthCalledWith(1, key);
    expect(getFeatureSpy).toHaveBeenNthCalledWith(2, "__missing__");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<FeatureDetail | null>();
      expect(res.data).toEqual(featuresAdapter.get(key));
      expect(res.data).toMatchObject({
        key,
        penetration: expect.any(Number),
        avgPerUser: expect.any(Number),
      });
    }
    expect(missing).toEqual({ ok: true, data: null });
  });
});

describe("TT-READ-NO-IO", () => {
  let setItemSpy: ReturnType<typeof vi.spyOn> | null;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setItemSpy = null;
  });

  it("performs no fetch and no localStorage.setItem during feature reads", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    await featuresReadSeam.list();
    await featuresReadSeam.get("ai-write");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
