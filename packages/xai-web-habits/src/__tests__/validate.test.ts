/**
 * AC-VAL-1..6: isHabit and validateHabitsState unit tests.
 */
import { describe, it, expect } from "vitest";
import { isHabit, validateHabitsState } from "../internal/validate.js";

const validHabit = {
  id: "h_x",
  emoji: "🌱",
  title: { en: "A", zh: "甲" },
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("isHabit", () => {
  it("AC-VAL-1: accepts a minimal valid object", () => {
    expect(isHabit(validHabit)).toBe(true);
  });

  it("AC-VAL-2: rejects missing title.zh", () => {
    expect(isHabit({ ...validHabit, title: { en: "A" } })).toBe(false);
  });

  it("AC-VAL-3: rejects non-string id", () => {
    expect(isHabit({ ...validHabit, id: 0 })).toBe(false);
  });

  it("rejects null", () => {
    expect(isHabit(null)).toBe(false);
  });

  it("rejects missing emoji", () => {
    const { emoji: _e, ...rest } = validHabit;
    expect(isHabit(rest)).toBe(false);
  });
});

describe("validateHabitsState", () => {
  const validState = {
    schemaVersion: 1 as const,
    habits: [validHabit],
    checkIns: {},
    diaries: {},
  };

  it("AC-VAL-4: accepts a clean blob", () => {
    const result = validateHabitsState(validState);
    expect(result.schemaVersion).toBe(1);
    expect(result.habits).toHaveLength(1);
  });

  it("AC-VAL-5: returns default when checkIns is an array", () => {
    const bad = { ...validState, checkIns: [] };
    const result = validateHabitsState(bad);
    expect(result.habits).toHaveLength(0);
    expect(result.checkIns).toEqual({});
  });

  it("AC-VAL-6: returns default for schemaVersion !== 1", () => {
    const bad = { ...validState, schemaVersion: 99 };
    const result = validateHabitsState(bad);
    expect(result.habits).toHaveLength(0);
  });

  it("returns default for null", () => {
    const result = validateHabitsState(null);
    expect(result.schemaVersion).toBe(1);
    expect(result.habits).toHaveLength(0);
  });

  it("returns default for non-object", () => {
    expect(validateHabitsState("not-json").habits).toHaveLength(0);
  });
});
