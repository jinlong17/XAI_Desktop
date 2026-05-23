import { describe, it, expect } from "vitest";
import { rangeWindow } from "../internal/rangeWindow.js";

const NOW_SAT = new Date("2026-05-23T10:30:00Z"); // Sat
const NOW_FEB = new Date("2026-02-15T12:00:00Z");

describe("rangeWindow — week", () => {
  it("W1: weekStart=0 EN labels Sun..Sat", () => {
    const w = rangeWindow("week", NOW_SAT, 0, "en");
    expect(w.labels).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    // The week containing Sat 2026-05-23 starts Sun 2026-05-17 UTC.
    expect(w.start.toISOString().startsWith("2026-05-17")).toBe(true);
    expect(w.end.getTime()).toBeGreaterThan(w.start.getTime());
  });

  it("W2: weekStart=1 EN labels Mon..Sun", () => {
    const w = rangeWindow("week", NOW_SAT, 1, "en");
    expect(w.labels).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(w.start.toISOString().startsWith("2026-05-18")).toBe(true);
  });

  it("W3: ZH labels", () => {
    const wSun = rangeWindow("week", NOW_SAT, 0, "zh");
    expect(wSun.labels).toEqual(["日", "一", "二", "三", "四", "五", "六"]);
    const wMon = rangeWindow("week", NOW_SAT, 1, "zh");
    expect(wMon.labels).toEqual(["一", "二", "三", "四", "五", "六", "日"]);
  });

  it("prior window is the same length, immediately preceding", () => {
    const w = rangeWindow("week", NOW_SAT, 0, "en");
    expect(w.end.getTime() - w.start.getTime()).toBe(
      w.priorEnd.getTime() - w.priorStart.getTime(),
    );
    expect(w.priorEnd.getTime()).toBeLessThan(w.start.getTime());
  });

  it("bucketBoundaries has 7 entries", () => {
    const w = rangeWindow("week", NOW_SAT, 0, "en");
    expect(w.bucketBoundaries).toHaveLength(7);
  });
});

describe("rangeWindow — month", () => {
  it("W4: 4 weekly buckets for May", () => {
    const w = rangeWindow("month", NOW_SAT, 0, "en");
    expect(w.labels).toEqual(["W1", "W2", "W3", "W4"]);
    expect(w.start.toISOString().startsWith("2026-05-01")).toBe(true);
  });

  it("W5: ZH labels", () => {
    const w = rangeWindow("month", NOW_SAT, 0, "zh");
    expect(w.labels).toEqual(["1 周", "2 周", "3 周", "4 周"]);
  });

  it("prior month is April", () => {
    const w = rangeWindow("month", NOW_SAT, 0, "en");
    expect(w.priorStart.toISOString().startsWith("2026-04-01")).toBe(true);
  });

  it("bucketBoundaries has 4 entries", () => {
    const w = rangeWindow("month", NOW_SAT, 0, "en");
    expect(w.bucketBoundaries).toHaveLength(4);
  });
});

describe("rangeWindow — all", () => {
  it("W6: 5 monthly buckets ending in May", () => {
    const w = rangeWindow("all", NOW_SAT, 0, "en");
    expect(w.labels).toEqual(["Jan", "Feb", "Mar", "Apr", "May"]);
  });

  it("W7: ZH month labels", () => {
    const w = rangeWindow("all", NOW_SAT, 0, "zh");
    expect(w.labels).toEqual(["1 月", "2 月", "3 月", "4 月", "5 月"]);
  });

  it("W8: near year boundary", () => {
    const w = rangeWindow("all", NOW_FEB, 0, "en");
    expect(w.labels).toEqual(["Oct", "Nov", "Dec", "Jan", "Feb"]);
  });

  it("W9-W12: bucketBoundaries length matches labels; start ≤ end; same-length prior", () => {
    const w = rangeWindow("all", NOW_SAT, 0, "en");
    expect(w.bucketBoundaries.length).toBe(w.labels.length);
    expect(w.start.getTime()).toBeLessThanOrEqual(w.end.getTime());
    expect(w.priorStart.getTime()).toBeLessThanOrEqual(w.priorEnd.getTime());
    // Approximate same-length within a few days because months differ in length.
    const cur = w.end.getTime() - w.start.getTime();
    const prior = w.priorEnd.getTime() - w.priorStart.getTime();
    expect(Math.abs(cur - prior)).toBeLessThan(86_400_000 * 10);
  });
});
