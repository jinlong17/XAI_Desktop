/**
 * @internal — pure filter predicate types + applyFilter helper.
 *
 * Gap-closure row #6: Board Filter feature.
 * Canonical location: board-views (re-exported via index.ts for board-workspaces consumption).
 *
 * HC1: FilterState is render-only (no persistence, no localStorage).
 *      State is lifted into BoardWorkspacesModule and reset on activeBoard.id change.
 */

import type { BoardCardData, BoardListData } from "@repo/plugin-web-board-core";
import { getBoardCardDateMeta } from "@repo/plugin-web-board-core";

export interface FilterState {
  /** Empty Set = no label filter (all labels pass). */
  labels: ReadonlySet<string>;
  /** Empty Set = no member filter (all members pass). */
  members: ReadonlySet<string>;
  /** 'all' = no due filter. */
  dueRange: "all" | "overdue" | "today" | "week";
}

export const EMPTY_FILTER: FilterState = Object.freeze({
  labels: new Set<string>(),
  members: new Set<string>(),
  dueRange: "all",
});

/**
 * Pure helper. Returns a new BoardListData[] where each list's cards are
 * filtered by the predicate. Lists are preserved (empty lists OK).
 *
 * Predicate semantics (AND between facets, OR within each facet):
 * - labels: card passes if labels.size === 0 OR card.labels?.some(l => labels.has(l))
 * - members: card passes if members.size === 0 OR card.members?.some(m => members.has(m))
 * - dueRange: card passes if:
 *   - 'all' — always pass
 *   - 'overdue' — dueDate is before today
 *   - 'today' — dueDate matches today
 *   - 'week' — dueDate is inside [today, today+7) range
 *
 * @param now Injectable current date for testability. Defaults to new Date().
 */
export function applyFilter(
  lists: readonly BoardListData[],
  filter: FilterState,
  now?: Date,
): BoardListData[] {
  if (!Array.isArray(lists)) return [];

  const { labels, members, dueRange } = filter;

  // Fast-path: empty filter = identity
  if (labels.size === 0 && members.size === 0 && dueRange === "all") {
    return lists.map((l) => ({ ...l, cards: [...l.cards] }));
  }

  const today = now ?? new Date();

  return lists.map((list) => {
    const filteredCards = list.cards.filter((card: BoardCardData) => {
      // --- Labels facet ---
      if (labels.size > 0) {
        const hasMatchingLabel =
          Array.isArray(card.labels) &&
          card.labels.some((l: string) => labels.has(l));
        if (!hasMatchingLabel) return false;
      }

      // --- Members facet ---
      if (members.size > 0) {
        const hasMatchingMember =
          Array.isArray(card.members) &&
          card.members.some((m: string) => members.has(m));
        if (!hasMatchingMember) return false;
      }

      // --- Due range facet ---
      if (dueRange !== "all") {
        const dateMeta = getBoardCardDateMeta(card, { now: today });
        if (dueRange === "overdue") {
          if (!dateMeta.isOverdue) return false;
        } else if (dueRange === "today") {
          if (!dateMeta.isDueToday) return false;
        } else if (dueRange === "week") {
          if (!dateMeta.isWithinWeek) return false;
        }
      }

      return true;
    });

    return { ...list, cards: filteredCards };
  });
}
