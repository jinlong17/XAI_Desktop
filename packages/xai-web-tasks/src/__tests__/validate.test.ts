/**
 * validate.test.ts — T-VAL-1..4
 *
 * Phase: P2
 */

import { describe, it, expect } from "vitest";
import { isTaskColsArray, isTaskCard } from "../internal/validate.js";
import { SEED_TASK_COLS } from "../internal/seed/tasksMock.js";

describe("isTaskColsArray", () => {
  // T-VAL-1: null / {} / [] / SEED_TASK_COLS
  it("T-VAL-1: null → false, {} → false, [] → false, SEED_TASK_COLS → true", () => {
    expect(isTaskColsArray(null)).toBe(false);
    expect(isTaskColsArray({})).toBe(false);
    expect(isTaskColsArray([])).toBe(false);
    expect(isTaskColsArray(SEED_TASK_COLS)).toBe(true);
  });

  // T-VAL-2: wrong length
  it("T-VAL-2: array of length ≠ 4 → false", () => {
    expect(isTaskColsArray([1, 2, 3])).toBe(false);
    expect(isTaskColsArray([1, 2, 3, 4, 5])).toBe(false);
  });

  // T-VAL-3: wrong bucket ids
  it("T-VAL-3: array with wrong bucket id → false", () => {
    const bad = JSON.parse(JSON.stringify(SEED_TASK_COLS)) as typeof SEED_TASK_COLS;
    // Mutate the first element's id
    (bad[0] as { id: string }).id = "WRONG";
    expect(isTaskColsArray(bad)).toBe(false);
  });

  // Additional: non-array value
  it("T-VAL-1b: string → false, number → false", () => {
    expect(isTaskColsArray("hello")).toBe(false);
    expect(isTaskColsArray(42)).toBe(false);
  });
});

describe("isTaskCard", () => {
  // T-VAL-4: seed task → true; {id:1,title:{}} → false
  it("T-VAL-4: SEED_TASK_COLS[0].tasks[0] → true; {id:1,title:{}} → false", () => {
    const seedTask = SEED_TASK_COLS[0]!.tasks[0];
    expect(isTaskCard(seedTask)).toBe(true);
    expect(isTaskCard({ id: 1, title: {} })).toBe(false);
  });

  it("T-VAL-4b: missing title.en → false; missing title.zh → false", () => {
    expect(isTaskCard({ id: "x", title: { en: "yes" } })).toBe(false);
    expect(isTaskCard({ id: "x", title: { zh: "是" } })).toBe(false);
  });

  it("T-VAL-4c: valid minimal card → true", () => {
    expect(isTaskCard({ id: "x", title: { en: "Test", zh: "测试" } })).toBe(true);
  });

  it("T-VAL-4d: valid board source → true; malformed board source → false", () => {
    const task = {
      id: "bt-b1-c1",
      title: { en: "Linked", zh: "Linked" },
      source: {
        type: "board-card",
        boardId: "b1",
        listId: "l1",
        cardId: "c1",
      },
    };
    expect(isTaskCard(task)).toBe(true);
    expect(
      isTaskCard({
        ...task,
        source: { type: "board-card", boardId: "", listId: "l1", cardId: "c1" },
      }),
    ).toBe(false);
  });
});
