import { describe, it, expect } from "vitest";
import { paneRegistry } from "../index.js";
import type { SettingsPaneId } from "../index.js";

/**
 * T1..T2 — SettingsPaneId enum order parity with DESIGN.md §4.12.
 */
describe("types — SettingsPaneId order parity", () => {
  it("T1: paneRegistry order matches the 13-pane DESIGN.md sequence", () => {
    const ids = paneRegistry.map((p) => p.id);
    const expected: SettingsPaneId[] = [
      "account",
      "premium",
      "features",
      "smart_lists",
      "notifications",
      "date_time",
      "appearance",
      "more",
      "integrations",
      "collaborate",
      "sticky",
      "hotkeys",
      "about",
    ];
    expect(ids).toEqual(expected);
  });

  it("T2: paneRegistry length is exactly 13 (no implicit additions)", () => {
    expect(paneRegistry).toHaveLength(13);
  });
});
