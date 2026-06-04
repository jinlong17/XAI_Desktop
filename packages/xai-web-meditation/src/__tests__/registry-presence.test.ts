/**
 * AC-REGISTRY-1: xai_meditation_prefs is present in PREF_REGISTRY with
 * the expected shape.
 */
import { describe, it, expect } from "vitest";
import { PREF_REGISTRY } from "@repo/plugin-web-storage";

describe("PREF_REGISTRY.xai_meditation_prefs", () => {
  it("AC-REGISTRY-1: exists", () => {
    expect(PREF_REGISTRY.xai_meditation_prefs).toBeDefined();
  });

  it("AC-REGISTRY-1: key === 'xai_meditation_prefs'", () => {
    expect(PREF_REGISTRY.xai_meditation_prefs.key).toBe("xai_meditation_prefs");
  });

  it("AC-REGISTRY-1: codec === 'json'", () => {
    expect(PREF_REGISTRY.xai_meditation_prefs.codec).toBe("json");
  });

  it("AC-REGISTRY-1: owner === 'xai-web-meditation'", () => {
    expect(PREF_REGISTRY.xai_meditation_prefs.owner).toBe("xai-web-meditation");
  });

  it("AC-REGISTRY-1: category === 'module'", () => {
    expect(PREF_REGISTRY.xai_meditation_prefs.category).toBe("module");
  });

  it("AC-REGISTRY-1: schemaVersion === 2", () => {
    expect(PREF_REGISTRY.xai_meditation_prefs.schemaVersion).toBe(2);
  });

  it("AC-REGISTRY-1: default has expected shape", () => {
    const def = PREF_REGISTRY.xai_meditation_prefs.default as Record<string, unknown>;
    expect(def).toMatchObject({
      schemaVersion: 2,
      scene: "ocean",
      clock: "split",
      sound: "water",
      volume: 0.55,
      duration: 15,
      durationMode: "preset",
      customDuration: 20,
      clockScale: "normal",
      customScenes: [],
    });
  });
});
