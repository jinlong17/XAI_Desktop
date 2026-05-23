import { describe, it, expect } from "vitest";
import * as Barrel from "../index.js";

/**
 * B1..B3 — public surface enumeration (P1 subset).
 *
 * The P1 surface is types + paneRegistry + resetAllPrefs only.
 * Component + registration exports land in P2 / P3.
 */
describe("index barrel — P1 surface", () => {
  it("B1: P1 named exports present (paneRegistry + resetAllPrefs)", () => {
    expect(Array.isArray(Barrel.paneRegistry)).toBe(true);
    expect(typeof Barrel.resetAllPrefs).toBe("function");
  });

  it("B2: paneRegistry length is 13", () => {
    expect(Barrel.paneRegistry).toHaveLength(13);
  });

  it("B3: internal helpers are not exposed", () => {
    const exposed = Object.keys(Barrel as Record<string, unknown>);
    expect(exposed).not.toContain("confirmAction");
    expect(exposed).not.toContain("RESET_DEFAULTS");
    expect(exposed).not.toContain("placeholderRender");
  });
});
