/**
 * AC-CITYLIB-1..2 + helper round-trips.
 */
import { describe, it, expect } from "vitest";

import { CITY_LIBRARY, findCity, cityLabel } from "../internal/cityLibrary.js";

describe("AC-CITYLIB-1: 12 entries with prototype ids", () => {
  it("library has 12 entries", () => {
    expect(CITY_LIBRARY).toHaveLength(12);
  });

  it("ids match design.md §1.1 #8 verbatim", () => {
    expect(CITY_LIBRARY.map((c) => c.id)).toEqual([
      "shanghai",
      "london",
      "new_york",
      "tokyo",
      "sf",
      "paris",
      "sydney",
      "berlin",
      "dubai",
      "singapore",
      "hk",
      "la",
    ]);
  });
});

describe("AC-CITYLIB-2: bilingual city + tz", () => {
  it("each entry has en+zh city + numeric tz", () => {
    for (const c of CITY_LIBRARY) {
      expect(typeof c.city.en).toBe("string");
      expect(typeof c.city.zh).toBe("string");
      expect(c.city.en.length).toBeGreaterThan(0);
      expect(c.city.zh.length).toBeGreaterThan(0);
      expect(typeof c.tz).toBe("number");
      expect(Number.isInteger(c.tz)).toBe(true);
    }
  });
});

describe("findCity + cityLabel helpers", () => {
  it("findCity returns matching entry by id", () => {
    expect(findCity("shanghai")?.tz).toBe(8);
    expect(findCity("la")?.tz).toBe(-7);
  });

  it("findCity returns undefined for unknown id", () => {
    expect(findCity("unknown")).toBeUndefined();
    expect(findCity("local")).toBeUndefined();
  });

  it("cityLabel returns the active-lang city name", () => {
    const sh = findCity("shanghai")!;
    expect(cityLabel(sh, "en")).toBe("Shanghai");
    expect(cityLabel(sh, "zh")).toBe("上海");
  });
});
