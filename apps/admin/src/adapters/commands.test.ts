/**
 * TT-CMD-NOOP — destructive command adapter no-op tests (Phase 3).
 *
 * Asserts every command resolves the canonical no-op result AND performs no
 * write / network / persistence (AC-4, api.md §5, test.md §2).
 *
 * Phase: P3 (mock adapters).
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { mockAdminCommandAdapter } from "./commands";

afterEach(() => {
  vi.restoreAllMocks();
});

const EXPECTED = { ok: true, noop: true, reason: "slice-1-mock-no-write" } as const;

describe("TT-CMD-NOOP: every command is a no-op", () => {
  it("each command resolves { ok:true, noop:true, reason:'slice-1-mock-no-write' }", async () => {
    expect(await mockAdminCommandAdapter.banUser({ email: "x@y.z" })).toEqual(EXPECTED);
    expect(await mockAdminCommandAdapter.bulkBan({ emails: ["a", "b"] })).toEqual(EXPECTED);
    expect(await mockAdminCommandAdapter.setFeatureRollout({ key: "f", rollout: 50 })).toEqual(EXPECTED);
    expect(await mockAdminCommandAdapter.transferOwnership({ org: "o", toMember: "m" })).toEqual(EXPECTED);
    expect(await mockAdminCommandAdapter.setProviderRouting({ plan: "Pro", model: "m" })).toEqual(EXPECTED);
    expect(await mockAdminCommandAdapter.setQuota({ subject: "s", quota: 100 })).toEqual(EXPECTED);
  });

  it("commands trigger NO write / network (fetch + storage spies untouched)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch" as never).mockImplementation(() => {
      throw new Error("command must not call fetch");
    });
    const setItemSpy =
      typeof localStorage !== "undefined" ? vi.spyOn(Storage.prototype, "setItem") : null;
    const removeItemSpy =
      typeof localStorage !== "undefined" ? vi.spyOn(Storage.prototype, "removeItem") : null;

    await mockAdminCommandAdapter.banUser({ email: "x@y.z" });
    await mockAdminCommandAdapter.bulkBan({ emails: ["a"] });
    await mockAdminCommandAdapter.setFeatureRollout({ key: "f", rollout: 0 });
    await mockAdminCommandAdapter.transferOwnership({ org: "o", toMember: "m" });
    await mockAdminCommandAdapter.setProviderRouting({ plan: "Team", model: "m" });
    await mockAdminCommandAdapter.setQuota({ subject: "s", quota: 1 });

    expect(fetchSpy).not.toHaveBeenCalled();
    if (setItemSpy) expect(setItemSpy).not.toHaveBeenCalled();
    if (removeItemSpy) expect(removeItemSpy).not.toHaveBeenCalled();
  });
});
