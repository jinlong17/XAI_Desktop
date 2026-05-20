import { createInMemoryRepo } from "@repo/core-data/testing";
import { describe, expect, it } from "vitest";
import type { Label } from "../types";
import { RepoAdapter } from "./RepoAdapter";

const NOW = "2026-05-20T00:00:00.000Z";

function makeLabel(overrides: Partial<Label> = {}): Label {
  return {
    id: "lab-1",
    entityType: "labels.label",
    schemaVersion: 1,
    syncScope: "account-sync",
    name: "Focus",
    color: "#2563eb",
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    ...overrides,
  };
}

describe("plugin-labels RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<Label>({ namespace: "labels-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeLabel());

    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("lab-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<Label>({ namespace: "labels-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeLabel());

    expect((await adapter.getById("lab-1"))?.id).toBe("lab-1");
  });

  it("delete removes the record from getAll", async () => {
    const repo = createInMemoryRepo<Label>({ namespace: "labels-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeLabel());
    await adapter.delete("lab-1");

    expect(await adapter.getAll()).toEqual([]);
  });

  it("delete makes getById return null", async () => {
    const repo = createInMemoryRepo<Label>({ namespace: "labels-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo);

    await adapter.save(makeLabel());
    await adapter.delete("lab-1");

    expect(await adapter.getById("lab-1")).toBeNull();
  });

  it("seed runs once when repo is empty and never again", async () => {
    const repo = createInMemoryRepo<Label>({ namespace: "labels-test", schemaVersion: 1 });
    const seed = [makeLabel({ id: "seed-1" }), makeLabel({ id: "seed-2", name: "Waiting" })];
    const adapter = new RepoAdapter(repo, { seed });

    const first = await adapter.getAll();
    expect(first).toHaveLength(2);

    await adapter.delete("seed-1");

    const second = await adapter.getAll();
    expect(second).toHaveLength(1);
    expect(second.map((label) => label.id)).toEqual(["seed-2"]);
  });
});
