/**
 * mergeEventsForViewport — pure helpers Month + Window merge.
 * 10 cases.
 */

import { describe, it, expect } from "vitest";
import {
  mergeEventsForMonth,
  mergeEventsForWindow,
} from "../internal/eventStore/mergeEventsForViewport.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";
import type { CalEventsByDay } from "../internal/sampleEvents.js";

function userEvent(over: Partial<UserCalEvent> = {}): UserCalEvent {
  return {
    id: "u1",
    title: "User",
    startISO: "2026-05-22T11:00",
    endISO: "2026-05-22T12:00",
    colorPreset: "rose",
    recurrence: null,
    createdAt: "2026-05-22T00:00:00.000Z",
    updatedAt: "2026-05-22T00:00:00.000Z",
    ...over,
  };
}

const FIXTURE: CalEventsByDay = {
  3: [{ c: "mint", t: { en: "Family dinner", zh: "家庭聚餐" }, time: "19:00" }],
  22: [{ c: "mint", t: { en: "Brainstorming", zh: "头脑风暴" }, time: "11:30" }],
};

describe("mergeEventsForMonth — Month view", () => {
  it("preserves fixture rows with _source='fixture'", () => {
    const out = mergeEventsForMonth(FIXTURE, {}, 2026, 5);
    expect(out[3]).toHaveLength(1);
    expect(out[3]?.[0]?._source).toBe("fixture");
    expect(out[3]?.[0]?.t.en).toBe("Family dinner");
  });

  it("merges a user event onto the right day with _source='user'", () => {
    const userEvents = { u1: userEvent() };
    const out = mergeEventsForMonth(FIXTURE, userEvents, 2026, 5);
    expect(out[22]).toBeDefined();
    const userRow = out[22]?.find((e) => e._source === "user");
    expect(userRow?.t.en).toBe("User");
    expect(userRow?._userId).toBe("u1");
  });

  it("user event outside displayed month is filtered out", () => {
    const userEvents = { u1: userEvent({ startISO: "2026-06-15T11:00", endISO: "2026-06-15T12:00" }) };
    const out = mergeEventsForMonth(FIXTURE, userEvents, 2026, 5);
    const flat = Object.values(out).flat();
    expect(flat.find((e) => e._source === "user")).toBeUndefined();
  });

  it("daily-recurring user event materializes across the displayed month", () => {
    const userEvents = { u1: userEvent({ recurrence: { kind: "daily" } }) };
    const out = mergeEventsForMonth(FIXTURE, userEvents, 2026, 5);
    // Daily starting May 22 → May 22..31 = 10 instances
    let userCount = 0;
    for (const day of Object.values(out)) {
      userCount += day.filter((e) => e._source === "user").length;
    }
    expect(userCount).toBe(10);
  });

  it("sorts events in each day by start time (fixture first when no time)", () => {
    const userEvents = {
      a: userEvent({ id: "a", startISO: "2026-05-22T08:00", endISO: "2026-05-22T09:00", title: "Early" }),
    };
    const out = mergeEventsForMonth(FIXTURE, userEvents, 2026, 5);
    const day22 = out[22] ?? [];
    expect(day22[0]?.time).toBe("08:00");
    expect(day22[1]?.time).toBe("11:30");
  });
});

describe("mergeEventsForWindow — Week/Day views", () => {
  it("returns map keyed by 'YYYY-MM-DD' with fixture rows on matching month days", () => {
    const out = mergeEventsForWindow(FIXTURE, { year: 2026, month: 5 }, {}, "2026-05-22", "2026-05-22");
    expect(out["2026-05-22"]).toBeDefined();
    expect(out["2026-05-22"]?.[0]?.t.en).toBe("Brainstorming");
    expect(out["2026-05-22"]?.[0]?._source).toBe("fixture");
  });

  it("fixture skipped for window dates outside fixtureYearMonth", () => {
    const out = mergeEventsForWindow(FIXTURE, { year: 2026, month: 5 }, {}, "2026-06-01", "2026-06-03");
    expect(out["2026-06-01"]).toEqual([]);
    expect(out["2026-06-02"]).toEqual([]);
    expect(out["2026-06-03"]).toEqual([]);
  });

  it("merges user events under their full-date key", () => {
    const userEvents = { u1: userEvent() };
    const out = mergeEventsForWindow(FIXTURE, { year: 2026, month: 5 }, userEvents, "2026-05-22", "2026-05-22");
    const userRow = out["2026-05-22"]?.find((e) => e._source === "user");
    expect(userRow?.t.en).toBe("User");
  });

  it("expands daily recurrence inside window", () => {
    const userEvents = { u1: userEvent({ recurrence: { kind: "daily" } }) };
    const out = mergeEventsForWindow(FIXTURE, { year: 2026, month: 5 }, userEvents, "2026-05-22", "2026-05-24");
    const counts = [
      out["2026-05-22"]?.filter((e) => e._source === "user").length,
      out["2026-05-23"]?.filter((e) => e._source === "user").length,
      out["2026-05-24"]?.filter((e) => e._source === "user").length,
    ];
    expect(counts).toEqual([1, 1, 1]);
  });

  it("returns {} when window end < window start", () => {
    const out = mergeEventsForWindow(FIXTURE, { year: 2026, month: 5 }, {}, "2026-05-30", "2026-05-22");
    expect(Object.keys(out)).toHaveLength(0);
  });
});
