import type { RepoRecord } from "@repo/core-data";

export interface Label extends RepoRecord {
  id: string;
  entityType: "labels.label";
  schemaVersion: 1;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt?: string;
}

export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface LabelDraft {
  name: string;
  color?: string;
  icon?: string;
}

export interface LabelStoreState {
  labels: Label[];
  recentLabelIds: string[];
  isLoading: boolean;
  error: string | null;
}

export interface LabelStoreActions {
  refresh(): Promise<void>;
  createLabel(input: LabelDraft): Promise<Label>;
  updateLabel(id: string, patch: Partial<Omit<Label, "id" | "createdAt">>): Promise<void>;
  deleteLabel(id: string): Promise<void>;
  markRecent(labelIds: string[]): void;
  getLabelById(id: string): Label | null;
}

export type LabelStore = LabelStoreState & LabelStoreActions;
