/**
 * validate.ts — boundary guards for persistence data.
 *
 * isTaskColsArray: validates usePref("xai_task_cols") raw value.
 * isTaskCard: validates individual task card objects.
 *
 * API contract: packages/xai-web-tasks/docs/api.md §5.4 + §5.5
 * Design: packages/xai-web-tasks/docs/design.md §6 (A1 persistence)
 *
 * @internal
 */

import type { TaskCard, TaskCol, BucketId } from "../types.js";

const VALID_BUCKET_IDS = new Set<BucketId>(["overdue", "next7", "later", "nodate"]);
const BUCKET_KEY_MAP: Record<BucketId, string> = {
  overdue:  "overdue",
  next7:    "next_7_days",
  later:    "later",
  nodate:   "no_date",
};
const VALID_PRIORITIES = new Set(["low", "normal", "high", "urgent"]);

/**
 * Returns true iff `value` is a valid TaskCard object.
 *
 * T-VAL-4: isTaskCard(seedTask) is true; isTaskCard({id:1,title:{}}) is false.
 */
export function isTaskCard(value: unknown): value is TaskCard {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  if (typeof v["id"] !== "string" || v["id"].length === 0) return false;

  // title must have non-empty string en + zh
  const title = v["title"];
  if (!title || typeof title !== "object") return false;
  const titleObj = title as Record<string, unknown>;
  if (typeof titleObj["en"] !== "string" || typeof titleObj["zh"] !== "string") return false;

  // Optional fields — check type when present
  if ("sub" in v && v["sub"] !== undefined) {
    const sub = v["sub"] as Record<string, unknown>;
    if (typeof sub["en"] !== "string" || typeof sub["zh"] !== "string") return false;
  }
  if ("tag" in v && v["tag"] !== undefined) {
    if (typeof v["tag"] !== "string" || v["tag"].length === 0) return false;
  }
  if ("tags" in v && v["tags"] !== undefined) {
    if (!Array.isArray(v["tags"])) return false;
    for (const tag of v["tags"] as unknown[]) {
      if (typeof tag !== "string" || tag.length === 0) return false;
    }
  }
  if ("listId" in v && v["listId"] !== undefined) {
    if (typeof v["listId"] !== "string" || v["listId"].length === 0) return false;
  }
  if ("priority" in v && v["priority"] !== undefined) {
    if (!VALID_PRIORITIES.has(v["priority"] as string)) return false;
  }
  if ("notes" in v && v["notes"] !== undefined) {
    if (typeof v["notes"] !== "string") return false;
  }
  if ("source" in v && v["source"] !== undefined) {
    const source = v["source"];
    if (!source || typeof source !== "object") return false;
    const sourceObj = source as Record<string, unknown>;
    if (sourceObj["type"] !== "board-card") return false;
    if (typeof sourceObj["boardId"] !== "string" || sourceObj["boardId"].length === 0) return false;
    if (typeof sourceObj["listId"] !== "string" || sourceObj["listId"].length === 0) return false;
    if (typeof sourceObj["cardId"] !== "string" || sourceObj["cardId"].length === 0) return false;
  }
  // Keep malformed string dates visible in All for manual repair; selectors reject them.
  if (v["dueDate"] !== undefined && typeof v["dueDate"] !== "string") return false;
  if ("date" in v && v["date"] !== undefined) {
    if (typeof v["date"] !== "string") return false;
  }
  if ("dateZh" in v && v["dateZh"] !== undefined) {
    if (typeof v["dateZh"] !== "string") return false;
  }
  if ("dateLabel" in v && v["dateLabel"] !== undefined) {
    const dl = v["dateLabel"] as Record<string, unknown>;
    if (typeof dl["en"] !== "string" || typeof dl["zh"] !== "string") return false;
  }
  if ("inbox" in v && v["inbox"] !== undefined) {
    if (typeof v["inbox"] !== "boolean") return false;
  }
  if ("done" in v && v["done"] !== undefined) {
    if (typeof v["done"] !== "boolean") return false;
  }

  return true;
}

/**
 * Returns true iff `value` is a valid TaskCol[] array of length 4 with the
 * correct bucket ids in order.
 *
 * T-VAL-1..3: covers null / {} / [] / wrong-length / wrong-ids / SEED_TASK_COLS.
 */
export function isTaskColsArray(value: unknown): value is TaskCol[] {
  if (!Array.isArray(value)) return false;
  if (value.length !== 4) return false;

  const expectedIds: BucketId[] = ["overdue", "next7", "later", "nodate"];
  for (let i = 0; i < 4; i++) {
    const col = value[i] as Record<string, unknown>;
    if (!col || typeof col !== "object") return false;
    const id = col["id"] as BucketId;
    if (!VALID_BUCKET_IDS.has(id)) return false;
    if (id !== expectedIds[i]) return false;
    if (col["key"] !== BUCKET_KEY_MAP[id]) return false;
    if (typeof col["count"] !== "number") return false;
    if (!Array.isArray(col["tasks"])) return false;
    for (const task of col["tasks"] as unknown[]) {
      if (!isTaskCard(task)) return false;
    }
    if ("completed" in col && col["completed"] !== undefined) {
      if (!Array.isArray(col["completed"])) return false;
      for (const task of col["completed"] as unknown[]) {
        if (!isTaskCard(task)) return false;
      }
    }
  }
  return true;
}
