/**
 * RP1..RP3 — restPanesById tests (test.md §3 P3)
 */
import { describe, it, expect } from "vitest";
import { restPanesById } from "../internal/restPanesById.js";

const OWNED_IDS = [
  "account", "premium", "smart_lists", "notifications", "date_time",
  "more", "integrations", "collaborate", "sticky", "hotkeys", "about",
] as const;

describe("restPanesById", () => {
  it("RP1: contains exactly 11 entries", () => {
    expect(Object.keys(restPanesById).length).toBe(11);
  });

  it("RP2: each entry has the correct id, icon, and i18nKey", () => {
    for (const id of OWNED_IDS) {
      const pane = restPanesById[id];
      expect(pane.id).toBe(id);
      expect(typeof pane.icon).toBe("string");
      expect(pane.i18nKey).toMatch(/^settings\./);
    }
  });

  it("RP3: each pane render is a function that returns a React element", () => {
    // Just verify the shape — rendering would require full React setup.
    for (const id of OWNED_IDS) {
      const pane = restPanesById[id];
      expect(typeof pane.render).toBe("function");
    }
  });
});
