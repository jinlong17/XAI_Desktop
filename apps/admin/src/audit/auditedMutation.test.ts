/**
 * audit/auditedMutation.test.ts — P2 audit-on-mutation invariant (row #5).
 *
 * Covers (test.md §1, AC-4/AC-5/AC-6):
 *   - TT-AUDIT-ON-MUTATION-<family> ×6 : granted → exactly one correct event
 *   - TT-AUDIT-DENY-NOAPPEND-<family> ×6 : denied/unauthorized → ZERO append
 *   - TT-AUDIT-ID-RESOLVES             : auditId resolves to the appended event
 *   - TT-AUDIT-APPLIED-FALSE           : granted ack has applied:false + auditId set
 *   - TT-AUDIT-CHAIN-AFTER-N           : verify() green after N mixed; length === granted count
 *   - TT-AUDIT-NO-IO                   : no fetch / no localStorage write across reads+mutations
 *   - TT-AUDIT-ADVISORY-NOTE           : module names the server as the real enforcer
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createAuditedMockAdminApiClient,
  AUDIT_ON_MUTATION_ADVISORY_NOTE,
  projectAudit,
} from "./auditedMutation";
import { MUTATION_PERMISSION, type MutationFamily } from "../authz/permissionKeys";
import { canMutate, ADMIN_ROLES, type AdminRole } from "../authz/rbac";
import type { AdminApiClient, AdminApiResult, MutationAck } from "../contracts/adminApi";

/** Minimal valid input per family (matches the AdminApiClient signatures EXACTLY). */
const CALL: Record<
  MutationFamily,
  (c: AdminApiClient) => Promise<AdminApiResult<MutationAck>>
> = {
  banUser: (c) => c.banUser({ email: "spam_bot_91@mail.ru" }),
  bulkBan: (c) => c.bulkBan({ emails: ["a@x.io", "b@x.io"] }),
  setFeatureRollout: (c) => c.setFeatureRollout({ key: "clipboard", rollout: 25 }),
  transferOwnership: (c) => c.transferOwnership({ org: "Acme", toMember: "alice" }),
  setProviderRouting: (c) => c.setProviderRouting({ plan: "Team", model: "gpt-4o" }),
  setQuota: (c) => c.setQuota({ subject: "Acme", quota: 500 }),
};

const FAMILIES = Object.keys(CALL) as MutationFamily[];

/** A role that IS granted the family (super always is). */
function grantedRole(family: MutationFamily): AdminRole {
  const r = ADMIN_ROLES.find((role) => canMutate(role, family));
  if (!r) throw new Error(`no role grants ${family}`);
  return r;
}

/** All roles that are NOT granted the family (the mandatory negatives). */
function deniedRoles(family: MutationFamily): AdminRole[] {
  return ADMIN_ROLES.filter((role) => !canMutate(role, family));
}

describe("TT-AUDIT-ON-MUTATION-<family>: granted → exactly one correct event", () => {
  for (const family of FAMILIES) {
    it(`${family}: granted role appends exactly ONE event (family/permissionKey/result)`, async () => {
      const role = grantedRole(family);
      const { client, chain } = createAuditedMockAdminApiClient({ role });
      const before = chain.length;
      const res = await CALL[family](client);

      expect(res.ok).toBe(true);
      expect(chain.length).toBe(before + 1);

      const event = chain.list()[chain.length - 1]!;
      expect(event.mutationFamily).toBe(family);
      expect(event.permissionKey).toBe(MUTATION_PERMISSION[family]);
      expect(event.result).toBe("ok");
      expect(event.target.id.length).toBeGreaterThan(0); // target derived from input
      expect(event.seq).toBe(chain.length);
    });
  }
});

describe("TT-AUDIT-DENY-NOAPPEND-<family>: denied/unauthorized → ZERO append", () => {
  for (const family of FAMILIES) {
    it(`${family}: every NON-granted role returns forbidden + appends ZERO`, async () => {
      for (const role of deniedRoles(family)) {
        const { client, chain } = createAuditedMockAdminApiClient({ role });
        const res = await CALL[family](client);
        expect(res.ok).toBe(false);
        if (!res.ok) expect(res.error.code).toBe("forbidden");
        expect(chain.length, `${role} must not append for ${family}`).toBe(0);
      }
    });

    it(`${family}: NO role (unauthenticated) returns unauthorized + appends ZERO`, async () => {
      const { client, chain } = createAuditedMockAdminApiClient(); // no role → fail closed
      const res = await CALL[family](client);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error.code).toBe("unauthorized");
      expect(chain.length).toBe(0);
    });
  }

  it("spot-check the documented deny matrix (audit/finance/support cannot banUser; non-super cannot transferOwnership/setProviderRouting)", () => {
    expect(canMutate("audit", "banUser")).toBe(false);
    expect(canMutate("finance", "banUser")).toBe(false);
    expect(canMutate("support", "banUser")).toBe(false);
    for (const r of ["ops", "support", "finance", "audit"] as AdminRole[]) {
      expect(canMutate(r, "transferOwnership")).toBe(false);
      expect(canMutate(r, "setProviderRouting")).toBe(false);
    }
    expect(canMutate("super", "transferOwnership")).toBe(true);
    expect(canMutate("super", "setProviderRouting")).toBe(true);
  });
});

describe("TT-AUDIT-ID-RESOLVES + TT-AUDIT-APPLIED-FALSE", () => {
  it("granted mutation's auditId resolves to the appended event", async () => {
    const { client, chain } = createAuditedMockAdminApiClient({ role: "super" });
    const res = await client.banUser({ email: "x@y.io" });
    expect(res.ok).toBe(true);
    if (res.ok) {
      const id = res.data.auditId;
      expect(id).toBeDefined();
      const found = chain.list().find((e) => e.hash === id);
      expect(found, "auditId must resolve to an event in the chain").toBeDefined();
      expect(found!.mutationFamily).toBe("banUser");
    }
  });

  it("every granted mutation returns applied:false WITH a set auditId", async () => {
    for (const family of FAMILIES) {
      const { client } = createAuditedMockAdminApiClient({ role: grantedRole(family) });
      const res = await CALL[family](client);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.applied).toBe(false); // NO real write this row
        expect(typeof res.data.auditId).toBe("string"); // audit recorded (row #2 obligation)
        expect(res.data.auditId!.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("TT-AUDIT-CHAIN-AFTER-N: verify() green after N mixed; length === granted count", () => {
  it("a mixed sequence of granted + denied keeps verify() green; length === granted count", async () => {
    // super grants everything → use a role with a MIX of grants/denies: ops.
    // ops grants: banUser, bulkBan, setFeatureRollout, setQuota (4). denies: transferOwnership,
    // setProviderRouting (2). Run each family once.
    const role: AdminRole = "ops";
    const { client, chain } = createAuditedMockAdminApiClient({ role });
    let grantedCount = 0;
    for (const family of FAMILIES) {
      const res = await CALL[family](client);
      if (canMutate(role, family)) {
        expect(res.ok).toBe(true);
        grantedCount++;
      } else {
        expect(res.ok).toBe(false);
      }
    }
    expect(grantedCount).toBe(4); // sanity: ops grants exactly 4 of the 6 families
    expect(chain.length).toBe(grantedCount);
    expect(() => chain.verify()).not.toThrow();
  });

  it("repeated granted calls each append a NEW event (append-only ledger, not deduped)", async () => {
    const { client, chain } = createAuditedMockAdminApiClient({ role: "super" });
    await client.banUser({ email: "x@y.io" });
    await client.banUser({ email: "x@y.io" }); // same input → still a new ledger entry
    expect(chain.length).toBe(2);
    expect(() => chain.verify()).not.toThrow();
  });
});

describe("TT-AUDIT-NO-IO: no network / no persistence across reads + mutations", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let setItemSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    fetchSpy = vi.fn();
    // jsdom provides localStorage; spy on setItem. fetch may be undefined → install a spy.
    (globalThis as { fetch?: unknown }).fetch = fetchSpy;
    if (typeof localStorage !== "undefined") {
      setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as { fetch?: unknown }).fetch;
  });

  it("reads + granted/denied mutations perform NO fetch and NO localStorage.setItem", async () => {
    const { client } = createAuditedMockAdminApiClient({ role: "ops" });
    await client.getOverview();
    await client.getAudit();
    await client.banUser({ email: "x@y.io" }); // granted → appends in-memory only
    await client.transferOwnership({ org: "A", toMember: "b" }); // denied
    expect(fetchSpy).not.toHaveBeenCalled();
    if (setItemSpy) expect(setItemSpy).not.toHaveBeenCalled();
  });
});

describe("TT-AUDIT-ADVISORY-NOTE: server is the real enforcer (R2 guard)", () => {
  it("the advisory note names the SERVER as the real enforcer + applied:false posture", () => {
    expect(AUDIT_ON_MUTATION_ADVISORY_NOTE).toMatch(/server/i);
    expect(AUDIT_ON_MUTATION_ADVISORY_NOTE).toMatch(/real enforcer/i);
    expect(AUDIT_ON_MUTATION_ADVISORY_NOTE).toMatch(/advisory/i);
    expect(AUDIT_ON_MUTATION_ADVISORY_NOTE).toMatch(/applied:false|no real write/i);
  });
});

describe("audit read side (§5) — chain projection used by getAudit", () => {
  it("getAudit returns rows projected from the chain, NEWEST FIRST", async () => {
    const { client, chain } = createAuditedMockAdminApiClient({ role: "super" });
    await client.banUser({ email: "first@y.io" });
    await client.setQuota({ subject: "Acme", quota: 10 });
    const res = await client.getAudit();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data).toHaveLength(2);
      // newest (setQuota) first
      expect(res.data[0]!.action).toBe("quota.set");
      expect(res.data[1]!.action).toBe("users.ban");
      // bound to slice #1 AuditRow shape
      expect(Object.keys(res.data[0]!).sort()).toEqual(
        ["action", "ip", "object", "ok", "time", "type", "who"].sort(),
      );
    }
    // projectAudit is pure over the chain snapshot
    expect(projectAudit(chain)).toHaveLength(2);
  });

  it("getAudit filters by type over the projection", async () => {
    const { client } = createAuditedMockAdminApiClient({ role: "super" });
    await client.banUser({ email: "x@y.io" }); // danger
    await client.setQuota({ subject: "Acme", quota: 10 }); // config
    const danger = await client.getAudit({ type: "danger" });
    expect(danger.ok).toBe(true);
    if (danger.ok) {
      expect(danger.data).toHaveLength(1);
      expect(danger.data[0]!.action).toBe("users.ban");
    }
  });
});
