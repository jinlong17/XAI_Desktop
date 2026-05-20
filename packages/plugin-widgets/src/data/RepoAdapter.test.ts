import { createInMemoryRepo } from "@repo/core-data/testing";
import { describe, expect, it } from "vitest";
import type { WidgetEntity } from "../types";
import { RepoAdapter } from "./RepoAdapter";

const NOW = "2026-05-20T00:00:00.000Z";

function makeWidget(overrides: Partial<WidgetEntity> = {}): WidgetEntity {
  return {
    id: "widget-1",
    entityType: "widgets.widget",
    schemaVersion: 1,
    syncScope: "device-local",
    type: "calendar",
    position: { x: 1, y: 2 },
    size: { width: 4, height: 3 },
    config: { density: "comfortable" },
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    ...overrides,
  };
}

describe("plugin-widgets RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<WidgetEntity>({ namespace: "widgets-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeWidget());

    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("widget-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<WidgetEntity>({ namespace: "widgets-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeWidget());

    expect((await adapter.getById("widget-1"))?.id).toBe("widget-1");
  });

  it("delete removes the record from getAll", async () => {
    const repo = createInMemoryRepo<WidgetEntity>({ namespace: "widgets-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeWidget());
    await adapter.delete("widget-1");

    expect(await adapter.getAll()).toEqual([]);
  });

  it("delete makes getById return null", async () => {
    const repo = createInMemoryRepo<WidgetEntity>({ namespace: "widgets-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeWidget());
    await adapter.delete("widget-1");

    expect(await adapter.getById("widget-1")).toBeNull();
  });

  it("seed runs once when repo is empty and never again", async () => {
    const repo = createInMemoryRepo<WidgetEntity>({ namespace: "widgets-test", schemaVersion: 1 });
    const seed = [makeWidget({ id: "seed-1" }), makeWidget({ id: "seed-2", type: "weather" })];
    const adapter = new RepoAdapter(repo, seed);

    const first = await adapter.getAll();
    expect(first).toHaveLength(2);

    await adapter.delete("seed-1");

    const second = await adapter.getAll();
    expect(second).toHaveLength(1);
    expect(second.map((widget) => widget.id)).toEqual(["seed-2"]);
  });
});
