/**
 * Legacy `xai-desktop-layout` localStorage blob → Repository v0 migration.
 *
 * The Organizer originally serialised the entire desktop layout as one JSON
 * blob (`{ grids: GridBox[], items: DesktopItem[] }`) under the key
 * `xai-desktop-layout`. G2.3 splits that blob into typed Repository v0
 * records — `GridEntity` per grid and `GridItemEntity` per item.
 *
 * Guarantees:
 *
 * - **Idempotent.** Running the migration twice produces the same repo
 *   state; the second run is a no-op upsert.
 * - **Non-destructive by default.** The legacy key is kept in
 *   `localStorage` unless the caller passes `removeLegacy: true`, so the
 *   user can roll back if SQLite is unavailable.
 * - **Pure data transform.** No Tauri / no React; safe to call from
 *   either side of the IPC boundary.
 */

import { assertRepoRecord } from "./repo-utils";
import type {
  GridEntity,
  GridItemEntity,
} from "./entities";
import type { Repo } from "./types";
import type { StorageLike } from "./local-storage";

export const LEGACY_LAYOUT_STORAGE_KEY = "xai-desktop-layout";

/** Minimal shape of a record inside the legacy `grids[]` array. */
export interface LegacyGridBox {
  id: string;
  title: string;
  rect: { x: number; y: number; width: number; height: number };
  isLocked?: boolean;
  isFolded?: boolean;
  viewMode?: "grid" | "list";
  itemIds?: string[];
  themeColor?: string;
}

/** Minimal shape of a record inside the legacy `items[]` array. */
export interface LegacyDesktopItem {
  id: string;
  filename: string;
  filepath: string;
  type: "file" | "folder" | "app";
  icon: string;
  size?: number;
  createdAt?: number;
}

export interface LegacyOrganizerLayout {
  grids: LegacyGridBox[];
  items: LegacyDesktopItem[];
}

export interface OrganizerLayoutMigrationOptions {
  storage: StorageLike;
  gridRepo: Repo<GridEntity>;
  itemRepo: Repo<GridItemEntity>;
  legacyKey?: string;
  nowIso?: () => string;
  removeLegacy?: boolean;
}

export interface OrganizerLayoutMigrationResult {
  scanned: boolean;
  parsed: boolean;
  gridsMigrated: number;
  itemsMigrated: number;
  removedLegacy: boolean;
}

export async function migrateOrganizerLayoutToRepos(
  options: OrganizerLayoutMigrationOptions,
): Promise<OrganizerLayoutMigrationResult> {
  const legacyKey = options.legacyKey ?? LEGACY_LAYOUT_STORAGE_KEY;
  const raw = options.storage.getItem(legacyKey);
  if (raw === null) {
    return emptyResult();
  }

  let layout: LegacyOrganizerLayout;
  try {
    layout = JSON.parse(raw) as LegacyOrganizerLayout;
  } catch {
    return { ...emptyResult(), scanned: true };
  }

  if (
    !layout ||
    !Array.isArray(layout.grids) ||
    !Array.isArray(layout.items)
  ) {
    return { ...emptyResult(), scanned: true };
  }

  const nowIso = options.nowIso ?? (() => new Date().toISOString());
  const timestamp = nowIso();

  let gridsMigrated = 0;
  for (const legacyGrid of layout.grids) {
    if (!legacyGrid || typeof legacyGrid.id !== "string") continue;
    const record = toGridEntity(legacyGrid, timestamp);
    assertRepoRecord(record);
    await options.gridRepo.put(record);
    gridsMigrated += 1;
  }

  let itemsMigrated = 0;
  for (const legacyItem of layout.items) {
    if (!legacyItem || typeof legacyItem.id !== "string") continue;
    const gridId = findOwningGridId(legacyItem.id, layout.grids);
    if (!gridId) continue;
    const record = toGridItemEntity(legacyItem, gridId, timestamp);
    assertRepoRecord(record);
    await options.itemRepo.put(record);
    itemsMigrated += 1;
  }

  let removedLegacy = false;
  if (options.removeLegacy) {
    options.storage.removeItem(legacyKey);
    removedLegacy = true;
  }

  return {
    scanned: true,
    parsed: true,
    gridsMigrated,
    itemsMigrated,
    removedLegacy,
  };
}

function emptyResult(): OrganizerLayoutMigrationResult {
  return {
    scanned: false,
    parsed: false,
    gridsMigrated: 0,
    itemsMigrated: 0,
    removedLegacy: false,
  };
}

function toGridEntity(
  legacy: LegacyGridBox,
  timestamp: string,
): GridEntity {
  return {
    id: legacy.id,
    entityType: "organizer.grid",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "account-sync",
    title: legacy.title ?? "Untitled",
    rect: {
      x: numberOrZero(legacy.rect?.x),
      y: numberOrZero(legacy.rect?.y),
      width: numberOrDefault(legacy.rect?.width, 240),
      height: numberOrDefault(legacy.rect?.height, 320),
    },
    isLocked: Boolean(legacy.isLocked),
    isFolded: Boolean(legacy.isFolded),
    viewMode: legacy.viewMode === "list" ? "list" : "grid",
    itemIds: Array.isArray(legacy.itemIds) ? [...legacy.itemIds] : [],
    themeColor: legacy.themeColor,
  };
}

function toGridItemEntity(
  legacy: LegacyDesktopItem,
  gridId: string,
  timestamp: string,
): GridItemEntity {
  const kind: GridItemEntity["kind"] = legacy.type ?? "file";
  return {
    id: legacy.id,
    entityType: "organizer.item",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "account-sync",
    gridId,
    filename: legacy.filename ?? legacy.id,
    filepath: legacy.filepath,
    kind,
    icon: legacy.icon ?? "doc",
    size: legacy.size,
  };
}

function findOwningGridId(
  itemId: string,
  grids: LegacyGridBox[],
): string | undefined {
  for (const grid of grids) {
    if (Array.isArray(grid.itemIds) && grid.itemIds.includes(itemId)) {
      return grid.id;
    }
  }
  return undefined;
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function numberOrDefault(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
