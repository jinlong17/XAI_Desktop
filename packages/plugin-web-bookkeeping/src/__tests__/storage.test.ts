import { accountScope } from "@repo/plugin-web-storage";
import { describe, expect, it } from "vitest";
import {
  BOOKKEEPING_CALENDAR_MODE_KEY,
  BOOKKEEPING_DASH_ORDER_KEY,
  BOOKKEEPING_DASH_SPLIT_KEY,
  BOOKKEEPING_STATE_KEY,
  BOOKKEEPING_VIEW_KEY,
  createSeedBookkeepingState,
} from "../internal/defaults.js";
import { localBookkeepingStorageAdapter, readBookkeepingState, writeBookkeepingState } from "../internal/storage.js";

describe("bookkeeping local storage adapter", () => {
  it("persists canonical state plus dashboard/view preference mirror keys", () => {
    const seed = createSeedBookkeepingState();
    const state = {
      ...seed,
      activeLedger: "us",
      prefs: {
        dashboardOrder: "quick-first" as const,
        dashboardSplit: 55,
        billsView: "overview" as const,
        calendarMode: "year" as const,
      },
    };

    writeBookkeepingState(state);

    expect(JSON.parse(localStorage.getItem(accountScope.physicalKey(BOOKKEEPING_STATE_KEY)) ?? "{}")).toMatchObject({ activeLedger: "us", version: 2 });
    expect(localStorage.getItem(accountScope.physicalKey(BOOKKEEPING_DASH_ORDER_KEY))).toBe("quick-first");
    expect(localStorage.getItem(accountScope.physicalKey(BOOKKEEPING_DASH_SPLIT_KEY))).toBe("55");
    expect(localStorage.getItem(accountScope.physicalKey(BOOKKEEPING_VIEW_KEY))).toBe("overview");
    expect(localStorage.getItem(accountScope.physicalKey(BOOKKEEPING_CALENDAR_MODE_KEY))).toBe("year");
    expect(readBookkeepingState().prefs).toMatchObject(state.prefs);
  });

  it("falls back to seeded data when stored state is missing or corrupt", () => {
    localStorage.setItem(accountScope.physicalKey(BOOKKEEPING_STATE_KEY), "{not-json");

    expect(readBookkeepingState()).toMatchObject({ version: 2, activeLedger: "daily" });
    expect(localBookkeepingStorageAdapter.reset()).toMatchObject({ version: 2, activeLedger: "daily" });
    expect(JSON.parse(localStorage.getItem(accountScope.physicalKey(BOOKKEEPING_STATE_KEY)) ?? "{}")).toMatchObject({ version: 2 });
  });
});
