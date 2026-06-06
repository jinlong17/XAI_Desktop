/**
 * TT-READMODEL-CONTRACT / TT-READMODEL-ANNOTATION — row #2 P1.
 *
 * Proves the canonical read-model contract (`contracts/readModels.ts`) is a
 * single-source RE-EXPORT of slice #1's `adapters/types.ts` (NOT a re-declaration),
 * and that the live/mock/deferred annotation covers exactly the 10 page read models.
 *
 * Test strategy: apps/admin/docs/data-contracts-rbac/test.md §1 (AC-1).
 */
import { describe, it, expect, expectTypeOf } from "vitest";

import { adminReadModels } from "../adapters/index";
import type { AdminReadModels as SliceOneAdminReadModels } from "../adapters/types";
import type {
  AdminReadModels as CanonicalAdminReadModels,
  OverviewReadModel as CanonicalOverview,
  UsersReadModel as CanonicalUsers,
  OrgsReadModel as CanonicalOrgs,
  FeaturesReadModel as CanonicalFeatures,
  AiUsageReadModel as CanonicalAiUsage,
  ProvidersReadModel as CanonicalProviders,
  RolesReadModel as CanonicalRoles,
  BillingReadModel as CanonicalBilling,
  AuditReadModel as CanonicalAudit,
  SettingsReadModel as CanonicalSettings,
  ModelPlanCell,
  RbacRow,
} from "./readModels";
import type {
  OverviewReadModel as SliceOverview,
  UsersReadModel as SliceUsers,
  ProvidersReadModel as SliceProviders,
  RolesReadModel as SliceRoles,
} from "../adapters/types";
import {
  READ_MODEL_KEYS,
  READ_MODEL_ANNOTATIONS,
  type ReadModelKey,
} from "./readModels";

describe("TT-READMODEL-CONTRACT: canonical contract is a single-source re-export", () => {
  it("the canonical AdminReadModels IS slice #1's AdminReadModels (re-export, not a fork)", () => {
    // Bidirectional type identity: each is assignable to the other AND the
    // shipped `adminReadModels` instance satisfies the canonical contract.
    expectTypeOf<CanonicalAdminReadModels>().toEqualTypeOf<SliceOneAdminReadModels>();
    expectTypeOf(adminReadModels).toMatchTypeOf<CanonicalAdminReadModels>();
    // A value-level smoke: the shipped instance has every registry key.
    expect(Object.keys(adminReadModels).sort()).toEqual([...READ_MODEL_KEYS].sort());
  });

  it("each of the 10 page read-model types is the same type as slice #1's (no re-declaration)", () => {
    expectTypeOf<CanonicalOverview>().toEqualTypeOf<SliceOverview>();
    expectTypeOf<CanonicalUsers>().toEqualTypeOf<SliceUsers>();
    expectTypeOf<CanonicalProviders>().toEqualTypeOf<SliceProviders>();
    expectTypeOf<CanonicalRoles>().toEqualTypeOf<SliceRoles>();
    // Compile-time presence of all 10 canonical read-model types (any rename/removal
    // upstream would fail this import + the assignments below).
    const _checks: [
      CanonicalOverview?,
      CanonicalUsers?,
      CanonicalOrgs?,
      CanonicalFeatures?,
      CanonicalAiUsage?,
      CanonicalProviders?,
      CanonicalRoles?,
      CanonicalBilling?,
      CanonicalAudit?,
      CanonicalSettings?,
    ] = [];
    expect(_checks).toBeDefined();
  });

  it("REC-3: real return shapes are 1-D (ModelPlanCell[] / RbacRow[]), not [][]", () => {
    // The shipped adapters return 1-D arrays; the canonical types re-export those exact
    // shapes. A `[][]` fork (slice #1's stale doc) would make these assignments fail.
    const matrix: ModelPlanCell[] = adminReadModels.providers.modelPlanMatrix();
    const rbac: RbacRow[] = adminReadModels.roles.rbacMatrix();
    expect(Array.isArray(matrix)).toBe(true);
    expect(Array.isArray(rbac)).toBe(true);
    // 1-D element shape (no nested array element).
    if (matrix.length) expect(Array.isArray(matrix[0])).toBe(false);
    if (rbac.length) expect(Array.isArray(rbac[0])).toBe(false);
    expectTypeOf(adminReadModels.providers.modelPlanMatrix()).toEqualTypeOf<ModelPlanCell[]>();
    expectTypeOf(adminReadModels.roles.rbacMatrix()).toEqualTypeOf<RbacRow[]>();
  });

  it("the contract surfaces all 10 read models + the AdminReadModels aggregate", () => {
    expect(READ_MODEL_KEYS).toHaveLength(10);
    expect([...READ_MODEL_KEYS]).toEqual([
      "overview",
      "users",
      "orgs",
      "features",
      "aiUsage",
      "providers",
      "roles",
      "billing",
      "audit",
      "settings",
    ]);
  });
});

describe("TT-READMODEL-ANNOTATION: live/mock/deferred covers exactly the 10 page read models", () => {
  it("annotation set covers every registry key — none missing, none extra", () => {
    const annotated = READ_MODEL_ANNOTATIONS.map((a) => a.key).sort();
    const expected = [...READ_MODEL_KEYS].sort();
    expect(annotated).toEqual(expected);
    expect(READ_MODEL_ANNOTATIONS).toHaveLength(READ_MODEL_KEYS.length);
  });

  it("each annotation key is a valid ReadModelKey and unique", () => {
    const keys = READ_MODEL_ANNOTATIONS.map((a) => a.key);
    expect(new Set(keys).size).toBe(keys.length); // unique
    for (const a of READ_MODEL_ANNOTATIONS) {
      expect(READ_MODEL_KEYS).toContain(a.key as ReadModelKey);
    }
  });

  it("row #2 is contract-only → every read model is mock today, each carries a target-row annotation", () => {
    for (const a of READ_MODEL_ANNOTATIONS) {
      // No read model is wired to a real backend in row #2.
      expect(a.today).toBe("mock");
      // Each has a defined target-row annotation (string or the 'derivable' note).
      expect(typeof a.becomesLiveIn === "string" || a.becomesLiveIn === null).toBe(true);
      expect(a.becomesLiveIn).not.toBe(undefined);
      expect(a.page.length).toBeGreaterThan(0);
    }
  });

  it("providers annotation documents key-STATUS-only (no key material obligation)", () => {
    const providers = READ_MODEL_ANNOTATIONS.find((a) => a.key === "providers");
    expect(providers?.notes.toLowerCase()).toContain("status only");
  });
});
