/**
 * seed.test.ts — T-SEED-1..4
 *
 * Validates the typed seed data against the prototype's MOCK.taskCols.
 * Phase: P1
 */

import { describe, it, expect } from "vitest";
import { SEED_TASK_COLS } from "../internal/seed/tasksMock.js";

describe("SEED_TASK_COLS", () => {
  // T-SEED-1: length 4, ids in correct order
  it("T-SEED-1: has 4 columns with ids [overdue, next7, later, nodate] in order", () => {
    expect(SEED_TASK_COLS.length).toBe(4);
    const ids = SEED_TASK_COLS.map((c) => c.id);
    expect(ids).toEqual(["overdue", "next7", "later", "nodate"]);
  });

  // T-SEED-2: active task count matches prototype (10 + 2 + 13 + 1 = 26)
  it("T-SEED-2: total active tasks across all columns is 26", () => {
    const total = SEED_TASK_COLS.reduce((sum, col) => sum + col.tasks.length, 0);
    expect(total).toBe(26);
  });

  // T-SEED-3: nodate completed group has 6 items
  it("T-SEED-3: nodate completed group has 6 tasks", () => {
    const nodate = SEED_TASK_COLS.find((c) => c.id === "nodate");
    expect(nodate?.completed?.length).toBe(6);
  });

  // T-SEED-4: every task title bundle has non-empty en and zh strings (bilingual parity)
  it("T-SEED-4: every task title has non-empty en and zh strings", () => {
    for (const col of SEED_TASK_COLS) {
      for (const task of col.tasks) {
        expect(task.title.en.length).toBeGreaterThan(0);
        expect(task.title.zh.length).toBeGreaterThan(0);
      }
      if (col.completed) {
        for (const task of col.completed) {
          expect(task.title.en.length).toBeGreaterThan(0);
          expect(task.title.zh.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
