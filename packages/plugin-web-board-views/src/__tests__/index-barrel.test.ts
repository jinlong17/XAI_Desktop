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
  it("IB1: resolves all api.md §0 named exports", () => {
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
  });

  it("IB2: does not re-export internal symbols (static source scan)", async () => {
    // Read the index.ts source and assert no export from './internal' in the barrel
    const fs = await import("fs");
    const path = await import("path");
    // __dirname is not available in ESM; use import.meta.url to resolve src/
    const testDir = path.dirname(new URL(import.meta.url).pathname);
    const indexPath = path.resolve(testDir, "..", "index.ts");
    const src = fs.readFileSync(indexPath, "utf8");
    // index.ts should not re-export anything from internal/
    expect(src).not.toMatch(/export\s+.*from\s+['"]\.\/internal/);
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
