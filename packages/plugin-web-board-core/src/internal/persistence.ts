/**
 * Persistence helpers — narrow `usePref("xai_boards_v2")` reads from
 * `unknown` (the registry's `BoardsState` type) into `Board[]` and pick the
 * active board safely when the persisted `xai_active_board` id is stale.
 */

import type { Board } from "../types.js";
import { isBoardArray } from "./isBoardArray.js";
import { makeDefaultBoards } from "./seed/board-data.js";

/**
 * Read boards from a `usePref("xai_boards_v2")` raw value.
 *
 *  - `null` (registry default) → seed
 *  - non-array / malformed shape → seed
 *  - empty array → seed (a freshly persisted empty array indicates wipe; we
 *    refuse to render a "no boards" empty state in row #7)
 *  - valid `Board[]` → identity-preserved (no copy)
 */
export function loadBoardsOrDefault(raw: unknown): Board[] {
  if (!isBoardArray(raw)) {
    return makeDefaultBoards();
  }
  if (raw.length === 0) {
    return makeDefaultBoards();
  }
  return raw;
}

/**
 * Pick the active board by id; falls back to `boards[0]` when the id is
 * unknown or empty. Throws if `boards` is empty (callers must guarantee a
 * non-empty list via `loadBoardsOrDefault`).
 */
export function pickActiveBoard(
  boards: readonly Board[],
  activeId: string,
): Board {
  if (boards.length === 0) {
    throw new Error(
      "[plugin-web-board-core] pickActiveBoard called with empty boards array — call loadBoardsOrDefault first.",
    );
  }
  if (activeId) {
    const match = boards.find((board) => board.id === activeId);
    if (match) return match;
  }
  return boards[0]!;
}
