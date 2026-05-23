/**
 * @repo/plugin-web-ai-chat — public type definitions.
 *
 * API contract: packages/xai-web-ai-chat/docs/api.md §3
 */

export type AiMessageRole = "user" | "assistant";

export interface AiAttachment {
  name: string;
  size: number;
}

export interface AiMessage {
  role: AiMessageRole;
  text: string;
  /** Attachment names attached to a user message. null if none. */
  attachments: string[] | null;
}

export interface AiConvoRecord {
  /** Unique id. "c-" + base36 timestamp for runtime entries. */
  id: string;
  /** First user-message slice (length 0..32). */
  title: string;
  /** Free-form display label — "刚刚"/"Just now"/"5/19" etc. */
  time: string;
}

export type AiModelId = "haiku" | "sonnet" | "opus";
