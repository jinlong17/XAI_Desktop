/**
 * TT-RBAC-* — role map + advisory predicate (row #2, P3).
 *
 * allow/deny tests for EVERY mutation family (mandatory negatives), read-grant proof for
 * the read-only `audit` role + full `super`, fail-closed on null/undefined/unknown role,
 * and the server-authoritative / browser-advisory documented invariant.
 *
 * Test strategy: apps/admin/docs/data-contracts-rbac/test.md §1 (AC-4, AC-5).
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import {
  can,
  canMutate,
  ROLE_GRANTS,
  ADMIN_ROLES,
  RBAC_ADVISORY_NOTE,
  RBAC_SERVER_AUTHORITATIVE,
  type AdminRole,
} from "./rbac";
import {
  PERMISSION_KEYS,
  MUTATION_PERMISSION,
  type MutationFamily,
} from "./permissionKeys";

const __dirname = dirname(fileURLToPath(import.meta.url));
const K = PERMISSION_KEYS;

/**
 * Expected allow/deny per mutation family, derived from the prototype matrix.
 * `allow` = roles that MUST be able to perform it; `deny` = roles that MUST NOT.
 * Every family lists BOTH (mandatory negatives — TT-RBAC-DENY-*).
 */
const FAMILY_EXPECTATIONS: Record<
  MutationFamily,
  { allow: AdminRole[]; deny: AdminRole[] }
> = {
  banUser: { allow: ["super", "ops"], deny: ["support", "finance", "audit"] },
  bulkBan: { allow: ["super", "ops"], deny: ["support", "finance", "audit"] },
  setFeatureRollout: { allow: ["super", "ops"], deny: ["support", "finance", "audit"] },
  setQuota: { allow: ["super", "ops"], deny: ["support", "finance", "audit"] },
  // REC-1: synthesized ORG_TRANSFER_OWNER → SUPER-ONLY (fail-closed default; not a seed).
  transferOwnership: { allow: ["super"], deny: ["ops", "support", "finance", "audit"] },
  setProviderRouting: { allow: ["super"], deny: ["ops", "support", "finance", "audit"] },
};

describe("TT-RBAC-ALLOW-<family>: granted roles can perform each mutation family", () => {
  for (const family of Object.keys(FAMILY_EXPECTATIONS) as MutationFamily[]) {
    const { allow } = FAMILY_EXPECTATIONS[family];
    for (const role of allow) {
      it(`TT-RBAC-ALLOW-${family}: ${role} canMutate(${family}) === true`, () => {
        expect(canMutate(role, family)).toBe(true);
      });
    }
  }
});

describe("TT-RBAC-DENY-<family>: ungranted roles CANNOT perform each mutation family (mandatory negatives)", () => {
  for (const family of Object.keys(FAMILY_EXPECTATIONS) as MutationFamily[]) {
    const { deny } = FAMILY_EXPECTATIONS[family];
    // every family must have at least one negative case
    it(`TT-RBAC-DENY-${family}: has at least one denied role`, () => {
      expect(deny.length).toBeGreaterThan(0);
    });
    for (const role of deny) {
      it(`TT-RBAC-DENY-${family}: ${role} canMutate(${family}) === false`, () => {
        expect(canMutate(role, family)).toBe(false);
      });
    }
  }

  it("the allow ∪ deny sets cover all 5 roles for every family (no role left unspecified)", () => {
    for (const family of Object.keys(FAMILY_EXPECTATIONS) as MutationFamily[]) {
      const { allow, deny } = FAMILY_EXPECTATIONS[family];
      expect([...allow, ...deny].sort()).toEqual([...ADMIN_ROLES].sort());
    }
  });
});

describe("TT-RBAC-READ-GRANTS: read-only role + super grants", () => {
  it("audit can VIEW_DASHBOARD and VIEW_AUDIT", () => {
    expect(can("audit", K.VIEW_DASHBOARD)).toBe(true);
    expect(can("audit", K.VIEW_AUDIT)).toBe(true);
  });

  it("audit CANNOT USER_BAN / FEATURE_ROLLOUT / BILLING_MANAGE (read-only proven)", () => {
    expect(can("audit", K.USER_BAN)).toBe(false);
    expect(can("audit", K.FEATURE_ROLLOUT)).toBe(false);
    expect(can("audit", K.BILLING_MANAGE)).toBe(false);
    expect(can("audit", K.ROLE_MANAGE)).toBe(false);
  });

  it("super has EVERY permission key (including the synthesized ORG_TRANSFER_OWNER)", () => {
    for (const key of Object.values(PERMISSION_KEYS)) {
      expect(can("super", key)).toBe(true);
    }
    expect(can("super", K.ORG_TRANSFER_OWNER)).toBe(true);
    // super's grant set IS the full catalog.
    expect(ROLE_GRANTS.super.size).toBe(Object.values(PERMISSION_KEYS).length);
  });

  it("finance is billing-only (+ dashboard); ops/support match the prototype matrix", () => {
    expect(can("finance", K.BILLING_MANAGE)).toBe(true);
    expect(can("finance", K.USER_BAN)).toBe(false);
    expect(can("ops", K.USER_MANAGE)).toBe(true);
    expect(can("ops", K.PROVIDER_ROUTING)).toBe(false);
    expect(can("support", K.USER_IMPERSONATE)).toBe(true);
    expect(can("support", K.USER_BAN)).toBe(false);
  });

  it("non-finance roles CANNOT BILLING_MANAGE", () => {
    expect(can("ops", K.BILLING_MANAGE)).toBe(false);
    expect(can("support", K.BILLING_MANAGE)).toBe(false);
    expect(can("audit", K.BILLING_MANAGE)).toBe(false);
  });
});

describe("TT-RBAC-FAILCLOSED: null/undefined/unknown role → false, never throws", () => {
  it("can(null|undefined, key) → false", () => {
    expect(can(null, K.USER_BAN)).toBe(false);
    expect(can(undefined, K.VIEW_DASHBOARD)).toBe(false);
  });

  it("canMutate(null|undefined, family) → false for every family", () => {
    for (const family of Object.keys(MUTATION_PERMISSION) as MutationFamily[]) {
      expect(canMutate(null, family)).toBe(false);
      expect(canMutate(undefined, family)).toBe(false);
    }
  });

  it("unknown role → false (fail closed), never throws", () => {
    const unknown = "root" as unknown as AdminRole;
    expect(() => can(unknown, K.USER_BAN)).not.toThrow();
    expect(can(unknown, K.USER_BAN)).toBe(false);
    expect(canMutate(unknown, "banUser")).toBe(false);
  });

  it("predicate is pure (no throw on any role × key combination)", () => {
    for (const role of [...ADMIN_ROLES, null, undefined]) {
      for (const key of Object.values(PERMISSION_KEYS)) {
        expect(() => can(role, key)).not.toThrow();
      }
    }
  });
});

describe("TT-RBAC-ADVISORY-NOTE: module documents browser-advisory / server-authoritative (guards R1)", () => {
  it("RBAC_SERVER_AUTHORITATIVE flag is true", () => {
    expect(RBAC_SERVER_AUTHORITATIVE).toBe(true);
  });

  it("RBAC_ADVISORY_NOTE names the browser as advisory and the server as authoritative", () => {
    const note = RBAC_ADVISORY_NOTE.toLowerCase();
    expect(note).toContain("advisory");
    expect(note).toContain("never");
    expect(note).toContain("server");
    expect(note).toMatch(/security boundary/);
  });

  it("the rbac.ts source carries the server-authoritative posture banner", () => {
    const src = readFileSync(join(__dirname, "rbac.ts"), "utf-8").toLowerCase();
    expect(src).toContain("server-authoritative");
    expect(src).toContain("advisory");
    expect(src).toContain("never the security boundary");
  });

  it("api.md documents server-authoritative + browser-advisory", () => {
    const apiMd = readFileSync(
      join(__dirname, "..", "..", "docs", "data-contracts-rbac", "api.md"),
      "utf-8",
    ).toLowerCase();
    expect(apiMd).toContain("advisory");
    expect(apiMd).toContain("server-authoritative");
  });
});
