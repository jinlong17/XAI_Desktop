/**
 * B1..B3 — index barrel tests (test.md §3)
 * Verifies public surface shape per api.md §0.
 */
import { describe, it, expect } from "vitest";
import * as barrel from "../index.js";

describe("index barrel", () => {
  it("B1: exports all 11 pane objects with correct ids", () => {
    const expectedPanes: Array<{ export: keyof typeof barrel; id: string }> = [
      { export: "accountPane",       id: "account" },
      { export: "premiumPane",       id: "premium" },
      { export: "smartListsPane",    id: "smart_lists" },
      { export: "notificationsPane", id: "notifications" },
      { export: "dateTimePane",      id: "date_time" },
      { export: "morePane",          id: "more" },
      { export: "integrationsPane",  id: "integrations" },
      { export: "collaboratePane",   id: "collaborate" },
      { export: "stickyPane",        id: "sticky" },
      { export: "hotkeysPane",       id: "hotkeys" },
      { export: "aboutPane",         id: "about" },
    ];
    for (const { export: key, id } of expectedPanes) {
      const pane = barrel[key] as { id: string } | undefined;
      expect(pane, `${key} should be exported`).toBeDefined();
      expect(pane?.id).toBe(id);
    }
  });

  it("B2: exports restPanesById with 11 entries", () => {
    expect(barrel.restPanesById).toBeDefined();
    expect(Object.keys(barrel.restPanesById).length).toBe(11);
  });

  it("B3: exports applyRestPanesToRegistry as a function", () => {
    expect(typeof barrel.applyRestPanesToRegistry).toBe("function");
  });
});
