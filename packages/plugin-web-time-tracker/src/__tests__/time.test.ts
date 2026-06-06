import { describe, expect, it } from "vitest";
import { createTimeTrackerEntry } from "../internal/storage.js";
import { dayKey, entryDuration, formatDuration, startOfWeek } from "../internal/time.js";

describe("time tracker time helpers", () => {
  it("formats durations with hour and minute precision", () => {
    expect(formatDuration(35 * 60_000)).toBe("35m");
    expect(formatDuration(95 * 60_000)).toBe("1h 35m");
  });

  it("sums segment durations including a live segment", () => {
    const entry = createTimeTrackerEntry("cat_work", null, 1000, null, { en: "", zh: "" });
    expect(entryDuration(entry, 61_000)).toBe(60_000);
  });

  it("uses local day and week keys", () => {
    const ts = new Date(2026, 4, 23, 10, 30).getTime();
    expect(dayKey(ts)).toBe("2026-05-23");
    expect(dayKey(startOfWeek(ts))).toBe("2026-05-18");
  });
});
