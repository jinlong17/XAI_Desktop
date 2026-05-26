/**
 * Tests for filterState helpers — FST-1..FST-8
 * Gap-closure row #6 — board-workspaces slice
 */
import { describe, expect, test } from "vitest";
import {
  EMPTY_FILTER,
  toggleLabel,
  toggleMember,
  setDueRange,
  clearFilter,
} from "../internal/filterState.js";

describe("EMPTY_FILTER", () => {
  test("FST-1 EMPTY_FILTER has empty Sets + dueRange: 'all'", () => {
    expect(EMPTY_FILTER.labels.size).toBe(0);
    expect(EMPTY_FILTER.members.size).toBe(0);
    expect(EMPTY_FILTER.dueRange).toBe("all");
  });

  test("FST-2 EMPTY_FILTER is frozen (Object.isFrozen)", () => {
    expect(Object.isFrozen(EMPTY_FILTER)).toBe(true);
  });
});

describe("toggleLabel", () => {
  test("FST-3 toggleLabel adds id when absent", () => {
    const result = toggleLabel(EMPTY_FILTER, "urgent");
    expect(result.labels.has("urgent")).toBe(true);
    expect(result.labels.size).toBe(1);
  });

  test("FST-4 toggleLabel removes id when present", () => {
    const withLabel = toggleLabel(EMPTY_FILTER, "urgent");
    const result = toggleLabel(withLabel, "urgent");
    expect(result.labels.has("urgent")).toBe(false);
    expect(result.labels.size).toBe(0);
  });
});

describe("toggleMember", () => {
  test("FST-5 toggleMember adds + removes", () => {
    const withMember = toggleMember(EMPTY_FILTER, "alice");
    expect(withMember.members.has("alice")).toBe(true);

    const cleared = toggleMember(withMember, "alice");
    expect(cleared.members.has("alice")).toBe(false);
  });
});

describe("setDueRange", () => {
  test("FST-6 setDueRange('overdue') returns new state with that value", () => {
    const result = setDueRange(EMPTY_FILTER, "overdue");
    expect(result.dueRange).toBe("overdue");
    // other facets unchanged
    expect(result.labels.size).toBe(0);
    expect(result.members.size).toBe(0);
  });
});

describe("EMPTY_FILTER immutability", () => {
  test("FST-7 EMPTY_FILTER reference NOT mutated by togglers", () => {
    toggleLabel(EMPTY_FILTER, "urgent");
    expect(EMPTY_FILTER.labels.size).toBe(0); // original unchanged
  });
});

describe("clearFilter", () => {
  test("FST-8 clearFilter returns reference-equal EMPTY_FILTER", () => {
    const withLabel = toggleLabel(EMPTY_FILTER, "urgent");
    const result = clearFilter(withLabel);
    expect(result).toBe(EMPTY_FILTER); // reference equality
  });
});
