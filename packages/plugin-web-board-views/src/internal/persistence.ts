/**
 * @internal — narrowing guard for the xai_board_view_by_id registry key.
 *
 * Codec: json, default: {}, shape: Record<string, BoardViewId>
 * Registered in packages/plugin-web-storage/src/internal/registry.ts (P3 edit).
 */

import type { BoardViewId } from "../types.js";

const VALID_VIEW_IDS = new Set<string>([
  "board",
  "table",
  "calendar",
  "dashboard",
  "timeline",
  "map",
]);

/**
 * Narrow the raw value from usePref("xai_board_view_by_id") to a typed map.
 * Returns {} on null, non-object, or wrong shape.
 */
export function loadViewByBoardIdOrEmpty(raw: unknown): Record<string, BoardViewId> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, BoardViewId> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string" && VALID_VIEW_IDS.has(v)) {
      result[k] = v as BoardViewId;
    }
  }
  return result;
}
