/**
 * Repository v0 entity surface.
 *
 * Concrete `RepoRecord` shapes used across the desktop. Plugin packages must
 * read and write these through the `Repo<T>` interface only; the canonical
 * type definitions live here so that drivers (SQLite, IndexedDB, sync) and
 * plugins agree on the same payload shape.
 *
 * Field-level constraints are enforced by `assertRepoRecord` and per-entity
 * schemas owned by the plugins. Adding a new field requires bumping
 * `schemaVersion` and writing a migration.
 */

import type { RepoRecord } from "./types";

/** A floating Grid container ("Smart Container") on the desktop. */
export interface GridEntity extends RepoRecord {
  entityType: "organizer.grid";
  title: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isLocked: boolean;
  isFolded: boolean;
  viewMode: "grid" | "list";
  itemIds: string[];
  themeColor?: string;
}

/** A typed item inside a Grid: file / folder / app / url. */
export interface GridItemEntity extends RepoRecord {
  entityType: "organizer.item";
  gridId: string;
  filename: string;
  /** Optional for non-fs items (e.g. URLs); required for file/folder/app. */
  filepath?: string;
  kind: "file" | "folder" | "app" | "url";
  icon: string;
  size?: number;
  /** Populated when kind === "url"; metadata is best-effort, may be empty. */
  url?: {
    href: string;
    title?: string;
    description?: string;
    favicon?: string;
  };
}

/** Global label shared across todo/grid/clipboard/project. */
export interface LabelEntity extends RepoRecord {
  entityType: "labels.label";
  name: string;
  color: string;
  parentId?: string;
}

export interface TodoEntity extends RepoRecord {
  entityType: "productivity.todo";
  title: string;
  done: boolean;
  labelIds: string[];
  dueAt?: string;
  notes?: string;
  projectId?: string;
  deletedAt?: string;
}

export interface HabitEntity extends RepoRecord {
  entityType: "productivity.habit";
  title: string;
  cadence: "daily" | "weekly" | "custom";
  /** ISO date strings (YYYY-MM-DD) of completion. */
  completions: string[];
  labelIds: string[];
}

/** Clipboard items are always device-local (`syncScope: "device-local"`). */
export interface ClipboardEntryEntity extends RepoRecord {
  entityType: "clipboard.item";
  syncScope: "device-local";
  kind: "text" | "image" | "file" | "url";
  /** UTF-8 text or base64 for binary. Driver decides storage encoding. */
  payload: string;
  preview?: string;
  pinned?: boolean;
}

export interface ProjectEntity extends RepoRecord {
  entityType: "project.board";
  title: string;
  description?: string;
  archivedAt?: string;
  labelIds: string[];
}

export interface CardEntity extends RepoRecord {
  entityType: "project.card";
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done" | "blocked";
  position: number;
  assigneeId?: string;
  labelIds: string[];
}

/** Discriminated union of all Repository v0 entity types. */
export type RepoEntity =
  | GridEntity
  | GridItemEntity
  | LabelEntity
  | TodoEntity
  | HabitEntity
  | ClipboardEntryEntity
  | ProjectEntity
  | CardEntity;

/** Map from `entityType` string to its concrete record shape. */
export interface RepoEntityTypeMap {
  "organizer.grid": GridEntity;
  "organizer.item": GridItemEntity;
  "labels.label": LabelEntity;
  "productivity.todo": TodoEntity;
  "productivity.habit": HabitEntity;
  "clipboard.item": ClipboardEntryEntity;
  "project.board": ProjectEntity;
  "project.card": CardEntity;
}

export type RepoEntityType = keyof RepoEntityTypeMap;
