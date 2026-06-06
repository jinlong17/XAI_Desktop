import type { Board, BoardVisibility } from "../types.js";

export const BOARD_VISIBILITY_VALUES: readonly BoardVisibility[] = [
  "private",
  "shared",
] as const;

export function isBoardVisibility(value: unknown): value is BoardVisibility {
  return (
    typeof value === "string" &&
    (BOARD_VISIBILITY_VALUES as readonly string[]).includes(value)
  );
}

export function getBoardVisibility(
  board: Pick<Board, "visibility">,
): BoardVisibility {
  return isBoardVisibility(board.visibility) ? board.visibility : "private";
}

export function setBoardVisibility<T extends Board>(
  board: T,
  visibility: BoardVisibility,
): T {
  if (board.visibility === visibility) return board;
  if (board.visibility === undefined && visibility === "private") return board;
  return { ...board, visibility };
}
