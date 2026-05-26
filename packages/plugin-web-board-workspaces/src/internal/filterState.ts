/**
 * @internal — FilterState re-export + toggler helpers.
 *
 * Gap-closure row #6: Board Filter feature.
 * REC-1 check: this file re-exports from board-views (package barrel), not
 * from board-views' internal/filter.ts directly → NO circular dependency.
 *
 * Dependency chain (one-way):
 *   board-workspaces → board-views (barrel) → board-views/internal/filter.ts
 * board-workspaces does NOT export anything that board-views imports. Safe.
 */

import type { FilterState } from "@repo/plugin-web-board-views";
import { EMPTY_FILTER } from "@repo/plugin-web-board-views";

// Re-export for convenience at board-workspaces import sites
export type { FilterState };
export { EMPTY_FILTER };

/**
 * Toggle a label id in the filter's labels Set.
 * If the id is already present, remove it. If absent, add it.
 * Returns a new FilterState (immutable).
 */
export function toggleLabel(filter: FilterState, labelId: string): FilterState {
  const next = new Set(filter.labels);
  if (next.has(labelId)) {
    next.delete(labelId);
  } else {
    next.add(labelId);
  }
  return { ...filter, labels: next };
}

/**
 * Toggle a member id in the filter's members Set.
 * If the id is already present, remove it. If absent, add it.
 * Returns a new FilterState (immutable).
 */
export function toggleMember(filter: FilterState, memberId: string): FilterState {
  const next = new Set(filter.members);
  if (next.has(memberId)) {
    next.delete(memberId);
  } else {
    next.add(memberId);
  }
  return { ...filter, members: next };
}

/**
 * Set the dueRange facet. Returns a new FilterState.
 */
export function setDueRange(filter: FilterState, dueRange: FilterState["dueRange"]): FilterState {
  return { ...filter, dueRange };
}

/**
 * Reset filter to EMPTY_FILTER. Returns reference-equal EMPTY_FILTER.
 */
export function clearFilter(_filter: FilterState): FilterState {
  return EMPTY_FILTER;
}
