/**
 * TT-PERMKEY-* — immutable permission-key catalog (row #2, P2).
 *
 * Validates the catalog invariants: unique, pattern-valid dotted keys; every mutation
 * family maps to exactly one in-catalog key; append-only snapshot holds.
 *
 * Test strategy: apps/admin/docs/data-contracts-rbac/test.md §1 (AC-2, AC-3).
 */
import { describe, it, expect, expectTypeOf } from "vitest";

import {
  PERMISSION_KEYS,
  MUTATION_PERMISSION,
  PERMISSION_KEYS_SNAPSHOT_V1,
  ALL_PERMISSION_KEYS,
  type PermissionKey,
  type MutationFamily,
} from "./permissionKeys";
import type { AdminCommandAdapter } from "../adapters/types";

const KEY_VALUES = Object.values(PERMISSION_KEYS);

// The 6 slice #1 command families, written out so the test pins the EXACT expected set.
const EXPECTED_FAMILIES: MutationFamily[] = [
  "banUser",
  "bulkBan",
  "setFeatureRollout",
  "transferOwnership",
  "setProviderRouting",
  "setQuota",
];

describe("TT-PERMKEY-UNIQUE: every permission key value is distinct", () => {
  it("no duplicate key strings", () => {
    expect(new Set(KEY_VALUES).size).toBe(KEY_VALUES.length);
  });

  it("ALL_PERMISSION_KEYS equals the catalog values", () => {
    expect([...ALL_PERMISSION_KEYS].sort()).toEqual([...KEY_VALUES].sort());
  });
});

describe("TT-PERMKEY-PATTERN: every key is dotted, namespaced, lowercase", () => {
  // ^admin\.<seg>(\.<seg>)*$  where <seg> = [a-z_]+ (snake_case allowed within a segment)
  const PATTERN = /^admin\.[a-z_]+(\.[a-z_]+)*$/;

  for (const [ident, key] of Object.entries(PERMISSION_KEYS)) {
    it(`${ident} ("${key}") matches the dotted-key pattern`, () => {
      expect(key).toMatch(PATTERN);
    });
  }

  it("all keys start with the admin. namespace", () => {
    for (const k of KEY_VALUES) expect(k.startsWith("admin.")).toBe(true);
  });
});

describe("TT-PERMKEY-MUTATION-COVERAGE: every mutation family maps to exactly one in-catalog key", () => {
  it("MUTATION_PERMISSION family set === keyof AdminCommandAdapter (exactly the 6 families)", () => {
    const mappedFamilies = Object.keys(MUTATION_PERMISSION).sort();
    expect(mappedFamilies).toEqual([...EXPECTED_FAMILIES].sort());
    expect(mappedFamilies).toHaveLength(6);
    // Compile-time: MUTATION_PERMISSION is Record<keyof AdminCommandAdapter, PermissionKey>.
    expectTypeOf<keyof typeof MUTATION_PERMISSION>().toEqualTypeOf<keyof AdminCommandAdapter>();
  });

  it("every mapped value is a member of PERMISSION_KEYS", () => {
    for (const [family, key] of Object.entries(MUTATION_PERMISSION)) {
      expect(KEY_VALUES, `${family} maps to an unknown key "${key}"`).toContain(key);
    }
  });

  it("each family maps to exactly one key (Record → single value)", () => {
    for (const family of EXPECTED_FAMILIES) {
      const key = MUTATION_PERMISSION[family];
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    }
    // banUser + bulkBan deliberately share USER_BAN (same destructive family).
    expect(MUTATION_PERMISSION.banUser).toBe(PERMISSION_KEYS.USER_BAN);
    expect(MUTATION_PERMISSION.bulkBan).toBe(PERMISSION_KEYS.USER_BAN);
  });

  it("REC-1: transferOwnership maps to the synthesized ORG_TRANSFER_OWNER key", () => {
    expect(MUTATION_PERMISSION.transferOwnership).toBe(PERMISSION_KEYS.ORG_TRANSFER_OWNER);
    expect(PERMISSION_KEYS.ORG_TRANSFER_OWNER).toBe("admin.orgs.transfer_ownership");
  });
});

describe("TT-PERMKEY-APPEND-ONLY: catalog is a superset of the frozen snapshot", () => {
  it("every snapshot key still exists (no removal / rename)", () => {
    for (const snapKey of PERMISSION_KEYS_SNAPSHOT_V1) {
      expect(
        KEY_VALUES,
        `append-only VIOLATION: snapshot key "${snapKey}" is missing — keys may be added, never removed/renamed`,
      ).toContain(snapKey);
    }
  });

  it("the catalog has at least as many keys as the snapshot (append-only)", () => {
    expect(KEY_VALUES.length).toBeGreaterThanOrEqual(PERMISSION_KEYS_SNAPSHOT_V1.length);
  });

  it("row #2 snapshot captures exactly the 11 launch keys", () => {
    expect(PERMISSION_KEYS_SNAPSHOT_V1).toHaveLength(11);
    expect(KEY_VALUES).toHaveLength(11);
  });

  it("catalog is readonly at the type level (as const) — values are literal types", () => {
    // `as const` narrows each value to its literal type and makes the record readonly.
    // We assert the literal-type narrowing rather than performing a runtime mutation
    // (which would corrupt the shared catalog object for other tests).
    expectTypeOf(PERMISSION_KEYS.USER_BAN).toEqualTypeOf<"admin.users.ban">();
    expectTypeOf(PERMISSION_KEYS.ORG_TRANSFER_OWNER).toEqualTypeOf<"admin.orgs.transfer_ownership">();
    // A readonly-assignment attempt would be a compile error (verified by the type system):
    type Catalog = typeof PERMISSION_KEYS;
    type IsReadonly = Catalog extends { readonly USER_BAN: string } ? true : false;
    expectTypeOf<IsReadonly>().toEqualTypeOf<true>();
  });

  it("PermissionKey type is the union of catalog values", () => {
    const k: PermissionKey = PERMISSION_KEYS.VIEW_DASHBOARD;
    expect(KEY_VALUES).toContain(k);
  });
});
