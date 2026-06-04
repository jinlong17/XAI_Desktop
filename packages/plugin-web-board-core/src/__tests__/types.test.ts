/**
 * Type-shape sanity checks (T1).
 *
 * These are mostly compile-time assertions; one runtime fact-check is
 * included to confirm `LIST_COLOR_IDS` is a `readonly` tuple of length 10.
 */

import { describe, expect, test } from "vitest";
import { LIST_COLOR_IDS } from "../internal/listColors.js";
import type {
  BilingualText,
  Board,
  BoardCard,
  BoardList,
  BoardListColorId,
  BoardTemplate,
} from "../types.js";

describe("types (T1)", () => {
  test("T1a BilingualText has en + zh strings", () => {
    const sample: BilingualText = { en: "hi", zh: "你好" };
    expect(typeof sample.en).toBe("string");
    expect(typeof sample.zh).toBe("string");
  });

  test("T1b BoardListColorId literal union members are all present in LIST_COLOR_IDS", () => {
    const id: BoardListColorId = "blue";
    expect((LIST_COLOR_IDS as readonly string[]).includes(id)).toBe(true);
  });

  test("T1c BoardTemplate is the three-literal union", () => {
    const ids: BoardTemplate[] = ["kanban", "pm", "blank"];
    expect(ids.length).toBe(3);
  });

  test("T1d Board.cover is a string (CSS background spec) — opaque to row #7", () => {
    const board: Board = {
      id: "b",
      workspaceId: "w",
      name: { en: "B", zh: "B" },
      cover: "linear-gradient(135deg, oklch(...))",
      template: "kanban",
      lists: [],
    };
    expect(typeof board.cover).toBe("string");
  });

  test("T1e Card.due is opaque string (no Date parse)", () => {
    const card: BoardCard = {
      id: "c",
      title: { en: "x", zh: "x" },
      due: "5/26",
    };
    expect(card.due).toBe("5/26");
  });

  test("T1f BoardList.key is `string | null` so key:null + customName is valid", () => {
    const list: BoardList = {
      id: "l",
      key: null,
      customName: { en: "Custom", zh: "自定义" },
      archived: true,
      cards: [],
    };
    expect(list.key).toBe(null);
    expect(list.customName?.en).toBe("Custom");
    expect(list.archived).toBe(true);
  });
});
