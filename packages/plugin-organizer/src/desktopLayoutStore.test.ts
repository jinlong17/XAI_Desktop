import { createInMemoryRepo, type GridEntity, type GridItemEntity } from "@repo/core-data";
import { describe, expect, it, vi } from "vitest";
import { LEGACY_LAYOUT_STORAGE_KEY } from "@repo/core-data";
import type { PersistedLayout } from "./types";
import { createOrganizerDesktopLayoutStore } from "./desktopLayoutStore";
import type { LayoutStore } from "./layoutStore";

function fakeStorage(initial: Record<string, string>) {
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
    has(key: string) {
      return map.has(key);
    },
  };
}

function legacyLayout(): PersistedLayout {
  return {
    grids: [
      {
        id: "grid-1",
        title: "Inbox",
        rect: { x: 16, y: 24, width: 320, height: 420 },
        isLocked: false,
        isFolded: false,
        viewMode: "grid",
        itemIds: ["item-1"],
      },
    ],
    items: [
      {
        id: "item-1",
        filename: "notes.md",
        filepath: "/Users/me/notes.md",
        type: "file",
        icon: "doc.text",
        createdAt: Date.now(),
      },
    ],
  };
}

describe("createOrganizerDesktopLayoutStore", () => {
  const stubInvoke = async <T>() => undefined as T;

  it("falls back to the provided local store when Tauri repo runtime is unavailable", async () => {
    const localStore: LayoutStore = {
      load: vi.fn(async () => null),
      save: vi.fn(async () => undefined),
    };
    const store = createOrganizerDesktopLayoutStore(stubInvoke, {
      canUseTauriRepo: () => false,
      localStore,
    });
    await store.load();
    await store.save({ grids: [], items: [] });
    expect(localStore.load).toHaveBeenCalledOnce();
    expect(localStore.save).toHaveBeenCalledOnce();
  });

  it("migrates legacy layout before repo-backed load/save and keeps legacy blob by default", async () => {
    const storage = fakeStorage({
      [LEGACY_LAYOUT_STORAGE_KEY]: JSON.stringify(legacyLayout()),
    });
    const gridRepo = createInMemoryRepo<GridEntity>({ namespace: "grids" });
    const itemRepo = createInMemoryRepo<GridItemEntity>({ namespace: "items" });
    const onMigrationResult = vi.fn();

    const store = createOrganizerDesktopLayoutStore(stubInvoke, {
      canUseTauriRepo: () => true,
      createGridRepo: () => gridRepo,
      createItemRepo: () => itemRepo,
      migrationStorage: storage,
      onMigrationResult,
    });

    const loaded = await store.load();
    expect(loaded?.grids).toHaveLength(1);
    expect(loaded?.items).toHaveLength(1);
    expect(onMigrationResult).toHaveBeenCalledOnce();
    expect(storage.has(LEGACY_LAYOUT_STORAGE_KEY)).toBe(true);

    await store.save({ grids: [], items: [] });
    await expect(gridRepo.list()).resolves.toHaveLength(0);
    await expect(itemRepo.list()).resolves.toHaveLength(0);
  });
});
