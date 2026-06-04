import { describe, expect, test } from "vitest";
import * as Barrel from "../index.js";

describe("index barrel", () => {
  test("IB1 re-exports the documented public surface", () => {
    // Constants
    expect(Array.isArray(Barrel.LIST_COLOR_IDS)).toBe(true);
    expect(Array.isArray(Barrel.LIST_COLOR_PALETTE)).toBe(true);
    expect(typeof Barrel.BOARD_CARD_DND_MIME).toBe("string");

    // Guards
    expect(typeof Barrel.isBoard).toBe("function");
    expect(typeof Barrel.isBoardArray).toBe("function");
    expect(typeof Barrel.isBoardCard).toBe("function");
    expect(typeof Barrel.isBoardList).toBe("function");

    // Seed
    expect(typeof Barrel.makeDefaultBoards).toBe("function");
    expect(Array.isArray(Barrel.DEFAULT_WORKSPACES)).toBe(true);
    expect(Array.isArray(Barrel.BOARD_TEMPLATES)).toBe(true);
    expect(Array.isArray(Barrel.PM_LABELS)).toBe(true);
    expect(Array.isArray(Barrel.BOARD_MEMBER_OPTIONS)).toBe(true);

    // Helpers
    expect(typeof Barrel.addCardToList).toBe("function");
    expect(typeof Barrel.addNewList).toBe("function");
    expect(typeof Barrel.mergeBoardCardPatch).toBe("function");
    expect(typeof Barrel.moveCardToList).toBe("function");
    expect(typeof Barrel.normalizeBoardCardDetail).toBe("function");
    expect(typeof Barrel.setListColor).toBe("function");
    expect(typeof Barrel.updateCardInList).toBe("function");
    expect(typeof Barrel.compareIsoDateOnly).toBe("function");
    expect(typeof Barrel.formatIsoDateOnly).toBe("function");
    expect(typeof Barrel.getBoardCardDateCompatibilityPatch).toBe("function");
    expect(typeof Barrel.getBoardCardDateMeta).toBe("function");
    expect(typeof Barrel.isoDateFromOffset).toBe("function");
    expect(typeof Barrel.isIsoDateOnly).toBe("function");
    expect(typeof Barrel.normalizeBoardCardDates).toBe("function");
    expect(typeof Barrel.parseIsoDateOnly).toBe("function");

    // Persistence
    expect(typeof Barrel.loadBoardsOrDefault).toBe("function");
    expect(typeof Barrel.pickActiveBoard).toBe("function");

    // Components
    expect(typeof Barrel.BoardCard).toBe("function");
    expect(typeof Barrel.BoardList).toBe("function");
    expect(typeof Barrel.BoardView).toBe("function");
    expect(typeof Barrel.BoardModule).toBe("function");

    // Registration
    expect(typeof Barrel.boardCoreWebModuleRegistration).toBe("object");
    expect(Barrel.boardCoreWebModuleRegistration.moduleId).toBe("board");
  });

  test("IB2 BoardCard component identifier exists and is callable (not the schema type)", () => {
    // The schema type `BoardCard` is re-exported as `BoardCardData`; the
    // identifier `BoardCard` is the React component.
    expect(typeof Barrel.BoardCard).toBe("function");
  });
});
