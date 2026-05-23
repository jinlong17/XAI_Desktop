/**
 * AC-BARREL-1: All expected names re-exported from index.ts.
 */
import { describe, it, expect } from "vitest";
import * as barrel from "../index.js";

describe("index barrel exports", () => {
  it("AC-BARREL-1: exports HabitsModule, default, habitsSlotRegistration, HABITS_STORAGE_KEY", () => {
    expect(barrel.HabitsModule).toBeDefined();
    expect(barrel.default).toBeDefined();
    expect(barrel.habitsSlotRegistration).toBeDefined();
    expect(barrel.HABITS_STORAGE_KEY).toBe("xai_habits_state");
  });

  it("AC-BARREL-1: default === HabitsModule", () => {
    expect(barrel.default).toBe(barrel.HabitsModule);
  });
});
