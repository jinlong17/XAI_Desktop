import { createInMemoryRepo } from "@repo/core-data/testing";
import { describe, expect, it } from "vitest";
import type { Todo } from "../types";
import { RepoAdapter } from "./RepoAdapter";

const NOW = "2026-05-20T00:00:00.000Z";

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "todo-1",
    entityType: "productivity.todo",
    schemaVersion: 1,
    syncScope: "account-sync",
    title: "Ship Track D",
    description: "Add RepoAdapter tests",
    status: "open",
    priority: "high",
    quadrant: "do",
    labels: [],
    pomodoroCount: 0,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
    ...overrides,
  };
}

describe("plugin-productivity RepoAdapter", () => {
  it("save then getAll returns the record", async () => {
    const repo = createInMemoryRepo<Todo>({ namespace: "productivity-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, { entityType: "productivity.todo", orderBy: "updatedAt" });

    await adapter.save(makeTodo());

    const all = await adapter.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("todo-1");
  });

  it("getById returns the saved record", async () => {
    const repo = createInMemoryRepo<Todo>({ namespace: "productivity-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, { entityType: "productivity.todo", orderBy: "updatedAt" });

    await adapter.save(makeTodo());

    expect((await adapter.getById("todo-1"))?.id).toBe("todo-1");
  });

  it("delete removes the record from getAll", async () => {
    const repo = createInMemoryRepo<Todo>({ namespace: "productivity-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, { entityType: "productivity.todo", orderBy: "updatedAt" });

    await adapter.save(makeTodo());
    await adapter.delete("todo-1");

    expect(await adapter.getAll()).toEqual([]);
  });

  it("delete makes getById return null", async () => {
    const repo = createInMemoryRepo<Todo>({ namespace: "productivity-test", schemaVersion: 1 });
    const adapter = new RepoAdapter(repo, { entityType: "productivity.todo", orderBy: "updatedAt" });

    await adapter.save(makeTodo());
    await adapter.delete("todo-1");

    expect(await adapter.getById("todo-1")).toBeNull();
  });

  it("seed runs once when repo is empty and never again", async () => {
    const repo = createInMemoryRepo<Todo>({ namespace: "productivity-test", schemaVersion: 1 });
    const seed = [makeTodo({ id: "seed-1" }), makeTodo({ id: "seed-2", title: "Review" })];
    const adapter = new RepoAdapter(repo, {
      entityType: "productivity.todo",
      orderBy: "updatedAt",
      seed,
    });

    const first = await adapter.getAll();
    expect(first).toHaveLength(2);

    await adapter.delete("seed-1");

    const second = await adapter.getAll();
    expect(second).toHaveLength(1);
    expect(second.map((todo) => todo.id)).toEqual(["seed-2"]);
  });
});
