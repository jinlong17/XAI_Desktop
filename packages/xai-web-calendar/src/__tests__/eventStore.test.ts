/**
 * eventStore — pure CRUD over Record<string, UserCalEvent>.
 * AC-DELETE-4 + 13 supporting cases.
 */

import { describe, it, expect } from "vitest";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  listEvents,
} from "../internal/eventStore/eventStore.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";

function partial() {
  return {
    title: "Demo",
    startISO: "2026-05-22T09:00",
    endISO: "2026-05-22T10:00",
    colorPreset: "mint" as const,
    recurrence: null,
  };
}

describe("createEvent", () => {
  it("returns a fresh id + createdAt + updatedAt", () => {
    const { created } = createEvent({}, partial());
    expect(created.id).toMatch(/^.+$/);
    expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(created.updatedAt).toBe(created.createdAt);
  });

  it("preserves the partial fields on the new event", () => {
    const { created } = createEvent({}, partial());
    expect(created.title).toBe("Demo");
    expect(created.startISO).toBe("2026-05-22T09:00");
    expect(created.endISO).toBe("2026-05-22T10:00");
    expect(created.colorPreset).toBe("mint");
    expect(created.recurrence).toBeNull();
  });

  it("returns a new store snapshot (does NOT mutate input)", () => {
    const store: Record<string, UserCalEvent> = {};
    const { next } = createEvent(store, partial());
    expect(next).not.toBe(store);
    expect(Object.keys(store)).toHaveLength(0);
    expect(Object.keys(next)).toHaveLength(1);
  });

  it("two successive creates produce distinct ids", () => {
    const { created: a, next: store1 } = createEvent({}, partial());
    const { created: b } = createEvent(store1, partial());
    expect(a.id).not.toBe(b.id);
  });
});

describe("updateEvent", () => {
  it("returns the same store + null when id missing", () => {
    const store: Record<string, UserCalEvent> = {};
    const { next, updated } = updateEvent(store, "nope", { title: "X" });
    expect(next).toBe(store);
    expect(updated).toBeNull();
  });

  it("applies patch + bumps updatedAt", async () => {
    const { created, next: s1 } = createEvent({}, partial());
    // Wait 5ms so updatedAt actually advances.
    await new Promise((r) => setTimeout(r, 5));
    const { updated, next: s2 } = updateEvent(s1, created.id, { title: "Renamed" });
    expect(updated?.title).toBe("Renamed");
    expect(updated?.createdAt).toBe(created.createdAt);
    expect(updated?.updatedAt).not.toBe(created.updatedAt);
    expect(s2[created.id]?.title).toBe("Renamed");
  });

  it("preserves id + createdAt under patch", async () => {
    const { created, next: s1 } = createEvent({}, partial());
    await new Promise((r) => setTimeout(r, 5));
    const { updated } = updateEvent(s1, created.id, {
      title: "X",
      startISO: "2026-05-23T08:00",
      endISO: "2026-05-23T09:00",
    });
    expect(updated?.id).toBe(created.id);
    expect(updated?.createdAt).toBe(created.createdAt);
  });
});

describe("deleteEvent", () => {
  it("AC-DELETE-4: removes existing id; no-op for missing id", () => {
    const { created, next: s1 } = createEvent({}, partial());
    const s2 = deleteEvent(s1, created.id);
    expect(s2).not.toBe(s1);
    expect(Object.keys(s2)).toHaveLength(0);
    const s3 = deleteEvent(s2, "missing-id");
    expect(s3).toBe(s2); // same reference for no-op
  });

  it("does not mutate the input store", () => {
    const { created, next: s1 } = createEvent({}, partial());
    const snapshot = JSON.stringify(s1);
    deleteEvent(s1, created.id);
    expect(JSON.stringify(s1)).toBe(snapshot);
  });
});

describe("getEvent", () => {
  it("returns the event when present", () => {
    const { created, next } = createEvent({}, partial());
    expect(getEvent(next, created.id)).toEqual(created);
  });

  it("returns null when missing", () => {
    expect(getEvent({}, "missing")).toBeNull();
  });
});

describe("listEvents", () => {
  it("returns events sorted by createdAt ASC", async () => {
    const { created: a, next: s1 } = createEvent({}, { ...partial(), title: "A" });
    await new Promise((r) => setTimeout(r, 5));
    const { created: b, next: s2 } = createEvent(s1, { ...partial(), title: "B" });
    await new Promise((r) => setTimeout(r, 5));
    const { next: s3 } = createEvent(s2, { ...partial(), title: "C" });
    const list = listEvents(s3);
    expect(list.map((e) => e.title)).toEqual(["A", "B", "C"]);
    expect(list[0]?.id).toBe(a.id);
    expect(list[1]?.id).toBe(b.id);
  });

  it("breaks tie by id ASC when createdAt equal", () => {
    const base = {
      title: "tie",
      startISO: "2026-05-22T09:00",
      endISO: "2026-05-22T10:00",
      colorPreset: "mint" as const,
      recurrence: null,
      createdAt: "2026-05-22T00:00:00.000Z",
      updatedAt: "2026-05-22T00:00:00.000Z",
    };
    const store: Record<string, UserCalEvent> = {
      "z": { ...base, id: "z" },
      "a": { ...base, id: "a" },
      "m": { ...base, id: "m" },
    };
    const list = listEvents(store);
    expect(list.map((e) => e.id)).toEqual(["a", "m", "z"]);
  });
});
