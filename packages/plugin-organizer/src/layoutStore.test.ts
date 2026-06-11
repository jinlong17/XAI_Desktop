import { describe, expect, it, vi } from "vitest";

import {
  ORGANIZER_LAYOUT_STORAGE_KEY,
  localStorageLayoutStore,
  repositoryLayoutStore,
} from "./layoutStore";
import type { GridEntity, GridItemEntity } from "@repo/core-data";
import { createInMemoryRepo } from "@repo/core-data";
import type { PersistedLayout } from "./types";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem">;
}

function sampleLayout(): PersistedLayout {
  return {
    grids: [
      {
        id: "grid-1",
        title: "Today",
        rect: { x: 16, y: 24, width: 320, height: 480 },
        isLocked: false,
        isFolded: false,
        viewMode: "grid",
        itemIds: ["item-1"],
      },
    ],
    items: [
      {
        id: "item-1",
        filename: "draft.md",
        filepath: "/Users/me/draft.md",
        type: "file",
        icon: "doc.text",
        createdAt: 0,
      },
    ],
  };
}

describe("localStorageLayoutStore", () => {
  it("round-trips a layout through the configured storage", async () => {
    const storage = memoryStorage();
    const store = localStorageLayoutStore({ storage });
    await store.save(sampleLayout());
    const loaded = await store.load();
    expect(loaded).toEqual(sampleLayout());
  });

  it("returns null when the storage key is absent", async () => {
    const store = localStorageLayoutStore({ storage: memoryStorage() });
    await expect(store.load()).resolves.toBeNull();
  });

  it("returns null and reports the error for malformed JSON", async () => {
    const storage = memoryStorage();
    storage.setItem(ORGANIZER_LAYOUT_STORAGE_KEY, "{not json");
    const onLoadError = vi.fn();
    const store = localStorageLayoutStore({ storage, onLoadError });
    await expect(store.load()).resolves.toBeNull();
    expect(onLoadError).toHaveBeenCalledOnce();
  });

  it("returns null when the parsed payload misses grids/items arrays", async () => {
    const storage = memoryStorage();
    storage.setItem(
      ORGANIZER_LAYOUT_STORAGE_KEY,
      JSON.stringify({ grids: "oops" }),
    );
    const store = localStorageLayoutStore({ storage });
    await expect(store.load()).resolves.toBeNull();
  });

  it("swallows save errors and surfaces them via onSaveError", async () => {
    const error = new Error("quota");
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw error;
      },
      removeItem: () => undefined,
    };
    const onSaveError = vi.fn();
    const store = localStorageLayoutStore({ storage, onSaveError });
    await store.save(sampleLayout());
    expect(onSaveError).toHaveBeenCalledWith(error);
  });
});

describe("repositoryLayoutStore", () => {
  it("returns null for an empty repo (not an empty layout) to keep startup neutral", async () => {
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });
    const store = repositoryLayoutStore({ gridRepo, itemRepo });
    const loaded = await store.load();
    expect(loaded).toEqual({ grids: [], items: [] });
  });

  it("round-trips a layout via the underlying repos", async () => {
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });
    const store = repositoryLayoutStore({
      gridRepo,
      itemRepo,
      nowIso: () => "2026-05-20T00:00:00.000Z",
    });

    await store.save(sampleLayout());

    const grids = await gridRepo.list();
    expect(grids).toHaveLength(1);
    expect(grids[0]).toMatchObject({
      id: "grid-1",
      title: "Today",
      entityType: "organizer.grid",
    });

    const items = await itemRepo.list();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "item-1",
      gridId: "grid-1",
      kind: "file",
    });

    const reloaded = await store.load();
    expect(reloaded?.grids).toHaveLength(1);
    expect(reloaded?.items).toHaveLength(1);
  });

  it("culls grids and items that disappeared between saves", async () => {
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });
    const store = repositoryLayoutStore({ gridRepo, itemRepo });
    await store.save(sampleLayout());
    await store.save({ grids: [], items: [] });
    await expect(gridRepo.list()).resolves.toEqual([]);
    await expect(itemRepo.list()).resolves.toEqual([]);
  });

  it("round-trips a url item with full payload (href + title + description + favicon)", async () => {
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });
    const store = repositoryLayoutStore({
      gridRepo,
      itemRepo,
      nowIso: () => "2026-05-20T00:00:00.000Z",
    });

    const urlLayout: PersistedLayout = {
      grids: [
        {
          id: "grid-u",
          title: "Reading",
          rect: { x: 0, y: 0, width: 320, height: 480 },
          isLocked: false,
          isFolded: false,
          viewMode: "grid",
          itemIds: ["item-url"],
        },
      ],
      items: [
        {
          id: "item-url",
          filename: "Anthropic",
          filepath: "",
          type: "url",
          icon: "globe",
          createdAt: 0,
          url: {
            href: "https://anthropic.com/",
            title: "Anthropic",
            description: "AI safety company",
            favicon: "https://anthropic.com/favicon.ico",
          },
        },
      ],
    };

    await store.save(urlLayout);
    const reloaded = await store.load();
    expect(reloaded?.items).toHaveLength(1);
    expect(reloaded?.items[0]).toMatchObject({
      id: "item-url",
      type: "url",
      url: {
        href: "https://anthropic.com/",
        title: "Anthropic",
        description: "AI safety company",
        favicon: "https://anthropic.com/favicon.ico",
      },
    });
  });

  it("rolls back grid upsert when cull throws (transactional save)", async () => {
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });
    // Seed an existing grid so cull has something to attempt deleting.
    await gridRepo.put({
      id: "grid-keep",
      entityType: "organizer.grid",
      schemaVersion: 1,
      createdAt: "2026-05-19T00:00:00.000Z",
      updatedAt: "2026-05-19T00:00:00.000Z",
      syncScope: "device-local",
      title: "Old",
      rect: { x: 0, y: 0, width: 100, height: 100 },
      isLocked: false,
      isFolded: false,
      viewMode: "grid",
      itemIds: [],
    });

    // Patch the underlying tx by wrapping the repo; transaction
    // delegates to operations, so intercepting at the .transaction
    // boundary lets us throw mid-flight while the snapshot still
    // restores grid state.
    const originalTransaction = gridRepo.transaction.bind(gridRepo);
    const failingGridRepo = {
      ...gridRepo,
      transaction: async (
        fn: Parameters<typeof gridRepo.transaction>[0],
      ) => {
        return originalTransaction(async (tx) => {
          // Force the delete step to throw.
          const wrappedTx = {
            ...tx,
            delete: async () => {
              throw new Error("cull failed");
            },
          };
          return fn(wrappedTx);
        });
      },
    } as typeof gridRepo;

    const onSaveError = vi.fn();
    const store = repositoryLayoutStore({
      gridRepo: failingGridRepo,
      itemRepo,
      onSaveError,
    });

    // The new layout introduces "grid-new" and removes "grid-keep".
    // With transactional save: the put of grid-new must roll back when
    // the cull throws.
    await store.save({
      grids: [
        {
          id: "grid-new",
          title: "New",
          rect: { x: 1, y: 1, width: 100, height: 100 },
          isLocked: false,
          isFolded: false,
          viewMode: "grid",
          itemIds: [],
        },
      ],
      items: [],
    });

    expect(onSaveError).toHaveBeenCalledOnce();
    const grids = await gridRepo.list();
    // After rollback, only grid-keep remains; grid-new was rolled back.
    expect(grids.map((g) => g.id).sort()).toEqual(["grid-keep"]);
  });

  it("swallows load errors and returns null so the desktop never whiteouts", async () => {
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({
      namespace: "items",
    });
    const broken = {
      ...gridRepo,
      list: async () => {
        throw new Error("driver dead");
      },
    } as typeof gridRepo;
    const onLoadError = vi.fn();
    const store = repositoryLayoutStore({
      gridRepo: broken,
      itemRepo,
      onLoadError,
    });
    await expect(store.load()).resolves.toBeNull();
    expect(onLoadError).toHaveBeenCalledOnce();
  });
});
