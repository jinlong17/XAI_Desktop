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
 * - **Repo-state idempotent.** Running the migration twice converges to the
 *   same repo state. Records whose meaningful fields are already byte-equal
 *   to what's stored are SKIPPED instead of re-`put` so that `updatedAt`
 *   never gets re-stamped on a no-op rerun (which would otherwise produce a
 *   spurious sync-conflict signal). Such records are reported via the
 *   `unchanged` counter; only records whose payload actually changed are
 *   counted toward `gridsMigrated` / `itemsMigrated`.
 * - **Validation-rejects counted separately.** Legacy items that fail
 *   positive validation (e.g. empty `filepath`, unsupported `kind`) are
 *   reported via the `skipped` counter, not silently dropped.
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
  /**
   * Records whose meaningful fields equal what's already in the repo and
   * therefore did NOT trigger a re-`put` (C2). Rerunning against an
   * unchanged blob bumps `unchanged` instead of touching `updatedAt`.
   */
  unchanged: number;
  /**
   * Legacy items rejected by positive validation (A3): empty `filepath`,
   * unsupported `kind`, etc. Not counted toward `unchanged`.
   */
  skipped: number;
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
  let itemsMigrated = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const legacyGrid of layout.grids) {
    if (!legacyGrid || typeof legacyGrid.id !== "string") continue;
    const record = toGridEntity(legacyGrid, timestamp);

    // C2 — unchanged-skip: avoid re-stamping updatedAt on a no-op rerun.
    const existing = await options.gridRepo.get(record.id);
    if (existing && isGridRecordEqual(existing, record)) {
      unchanged += 1;
      continue;
    }

    assertRepoRecord(record);
    await options.gridRepo.put(record);
    gridsMigrated += 1;
  }

  for (const legacyItem of layout.items) {
    if (!legacyItem || typeof legacyItem.id !== "string") continue;
    const gridId = findOwningGridId(legacyItem.id, layout.grids);
    if (!gridId) continue;
    const record = toGridItemEntity(legacyItem, gridId, timestamp);

    // A3 — positive validation rejected this legacy item.
    if (!record) {
      skipped += 1;
      continue;
    }

    // C2 — unchanged-skip (same rationale as the grid loop).
    const existing = await options.itemRepo.get(record.id);
    if (existing && isItemRecordEqual(existing, record)) {
      unchanged += 1;
      continue;
    }

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
    unchanged,
    skipped,
    removedLegacy,
  };
}

function emptyResult(): OrganizerLayoutMigrationResult {
  return {
    scanned: false,
    parsed: false,
    gridsMigrated: 0,
    itemsMigrated: 0,
    unchanged: 0,
    skipped: 0,
    removedLegacy: false,
  };
}

/**
 * Returns true when the meaningful Grid fields of `existing` match those of
 * the freshly-computed `candidate`. Excludes `createdAt` / `updatedAt` so a
 * rerun of the migration does not re-stamp timestamps and trigger a false
 * sync-conflict downstream (C2).
 */
function isGridRecordEqual(existing: GridEntity, candidate: GridEntity): boolean {
  return (
    existing.entityType === candidate.entityType &&
    existing.schemaVersion === candidate.schemaVersion &&
    existing.syncScope === candidate.syncScope &&
    existing.title === candidate.title &&
    existing.isLocked === candidate.isLocked &&
    existing.isFolded === candidate.isFolded &&
    existing.viewMode === candidate.viewMode &&
    existing.themeColor === candidate.themeColor &&
    existing.rect.x === candidate.rect.x &&
    existing.rect.y === candidate.rect.y &&
    existing.rect.width === candidate.rect.width &&
    existing.rect.height === candidate.rect.height &&
    arraysEqual(existing.itemIds, candidate.itemIds)
  );
}

/**
 * Like {@link isGridRecordEqual} but for `GridItemEntity`. Excludes
 * `createdAt` / `updatedAt`.
 */
function isItemRecordEqual(
  existing: GridItemEntity,
  candidate: GridItemEntity,
): boolean {
  return (
    existing.entityType === candidate.entityType &&
    existing.schemaVersion === candidate.schemaVersion &&
    existing.syncScope === candidate.syncScope &&
    existing.gridId === candidate.gridId &&
    existing.filename === candidate.filename &&
    existing.filepath === candidate.filepath &&
    existing.kind === candidate.kind &&
    existing.icon === candidate.icon &&
    existing.size === candidate.size
  );
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
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
    syncScope: "device-local",
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
): GridItemEntity | null {
  const rawKind = (legacy as { type?: string }).type ?? "file";
  // url items are not produced by this adapter — reject defensively to
  // keep the migration's contract focused on file-system items.
  if (rawKind !== "file" && rawKind !== "folder" && rawKind !== "app") {
    return null;
  }
  if (typeof legacy.filepath !== "string" || legacy.filepath.length === 0) {
    return null;
  }
  return {
    id: legacy.id,
    entityType: "organizer.item",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "device-local",
    gridId,
    filename: legacy.filename ?? legacy.id,
    filepath: legacy.filepath,
    kind: rawKind,
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
