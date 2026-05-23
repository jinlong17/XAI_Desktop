/**
 * AC-BARREL-1: src/index.ts exports the expected public surface.
 * AC-BARREL-2: src/index.ts does not re-export anything from src/internal/.
 */
import { describe, it, expect } from "vitest";
import * as barrel from "../index.js";

describe("public surface (index.ts)", () => {
  it("AC-BARREL-1: exports MeditationModule (named + default)", () => {
    expect(barrel.MeditationModule).toBeDefined();
    expect(typeof barrel.MeditationModule).toBe("function");
    expect(barrel.default).toBe(barrel.MeditationModule);
  });

  it("AC-BARREL-1: exports meditationSlotRegistration", () => {
    expect(barrel.meditationSlotRegistration).toBeDefined();
    expect(barrel.meditationSlotRegistration.moduleId).toBe("meditation");
  });

  it("AC-BARREL-1: exports MEDITATION_STORAGE_KEY", () => {
    expect(barrel.MEDITATION_STORAGE_KEY).toBe("xai_meditation_prefs");
  });

  it("AC-BARREL-2: does not expose internal helpers", () => {
    const keys = Object.keys(barrel);
    expect(keys).not.toContain("validatePrefs");
    expect(keys).not.toContain("useMeditationPrefs");
    expect(keys).not.toContain("getScene");
    expect(keys).not.toContain("formatRemaining");
    expect(keys).not.toContain("computeAnalogAngles");
    expect(keys).not.toContain("SCENES");
    expect(keys).not.toContain("PARTICLE_COUNT");
    expect(keys).not.toContain("Icon");
  });
});
