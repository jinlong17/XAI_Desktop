/**
 * Organizer layout persistence seam (G1.5).
 *
 * The default behaviour stays unchanged: `localStorageLayoutStore`
 * preserves the historical synchronous localStorage path used by
 * `useGridSystem`. The new `repositoryLayoutStore` accepts G2.1
 * Repository v0 repos for Grid and GridItem entities, returning a
 * Promise-shaped layout so the same provider can be opted into the
 * SQLite-backed path once the Host wires it.
 *
 * Hardening invariants — both implementations:
 *
 * 1. Returning `null` from `load()` means "no prior state"; callers
 *    must treat it as an empty layout, not as a failure.
 * 2. Any parse or driver error during `load()` is **caught** and
 *    surfaces as `null` so a corrupted state can never whiteout the
 *    desktop. Production telemetry hooks can attach via
 *    `onLoadError`.
 * 3. `save(layout)` is best-effort. Failures during save are caught
 *    and surfaced through the optional `onSaveError` callback so the
 *    in-memory state stays authoritative for the session.
 */

import type { GridEntity, GridItemEntity, Repo } from "@repo/core-data";
import type { DesktopItem, GridBox, PersistedLayout } from "./types";

export const ORGANIZER_LAYOUT_STORAGE_KEY = "xai-desktop-layout";

export interface LayoutStore {
  load(): Promise<PersistedLayout | null>;
  save(layout: PersistedLayout): Promise<void>;
}

export interface LocalStorageLayoutStoreOptions {
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
  storageKey?: string;
  onLoadError?: (error: unknown) => void;
  onSaveError?: (error: unknown) => void;
}

export function localStorageLayoutStore(
  options: LocalStorageLayoutStoreOptions = {},
): LayoutStore {
  const storageKey = options.storageKey ?? ORGANIZER_LAYOUT_STORAGE_KEY;
  const resolveStorage = () => options.storage ?? globalStorage();

  return {
    async load() {
      const storage = resolveStorage();
      if (!storage) return null;
      try {
        const raw = storage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as PersistedLayout;
        if (!isPersistedLayout(parsed)) return null;
        return parsed;
      } catch (error) {
        options.onLoadError?.(error);
        return null;
      }
    },
    async save(layout) {
      const storage = resolveStorage();
      if (!storage) return;
      try {
        storage.setItem(storageKey, JSON.stringify(layout));
      } catch (error) {
        options.onSaveError?.(error);
      }
    },
  };
}

export interface RepositoryLayoutStoreOptions {
  gridRepo: Repo<GridEntity>;
  itemRepo: Repo<GridItemEntity>;
  nowIso?: () => string;
  onLoadError?: (error: unknown) => void;
  onSaveError?: (error: unknown) => void;
}

export function repositoryLayoutStore(
  options: RepositoryLayoutStoreOptions,
): LayoutStore {
  const nowIso = options.nowIso ?? (() => new Date().toISOString());

  return {
    async load() {
      try {
        const grids = await options.gridRepo.list({
          orderBy: { field: "id", direction: "asc" },
        });
        const items = await options.itemRepo.list({
          orderBy: { field: "id", direction: "asc" },
        });

        const gridBoxes: GridBox[] = grids.map(entityToGridBox);
        const desktopItems: DesktopItem[] = items.map(entityToDesktopItem);
        return {
          grids: gridBoxes,
          items: desktopItems,
        };
      } catch (error) {
        options.onLoadError?.(error);
        return null;
      }
    },
    async save(layout) {
      try {
        const timestamp = nowIso();

        // Wrap grid upsert + cull in a single transaction so a partial
        // failure rolls back. On the in-memory driver this is
        // snapshot-atomic; on the Tauri SQLite driver (post-G2.6) this
        // batches via db_put_batch. Either way, `onSaveError` still
        // surfaces the throw to consumers.
        await options.gridRepo.transaction(async (tx) => {
          const seen = new Set<string>();
          for (const grid of layout.grids) {
            await tx.put(gridBoxToEntity(grid, timestamp));
            seen.add(grid.id);
          }
          const existingGrids = await tx.list();
          for (const existing of existingGrids) {
            if (!seen.has(existing.id)) {
              await tx.delete(existing.id);
            }
          }
        });

        // Same atomicity story for items.
        await options.itemRepo.transaction(async (tx) => {
          const seenItems = new Set<string>();
          for (const item of layout.items) {
            const owningGridId = findOwningGridId(item.id, layout.grids);
            if (!owningGridId) continue;
            await tx.put(desktopItemToEntity(item, owningGridId, timestamp));
            seenItems.add(item.id);
          }
          const existingItems = await tx.list();
          for (const existing of existingItems) {
            if (!seenItems.has(existing.id)) {
              await tx.delete(existing.id);
            }
          }
        });
      } catch (error) {
        options.onSaveError?.(error);
      }
    },
  };
}

function globalStorage(): Storage | undefined {
  if (typeof localStorage === "undefined") return undefined;
  return localStorage;
}

function isPersistedLayout(value: unknown): value is PersistedLayout {
  if (!value || typeof value !== "object") return false;
  const obj = value as { grids?: unknown; items?: unknown };
  return Array.isArray(obj.grids) && Array.isArray(obj.items);
}

function entityToGridBox(grid: GridEntity): GridBox {
  return {
    id: grid.id,
    title: grid.title,
    rect: { ...grid.rect },
    isLocked: grid.isLocked,
    isFolded: grid.isFolded,
    viewMode: grid.viewMode,
    itemIds: [...grid.itemIds],
    themeColor: grid.themeColor,
  };
}

function entityToDesktopItem(item: GridItemEntity): DesktopItem {
  const base: DesktopItem = {
    id: item.id,
    filename: item.filename,
    filepath: item.filepath ?? "",
    type: item.kind,
    icon: item.icon,
    size: item.size,
    createdAt: 0,
  };
  // Preserve the url payload — previously lossy (mapped url → file and
  // dropped url metadata).
  if (item.kind === "url" && item.url) {
    base.url = {
      href: item.url.href,
      title: item.url.title,
      description: item.url.description,
      favicon: item.url.favicon,
    };
  }
  return base;
}

function gridBoxToEntity(grid: GridBox, timestamp: string): GridEntity {
  return {
    id: grid.id,
    entityType: "organizer.grid",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "account-sync",
    title: grid.title,
    rect: { ...grid.rect },
    isLocked: grid.isLocked,
    isFolded: grid.isFolded,
    viewMode: grid.viewMode,
    itemIds: [...grid.itemIds],
    themeColor: grid.themeColor,
  };
}

function desktopItemToEntity(
  item: DesktopItem,
  gridId: string,
  timestamp: string,
): GridItemEntity {
  const entity: GridItemEntity = {
    id: item.id,
    entityType: "organizer.item",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "account-sync",
    gridId,
    filename: item.filename,
    filepath: item.filepath,
    kind: item.type,
    icon: item.icon,
    size: item.size,
  };
  // Symmetric url payload preservation — DesktopItem.url ↔
  // GridItemEntity.url for the round-trip.
  if (item.type === "url" && item.url) {
    entity.url = {
      href: item.url.href,
      title: item.url.title,
      description: item.url.description,
      favicon: item.url.favicon,
    };
  }
  return entity;
}

function findOwningGridId(
  itemId: string,
  grids: GridBox[],
): string | undefined {
  for (const grid of grids) {
    if (grid.itemIds.includes(itemId)) return grid.id;
  }
  return undefined;
}
