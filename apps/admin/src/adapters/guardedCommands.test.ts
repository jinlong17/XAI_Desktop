import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MUTATION_PERMISSION } from "../authz/permissionKeys";
import type { AdminApiResult, MutationAck } from "../contracts/adminApi";
import { mockAdminCommandAdapter } from "./commands";
import {
  createGuardedCommandAdapter,
  GUARDED_COMMAND_ADVISORY_NOTE,
  type GuardedCommandAdapter,
} from "./guardedCommands";

type GuardedFamily = keyof GuardedCommandAdapter;

const GUARDED_CALLS: Record<
  GuardedFamily,
  (commands: GuardedCommandAdapter) => Promise<AdminApiResult<MutationAck>>
> = {
  banUser: (commands) => commands.banUser({ email: "spam_bot_91@mail.ru" }),
  bulkBan: (commands) =>
    commands.bulkBan({ emails: ["spam_one@mail.ru", "spam_two@mail.ru"] }),
  transferOwnership: (commands) =>
    commands.transferOwnership({ org: "Acme Robotics", toMember: "alice@acme.io" }),
  setFeatureRollout: (commands) =>
    commands.setFeatureRollout({ key: "ai-write", rollout: 0 }),
};

describe("TT-CMD-GUARDED-ALLOW-banUser / -bulkBan", () => {
  it("ops role can banUser; granted call returns applied:false + auditId and appends one event", async () => {
    const { commands, chain } = createGuardedCommandAdapter({ role: "ops" });
    const before = chain.length;
    const res = await commands.banUser({ email: "spam_bot_91@mail.ru" });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.applied).toBe(false);
      expect(typeof res.data.auditId).toBe("string");
    }
    expect(chain.length).toBe(before + 1);
  });

  it("ops role can bulkBan; granted call returns applied:false + auditId and appends one event", async () => {
    const { commands, chain } = createGuardedCommandAdapter({ role: "ops" });
    const before = chain.length;
    const res = await commands.bulkBan({
      emails: ["spam_one@mail.ru", "spam_two@mail.ru"],
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.applied).toBe(false);
      expect(typeof res.data.auditId).toBe("string");
    }
    expect(chain.length).toBe(before + 1);
  });
});

describe("TT-CMD-GUARDED-DENY-banUser / -bulkBan", () => {
  it("support role cannot banUser or bulkBan and appends zero events", async () => {
    const { commands, chain } = createGuardedCommandAdapter({ role: "support" });

    const ban = await commands.banUser({ email: "x@example.test" });
    const bulk = await commands.bulkBan({ emails: ["x@example.test"] });

    expect(ban.ok).toBe(false);
    if (!ban.ok) expect(ban.error.code).toBe("forbidden");
    expect(bulk.ok).toBe(false);
    if (!bulk.ok) expect(bulk.error.code).toBe("forbidden");
    expect(chain.length).toBe(0);
  });

  it("no role fails closed as unauthorized and appends zero events", async () => {
    const { commands, chain } = createGuardedCommandAdapter();

    const ban = await commands.banUser({ email: "x@example.test" });
    const bulk = await commands.bulkBan({ emails: ["x@example.test"] });

    expect(ban.ok).toBe(false);
    if (!ban.ok) expect(ban.error.code).toBe("unauthorized");
    expect(bulk.ok).toBe(false);
    if (!bulk.ok) expect(bulk.error.code).toBe("unauthorized");
    expect(chain.length).toBe(0);
  });
});

describe("TT-CMD-AUDIT-ON-MUTATION-banUser / -bulkBan", () => {
  it("banUser appends exactly one event with family, permission, result, and target derived from input", async () => {
    const email = "spam_bot_91@mail.ru";
    const { commands, chain } = createGuardedCommandAdapter({ role: "ops" });

    await commands.banUser({ email });

    expect(chain.length).toBe(1);
    const event = chain.list()[0]!;
    expect(event.mutationFamily).toBe("banUser");
    expect(event.permissionKey).toBe(MUTATION_PERMISSION.banUser);
    expect(event.result).toBe("ok");
    expect(event.target).toEqual({ kind: "user", id: email });
  });

  it("bulkBan appends exactly one event with family, permission, result, and target derived from input", async () => {
    const emails = ["spam_one@mail.ru", "spam_two@mail.ru"];
    const { commands, chain } = createGuardedCommandAdapter({ role: "ops" });

    await commands.bulkBan({ emails });

    expect(chain.length).toBe(1);
    const event = chain.list()[0]!;
    expect(event.mutationFamily).toBe("bulkBan");
    expect(event.permissionKey).toBe(MUTATION_PERMISSION.bulkBan);
    expect(event.result).toBe("ok");
    expect(event.target).toEqual({ kind: "user", id: emails.join(",") });
  });
});

describe("TT-CMD-APPLIED-FALSE", () => {
  it("every granted guarded family returns applied:false with a set auditId", async () => {
    for (const family of Object.keys(GUARDED_CALLS) as GuardedFamily[]) {
      const { commands } = createGuardedCommandAdapter({ role: "super" });
      const res = await GUARDED_CALLS[family](commands);

      expect(res.ok, `${family} should be granted for super`).toBe(true);
      if (res.ok) {
        expect(res.data.applied).toBe(false);
        expect(typeof res.data.auditId).toBe("string");
        expect(res.data.auditId!.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("TT-CMD-NO-IO", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let setItemSpy: ReturnType<typeof vi.spyOn> | null;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setItemSpy = null;
  });

  it("does not call fetch or localStorage.setItem across an allow and a deny", async () => {
    const allowed = createGuardedCommandAdapter({ role: "ops" });
    const denied = createGuardedCommandAdapter({ role: "support" });

    await allowed.commands.banUser({ email: "x@example.test" });
    await denied.commands.banUser({ email: "x@example.test" });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});

describe("TT-CMD-ADVISORY-NOTE", () => {
  it("documents the server as the real authoritative enforcer", () => {
    expect(GUARDED_COMMAND_ADVISORY_NOTE).toMatch(/server/i);
    expect(GUARDED_COMMAND_ADVISORY_NOTE).toMatch(/enforc|authoritative/i);
    expect(GUARDED_COMMAND_ADVISORY_NOTE).toMatch(/applied:false|no real write/i);
  });
});

describe("TT-CMD-GUARDED-IS-ADDITIVE", () => {
  it("leaves slice #1 mockAdminCommandAdapter unchanged and exposes a distinct guarded seam", async () => {
    await expect(mockAdminCommandAdapter.banUser({ email: "x" })).resolves.toEqual({
      ok: true,
      noop: true,
      reason: "slice-1-mock-no-write",
    });

    const guarded = createGuardedCommandAdapter({ role: "ops" });
    expect(guarded).toHaveProperty("commands");
    expect(guarded).toHaveProperty("chain");
    expect(typeof guarded.commands.banUser).toBe("function");
    expect(guarded.commands).not.toBe(mockAdminCommandAdapter);
  });
});

describe("TT-CMD-GUARDED-ALLOW-transferOwnership", () => {
  it("super role can transferOwnership; granted call returns applied:false + auditId and appends one event", async () => {
    const { commands, chain } = createGuardedCommandAdapter({ role: "super" });
    const before = chain.length;
    const res = await commands.transferOwnership({
      org: "Acme",
      toMember: "x",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.applied).toBe(false);
      expect(typeof res.data.auditId).toBe("string");
    }
    expect(chain.length).toBe(before + 1);
  });
});

describe("TT-CMD-GUARDED-DENY-transferOwnership", () => {
  it.each(["ops", "support", "finance", "audit"] as const)(
    "%s role cannot transferOwnership and appends zero events",
    async (role) => {
      const { commands, chain } = createGuardedCommandAdapter({ role });

      const res = await commands.transferOwnership({
        org: "Acme",
        toMember: "x",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("forbidden");
      expect(chain.length).toBe(0);
    },
  );

  it("no role fails transferOwnership closed as unauthorized and appends zero events", async () => {
    const { commands, chain } = createGuardedCommandAdapter();

    const res = await commands.transferOwnership({
      org: "Acme",
      toMember: "x",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("unauthorized");
    expect(chain.length).toBe(0);
  });
});

describe("TT-CMD-AUDIT-ON-MUTATION-transferOwnership", () => {
  it("transferOwnership appends exactly one event with family, permission, and ok result", async () => {
    const { commands, chain } = createGuardedCommandAdapter({ role: "super" });

    await commands.transferOwnership({
      org: "Acme",
      toMember: "x",
    });

    expect(chain.length).toBe(1);
    const event = chain.list()[0]!;
    expect(event.mutationFamily).toBe("transferOwnership");
    expect(event.permissionKey).toBe(MUTATION_PERMISSION.transferOwnership);
    expect(event.permissionKey).toBe("admin.orgs.transfer_ownership");
    expect(event.result).toBe("ok");
  });
});

describe("TT-CMD-GUARDED-ALLOW-setFeatureRollout", () => {
  it.each(["super", "ops"] as const)(
    "%s role can setFeatureRollout; granted call returns applied:false + auditId and appends one event",
    async (role) => {
      const { commands, chain } = createGuardedCommandAdapter({ role });
      const before = chain.length;
      const res = await commands.setFeatureRollout({
        key: "ai-write",
        rollout: 0,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.applied).toBe(false);
        expect(typeof res.data.auditId).toBe("string");
      }
      expect(chain.length).toBe(before + 1);
    },
  );
});

describe("TT-CMD-GUARDED-DENY-setFeatureRollout", () => {
  it.each(["support", "finance", "audit"] as const)(
    "%s role cannot setFeatureRollout and appends zero events",
    async (role) => {
      const { commands, chain } = createGuardedCommandAdapter({ role });

      const res = await commands.setFeatureRollout({
        key: "ai-write",
        rollout: 0,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("forbidden");
      expect(chain.length).toBe(0);
    },
  );

  it("no role fails setFeatureRollout closed as unauthorized and appends zero events", async () => {
    const { commands, chain } = createGuardedCommandAdapter();

    const res = await commands.setFeatureRollout({
      key: "ai-write",
      rollout: 0,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("unauthorized");
    expect(chain.length).toBe(0);
  });
});

describe("TT-CMD-AUDIT-ON-MUTATION-setFeatureRollout", () => {
  it("setFeatureRollout appends exactly one event with family, permission, and ok result", async () => {
    const { commands, chain } = createGuardedCommandAdapter({ role: "super" });

    await commands.setFeatureRollout({
      key: "ai-write",
      rollout: 0,
    });

    expect(chain.length).toBe(1);
    const event = chain.list()[0]!;
    expect(event.mutationFamily).toBe("setFeatureRollout");
    expect(event.permissionKey).toBe(MUTATION_PERMISSION.setFeatureRollout);
    expect(event.permissionKey).toBe("admin.features.rollout");
    expect(event.result).toBe("ok");
  });
});

describe("TT-CMD-CHAIN-AFTER-N", () => {
  it("keeps the audit chain valid after a mixed granted and denied command sequence", async () => {
    const granted = createGuardedCommandAdapter({ role: "super" });
    const denied = createGuardedCommandAdapter({ role: "audit" });

    await granted.commands.banUser({ email: "spam_bot_91@mail.ru" });
    await denied.commands.banUser({ email: "x@example.test" });
    await granted.commands.bulkBan({
      emails: ["spam_one@mail.ru", "spam_two@mail.ru"],
    });
    await denied.commands.bulkBan({ emails: ["x@example.test"] });
    await granted.commands.transferOwnership({
      org: "Acme",
      toMember: "x",
    });
    await denied.commands.transferOwnership({
      org: "Acme",
      toMember: "x",
    });

    expect(() => granted.chain.verify()).not.toThrow();
    expect(() => denied.chain.verify()).not.toThrow();
    expect(granted.chain.list()).toHaveLength(3);
    expect(denied.chain.list()).toHaveLength(0);
    expect(granted.chain.length + denied.chain.length).toBe(3);
  });
});
