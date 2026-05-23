import { describe, expect, test } from "vitest";
import {
  isBoard,
  isBoardArray,
  isBoardCard,
  isBoardList,
} from "../internal/isBoardArray.js";
import { makeDefaultBoards } from "../internal/seed/board-data.js";

describe("isBoardArray", () => {
  test("V1 isBoardArray(null) → false", () => {
    expect(isBoardArray(null)).toBe(false);
  });

  test("V2 isBoardArray([]) → true (empty is valid persisted shape)", () => {
    expect(isBoardArray([])).toBe(true);
  });

  test("V3 isBoardArray([{ id: 'x' }]) → false (missing required fields)", () => {
    expect(isBoardArray([{ id: "x" }])).toBe(false);
  });

  test("V4 isBoardArray('not array') → false", () => {
    expect(isBoardArray("not array")).toBe(false);
    expect(isBoardArray(42)).toBe(false);
    expect(isBoardArray(undefined)).toBe(false);
  });

  test("V5 isBoardArray(makeDefaultBoards()) → true", () => {
    expect(isBoardArray(makeDefaultBoards())).toBe(true);
  });

  test("V6 isBoard accepts a complete board", () => {
    const board = makeDefaultBoards()[0]!;
    expect(isBoard(board)).toBe(true);
  });

  test("V6b isBoard rejects a malformed board (bad template)", () => {
    const board = { ...makeDefaultBoards()[0]!, template: "unknown" };
    expect(isBoard(board)).toBe(false);
  });

  test("V7 isBoardList accepts a list with key + empty cards", () => {
    expect(
      isBoardList({
        id: "l1",
        key: "todo",
        cards: [],
      }),
    ).toBe(true);
  });

  test("V7b isBoardList accepts a list with key:null + customName + color", () => {
    expect(
      isBoardList({
        id: "l1",
        key: null,
        customName: { en: "C", zh: "自定义" },
        color: "blue",
        cards: [],
      }),
    ).toBe(true);
  });

  test("V7c isBoardList rejects list with invalid color id", () => {
    expect(
      isBoardList({
        id: "l1",
        key: null,
        color: "magenta", // not in LIST_COLOR_IDS
        cards: [],
      }),
    ).toBe(false);
  });

  test("V8 isBoardCard accepts minimal valid card", () => {
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
      }),
    ).toBe(true);
  });

  test("V8b isBoardCard accepts card with full optional set", () => {
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
        labels: ["l1"],
        members: ["u1"],
        checklist: { done: 1, total: 2 },
        due: "5/26",
        dueEn: "Today",
        start: "5/20",
        dueLate: true,
        attach: 2,
        cover: "linear-gradient(...)",
      }),
    ).toBe(true);
  });

  test("V8c isBoardCard rejects card with malformed checklist", () => {
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
        checklist: { done: "wrong" },
      }),
    ).toBe(false);
  });

  test("V8d isBoardCard rejects card missing title.zh", () => {
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a" },
      }),
    ).toBe(false);
  });
});
