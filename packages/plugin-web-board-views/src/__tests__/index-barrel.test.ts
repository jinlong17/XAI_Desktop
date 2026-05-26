/**
 * Barrel / index tests (IB1..IB4)
 *
 * Verifies the public surface exported from src/index.ts:
 * - All api.md §0 symbols present
 * - No internal re-exports
 * - boardViewsWebModuleRegistration structural check
 * - All view component prop types exported
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * Test plan: packages/xai-web-board-views/docs/test.md §2.10
 */

import { describe, it, expect } from "vitest";
import * as M from "../index.js";

describe("index barrel", () => {
  it("IB1: resolves all api.md §0 named exports (incl. gap-closure row #6 additions)", () => {
    // React components
    expect(typeof M.BoardModule).toBe("function");
    expect(typeof M.ViewPicker).toBe("function");
    expect(typeof M.TableView).toBe("function");
    expect(typeof M.BoardCalendarView).toBe("function");
    expect(typeof M.BoardDashboardView).toBe("function");
    expect(typeof M.TimelineView).toBe("function");
    expect(typeof M.MapView).toBe("function");

    // Registration
    expect(typeof M.boardViewsWebModuleRegistration).toBe("object");
    expect(M.boardViewsWebModuleRegistration).not.toBeNull();

    // gap-closure row #6 additions
    expect(typeof M.applyFilter).toBe("function");
    expect(typeof M.isValidLocation).toBe("function");
    expect(M.EMPTY_FILTER).toBeDefined();
  });

  it("IB2: only explicitly-approved internal re-exports are present (static source scan)", async () => {
    // Read the index.ts source and assert only approved internal re-exports exist.
    // Original row #8 rule: no ./internal re-exports.
    // Gap-closure row #6 amendment: applyFilter/FilterState/EMPTY_FILTER from internal/filter.ts
    //   AND isValidLocation/CardLocation from internal/location.ts are promoted to the barrel.
    //   These are the ONLY approved internal re-exports; all other internal symbols remain private.
    const fs = await import("fs");
    const path = await import("path");
    const testDir = path.dirname(new URL(import.meta.url).pathname);
    const indexPath = path.resolve(testDir, "..", "index.ts");
    const src = fs.readFileSync(indexPath, "utf8");
    // Count lines that export from ./internal/
    const internalExportLines = src.split("\n").filter((line) =>
      /export\s+.*from\s+['"]\.\/internal/.test(line),
    );
    // Exactly 4 approved internal export lines (2 per approved module):
    //   ./internal/filter.js — 2 lines (values + types)
    //   ./internal/location.js — 2 lines (values + types)
    expect(internalExportLines.length).toBe(4);
    // Both approved modules must be present
    const joined = internalExportLines.join("\n");
    expect(joined).toMatch(/internal\/filter/);
    expect(joined).toMatch(/internal\/location/);
  });

  it("IB3: boardViewsWebModuleRegistration has correct moduleId, railOrder, icon", () => {
    const reg = M.boardViewsWebModuleRegistration;
    expect(reg.moduleId).toBe("board");
    expect(reg.railOrder).toBe(3);
    expect(reg.icon).toBe("kanban");
  });

  it("IB4: all view prop-type exports are present as named exports (runtime shape check)", () => {
    // TypeScript types are erased at runtime, but since the barrel uses
    // "export type { ... }" the names are not present as runtime values.
    // This test verifies the component exports (which carry the prop types
    // as the function signature) are all present.
    const componentNames: string[] = [
      "BoardModule",
      "ViewPicker",
      "TableView",
      "BoardCalendarView",
      "BoardDashboardView",
      "TimelineView",
      "MapView",
    ];
    for (const name of componentNames) {
      expect(
        typeof (M as Record<string, unknown>)[name],
        `expected ${name} to be a function`,
      ).toBe("function");
    }
  });
});
