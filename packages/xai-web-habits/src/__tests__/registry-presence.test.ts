/**
 * AC-REGISTRY-1..2: PREF_REGISTRY entry for xai_habits_state.
 */
import { describe, it, expect } from "vitest";
import { PREF_REGISTRY } from "@repo/plugin-web-storage";
import { HABITS_STORAGE_KEY } from "../constants.js";

describe("PREF_REGISTRY presence", () => {
  it("AC-REGISTRY-1: xai_habits_state key exists in PREF_REGISTRY", () => {
    expect(HABITS_STORAGE_KEY in PREF_REGISTRY).toBe(true);
  });

  it("AC-REGISTRY-1: entry has expected metadata", () => {
    const entry = PREF_REGISTRY[HABITS_STORAGE_KEY];
    expect(entry.owner).toBe("xai-web-habits");
    expect(entry.category).toBe("module");
    expect(entry.codec).toBe("json");
    expect(entry.schemaVersion).toBe(1);
  });

  it("AC-REGISTRY-2: default value has HabitsState shape", () => {
    const entry = PREF_REGISTRY[HABITS_STORAGE_KEY];
    const def = entry.default as Record<string, unknown>;
    expect(def["schemaVersion"]).toBe(1);
    expect(Array.isArray(def["habits"])).toBe(true);
    expect(typeof def["checkIns"]).toBe("object");
    expect(typeof def["diaries"]).toBe("object");
  });
});
