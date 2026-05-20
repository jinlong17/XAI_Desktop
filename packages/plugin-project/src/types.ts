import type { RepoRecord } from "@repo/core-data";

export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ProjectList {
  id: string;
  title: string;
  order: number;
}

export interface Project extends RepoRecord {
  id: string;
  entityType: "project.project";
  schemaVersion: 1;
  name: string;
  lists: ProjectList[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Card extends RepoRecord {
  id: string;
  entityType: "project.card";
  schemaVersion: 1;
  title: string;
  listId: string;
  order: number;
  labels: string[];
  dueDate?: string;
  checklist: ChecklistItem[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt?: string;
}

export interface ProjectDraft {
  name: string;
  labels?: string[];
}

export interface CardDraft {
  title: string;
  listId: string;
  labels?: string[];
  dueDate?: string;
  description?: string;
}
