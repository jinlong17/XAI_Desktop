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

  it("AC-PERSIST-6: unknown schemaVersion still loads (v1 ignores schema mismatch and clamps)", () => {
    const result = validatePrefs({
      schemaVersion: 999,
      scene: "forest",
      clock: "digital",
      sound: "waves",
      duration: 10,
    });
    expect(result.schemaVersion).toBe(1);
    expect(result.scene).toBe("forest");
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

  it("preserves all valid prefs unchanged", () => {
    const input = {
      schemaVersion: 1,
      scene: "night" as const,
      clock: "minimal" as const,
      sound: "forest" as const,
      duration: 45 as const,
    };
    expect(validatePrefs(input)).toEqual(input);
  });
});
