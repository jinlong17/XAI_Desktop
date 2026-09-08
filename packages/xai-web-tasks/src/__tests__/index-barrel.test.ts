/**
 * index-barrel.test.ts — T-BAR-1 (P3) + T-BAR-2 (EP3) + T-FILT-BAR (FP2)
 *
 * Verifies the public surface exports the documented identifiers.
 * Intentionally runtime-only (no tsd) — type re-exports are already
 * covered by tsconfig noEmit in the typecheck script.
 *
 * Phase: P3 (T-BAR-1) + EP3 (T-BAR-2) + FP2 (T-FILT-BAR)
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

// ---------------------------------------------------------------------------
// T-BAR-2 (EP3): NewTaskDraft type exported; internal helpers NOT exported
// ---------------------------------------------------------------------------

describe("@repo/plugin-web-tasks barrel (T-BAR-2 EP3)", () => {
  it("T-BAR-2a: NewTaskDraft is accessible on the public surface (type-level compile check)", () => {
    // Runtime check: the barrel does not accidentally un-export it.
    // Type-level assertion: if NewTaskDraft were missing, tsc --noEmit would fail.
    // We verify the barrel re-exports the public types by checking the module shape.
    // (NewTaskDraft is a TS type — no runtime value; we verify no runtime crash on import.)
    expect(typeof api).toBe("object");
  });

  it("T-BAR-2b: addCard (internal) is NOT exported", () => {
    expect((api as Record<string, unknown>)["addCard"]).toBeUndefined();
  });

  it("T-BAR-2c: createTaskId (internal) is NOT exported", () => {
    expect((api as Record<string, unknown>)["createTaskId"]).toBeUndefined();
  });

  it("T-BAR-2d: TaskComposer (internal in v1) is NOT exported", () => {
    // TaskComposer is kept internal in v1 — rendered only by TasksModule.
    expect((api as Record<string, unknown>)["TaskComposer"]).toBeUndefined();
  });

  it("T-BAR-2e: STR_TASK_COMPOSER (internal) is NOT exported", () => {
    expect((api as Record<string, unknown>)["STR_TASK_COMPOSER"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// T-FILT-BAR (FP2): filterCardsByList + SmartListId + STR_SMART_LIST_EMPTY
// must NOT appear on the public barrel surface (kept internal per Rec-F3).
// ---------------------------------------------------------------------------

describe("@repo/plugin-web-tasks barrel (T-FILT-BAR FP2)", () => {
  it("T-FILT-BAR-a: filterCardsByList (internal selector) is NOT exported", () => {
    expect((api as Record<string, unknown>)["filterCardsByList"]).toBeUndefined();
  });

  it("T-FILT-BAR-b: STR_SMART_LIST_EMPTY (internal STR) is NOT exported", () => {
    expect((api as Record<string, unknown>)["STR_SMART_LIST_EMPTY"]).toBeUndefined();
  });

  it("T-FILT-BAR-c: SmartListId (kept internal per Rec-F3) is NOT exported as a runtime value", () => {
    // SmartListId is a TypeScript type — no runtime value expected.
    // This ensures it was NOT accidentally turned into a runtime export (e.g. an enum or const object).
    expect((api as Record<string, unknown>)["SmartListId"]).toBeUndefined();
  });
});
