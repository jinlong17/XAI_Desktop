import type { ComponentType, ReactNode } from "react";
import type { RepoRecord } from "@repo/core-data";

export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ConsoleNavItem {
  id: string;
  pluginId: string;
  label: string;
  icon?: string;
  order: number;
  badgeCount?: number;
  render?: ComponentType;
}

export interface ConsoleLayoutSection {
  id: string;
  title: string;
  content: ReactNode;
}

export type SearchEntityType = "label" | "todo" | "habit" | "clipboard" | "project";
export type SearchResultAction = "open" | "reveal" | "copy" | "create";

export interface SearchableEntity {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  keywords?: string[];
  payload?: unknown;
}

export interface CommandSearchResult {
  id: string;
  entity: SearchableEntity;
  score: number;
  actions: SearchResultAction[];
}

export type NotificationType = "info" | "success" | "warning" | "error";

export interface ConsoleNotification extends RepoRecord {
  id: string;
  entityType: "console.notification";
  schemaVersion: 1;
  syncScope: "account-sync" | "device-local";
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt?: string;
  sourcePlugin: string;
}

export interface GridItemSnapshot {
  id: string;
  title: string;
  path?: string;
  kind: "file" | "folder" | "app" | "url" | "unknown";
  gridId?: string;
}

export interface GridItemTaskDraft {
  title: string;
  description: string;
  source: "organizer-grid";
  sourceId: string;
  labels: string[];
}

export interface ConsoleDesktopEvent<TPayload = unknown> {
  type: string;
  payload: TPayload;
  createdAt: string;
}
