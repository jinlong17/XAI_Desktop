/**
 * Typed `GridItemEntity` factory (G3-E1 / G3-S3).
 *
 * Bridges the Organizer's runtime sources (Finder DnD, URL paste,
 * pasteboard) to the G2.1 Repository v0 entity surface. Plugin code
 * should pass through these helpers rather than constructing
 * `GridItemEntity` objects directly so the dotted `entityType`,
 * `syncScope`, and timestamp conventions stay consistent.
 */

import type { GridItemEntity } from "@repo/core-data";

export type GridItemKind = GridItemEntity["kind"];

/**
 * App bundle suffix — overridable for test rigs. Anything ending with
 * `.app` (case-insensitive) is treated as a macOS application bundle.
 */
const APP_BUNDLE_SUFFIX = ".app";

const DEFAULT_ICONS: Record<GridItemKind, string> = {
  file: "doc.text",
  folder: "folder",
  app: "app.dashed",
  url: "globe",
};

export interface GridItemFactoryDeps {
  /** Returns an ISO timestamp; defaults to `new Date().toISOString()`. */
  nowIso?: () => string;
  /** Returns a unique id; defaults to a `crypto.randomUUID`-backed shim. */
  newId?: (kind: GridItemKind) => string;
}

function resolveDeps(deps: GridItemFactoryDeps = {}): Required<
  Pick<GridItemFactoryDeps, "nowIso" | "newId">
> {
  return {
    nowIso: deps.nowIso ?? (() => new Date().toISOString()),
    newId:
      deps.newId ??
      ((kind: GridItemKind) => `${kind}_${randomSlug()}`),
  };
}

function randomSlug(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(16).slice(2, 12);
}

/** Heuristic kind inference from a filesystem path. */
export function inferKindFromPath(path: string): GridItemKind {
  if (path.toLowerCase().endsWith(APP_BUNDLE_SUFFIX)) return "app";
  if (path.endsWith("/")) return "folder";
  // The drop adapter labels folders explicitly; the bare path heuristic
  // defaults the unknown case to "file" — most drag-ins are files.
  return "file";
}

export interface CreateFileGridItemInput {
  gridId: string;
  filename: string;
  filepath: string;
  size?: number;
  icon?: string;
}

export function createFileGridItem(
  input: CreateFileGridItemInput,
  deps: GridItemFactoryDeps = {},
): GridItemEntity {
  const { nowIso, newId } = resolveDeps(deps);
  const timestamp = nowIso();
  return {
    id: newId("file"),
    entityType: "organizer.item",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "account-sync",
    gridId: input.gridId,
    filename: input.filename,
    filepath: input.filepath,
    kind: "file",
    icon: input.icon ?? DEFAULT_ICONS.file,
    size: input.size,
  };
}

export interface CreateFolderGridItemInput {
  gridId: string;
  name: string;
  filepath: string;
  icon?: string;
}

export function createFolderGridItem(
  input: CreateFolderGridItemInput,
  deps: GridItemFactoryDeps = {},
): GridItemEntity {
  const { nowIso, newId } = resolveDeps(deps);
  const timestamp = nowIso();
  return {
    id: newId("folder"),
    entityType: "organizer.item",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "account-sync",
    gridId: input.gridId,
    filename: input.name,
    filepath: input.filepath,
    kind: "folder",
    icon: input.icon ?? DEFAULT_ICONS.folder,
  };
}

export interface CreateAppGridItemInput {
  gridId: string;
  name: string;
  filepath: string;
  icon?: string;
}

export function createAppGridItem(
  input: CreateAppGridItemInput,
  deps: GridItemFactoryDeps = {},
): GridItemEntity {
  const { nowIso, newId } = resolveDeps(deps);
  const timestamp = nowIso();
  return {
    id: newId("app"),
    entityType: "organizer.item",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "account-sync",
    gridId: input.gridId,
    filename: input.name,
    filepath: input.filepath,
    kind: "app",
    icon: input.icon ?? DEFAULT_ICONS.app,
  };
}

export interface CreateUrlGridItemInput {
  gridId: string;
  href: string;
  title?: string;
  description?: string;
  favicon?: string;
  icon?: string;
}

export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
  }
}

/**
 * Build a URL item. Validates that `href` parses as a `URL` and that
 * its protocol is `http(s):`, otherwise throws `InvalidUrlError`. Other
 * protocols (file://, mailto:) are rejected because they require Finder
 * collaboration paths that have their own factories.
 */
export function createUrlGridItem(
  input: CreateUrlGridItemInput,
  deps: GridItemFactoryDeps = {},
): GridItemEntity {
  let url: URL;
  try {
    url = new URL(input.href);
  } catch {
    throw new InvalidUrlError(
      `URL parse failed for "${input.href}" — must be a fully qualified http(s) URL`,
    );
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidUrlError(
      `URL protocol "${url.protocol}" not allowed; expected http: or https:`,
    );
  }

  const { nowIso, newId } = resolveDeps(deps);
  const timestamp = nowIso();
  return {
    id: newId("url"),
    entityType: "organizer.item",
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncScope: "account-sync",
    gridId: input.gridId,
    filename: input.title?.trim() || url.hostname,
    kind: "url",
    icon: input.icon ?? DEFAULT_ICONS.url,
    url: {
      href: url.toString(),
      title: input.title?.trim() || undefined,
      description: input.description?.trim() || undefined,
      favicon: input.favicon,
    },
  };
}

/**
 * Bulk factory for Finder-style drop adapters. Each path becomes a
 * typed item; kind is inferred from `inferKindFromPath` unless the
 * caller pins it explicitly via `kindOverride`.
 */
export interface FinderDropEntry {
  filepath: string;
  filename: string;
  size?: number;
  kindOverride?: GridItemKind;
}

export function createGridItemsFromFinderDrop(
  gridId: string,
  entries: FinderDropEntry[],
  deps: GridItemFactoryDeps = {},
): GridItemEntity[] {
  return entries.map((entry) => {
    const kind = entry.kindOverride ?? inferKindFromPath(entry.filepath);
    switch (kind) {
      case "app":
        return createAppGridItem(
          { gridId, name: entry.filename, filepath: entry.filepath },
          deps,
        );
      case "folder":
        return createFolderGridItem(
          { gridId, name: entry.filename, filepath: entry.filepath },
          deps,
        );
      case "url":
        // Unusual — Finder drops are filesystem paths. If the caller
        // pins `kindOverride = "url"` we treat the path as the href
        // for parity with the pasteboard URL path.
        return createUrlGridItem({ gridId, href: entry.filepath }, deps);
      case "file":
      default:
        return createFileGridItem(
          {
            gridId,
            filename: entry.filename,
            filepath: entry.filepath,
            size: entry.size,
          },
          deps,
        );
    }
  });
}
