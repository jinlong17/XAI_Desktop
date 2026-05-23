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

export function isAiConvoRecord(x: unknown): x is AiConvoRecord {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string" || o.id.length === 0 || o.id.length > MAX_FIELD_LEN) return false;
  if (typeof o.title !== "string" || o.title.length > MAX_FIELD_LEN) return false;
  if (typeof o.time !== "string" || o.time.length > MAX_FIELD_LEN) return false;
  return true;
}
