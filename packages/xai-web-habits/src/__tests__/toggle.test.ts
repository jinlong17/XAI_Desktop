/**
 * AC-REDUCE-1..5: toggleCheckIn pure reducer unit tests.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { toggleCheckIn } from "../internal/toggle.js";
import type { HabitsState } from "../types.js";

// Fix "today" so computeStreak inside toggleCheckIn is deterministic
const TODAY = "2026-05-23";
vi.useFakeTimers();
vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));

afterEach(() => {
  vi.useRealTimers();
});

function makeEmptyState(): HabitsState {
  return { schemaVersion: 1, habits: [], checkIns: {}, diaries: {} };
}

describe("toggleCheckIn", () => {
  it("AC-REDUCE-1: flips absent date to true", () => {
    vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));
    const state = makeEmptyState();
    const { next } = toggleCheckIn(state, "h_1", TODAY);
    expect((next.checkIns["h_1"] as Record<string, true>)[TODAY]).toBe(true);
  });

  it("AC-REDUCE-2: removes date when previously true", () => {
    vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));
    const state: HabitsState = {
      schemaVersion: 1,
      habits: [],
      checkIns: { h_1: { [TODAY]: true } },
      diaries: {},
    };
    const { next } = toggleCheckIn(state, "h_1", TODAY);
    expect(TODAY in (next.checkIns["h_1"] ?? {})).toBe(false);
  });

  it("AC-REDUCE-3: does not mutate input state", () => {
    vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));
    const state = makeEmptyState();
    const originalCheckIns = state.checkIns;
    toggleCheckIn(state, "h_1", TODAY);
    expect(state.checkIns).toBe(originalCheckIns); // same reference = not mutated
  });

  it("AC-REDUCE-4: postStreak reflects post-toggle streak", () => {
    vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));
    const state = makeEmptyState();
    // Add today's check — streak should become 1
    const { postStreak: s1 } = toggleCheckIn(state, "h_1", TODAY);
    expect(s1).toBe(1);

    // Remove today's check — streak should become 0
    const state2: HabitsState = {
      schemaVersion: 1,
      habits: [],
      checkIns: { h_1: { [TODAY]: true } },
      diaries: {},
    };
    const { postStreak: s2 } = toggleCheckIn(state2, "h_1", TODAY);
    expect(s2).toBe(0);
  });

  it("AC-REDUCE-5: valid HabitsState for unknown habitId", () => {
    vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));
    const state = makeEmptyState();
    const { next } = toggleCheckIn(state, "h_unknown", TODAY);
    expect(next.schemaVersion).toBe(1);
    expect(Array.isArray(next.habits)).toBe(true);
    expect(typeof next.checkIns).toBe("object");
  });
});
