import { describe, expect, test } from "vitest";
import {
  BOARD_VISIBILITY_VALUES,
  getBoardVisibility,
  isBoardVisibility,
  setBoardVisibility,
} from "../internal/boardVisibility.js";
import { makeDefaultBoards } from "../internal/seed/board-data.js";

describe("boardVisibility", () => {
  test("BV-1 exposes the closed visibility set", () => {
    expect(BOARD_VISIBILITY_VALUES).toEqual(["private", "shared"]);
    expect(isBoardVisibility("private")).toBe(true);
    expect(isBoardVisibility("shared")).toBe(true);
    expect(isBoardVisibility("team")).toBe(false);
  });

  test("BV-2 resolves missing legacy visibility to private", () => {
    expect(getBoardVisibility(makeDefaultBoards()[0]!)).toBe("private");
  });

  test("BV-3 setBoardVisibility writes shared and preserves no-op references", () => {
    const board = makeDefaultBoards()[0]!;
    const shared = setBoardVisibility(board, "shared");
    expect(shared).not.toBe(board);
    expect(shared.visibility).toBe("shared");
    expect(setBoardVisibility(shared, "shared")).toBe(shared);
  });

  test("BV-4 setting private on a legacy private board is a no-op", () => {
    const board = makeDefaultBoards()[0]!;
    expect(setBoardVisibility(board, "private")).toBe(board);
  });
});
