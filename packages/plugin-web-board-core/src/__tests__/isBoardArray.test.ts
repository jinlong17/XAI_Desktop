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
        description: "Detail text",
        labels: ["l1"],
        members: ["u1"],
        checklist: { done: 1, total: 2 },
        checklistItems: [
          { id: "i1", text: "Item 1", done: true },
          { id: "i2", text: "Item 2", done: false },
        ],
        attachments: [
          { id: "a1", url: "https://example.com", title: "Spec" },
        ],
        activity: [
          {
            id: "act1",
            kind: "note",
            body: "Updated",
            createdAt: "2026-06-03T00:00:00.000Z",
          },
        ],
        due: "5/26",
        dueEn: "Today",
        start: "5/20",
        startDate: "2026-05-20",
        dueDate: "2026-05-26",
        dueLate: true,
        attach: 2,
        cover: "linear-gradient(...)",
      }),
    ).toBe(true);
  });

  test("V8bb isBoardCard rejects malformed detail arrays", () => {
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
        checklistItems: [{ id: "i1", text: "Missing done" }],
      }),
    ).toBe(false);
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
        attachments: [{ id: "a1" }],
      }),
    ).toBe(false);
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
        dueDate: "05/26/2026",
      }),
    ).toBe(false);
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

  // BCV1..BCV4 — gap-closure row #6 (BoardCard.location? additive extension)
  test("BCV1 isBoardCard accepts card with valid location { lat, lng, label }", () => {
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
        location: { lat: 40.7128, lng: -74.006, label: "New York" },
      }),
    ).toBe(true);
  });

  test("BCV2 isBoardCard accepts card with valid location { lat, lng } (no label)", () => {
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
        location: { lat: 35.6762, lng: 139.6503 },
      }),
    ).toBe(true);
  });

  test("BCV3 isBoardCard rejects card with NaN location.lat", () => {
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
        location: { lat: NaN, lng: 0 },
      }),
    ).toBe(false);
  });

  test("BCV4 isBoardCard rejects card with out-of-range location.lng", () => {
    expect(
      isBoardCard({
        id: "c1",
        title: { en: "a", zh: "b" },
        location: { lat: 0, lng: 200 },
      }),
    ).toBe(false);
  });
});
