/**
 * @internal — Board saved-filter storage boundary.
 *
 * Persisted filters use arrays because JSON cannot encode Set. Runtime keeps
 * the existing board-views FilterState shape.
 */

import type { FilterState } from "@repo/plugin-web-board-views";
import { EMPTY_FILTER } from "@repo/plugin-web-board-views";

export type BoardFilterDueRange = FilterState["dueRange"];

export interface SavedBoardFilter {
  labels: string[];
  members: string[];
  dueRange: BoardFilterDueRange;
}

export type SavedBoardFilterById = Record<string, SavedBoardFilter>;

const DUE_RANGES = ["all", "overdue", "today", "week"] as const;
const EMPTY_SAVED_FILTER: SavedBoardFilter = Object.freeze({
  labels: [],
  members: [],
  dueRange: "all",
});

function isDueRange(value: unknown): value is BoardFilterDueRange {
  return typeof value === "string" && DUE_RANGES.includes(value as BoardFilterDueRange);
}

function sortedUniqueStrings(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return Array.from(
    new Set(
      value.filter((item): item is string => typeof item === "string" && item.length > 0),
    ),
  ).sort();
}

function readStringArrayProp(
  value: Record<string, unknown>,
  key: "labels" | "members",
): string[] | null {
  if (value[key] === undefined) return [];
  return sortedUniqueStrings(value[key]);
}

export function isEmptyFilterState(filter: FilterState): boolean {
  return filter.labels.size === 0 && filter.members.size === 0 && filter.dueRange === "all";
}

export function serializeFilterState(filter: FilterState): SavedBoardFilter {
  if (isEmptyFilterState(filter)) return { ...EMPTY_SAVED_FILTER };
  return {
    labels: Array.from(filter.labels).filter(Boolean).sort(),
    members: Array.from(filter.members).filter(Boolean).sort(),
    dueRange: filter.dueRange,
  };
}

export function filterStateFromSavedFilter(saved: SavedBoardFilter): FilterState {
  if (
    saved.labels.length === 0 &&
    saved.members.length === 0 &&
    saved.dueRange === "all"
  ) {
    return EMPTY_FILTER;
  }
  return {
    labels: new Set(saved.labels),
    members: new Set(saved.members),
    dueRange: saved.dueRange,
  };
}

export function loadSavedBoardFilters(raw: unknown): SavedBoardFilterById {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const result: SavedBoardFilterById = {};
  for (const [boardId, value] of Object.entries(raw)) {
    if (!boardId || !value || typeof value !== "object" || Array.isArray(value)) {
      continue;
    }
    const record = value as Record<string, unknown>;
    const labels = readStringArrayProp(record, "labels");
    const members = readStringArrayProp(record, "members");
    if (!labels || !members) continue;

    result[boardId] = {
      labels,
      members,
      dueRange: isDueRange(record.dueRange) ? record.dueRange : "all",
    };
  }
  return result;
}

export function filterStateForBoard(
  filtersById: SavedBoardFilterById,
  boardId: string,
): FilterState {
  const saved = filtersById[boardId];
  return saved ? filterStateFromSavedFilter(saved) : EMPTY_FILTER;
}

export function setSavedFilterForBoard(
  filtersById: SavedBoardFilterById,
  boardId: string,
  filter: FilterState,
): SavedBoardFilterById {
  if (!boardId) return filtersById;
  return {
    ...filtersById,
    [boardId]: serializeFilterState(filter),
  };
}
