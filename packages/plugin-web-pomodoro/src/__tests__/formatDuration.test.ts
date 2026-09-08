/**
 * FD1..FD5 — formatDuration tests.
 * test.md §2
 */

import { describe, it, expect } from "vitest";
import { formatDuration } from "../internal/formatDuration.js";

describe("formatDuration", () => {
  // FD1: 25 minutes → "25:00"
  it("FD1: 25*60_000 ms → '25:00'", () => {
    expect(formatDuration(25 * 60 * 1000)).toBe("25:00");
  });

  // FD2: 12:34 formatted correctly
  it("FD2: 12m 34s → '12:34'", () => {
    expect(formatDuration(12 * 60_000 + 34_000)).toBe("12:34");
  });

  // FD3: 0 ms → "0:00"
  it("FD3: 0 ms → '0:00'", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  // FD4: sub-second flooring (12_500 ms → "0:12")
  it("FD4: 12500 ms → '0:12'", () => {
    expect(formatDuration(12_500)).toBe("0:12");
  });

  // FD5: over-hour values (3700_000 ms → "61:40")
  it("FD5: 3700_000 ms → '61:40'", () => {
    expect(formatDuration(3_700_000)).toBe("61:40");
  });
});
