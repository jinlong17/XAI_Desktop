import { describe, expect, it } from "vitest";

import { assertRepoRecord } from "../src/repo-utils";
import { createInMemoryRepo } from "../src/testing";
import type {
  CardEntity,
  ClipboardEntryEntity,
  GridEntity,
  GridItemEntity,
  HabitEntity,
  LabelEntity,
  ProjectEntity,
  RepoEntity,
  TodoEntity,
} from "../src/entities";
import type { RepoRecord } from "../src/types";

const BASE = {
  schemaVersion: 1,
  createdAt: "2026-05-19T00:00:00.000Z",
  updatedAt: "2026-05-19T00:00:00.000Z",
  syncScope: "account-sync" as const,
};

function gridFixture(id: string): GridEntity {
  return {
    ...BASE,
    id,
    entityType: "organizer.grid",
    title: "Today",
    rect: { x: 0, y: 0, width: 240, height: 320 },
    isLocked: false,
    isFolded: false,
    viewMode: "grid",
    itemIds: [],
  };
}

function gridItemFixture(id: string): GridItemEntity {
  return {
    ...BASE,
    id,
    entityType: "organizer.item",
    gridId: "grid-1",
    filename: "report.md",
    filepath: "/Users/me/Documents/report.md",
    kind: "file",
    icon: "doc.text",
  };
}

function todoFixture(id: string): TodoEntity {
  return {
    ...BASE,
    id,
    entityType: "productivity.todo",
    title: "Ship G2.1",
    done: false,
    labelIds: [],
  };
}

function habitFixture(id: string): HabitEntity {
  return {
    ...BASE,
    id,
    entityType: "productivity.habit",
    title: "Read 20 min",
    cadence: "daily",
    completions: [],
    labelIds: [],
  };
}

function labelFixture(id: string): LabelEntity {
  return {
    ...BASE,
    id,
    entityType: "labels.label",
    name: "Work",
    color: "#3a86ff",
  };
}

function clipboardFixture(id: string): ClipboardEntryEntity {
  return {
    ...BASE,
    id,
    entityType: "clipboard.item",
    syncScope: "device-local",
    kind: "text",
    payload: "hello",
  };
}

function projectFixture(id: string): ProjectEntity {
  return {
    ...BASE,
    id,
    entityType: "project.board",
    title: "XAI Desktop GA",
    labelIds: [],
  };
}

function cardFixture(id: string): CardEntity {
  return {
    ...BASE,
    id,
    entityType: "project.card",
    projectId: "proj-1",
    title: "Repository v0",
    status: "doing",
    position: 0,
    labelIds: [],
  };
}

describe("Repo entities contract", () => {
  it("round-trips every entity type through the in-memory repo", async () => {
    const repo = createInMemoryRepo<RepoEntity>({ namespace: "entities" });

    const fixtures: RepoEntity[] = [
      gridFixture("grid-1"),
      gridItemFixture("item-1"),
      labelFixture("label-1"),
      todoFixture("todo-1"),
      habitFixture("habit-1"),
      clipboardFixture("clip-1"),
      projectFixture("proj-1"),
      cardFixture("card-1"),
    ];

    for (const record of fixtures) {
      await repo.put(record);
    }

    for (const record of fixtures) {
      await expect(repo.get(record.id)).resolves.toEqual(record);
    }

    await expect(
      repo.list({ entityType: "clipboard.item" }),
    ).resolves.toEqual([clipboardFixture("clip-1")]);
  });

  it("enforces clipboard items are device-local at the type level", () => {
    const clip = clipboardFixture("clip-2");
    // Type assertion: `syncScope` is the literal `"device-local"` only.
    const scope: "device-local" = clip.syncScope;
    expect(scope).toBe("device-local");
  });

  it("uses plugin.entity dotted entityType naming", async () => {
    const repo = createInMemoryRepo<RepoEntity>({ namespace: "entities" });
    await repo.put(gridFixture("grid-1"));
    await repo.put(labelFixture("label-1"));
    await repo.put(todoFixture("todo-1"));

    const all = await repo.list();
    for (const record of all) {
      expect(record.entityType).toMatch(/^[a-z]+\.[a-z_]+$/);
    }
  });

  it("rejects records whose entityType violates the plugin.entity regex", () => {
    const bad: RepoRecord = {
      ...BASE,
      id: "bad-1",
      // Uppercase + missing dot → violates `^[a-z]+\.[a-z_]+$`.
      entityType: "BadType",
    } as RepoRecord;
    expect(() => assertRepoRecord(bad)).toThrowError(
      /E3005: core-data record entityType "BadType" violates plugin\.entity regex/,
    );

    const trailingDash: RepoRecord = {
      ...BASE,
      id: "bad-2",
      entityType: "labels.label-1",
    } as RepoRecord;
    expect(() => assertRepoRecord(trailingDash)).toThrowError(
      /violates plugin\.entity regex/,
    );
  });

  it("rejects clipboard.item records with non-device-local syncScope at runtime", () => {
    const cheating: RepoRecord = {
      ...BASE,
      id: "clip-bad",
      entityType: "clipboard.item",
      // Force account-sync via the wider RepoRecord shape — the type-level
      // narrowing on ClipboardEntryEntity stops this in TS, but a raw
      // SQLite row could still carry the wrong value.
      syncScope: "account-sync",
    } as RepoRecord;
    expect(() => assertRepoRecord(cheating)).toThrowError(
      /E3005: clipboard\.item must be device-local, got "account-sync"/,
    );
  });

  it("supports listByIndex on entity-owned fields", async () => {
    const repo = createInMemoryRepo<GridItemEntity>({
      namespace: "organizer.items",
    });
    const item1: GridItemEntity = {
      ...gridItemFixture("item-1"),
      gridId: "grid-a",
    };
    const item2: GridItemEntity = {
      ...gridItemFixture("item-2"),
      gridId: "grid-b",
    };
    const item3: GridItemEntity = {
      ...gridItemFixture("item-3"),
      gridId: "grid-a",
    };
    await repo.put(item1);
    await repo.put(item2);
    await repo.put(item3);

    const byGrid = await repo.listByIndex("gridId", "grid-a", {
      orderBy: { field: "id", direction: "asc" },
    });
    expect(byGrid.map((it) => it.id)).toEqual(["item-1", "item-3"]);
  });
});
