/**
 * N1..N6 — nextMode pure function tests.
 * test.md §2
 */

import { describe, it, expect } from "vitest";
import { nextMode } from "../internal/nextMode.js";

describe("nextMode", () => {
  // N1: focus + count 1..3 → short-break
  it("N1: focus + count 1 → short-break", () => {
    expect(nextMode("focus", 1)).toBe("short-break");
  });
  it("N1b: focus + count 2 → short-break", () => {
    expect(nextMode("focus", 2)).toBe("short-break");
  });
  it("N1c: focus + count 3 → short-break", () => {
    expect(nextMode("focus", 3)).toBe("short-break");
  });

  // N2: focus + count 4 → long-break
  it("N2: focus + count 4 → long-break", () => {
    expect(nextMode("focus", 4)).toBe("long-break");
  });

  // N3: focus + count 5..7 → short-break
  it("N3: focus + count 5 → short-break", () => {
    expect(nextMode("focus", 5)).toBe("short-break");
  });
  it("N3b: focus + count 7 → short-break", () => {
    expect(nextMode("focus", 7)).toBe("short-break");
  });

  // N4: focus + count 8 → long-break
  it("N4: focus + count 8 → long-break", () => {
    expect(nextMode("focus", 8)).toBe("long-break");
  });

  // N5: non-focus (any count) → focus
  it("N5: short-break → focus", () => {
    expect(nextMode("short-break", 0)).toBe("focus");
    expect(nextMode("short-break", 3)).toBe("focus");
  });
  it("N5b: long-break → focus", () => {
    expect(nextMode("long-break", 0)).toBe("focus");
    expect(nextMode("long-break", 4)).toBe("focus");
  });

  // N6: edge — count === 0
  it("N6: focus + count 0 → long-break (0 % 4 === 0)", () => {
    expect(nextMode("focus", 0)).toBe("long-break");
  });
});
