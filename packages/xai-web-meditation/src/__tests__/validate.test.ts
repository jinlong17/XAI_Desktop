/**
 * AC-PERSIST-4..6 — validatePrefs clamps unknown / corrupted blobs.
 */
import { describe, it, expect } from "vitest";
import { validatePrefs } from "../internal/validate.js";
import { DEFAULT_PREFS } from "../constants.js";

describe("validatePrefs", () => {
  it("returns DEFAULT_PREFS for null", () => {
    expect(validatePrefs(null)).toEqual(DEFAULT_PREFS);
  });

  it("returns DEFAULT_PREFS for undefined", () => {
    expect(validatePrefs(undefined)).toEqual(DEFAULT_PREFS);
  });

  it("returns DEFAULT_PREFS for non-object", () => {
    expect(validatePrefs("garbage")).toEqual(DEFAULT_PREFS);
    expect(validatePrefs(42)).toEqual(DEFAULT_PREFS);
  });

  it("AC-PERSIST-5: unknown scene clamps to ocean; preserves valid fields", () => {
    const result = validatePrefs({
      schemaVersion: 1,
      scene: "mars",
      clock: "analog",
      sound: "rain",
      duration: 25,
    });
    expect(result.scene).toBe("ocean");
    expect(result.clock).toBe("analog");
    expect(result.sound).toBe("rain");
    expect(result.duration).toBe(25);
  });

  it("AC-PERSIST-6: unknown schemaVersion still loads and migrates to schema v2", () => {
    const result = validatePrefs({
      schemaVersion: 999,
      scene: "forest",
      clock: "digital",
      sound: "waves",
      duration: 10,
    });
    expect(result.schemaVersion).toBe(2);
    expect(result.scene).toBe("forest");
    expect(result.durationMode).toBe("preset");
    expect(result.customScenes).toEqual([]);
  });

  it("clamps unknown clock to split", () => {
    expect(validatePrefs({ clock: "weird" }).clock).toBe(DEFAULT_PREFS.clock);
  });

  it("clamps unknown sound to water", () => {
    expect(validatePrefs({ sound: "drums" }).sound).toBe(DEFAULT_PREFS.sound);
  });

  it("clamps unknown duration to 15", () => {
    expect(validatePrefs({ duration: 999 }).duration).toBe(DEFAULT_PREFS.duration);
  });

  it("does not mutate input", () => {
    const raw = { scene: "mars" };
    validatePrefs(raw);
    expect(raw).toEqual({ scene: "mars" });
  });

  it("preserves all valid schema v2 prefs unchanged", () => {
    const input = {
      schemaVersion: 2,
      scene: "night" as const,
      clock: "minimal" as const,
      sound: "forest" as const,
      volume: 0.4,
      duration: 45 as const,
      durationMode: "custom" as const,
      customDuration: 33,
      clockScale: "large" as const,
      clockColors: DEFAULT_PREFS.clockColors,
      customScenes: [],
    };
    expect(validatePrefs(input)).toEqual(input);
  });

  it("keeps a valid custom scene and selected custom id", () => {
    const result = validatePrefs({
      ...DEFAULT_PREFS,
      scene: "custom:calm01",
      customScenes: [
        {
          id: "custom:calm01",
          name: "Calm room",
          background: "#101820",
          gradientFrom: "#406070",
          gradientTo: "#101820",
          animation: "aurora",
          sound: "whiteNoise",
          clock: "analog",
          clockScale: "larger",
          clockColors: DEFAULT_PREFS.clockColors,
          durationMode: "infinite",
          duration: 25,
          customDuration: 44,
        },
      ],
    });
    expect(result.scene).toBe("custom:calm01");
    expect(result.customScenes).toHaveLength(1);
    expect(result.customScenes[0]?.sound).toBe("whiteNoise");
  });
});
