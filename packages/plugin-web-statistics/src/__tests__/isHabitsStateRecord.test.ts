import { describe, it, expect } from "vitest";
import {
  EMPTY_HABITS_STATE,
  isHabitsStateRecord,
} from "../internal/isHabitsStateRecord.js";
import { makeHabit } from "./__fixtures__/habits.js";

describe("isHabitsStateRecord", () => {
  it("V7: accepts the canonical shape", () => {
    expect(
      isHabitsStateRecord({
        schemaVersion: 1,
        habits: [makeHabit("h1", "💧", "Water", "饮水")],
        checkIns: { h1: { "2026-05-23": true } },
        diaries: {},
      }),
    ).toBe(true);
  });

  it("V8: rejects missing habits", () => {
    expect(
      isHabitsStateRecord({
        schemaVersion: 1,
        checkIns: {},
        diaries: {},
      }),
    ).toBe(false);
  });

  it("V9: rejects habits not array", () => {
    expect(
      isHabitsStateRecord({
        habits: "nope",
        checkIns: {},
        diaries: {},
      }),
    ).toBe(false);
  });

  it("V10: rejects checkIns not object", () => {
    expect(
      isHabitsStateRecord({
        habits: [],
        checkIns: 42,
        diaries: {},
      }),
    ).toBe(false);
  });

  it("V11: tolerates extra unknown fields", () => {
    expect(
      isHabitsStateRecord({
        habits: [],
        checkIns: {},
        diaries: {},
        somethingExtra: "ok",
        schemaVersion: 1,
      }),
    ).toBe(true);
  });

  it("V12: rejects null", () => {
    expect(isHabitsStateRecord(null)).toBe(false);
  });

  it("rejects when any habit fails the predicate", () => {
    expect(
      isHabitsStateRecord({
        habits: [{ id: "h1" /* missing emoji + title + createdAt */ }],
        checkIns: {},
        diaries: {},
      }),
    ).toBe(false);
  });

  it("EMPTY_HABITS_STATE is recognized as valid", () => {
    expect(isHabitsStateRecord(EMPTY_HABITS_STATE)).toBe(true);
  });
});
