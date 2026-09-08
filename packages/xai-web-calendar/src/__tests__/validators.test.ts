/**
 * validators.test — AC-VALIDATE-1..7 + supporting cases.
 *
 * Pure function exercised in isolation; no React tree.
 */

import { describe, it, expect } from "vitest";
import {
  validateUserCalEvent,
  isMultiDay,
  multiDayError,
  type UserCalEventDraft,
} from "../internal/eventStore/validators.js";

function valid(): UserCalEventDraft {
  return {
    title: "OK",
    date: "2026-05-22",
    startTime: "09:00",
    endTime: "10:00",
    colorPreset: "mint",
    recurrence: null,
  };
}

describe("validateUserCalEvent", () => {
  it("AC-VALIDATE-1: empty title → REQUIRED error", () => {
    const errors = validateUserCalEvent({ ...valid(), title: "   " });
    expect(errors.some((e) => e.code === "REQUIRED" && e.field === "title")).toBe(true);
  });

  it("AC-VALIDATE-2: endTime before startTime → END_BEFORE_START", () => {
    const errors = validateUserCalEvent({ ...valid(), startTime: "10:00", endTime: "09:00" });
    expect(errors.some((e) => e.code === "END_BEFORE_START")).toBe(true);
  });

  it("AC-VALIDATE-3: <5 min duration → MIN_DURATION", () => {
    const errors = validateUserCalEvent({ ...valid(), startTime: "09:00", endTime: "09:04" });
    expect(errors.some((e) => e.code === "MIN_DURATION")).toBe(true);
  });

  it("exactly 5 min duration → no error", () => {
    const errors = validateUserCalEvent({ ...valid(), startTime: "09:00", endTime: "09:05" });
    expect(errors).toHaveLength(0);
  });

  it("AC-VALIDATE-4: malformed startTime → INVALID_FORMAT", () => {
    const errors = validateUserCalEvent({ ...valid(), startTime: "9am" });
    expect(errors.some((e) => e.code === "INVALID_FORMAT" && e.field === "startTime")).toBe(true);
  });

  it("AC-VALIDATE-4: malformed endTime → INVALID_FORMAT", () => {
    const errors = validateUserCalEvent({ ...valid(), endTime: "10" });
    expect(errors.some((e) => e.code === "INVALID_FORMAT" && e.field === "endTime")).toBe(true);
  });

  it("AC-VALIDATE-5: past date → no error", () => {
    const errors = validateUserCalEvent({ ...valid(), date: "2020-01-01" });
    expect(errors).toHaveLength(0);
  });

  it("AC-VALIDATE-6: all-day attempt (00:00 → 23:59) → no error", () => {
    const errors = validateUserCalEvent({ ...valid(), startTime: "00:00", endTime: "23:59" });
    expect(errors).toHaveLength(0);
  });

  it("bilingual messages present on every error", () => {
    const errors = validateUserCalEvent({ ...valid(), title: "", startTime: "9", endTime: "0" });
    expect(errors.length).toBeGreaterThan(0);
    for (const err of errors) {
      expect(err.message.en.length).toBeGreaterThan(0);
      expect(err.message.zh.length).toBeGreaterThan(0);
    }
  });
});

describe("isMultiDay + multiDayError", () => {
  it("AC-VALIDATE-7: cross-day ISO pair → isMultiDay true + MULTI_DAY error", () => {
    expect(isMultiDay("2026-05-22T23:30", "2026-05-23T00:30")).toBe(true);
    const err = multiDayError();
    expect(err.code).toBe("MULTI_DAY");
    expect(err.field).toBe("endTime");
    expect(err.message.en.length).toBeGreaterThan(0);
    expect(err.message.zh.length).toBeGreaterThan(0);
  });

  it("same-day ISO pair → isMultiDay false", () => {
    expect(isMultiDay("2026-05-22T00:00", "2026-05-22T23:59")).toBe(false);
  });
});
