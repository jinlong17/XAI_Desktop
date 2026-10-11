import { describe, expect, it } from "vitest";
import type { FilterState } from "@repo/plugin-web-board-views";
import { EMPTY_FILTER } from "@repo/plugin-web-board-views";
import {
  filterStateForBoard,
  loadSavedBoardFilters,
  serializeFilterState,
  setSavedFilterForBoard,
} from "../internal/savedFilters.js";

function makeFilter(patch: Partial<FilterState> = {}): FilterState {
  return {
    labels: patch.labels ?? new Set(["l2", "l1"]),
    members: patch.members ?? new Set(["u2", "u1"]),
    priorities: patch.priorities ?? new Set(),
    dueRange: patch.dueRange ?? "week",
  };
}

describe("saved board filters", () => {
  it("SBF-1: malformed storage narrows to an empty map", () => {
    expect(loadSavedBoardFilters(null)).toEqual({});
    expect(loadSavedBoardFilters(["bad"])).toEqual({});
    expect(loadSavedBoardFilters({ "b-default": { labels: "bad" } })).toEqual({});
  });

  it("SBF-2: persisted arrays convert to FilterState Sets", () => {
    const loaded = loadSavedBoardFilters({
      "b-default": {
        labels: ["l2", "l1", "l1", ""],
        members: ["u2", "u1", "u2"],
        dueRange: "today",
      },
    });

    const filter = filterStateForBoard(loaded, "b-default");
    expect(Array.from(filter.labels)).toEqual(["l1", "l2"]);
    expect(Array.from(filter.members)).toEqual(["u1", "u2"]);
    expect(filter.dueRange).toBe("today");
  });

  it("SBF-3: invalid dueRange falls back to all", () => {
    const loaded = loadSavedBoardFilters({
      "b-default": { labels: [], members: [], dueRange: "soon" },
    });

    expect(loaded["b-default"]?.dueRange).toBe("all");
    expect(filterStateForBoard(loaded, "b-default")).toBe(EMPTY_FILTER);
  });

  it("SBF-4: serializes runtime Sets to sorted unique arrays", () => {
    expect(serializeFilterState(makeFilter())).toEqual({
      labels: ["l1", "l2"],
      members: ["u1", "u2"],
      priorities: [],
      dueRange: "week",
    });
  });

  it("SBF-5: writes one board filter without mutating siblings", () => {
    const next = setSavedFilterForBoard(
      {
        "b-pm": {
          labels: ["pm-forms"],
          members: [],
          priorities: [],
          dueRange: "overdue",
        },
      },
      "b-default",
      makeFilter({ dueRange: "today" }),
    );

    expect(next["b-pm"]?.dueRange).toBe("overdue");
    expect(next["b-default"]).toEqual({
      labels: ["l1", "l2"],
      members: ["u1", "u2"],
      priorities: [],
      dueRange: "today",
    });
  });
});
