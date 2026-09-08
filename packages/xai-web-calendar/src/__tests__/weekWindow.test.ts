/**
 * Tests for internal/weekWindow.ts.
 * AC-WKWIN-1..8 per test.md §8.
 */
import { describe, it, expect } from "vitest";
import { weekWindowFor } from "../internal/weekWindow.js";

describe("weekWindowFor", () => {
  it("AC-WKWIN-1: Sun-first week containing 2026-05-22 (Fri)", () => {
    // May 22 2026 is a Friday. Sun-first week: May 17..May 23.
    const w = weekWindowFor("2026-05-22", 0);
    expect(w).toHaveLength(7);
    expect(w[0]).toBe("2026-05-17"); // Sunday
    expect(w[6]).toBe("2026-05-23"); // Saturday
    expect(w).toContain("2026-05-22"); // Friday is in window
  });

  it("AC-WKWIN-2: Mon-first week containing 2026-05-22 (Fri)", () => {
    // Mon-first week: May 18..May 24.
    const w = weekWindowFor("2026-05-22", 1);
    expect(w).toHaveLength(7);
    expect(w[0]).toBe("2026-05-18"); // Monday
    expect(w[6]).toBe("2026-05-24"); // Sunday
    expect(w).toContain("2026-05-22"); // Friday is in window
  });

  it("AC-WKWIN-3: month-rollover — Apr 29 in Sun-first week", () => {
    // Apr 29 2026 is a Wednesday. Sun-first week: Apr 26..May 2.
    const w = weekWindowFor("2026-04-29", 0);
    expect(w[0]).toBe("2026-04-26");
    expect(w[6]).toBe("2026-05-02");
    expect(w).toContain("2026-04-29");
  });

  it("AC-WKWIN-4: month-rollover — May 1 in Sun-first week", () => {
    // May 1 2026 is a Friday. Sun-first week: Apr 26..May 2.
    const w = weekWindowFor("2026-05-01", 0);
    expect(w[0]).toBe("2026-04-26");
    expect(w[6]).toBe("2026-05-02");
    expect(w).toContain("2026-05-01");
  });

  it("AC-WKWIN-5: year rollover — Dec 31 2026 in Sun-first week", () => {
    // Dec 31 2026 is a Thursday. Sun-first week: Dec 27..Jan 2.
    const w = weekWindowFor("2026-12-31", 0);
    expect(w[0]).toBe("2026-12-27");
    expect(w[6]).toBe("2027-01-02");
    expect(w).toContain("2026-12-31");
  });

  it("AC-WKWIN-6: year rollover backward — Jan 1 2026 in Mon-first week", () => {
    // Jan 1 2026 is a Thursday. Mon-first week: Dec 29 2025..Jan 4 2026.
    const w = weekWindowFor("2026-01-01", 1);
    expect(w[0]).toBe("2025-12-29");
    expect(w[6]).toBe("2026-01-04");
    expect(w).toContain("2026-01-01");
  });

  it("AC-WKWIN-7: returns exactly 7 unique keys in order", () => {
    const w = weekWindowFor("2026-05-22", 0);
    expect(w).toHaveLength(7);
    for (let i = 1; i < 7; i++) {
      const cur = w[i];
      const prev = w[i - 1];
      expect(cur !== undefined && prev !== undefined && cur > prev).toBe(true); // strict ascending
    }
  });

  it("AC-WKWIN-8: activeDate is always inside the returned window", () => {
    const dates = [
      "2026-01-01",
      "2026-03-08",
      "2026-05-22",
      "2026-11-01",
      "2026-12-31",
    ];
    for (const d of dates) {
      expect(weekWindowFor(d, 0)).toContain(d);
      expect(weekWindowFor(d, 1)).toContain(d);
    }
  });
});
