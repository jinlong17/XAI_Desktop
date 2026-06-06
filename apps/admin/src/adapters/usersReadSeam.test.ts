import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import type { UserDetail, UserRow } from "./types";
import {
  adminApiClient,
  usersAdapter,
  usersReadSeam,
} from "./index";

describe("TT-WIRE-USERS-READ", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("list() delegates to adminApiClient.getUsers and returns fixture-backed UserRow data", async () => {
    const query = { text: "diego" };
    const getUsersSpy = vi.spyOn(adminApiClient, "getUsers");

    const res = await usersReadSeam.list(query);

    expect(getUsersSpy).toHaveBeenCalledTimes(1);
    expect(getUsersSpy).toHaveBeenCalledWith(query);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<UserRow[]>();
      expect(res.data).toEqual(usersAdapter.list(query));
      expect(res.data).toHaveLength(1);
      expect(res.data[0]).toMatchObject({
        name: "Diego Vega",
        email: "diego@acme.io",
        plan: expect.any(String),
        usageM: expect.any(Number),
      });
    }
  });

  it("get() delegates to adminApiClient.getUser and returns UserDetail|null", async () => {
    const email = "diego@acme.io";
    const getUserSpy = vi.spyOn(adminApiClient, "getUser");

    const res = await usersReadSeam.get(email);

    expect(getUserSpy).toHaveBeenCalledTimes(1);
    expect(getUserSpy).toHaveBeenCalledWith(email);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expectTypeOf(res.data).toEqualTypeOf<UserDetail | null>();
      expect(res.data).toEqual(usersAdapter.get(email));
      expect(res.data).toMatchObject({
        email,
        userId: expect.stringMatching(/^usr_/),
      });
    }
  });
});

describe("TT-READ-NO-IO", () => {
  it("performs no fetch and no localStorage.setItem during reads", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    await usersReadSeam.list();
    await usersReadSeam.get("diego@acme.io");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
