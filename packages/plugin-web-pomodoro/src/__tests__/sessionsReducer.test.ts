/**
 * R1..R5 — sessionsReducer pure function tests.
 * test.md §2
 */

import { describe, it, expect } from "vitest";
import { appendSession, newSessionId } from "../internal/sessionsReducer.js";
import { FIXTURE_FOCUS_TODAY, FIXTURE_FOCUS_YESTERDAY } from "../__fixtures__/sessions.js";

describe("appendSession", () => {
  // R1: appends to end
  it("R1: appends session to the end of the array", () => {
    const prev = [FIXTURE_FOCUS_YESTERDAY];
    const result = appendSession(prev, FIXTURE_FOCUS_TODAY);
    expect(result).toHaveLength(2);
    expect(result[result.length - 1]).toBe(FIXTURE_FOCUS_TODAY);
  });

  // R2: immutability — original array unchanged
  it("R2: does not mutate the input array", () => {
    const prev = [FIXTURE_FOCUS_YESTERDAY];
    appendSession(prev, FIXTURE_FOCUS_TODAY);
    expect(prev).toHaveLength(1);
    expect(prev[0]).toBe(FIXTURE_FOCUS_YESTERDAY);
  });

  // R3: preserves order
  it("R3: preserves existing order", () => {
    const prev = [FIXTURE_FOCUS_YESTERDAY, FIXTURE_FOCUS_TODAY];
    const newSession = { ...FIXTURE_FOCUS_TODAY, id: "pomo_new" };
    const result = appendSession(prev, newSession);
    expect(result[0]).toBe(FIXTURE_FOCUS_YESTERDAY);
    expect(result[1]).toBe(FIXTURE_FOCUS_TODAY);
    expect(result[2]).toBe(newSession);
  });

  // R4: handles empty starting array
  it("R4: handles empty starting array", () => {
    const result = appendSession([], FIXTURE_FOCUS_TODAY);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(FIXTURE_FOCUS_TODAY);
  });

  // R5: handles 1000+ existing sessions (perf smoke)
  it("R5: handles 1000+ existing sessions", () => {
    const large = Array.from({ length: 1000 }, (_, i) => ({
      ...FIXTURE_FOCUS_TODAY,
      id: `pomo_${i}`,
    }));
    const result = appendSession(large, FIXTURE_FOCUS_YESTERDAY);
    expect(result).toHaveLength(1001);
    expect(result[1000]).toBe(FIXTURE_FOCUS_YESTERDAY);
  });
});

describe("newSessionId", () => {
  it("generates an id starting with 'pomo_'", () => {
    const id = newSessionId();
    expect(id).toMatch(/^pomo_[0-9a-z]{8}$/);
  });

  it("generates different ids on successive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => newSessionId()));
    expect(ids.size).toBeGreaterThan(90);
  });
});
