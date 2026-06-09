/**
 * isAiConvoRecord — boundary predicate widening the storage registry's
 * `AiConvo = unknown` to this row's local `AiConvoRecord` shape.
 *
 * Used at the localStorage read boundary to drop invalid entries silently.
 *
 * Design: packages/xai-web-ai-chat/docs/api.md §5.1
 */

import type { AiConvoRecord } from "../types.js";

const MAX_FIELD_LEN = 64;
const MAX_SUMMARY_LEN = 220;

function isMessageRecord(x: unknown) {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return false;
  const o = x as Record<string, unknown>;
  if (o.role !== "user" && o.role !== "assistant") return false;
  if (typeof o.text !== "string") return false;
  if (o.attachments !== null && !Array.isArray(o.attachments)) return false;
  if (Array.isArray(o.attachments) && !o.attachments.every((a) => typeof a === "string")) return false;
  return true;
}

export function isAiConvoRecord(x: unknown): x is AiConvoRecord {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string" || o.id.length === 0 || o.id.length > MAX_FIELD_LEN) return false;
  if (typeof o.title !== "string" || o.title.length > MAX_FIELD_LEN) return false;
  if (typeof o.time !== "string" || o.time.length > MAX_FIELD_LEN) return false;
  if (o.summary !== undefined && (typeof o.summary !== "string" || o.summary.length > MAX_SUMMARY_LEN)) return false;
  if (o.updatedAt !== undefined && typeof o.updatedAt !== "string") return false;
  if (o.activeAt !== undefined && typeof o.activeAt !== "string") return false;
  if (o.messages !== undefined && (!Array.isArray(o.messages) || !o.messages.every(isMessageRecord))) return false;
  return true;
}
