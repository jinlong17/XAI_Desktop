/**
 * V1..V8 — isPomodoroSession predicate tests.
 * test.md §2
 */

import { describe, it, expect } from "vitest";
import { isPomodoroSession } from "../internal/validate.js";
import { FIXTURE_FOCUS_TODAY, FIXTURE_INVALID } from "../__fixtures__/sessions.js";

const VALID: unknown = FIXTURE_FOCUS_TODAY;

describe("isPomodoroSession", () => {
  // V1: accepts a valid session
  it("V1: accepts a valid session", () => {
    expect(isPomodoroSession(VALID)).toBe(true);
  });

  // V2: rejects missing id
  it("V2: rejects missing id", () => {
    const { id: _id, ...rest } = FIXTURE_FOCUS_TODAY;
    expect(isPomodoroSession(rest)).toBe(false);
  });

  // V3: rejects missing mode
  it("V3: rejects missing mode", () => {
    const { mode: _m, ...rest } = FIXTURE_FOCUS_TODAY;
    expect(isPomodoroSession(rest)).toBe(false);
  });

  // V4: rejects invalid mode literal
  it("V4: rejects invalid mode literal", () => {
    expect(isPomodoroSession({ ...FIXTURE_FOCUS_TODAY, mode: "work" })).toBe(false);
  });

  // V5: rejects missing startedAt
  it("V5: rejects missing startedAt", () => {
    const { startedAt: _s, ...rest } = FIXTURE_FOCUS_TODAY;
    expect(isPomodoroSession(rest)).toBe(false);
  });

  // V6: rejects missing finishedAt (matches FIXTURE_INVALID)
  it("V6: rejects missing finishedAt", () => {
    expect(isPomodoroSession(FIXTURE_INVALID)).toBe(false);
  });

  // V7: rejects durationMs as non-number
  it("V7: rejects durationMs as non-number", () => {
    expect(isPomodoroSession({ ...FIXTURE_FOCUS_TODAY, durationMs: "1500000" })).toBe(false);
  });

  // V8: rejects completed as non-boolean
  it("V8: rejects completed as non-boolean", () => {
    expect(isPomodoroSession({ ...FIXTURE_FOCUS_TODAY, completed: 1 })).toBe(false);
  });

  // Extra: tolerates extra fields
  it("extra fields are tolerated", () => {
    expect(isPomodoroSession({ ...FIXTURE_FOCUS_TODAY, extra: "field" })).toBe(true);
  });

  // Extra: rejects null
  it("rejects null", () => {
    expect(isPomodoroSession(null)).toBe(false);
  });

  // Extra: rejects non-object
  it("rejects primitive", () => {
    expect(isPomodoroSession(42)).toBe(false);
  });
});
