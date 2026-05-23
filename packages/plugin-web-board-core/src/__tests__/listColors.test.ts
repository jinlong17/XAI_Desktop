import { describe, expect, test } from "vitest";
import { LIST_COLOR_IDS, LIST_COLOR_PALETTE } from "../internal/listColors.js";

describe("listColors", () => {
  test("C1 LIST_COLOR_IDS.length === 10", () => {
    expect(LIST_COLOR_IDS.length).toBe(10);
  });

  test("C2 every id in LIST_COLOR_IDS appears exactly once in LIST_COLOR_PALETTE", () => {
    const paletteIds = LIST_COLOR_PALETTE.map((entry) => entry.id);
    expect(paletteIds.length).toBe(LIST_COLOR_IDS.length);
    for (const id of LIST_COLOR_IDS) {
      expect(paletteIds.filter((p) => p === id).length).toBe(1);
    }
  });

  test("C3 every LIST_COLOR_PALETTE entry has cssVar starting with var(--board-list-color-", () => {
    for (const entry of LIST_COLOR_PALETTE) {
      expect(entry.cssVar.startsWith("var(--board-list-color-")).toBe(true);
      expect(entry.cssVar.endsWith(")")).toBe(true);
    }
  });

  test("C4 LIST_COLOR_IDS exact order matches prototype module-board.jsx lines 13–24", () => {
    expect(LIST_COLOR_IDS).toEqual([
      "green",
      "yellow",
      "orange",
      "red",
      "purple",
      "blue",
      "teal",
      "lime",
      "pink",
      "gray",
    ]);
  });
});
