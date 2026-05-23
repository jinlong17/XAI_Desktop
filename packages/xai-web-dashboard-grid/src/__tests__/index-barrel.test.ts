/**
 * AC-BARREL-1..5: index.ts public surface contains the documented exports
 * and no internal leaks.
 */
import { describe, expect, it } from "vitest";

import * as barrel from "../index.js";

describe("index barrel exports", () => {
  it("AC-BARREL-1: exports DashboardModule", () => {
    expect(barrel.DashboardModule).toBeDefined();
    expect(typeof barrel.DashboardModule).toBe("function");
  });

  it("AC-BARREL-2: exports default === DashboardModule", () => {
    expect(barrel.default).toBeDefined();
    expect(barrel.default).toBe(barrel.DashboardModule);
  });

  it("AC-BARREL-3: exports dashboardGridSlotRegistration", () => {
    expect(barrel.dashboardGridSlotRegistration).toBeDefined();
    expect(barrel.dashboardGridSlotRegistration.moduleId).toBe("dashboard");
  });

  it("AC-BARREL-4: type-only exports compile (smoke check via runtime access surface)", () => {
    // Types are erased at runtime; this just guards against accidental
    // value-side export removals by checking that no unexpected names leak.
    const expectedRuntimeNames = new Set([
      "DashboardModule",
      "default",
      "dashboardGridSlotRegistration",
    ]);
    for (const name of Object.keys(barrel)) {
      expect(expectedRuntimeNames.has(name)).toBe(true);
    }
  });

  it("AC-BARREL-5: index does not re-export internal/", () => {
    expect((barrel as Record<string, unknown>).useDashOrder).toBeUndefined();
    expect((barrel as Record<string, unknown>).sanitizeOrder).toBeUndefined();
    expect((barrel as Record<string, unknown>).useFlipReorder).toBeUndefined();
    expect((barrel as Record<string, unknown>).useGridDrag).toBeUndefined();
    expect((barrel as Record<string, unknown>).pickGreetingKey).toBeUndefined();
    expect((barrel as Record<string, unknown>).formatDashboardDate).toBeUndefined();
  });
});
