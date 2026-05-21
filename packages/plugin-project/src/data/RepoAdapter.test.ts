import { createInMemoryRepo } from "@repo/core-data/testing";
import { describe, expect, it } from "vitest";
import type { Project } from "../types";
import { RepoAdapter } from "./RepoAdapter";

const NOW = "2026-05-20T00:00:00.000Z";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    entityType: "project.project",
    schemaVersion: 1,
    syncScope: "account-sync",
    name: "Track D",
    lists: [{ id: "list-1", title: "Backlog", order: 0 }],
    labels: [],
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    ...overrides,
  };
}

describe("plugin-project RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<Project>({ namespace: "project-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, { entityType: "project.project" });

    await adapter.save(makeProject());

    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("proj-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<Project>({ namespace: "project-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, { entityType: "project.project" });

    await adapter.save(makeProject());

    expect((await adapter.getById("proj-1"))?.id).toBe("proj-1");
  });

  it("delete removes the record from getAll", async () => {
    const repo = createInMemoryRepo<Project>({ namespace: "project-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, { entityType: "project.project" });

    await adapter.save(makeProject());
    await adapter.delete("proj-1");

    expect(await adapter.getAll()).toEqual([]);
  });

  it("delete makes getById return null", async () => {
    const repo = createInMemoryRepo<Project>({ namespace: "project-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, { entityType: "project.project" });

    await adapter.save(makeProject());
    await adapter.delete("proj-1");

    expect(await adapter.getById("proj-1")).toBeNull();
  });

  it("seed runs once when repo is empty and never again", async () => {
    const repo = createInMemoryRepo<Project>({ namespace: "project-test", schemaVersion: 1 });
    const seed = [makeProject({ id: "seed-1" }), makeProject({ id: "seed-2", name: "Review" })];
    const adapter = new RepoAdapter(repo, { entityType: "project.project", seed });

    const first = await adapter.getAll();
    expect(first).toHaveLength(2);

    await adapter.delete("seed-1");

    const second = await adapter.getAll();
    expect(second).toHaveLength(1);
    expect(second.map((project) => project.id)).toEqual(["seed-2"]);
  });
});
