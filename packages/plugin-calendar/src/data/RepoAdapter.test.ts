import { createInMemoryRepo } from "@repo/core-data/testing";
import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../types";
import { RepoAdapter } from "./RepoAdapter";

const NOW = "2026-05-20T00:00:00.000Z";

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "event-1",
    entityType: "calendar.event",
    schemaVersion: 1,
    syncScope: "account-sync",
    title: "Sprint planning",
    startsAt: NOW,
    endsAt: "2026-05-20T01:00:00.000Z",
    source: "manual",
    color: "#0f766e",
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    ...overrides,
  };
}

describe("plugin-calendar RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<CalendarEvent>({ namespace: "calendar-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeEvent());

    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("event-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<CalendarEvent>({ namespace: "calendar-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeEvent());

    expect((await adapter.getById("event-1"))?.id).toBe("event-1");
  });

  it("delete removes the record from getAll", async () => {
    const repo = createInMemoryRepo<CalendarEvent>({ namespace: "calendar-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeEvent());
    await adapter.delete("event-1");

    expect(await adapter.getAll()).toEqual([]);
  });

  it("delete makes getById return null", async () => {
    const repo = createInMemoryRepo<CalendarEvent>({ namespace: "calendar-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeEvent());
    await adapter.delete("event-1");

    expect(await adapter.getById("event-1")).toBeNull();
  });

  it("seed runs once when repo is empty and never again", async () => {
    const repo = createInMemoryRepo<CalendarEvent>({ namespace: "calendar-test", schemaVersion: 1 });
    const seed = [makeEvent({ id: "seed-1" }), makeEvent({ id: "seed-2", title: "Review" })];
    const adapter = new RepoAdapter(repo, seed);

    const first = await adapter.getAll();
    expect(first).toHaveLength(2);

    await adapter.delete("seed-1");

    const second = await adapter.getAll();
    expect(second).toHaveLength(1);
    expect(second.map((event) => event.id)).toEqual(["seed-2"]);
  });
});
