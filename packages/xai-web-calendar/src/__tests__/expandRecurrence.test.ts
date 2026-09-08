/**
 * expandRecurrence — AC-RECUR-8 + 11 supporting cases.
 *
 * Pure helper, no React tree.
 */

import { describe, it, expect } from "vitest";
import { expandRecurrence } from "../internal/eventStore/expandRecurrence.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";

function base(): UserCalEvent {
  return {
    id: "evt-1",
    title: "Test",
    startISO: "2026-05-22T09:00",
    endISO: "2026-05-22T10:00",
    colorPreset: "mint",
    recurrence: null,
    createdAt: "2026-05-22T00:00:00.000Z",
    updatedAt: "2026-05-22T00:00:00.000Z",
  };
}

describe("expandRecurrence — non-recurring", () => {
  it("returns [event] when anchor is in window", () => {
    const out = expandRecurrence(base(), "2026-05-20", "2026-05-25");
    expect(out).toHaveLength(1);
    expect(out[0]?.startISO).toBe("2026-05-22T09:00");
  });

  it("returns [] when anchor is before window", () => {
    const out = expandRecurrence(base(), "2026-06-01", "2026-06-30");
    expect(out).toHaveLength(0);
  });

  it("returns [] when anchor is after window", () => {
    const out = expandRecurrence(base(), "2026-04-01", "2026-04-30");
    expect(out).toHaveLength(0);
  });
});

describe("expandRecurrence — daily", () => {
  it("expands daily over 7-day window into 7 instances", () => {
    const event: UserCalEvent = { ...base(), recurrence: { kind: "daily" } };
    const out = expandRecurrence(event, "2026-05-22", "2026-05-28");
    expect(out).toHaveLength(7);
    expect(out.map((e) => e.startISO)).toEqual([
      "2026-05-22T09:00",
      "2026-05-23T09:00",
      "2026-05-24T09:00",
      "2026-05-25T09:00",
      "2026-05-26T09:00",
      "2026-05-27T09:00",
      "2026-05-28T09:00",
    ]);
  });

  it("anchor before window → first instance is the first window day", () => {
    const event: UserCalEvent = { ...base(), recurrence: { kind: "daily" } };
    const out = expandRecurrence(event, "2026-05-25", "2026-05-27");
    expect(out).toHaveLength(3);
    expect(out[0]?.startISO).toBe("2026-05-25T09:00");
  });
});

describe("expandRecurrence — weekly", () => {
  it("weekly over 30 days from a Friday anchor → ~4-5 Fridays", () => {
    const event: UserCalEvent = {
      ...base(),
      startISO: "2026-05-01T09:00", // May 1 2026 is a Friday
      endISO: "2026-05-01T10:00",
      recurrence: { kind: "weekly" },
    };
    const out = expandRecurrence(event, "2026-05-01", "2026-05-30");
    // May 1, 8, 15, 22, 29 = 5 Fridays
    expect(out.map((e) => e.startISO.slice(0, 10))).toEqual([
      "2026-05-01",
      "2026-05-08",
      "2026-05-15",
      "2026-05-22",
      "2026-05-29",
    ]);
  });

  it("weekly preserves time-of-day across instances", () => {
    const event: UserCalEvent = {
      ...base(),
      startISO: "2026-05-22T14:30",
      endISO: "2026-05-22T15:30",
      recurrence: { kind: "weekly" },
    };
    const out = expandRecurrence(event, "2026-05-22", "2026-06-12");
    expect(out.every((e) => e.startISO.endsWith("T14:30"))).toBe(true);
    expect(out.every((e) => e.endISO.endsWith("T15:30"))).toBe(true);
  });
});

describe("expandRecurrence — bounds & defenses", () => {
  it("AC-RECUR-8: daily over 2-year window respects maxInstances=366 cap", () => {
    const event: UserCalEvent = { ...base(), recurrence: { kind: "daily" } };
    const out = expandRecurrence(event, "2026-05-22", "2028-05-22");
    expect(out).toHaveLength(366);
  });

  it("custom maxInstances cap honored", () => {
    const event: UserCalEvent = { ...base(), recurrence: { kind: "daily" } };
    const out = expandRecurrence(event, "2026-05-22", "2026-12-31", 30);
    expect(out).toHaveLength(30);
  });

  it("malformed startISO → returns []", () => {
    const event = { ...base(), startISO: "not-iso" } as UserCalEvent;
    expect(expandRecurrence(event, "2026-05-22", "2026-05-28")).toHaveLength(0);
  });

  it("window end < window start → returns []", () => {
    expect(expandRecurrence(base(), "2026-05-30", "2026-05-22")).toHaveLength(0);
  });

  it("preserves event metadata (id, title, color, recurrence) on each instance", () => {
    const event: UserCalEvent = { ...base(), recurrence: { kind: "daily" } };
    const out = expandRecurrence(event, "2026-05-22", "2026-05-25");
    for (const inst of out) {
      expect(inst.id).toBe(event.id);
      expect(inst.title).toBe(event.title);
      expect(inst.colorPreset).toBe(event.colorPreset);
      expect(inst.recurrence).toEqual(event.recurrence);
    }
  });
});
