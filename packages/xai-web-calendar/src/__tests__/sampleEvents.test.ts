/**
 * Tests for internal/sampleEvents.ts — AC-FIXTURE-1..6, AC-EVENT-5.
 */
import { describe, it, expect } from "vitest";
import { SAMPLE_EVENTS } from "../internal/sampleEvents.js";

describe("SAMPLE_EVENTS fixture", () => {
  it("AC-FIXTURE-1: has exactly 31 day-of-month keys (1..31)", () => {
    const keys = Object.keys(SAMPLE_EVENTS).map(Number).sort((a, b) => a - b);
    expect(keys).toHaveLength(31);
    expect(keys[0]).toBe(1);
    expect(keys[30]).toBe(31);
  });

  it("AC-FIXTURE-2: day 14 + day 31 are empty arrays", () => {
    expect(SAMPLE_EVENTS[14]).toEqual([]);
    expect(SAMPLE_EVENTS[31]).toEqual([]);
  });

  it("AC-FIXTURE-3: total event count = 68 (byte parity with i18n.js)", () => {
    let total = 0;
    for (const day of Object.keys(SAMPLE_EVENTS)) {
      total += SAMPLE_EVENTS[Number(day)]?.length ?? 0;
    }
    expect(total).toBe(68);
  });

  it("AC-FIXTURE-4 / AC-EVENT-5: every event has c in {mint, amber, blue, violet}", () => {
    const allowed = new Set(["mint", "amber", "blue", "violet"]);
    for (const day of Object.keys(SAMPLE_EVENTS)) {
      const events = SAMPLE_EVENTS[Number(day)] ?? [];
      for (const e of events) {
        expect(allowed.has(e.c)).toBe(true);
      }
    }
  });

  it("AC-FIXTURE-5: every event has bilingual title", () => {
    for (const day of Object.keys(SAMPLE_EVENTS)) {
      const events = SAMPLE_EVENTS[Number(day)] ?? [];
      for (const e of events) {
        expect(typeof e.t.en).toBe("string");
        expect(typeof e.t.zh).toBe("string");
        expect(e.t.en.length).toBeGreaterThan(0);
        expect(e.t.zh.length).toBeGreaterThan(0);
      }
    }
  });

  it("AC-FIXTURE-6: day 7 yoga event has time: 19:00", () => {
    const day7 = SAMPLE_EVENTS[7] ?? [];
    const yoga = day7.find((e) => e.t.en === "Yoga class");
    expect(yoga?.time).toBe("19:00");
  });

  // --- Extension tests (gap-closure row #4) ------------------------------------

  it("AC-FIXTURE-EXT-1: exactly 5 events have endTime field", () => {
    let count = 0;
    for (const day of Object.keys(SAMPLE_EVENTS)) {
      const events = SAMPLE_EVENTS[Number(day)] ?? [];
      for (const e of events) {
        if ("endTime" in e && e.endTime !== undefined) count++;
      }
    }
    expect(count).toBe(5);
  });

  it("AC-FIXTURE-EXT-2: endTime is always > time (string compare)", () => {
    for (const day of Object.keys(SAMPLE_EVENTS)) {
      const events = SAMPLE_EVENTS[Number(day)] ?? [];
      for (const e of events) {
        if ("endTime" in e && e.endTime && e.time) {
          expect(e.endTime > e.time).toBe(true);
        }
      }
    }
  });

  it("AC-FIXTURE-EXT-3: endTime absent on all other events", () => {
    let withEndTime = 0;
    let withoutEndTime = 0;
    for (const day of Object.keys(SAMPLE_EVENTS)) {
      const events = SAMPLE_EVENTS[Number(day)] ?? [];
      for (const e of events) {
        if ("endTime" in e && e.endTime !== undefined) {
          withEndTime++;
        } else {
          withoutEndTime++;
        }
      }
    }
    expect(withEndTime).toBe(5);
    expect(withoutEndTime).toBe(63); // 68 total - 5 = 63
  });

  it("color distribution: mint > amber > blue/violet", () => {
    const counts: Record<string, number> = { mint: 0, amber: 0, blue: 0, violet: 0 };
    for (const day of Object.keys(SAMPLE_EVENTS)) {
      const events = SAMPLE_EVENTS[Number(day)] ?? [];
      for (const e of events) {
        counts[e.c] = (counts[e.c] ?? 0) + 1;
      }
    }
    expect(counts.mint).toBeGreaterThan(counts.amber as number);
    expect(counts.amber).toBeGreaterThan(counts.blue as number);
    // Violet is the rarest in May 2026 (only day 12 baseball)
    expect(counts.violet).toBeGreaterThanOrEqual(1);
  });
});
