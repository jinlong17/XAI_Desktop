import { describe, it, expect, vi } from "vitest";
import { confirmAction } from "../internal/confirmAction.js";

/**
 * C1..C2 — confirmAction thin wrapper.
 */
describe("confirmAction", () => {
  it("C1: returns true when window.confirm returns true", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    expect(confirmAction("proceed?")).toBe(true);
  });

  it("C2: returns false when window.confirm returns false", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    expect(confirmAction("proceed?")).toBe(false);
  });
});
