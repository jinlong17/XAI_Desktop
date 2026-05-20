import type { RepoRecord } from "@repo/core-data";

export type AiRole = "user" | "assistant" | "system";
export type AiActionKind = "create-todo" | "organize-desktop" | "summarize-clipboard";

export interface AiMessage extends RepoRecord {
  entityType: "ai-cube.message";
  role: AiRole;
  content: string;
  redacted: boolean;
  version: number;
  deletedAt?: string;
}

export interface ActionSuggestion {
  id: string;
  kind: AiActionKind;
  label: string;
  description: string;
}

export interface PrivacyReview {
  dataTypes: string[];
  scope: string;
  secretsDetected: string[];
  approved: boolean;
}

export interface CostGuardState {
  dailyLimit: number;
  usedToday: number;
  offline: boolean;
  lastResetDate?: string;
}

export interface CostUsage extends RepoRecord {
  entityType: "ai-cube.cost-usage";
  date: string;
  dailyLimit: number;
  used: number;
  offline: boolean;
  version: number;
  deletedAt?: string;
}

export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}
