/**
 * index-barrel.test.ts — T-BAR-1
 *
 * Verifies the public surface exports the documented identifiers.
 * Intentionally runtime-only (no tsd) — type re-exports are already
 * covered by tsconfig noEmit in the typecheck script.
 *
 * Phase: P3
 */

import { describe, it, expect } from "vitest";
import * as api from "../index.js";

describe("@repo/plugin-web-tasks barrel (T-BAR-1)", () => {
  it("T-BAR-1: exports TasksModule as a function", () => {
    expect(typeof api.TasksModule).toBe("function");
  });

  it("T-BAR-1b: exports tasksWebModuleRegistration as a non-null object", () => {
    expect(api.tasksWebModuleRegistration).toBeTruthy();
    expect(typeof api.tasksWebModuleRegistration).toBe("object");
  });

  it("T-BAR-1c: does NOT export internal helpers (tree-shaking / contract boundary)", () => {
    // Internal modules must not appear on the public surface
    expect((api as Record<string, unknown>)["moveCard"]).toBeUndefined();
    expect((api as Record<string, unknown>)["dateForCol"]).toBeUndefined();
    expect((api as Record<string, unknown>)["isTaskColsArray"]).toBeUndefined();
    expect((api as Record<string, unknown>)["SEED_TASK_COLS"]).toBeUndefined();
  });
});
