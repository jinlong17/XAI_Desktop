import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import type { OrgDetail, OrgRow } from "./types";
import {
  adminApiClient,
  orgsAdapter,
  orgsReadSeam,
} from "./index";

describe("TT-WIRE-ORGS-READ", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("list() delegates to adminApiClient.getOrgs and returns fixture-backed OrgRow data", async () => {
    const getOrgsSpy = vi.spyOn(adminApiClient, "getOrgs");

    const res = await orgsReadSeam.list();

    expect(getOrgsSpy).toHaveBeenCalledTimes(1);
    expect(getOrgsSpy).toHaveBeenCalledWith();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<OrgRow[]>();
      expect(res.data).toEqual(orgsAdapter.list());
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0]).toMatchObject({
        name: expect.any(String),
        short: expect.any(String),
        seatsUsed: expect.any(Number),
        seatsCap: expect.any(Number),
      });
    }
  });

  it("get() delegates to adminApiClient.getOrg and returns OrgDetail|null", async () => {
    const org = orgsAdapter.list()[0]!;
    const getOrgSpy = vi.spyOn(adminApiClient, "getOrg");

    const res = await orgsReadSeam.get(org.name);

    expect(getOrgSpy).toHaveBeenCalledTimes(1);
    expect(getOrgSpy).toHaveBeenCalledWith(org.name);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<OrgDetail | null>();
      expect(res.data).toEqual(orgsAdapter.get(org.name));
      expect(res.data).toMatchObject({
        name: org.name,
        orgId: expect.stringMatching(/^org_/),
      });
    }
  });
});
