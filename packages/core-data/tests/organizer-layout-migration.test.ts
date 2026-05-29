import { describe, expect, it } from "vitest";

import {
  LEGACY_LAYOUT_STORAGE_KEY,
  migrateOrganizerLayoutToRepos,
  type LegacyOrganizerLayout,
} from "../src/organizer-layout-migration";
import { createInMemoryRepo } from "../src/testing";
import type { GridEntity, GridItemEntity } from "../src/entities";
import type { StorageLike } from "../src/local-storage";

function fakeStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
  };
}

function exampleLayout(): LegacyOrganizerLayout {
  return {
    grids: [
      {
        id: "grid-1",
        title: "Today",
        rect: { x: 24, y: 48, width: 320, height: 480 },
        isLocked: false,
        isFolded: false,
        viewMode: "grid",
        itemIds: ["item-1", "item-2"],
      },
      {
        id: "grid-2",
        title: "Inbox",
        rect: { x: 360, y: 48, width: 280, height: 360 },
        viewMode: "list",
        itemIds: [],
      },
    ],
    items: [
      {
        id: "item-1",
        filename: "draft.md",
        filepath: "/Users/me/draft.md",
        type: "file",
        icon: "doc.text",
        size: 1024,
      },
      {
        id: "item-2",
        filename: "Notes",
        filepath: "/Users/me/Notes",
        type: "folder",
        icon: "folder",
      },
      // An item with no owning grid — must be dropped.
      {
        id: "orphan",
        filename: "lost",
        filepath: "/Users/me/lost",
        type: "file",
        icon: "doc",
      },
    ],
  };
}

describe("migrateOrganizerLayoutToRepos", () => {
  it("emits typed Grid/GridItem records for every layout entry with an owner", async () => {
    const storage = fakeStorage({
      [LEGACY_LAYOUT_STORAGE_KEY]: JSON.stringify(exampleLayout()),
    });
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });

    const result = await migrateOrganizerLayoutToRepos({
      storage,
      gridRepo,
      itemRepo,
      nowIso: () => "2026-05-20T00:00:00.000Z",
    });
    expect(result).toEqual({
      scanned: true,
      parsed: true,
      gridsMigrated: 2,
      itemsMigrated: 2,
      unchanged: 0,
      skipped: 0,
      removedLegacy: false,
    });

    const grids = await gridRepo.list({
      orderBy: { field: "id", direction: "asc" },
    });
    expect(grids).toEqual([
      expect.objectContaining({
        id: "grid-1",
        entityType: "organizer.grid",
        syncScope: "device-local",
        title: "Today",
        viewMode: "grid",
        itemIds: ["item-1", "item-2"],
      }),
      expect.objectContaining({
        id: "grid-2",
        viewMode: "list",
        itemIds: [],
      }),
    ]);

    const items = await itemRepo.list({
      orderBy: { field: "id", direction: "asc" },
    });
    expect(items.map((it) => it.id)).toEqual(["item-1", "item-2"]);
    expect(items[0]).toMatchObject({
      entityType: "organizer.item",
      syncScope: "device-local",
      gridId: "grid-1",
      kind: "file",
      filepath: "/Users/me/draft.md",
    });
    expect(items[1]).toMatchObject({
      gridId: "grid-1",
      kind: "folder",
    });
  });

  it("is repo-state idempotent when rerun against the same legacy blob", async () => {
    const storage = fakeStorage({
      [LEGACY_LAYOUT_STORAGE_KEY]: JSON.stringify(exampleLayout()),
    });
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });
    const run = () =>
      migrateOrganizerLayoutToRepos({
        storage,
        gridRepo,
        itemRepo,
        nowIso: () => "2026-05-20T00:00:00.000Z",
      });

    await run();
    const after = await run();
    // C2: the second pass must NOT re-`put` records — it skips them via the
    // `unchanged` counter so `updatedAt` is not re-stamped (which would
    // otherwise look like a spurious sync conflict downstream).
    expect(after).toMatchObject({
      gridsMigrated: 0,
      itemsMigrated: 0,
      unchanged: 4,
      skipped: 0,
    });
    expect((await gridRepo.list()).length).toBe(2);
    expect((await itemRepo.list()).length).toBe(2);
  });

  it("rerun against an unchanged blob increments `unchanged`, not `migrated`, and preserves `updatedAt`", async () => {
    const storage = fakeStorage({
      [LEGACY_LAYOUT_STORAGE_KEY]: JSON.stringify(exampleLayout()),
    });
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });

    // First run stamps `updatedAt` at T0.
    const firstStamp = "2026-05-20T00:00:00.000Z";
    await migrateOrganizerLayoutToRepos({
      storage,
      gridRepo,
      itemRepo,
      nowIso: () => firstStamp,
    });
    const firstGrids = await gridRepo.list({
      orderBy: { field: "id", direction: "asc" },
    });
    const firstItems = await itemRepo.list({
      orderBy: { field: "id", direction: "asc" },
    });

    // Second run uses a different `nowIso` — if we accidentally re-`put`,
    // the stored `updatedAt` would advance to T1.
    const secondStamp = "2026-05-21T12:34:56.000Z";
    const result = await migrateOrganizerLayoutToRepos({
      storage,
      gridRepo,
      itemRepo,
      nowIso: () => secondStamp,
    });

    expect(result).toEqual({
      scanned: true,
      parsed: true,
      gridsMigrated: 0,
      itemsMigrated: 0,
      unchanged: 4, // 2 grids + 2 owned items
      skipped: 0,
      removedLegacy: false,
    });

    // Verify `updatedAt` was NOT touched on the no-op rerun.
    const secondGrids = await gridRepo.list({
      orderBy: { field: "id", direction: "asc" },
    });
    const secondItems = await itemRepo.list({
      orderBy: { field: "id", direction: "asc" },
    });
    for (let i = 0; i < firstGrids.length; i += 1) {
      expect(secondGrids[i].updatedAt).toBe(firstStamp);
      expect(secondGrids[i].updatedAt).not.toBe(secondStamp);
    }
    for (let i = 0; i < firstItems.length; i += 1) {
      expect(secondItems[i].updatedAt).toBe(firstStamp);
      expect(secondItems[i].updatedAt).not.toBe(secondStamp);
    }
  });

  it("does not delete the legacy key by default", async () => {
    const storage = fakeStorage({
      [LEGACY_LAYOUT_STORAGE_KEY]: JSON.stringify(exampleLayout()),
    });
    await migrateOrganizerLayoutToRepos({
      storage,
      gridRepo: createInMemoryRepo<GridEntity>({ namespace: "grids" }),
      itemRepo: createInMemoryRepo<GridItemEntity>({ namespace: "items" }),
    });
    expect(storage.getItem(LEGACY_LAYOUT_STORAGE_KEY)).not.toBeNull();
  });

  it("removes the legacy key when removeLegacy=true", async () => {
    const storage = fakeStorage({
      [LEGACY_LAYOUT_STORAGE_KEY]: JSON.stringify(exampleLayout()),
    });
    const result = await migrateOrganizerLayoutToRepos({
      storage,
      gridRepo: createInMemoryRepo<GridEntity>({ namespace: "grids" }),
      itemRepo: createInMemoryRepo<GridItemEntity>({ namespace: "items" }),
      removeLegacy: true,
    });
    expect(result.removedLegacy).toBe(true);
    expect(storage.getItem(LEGACY_LAYOUT_STORAGE_KEY)).toBeNull();
  });

  it("drops items with an empty filepath and increments skipped", async () => {
    const layout: LegacyOrganizerLayout = {
      grids: [
        {
          id: "grid-1",
          title: "Today",
          rect: { x: 0, y: 0, width: 240, height: 320 },
          itemIds: ["good", "bad"],
        },
      ],
      items: [
        {
          id: "good",
          filename: "ok.md",
          filepath: "/Users/me/ok.md",
          type: "file",
          icon: "doc",
        },
        {
          id: "bad",
          filename: "missing",
          // Empty filepath → must be dropped.
          filepath: "",
          type: "file",
          icon: "doc",
        },
      ],
    };
    const storage = fakeStorage({
      [LEGACY_LAYOUT_STORAGE_KEY]: JSON.stringify(layout),
    });
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });

    const result = await migrateOrganizerLayoutToRepos({
      storage,
      gridRepo,
      itemRepo,
      nowIso: () => "2026-05-20T00:00:00.000Z",
    });

    expect(result).toEqual({
      scanned: true,
      parsed: true,
      gridsMigrated: 1,
      itemsMigrated: 1,
      unchanged: 0,
      removedLegacy: false,
      skipped: 1,
    });
    const items = await itemRepo.list();
    expect(items.map((it) => it.id)).toEqual(["good"]);
  });

  it("is a no-op when the legacy key is absent or malformed", async () => {
    const empty = fakeStorage();
    expect(
      await migrateOrganizerLayoutToRepos({
        storage: empty,
        gridRepo: createInMemoryRepo<GridEntity>({ namespace: "grids" }),
        itemRepo: createInMemoryRepo<GridItemEntity>({ namespace: "items" }),
      }),
    ).toMatchObject({ scanned: false, parsed: false });

    const malformed = fakeStorage({
      [LEGACY_LAYOUT_STORAGE_KEY]: "{not json",
    });
    expect(
      await migrateOrganizerLayoutToRepos({
        storage: malformed,
        gridRepo: createInMemoryRepo<GridEntity>({ namespace: "grids" }),
        itemRepo: createInMemoryRepo<GridItemEntity>({ namespace: "items" }),
      }),
    ).toMatchObject({ scanned: true, parsed: false });
  });
});
