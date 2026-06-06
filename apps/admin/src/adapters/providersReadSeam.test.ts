import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import type { ModelPlanCell, ProviderCard, ProviderSecretHandle } from "./types";
import {
  adminApiClient,
  providersAdapter,
  providersReadSeam,
} from "./index";

const SECRET_FIELD_NAMES = [
  "apiKey",
  "secret",
  "secretKey",
  "token",
  "credential",
  "privateKey",
  "keyMaterial",
  "keyMask",
  "maskedTail",
] as const;

const SECRET_VALUE_RE = /sk-|sk-ant-|AIza|•{3,}/;

describe("TT-WIRE-PROVIDERS-READ", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("list() delegates to adminApiClient.getProviders and returns fixture-backed ProviderCard[]", async () => {
    const getProvidersSpy = vi.spyOn(adminApiClient, "getProviders");

    const res = await providersReadSeam.list();

    expect(getProvidersSpy).toHaveBeenCalledTimes(1);
    expect(getProvidersSpy).toHaveBeenCalledWith();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<ProviderCard[]>();
      expect(res.data).toEqual(providersAdapter.list());
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: expect.any(String),
            name: expect.any(String),
            keyStatus: expect.stringMatching(/^(configured|not-configured)$/),
            enabled: expect.any(Boolean),
          }),
        ]),
      );
    }
  });

  it("modelPlanMatrix() delegates to adminApiClient.getModelPlanMatrix and returns ModelPlanCell[]", async () => {
    const getModelPlanMatrixSpy = vi.spyOn(adminApiClient, "getModelPlanMatrix");

    const res = await providersReadSeam.modelPlanMatrix();

    expect(getModelPlanMatrixSpy).toHaveBeenCalledTimes(1);
    expect(getModelPlanMatrixSpy).toHaveBeenCalledWith();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<ModelPlanCell[]>();
      expect(res.data).toEqual(providersAdapter.modelPlanMatrix());
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            modelId: expect.any(String),
            providerName: expect.any(String),
            tiers: expect.any(Object),
          }),
        ]),
      );
    }
  });
});

describe("TT-PROVIDER-HANDLE-SHAPE", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("projects one opaque non-secret handle per provider and no key material", async () => {
    const providers = providersAdapter.list();

    const res = await providersReadSeam.secretHandles();

    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<ProviderSecretHandle[]>();
      expect(res.data).toHaveLength(providers.length);
      for (const entry of res.data) {
        expect(entry.provider).toEqual(expect.any(String));
        expect(entry.handleId).toMatch(/^pk_ref_/);
        expect(entry.status).toMatch(/^(configured|not-configured)$/);

        if (entry.status === "configured") {
          expect(entry.lastRotated).toEqual(expect.any(String));
          expect(entry.vaultRef).toEqual(expect.any(String));
        }

        for (const field of SECRET_FIELD_NAMES) {
          expect(entry).not.toHaveProperty(field);
        }
        for (const value of Object.values(entry)) {
          if (typeof value === "string") {
            expect(value).not.toMatch(SECRET_VALUE_RE);
          }
        }
      }
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

  it("performs no fetch and no localStorage.setItem during provider reads", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    await providersReadSeam.list();
    await providersReadSeam.modelPlanMatrix();
    await providersReadSeam.secretHandles();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
