import { createInMemoryRepo } from "@repo/core-data/testing";
import { describe, expect, it } from "vitest";
import type { ConsoleNotification } from "../types";
import { RepoAdapter } from "./RepoAdapter";

const NOW = "2026-05-20T00:00:00.000Z";

function makeNotification(overrides: Partial<ConsoleNotification> = {}): ConsoleNotification {
  return {
    id: "note-1",
    entityType: "console.notification",
    schemaVersion: 1,
    syncScope: "account-sync",
    type: "info",
    title: "Focus",
    body: "Repo tests queued",
    read: false,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    sourcePlugin: "plugin-console",
    ...overrides,
  };
}

describe("plugin-console RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<ConsoleNotification>({ namespace: "console-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeNotification());

    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("note-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<ConsoleNotification>({ namespace: "console-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeNotification());

    expect((await adapter.getById("note-1"))?.id).toBe("note-1");
  });

  it("delete removes the record from getAll", async () => {
    const repo = createInMemoryRepo<ConsoleNotification>({ namespace: "console-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeNotification());
    await adapter.delete("note-1");

    expect(await adapter.getAll()).toEqual([]);
  });

  it("delete makes getById return null", async () => {
    const repo = createInMemoryRepo<ConsoleNotification>({ namespace: "console-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeNotification());
    await adapter.delete("note-1");

    expect(await adapter.getById("note-1")).toBeNull();
  });

  it("seed runs once when repo is empty and never again", async () => {
    const repo = createInMemoryRepo<ConsoleNotification>({ namespace: "console-test", schemaVersion: 1 });
    const seed = [
      makeNotification({ id: "seed-1" }),
      makeNotification({ id: "seed-2", title: "Review" }),
    ];
    const adapter = new RepoAdapter(repo, seed);

    const first = await adapter.getAll();
    expect(first).toHaveLength(2);

    await adapter.delete("seed-1");

    const second = await adapter.getAll();
    expect(second).toHaveLength(1);
    expect(second.map((notification) => notification.id)).toEqual(["seed-2"]);
  });
});
