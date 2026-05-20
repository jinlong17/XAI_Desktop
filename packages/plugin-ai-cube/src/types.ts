import type { RepoRecord } from "@repo/core-data";

export type AiRole = "user" | "assistant" | "system";
export type AiActionKind = "create-todo" | "organize-desktop" | "summarize-clipboard";

export interface AiMessage extends RepoRecord {
  entityType: "ai-cube.message";
  role: AiRole;
  content: string;
  redacted: boolean;
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
