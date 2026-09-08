/**
 * Item health / empty-state utilities (G3-E4).
 *
 * The desktop must never whiteout on missing paths. These helpers
 * classify a `GridItemEntity` into `healthy`, `missing-path`,
 * `missing-protocol`, or `unknown`, so the UI can render an
 * inline-recovery affordance ("locate / relink / remove") instead of
 * crashing.
 *
 * Health checks are best-effort and synchronous: they inspect the
 * entity's own fields. Live filesystem existence checks can be layered
 * on top via the optional `pathExists` predicate.
 */

import type { GridItemEntity } from "@repo/core-data";

export type ItemHealthStatus =
  | "healthy"
  | "missing-path"
  | "missing-protocol"
  | "broken-url"
  | "unknown";

export interface ItemHealthReport {
  status: ItemHealthStatus;
  reason?: string;
}

export interface ItemHealthOptions {
  /**
   * Optional sync predicate. When provided, file/folder/app items are
   * additionally checked for existence; missing paths report
   * `missing-path`. Async checks should call this helper after their
   * filesystem probe completes.
   */
  pathExists?: (filepath: string) => boolean;
}

export function evaluateItemHealth(
  item: GridItemEntity,
  options: ItemHealthOptions = {},
): ItemHealthReport {
  switch (item.kind) {
    case "file":
    case "folder":
    case "app": {
      if (!item.filepath || item.filepath.trim() === "") {
        return {
          status: "missing-path",
          reason: "filepath is empty",
        };
      }
      if (options.pathExists && !options.pathExists(item.filepath)) {
        return {
          status: "missing-path",
          reason: `path not found: ${item.filepath}`,
        };
      }
      return { status: "healthy" };
    }
    case "url": {
      if (!item.url) {
        return {
          status: "missing-protocol",
          reason: "url metadata missing",
        };
      }
      try {
        const parsed = new URL(item.url.href);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return {
            status: "missing-protocol",
            reason: `protocol ${parsed.protocol} not allowed`,
          };
        }
        return { status: "healthy" };
      } catch {
        return {
          status: "broken-url",
          reason: `unparseable href: ${item.url.href}`,
        };
      }
    }
    default:
      return { status: "unknown" };
  }
}

export interface EmptyStateAction {
  id: "create-grid" | "add-url" | "choose-folder" | "drop-here";
  label: string;
  description: string;
}

/** Canonical empty-state CTAs surfaced when no Grids exist. */
export function defaultEmptyStateActions(): EmptyStateAction[] {
  return [
    {
      id: "create-grid",
      label: "New Grid",
      description: "Create a Smart Container on the desktop",
    },
    {
      id: "drop-here",
      label: "Drop files here",
      description: "Drag a file, folder, or app to begin",
    },
    {
      id: "add-url",
      label: "Save a URL",
      description: "Add a web bookmark with metadata",
    },
    {
      id: "choose-folder",
      label: "Choose a folder",
      description: "Map a folder as a Grid source",
    },
  ];
}
