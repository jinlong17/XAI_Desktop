import { describe, it, expect } from "vitest";
import { paneRegistry } from "../index.js";
import type { SettingsPaneId } from "../index.js";

/**
 * T1..T2 — SettingsPaneId enum order parity with DESIGN.md §4.12.
 */
// T1/T2: pre-existing count drift fixed 2026-05-26. Row #2
// (xai-web-ai-chat-real-llm-adapter) added the "ai" pane between
// "appearance" and "more" but did not update these tests. Updated now
// (14 panes total) alongside the codex C3-CHROME-1 deep-link fix.

describe("types — SettingsPaneId order parity", () => {
  it("T1: paneRegistry order matches the 13-pane DESIGN.md sequence + row #2 'ai' insertion", () => {
    const ids = paneRegistry.map((p) => p.id);
    const expected: SettingsPaneId[] = [
      "account",
      "premium",
      "features",
      "smart_lists",
      "notifications",
      "date_time",
      "appearance",
      "ai",
      "more",
      "integrations",
      "collaborate",
      "sticky",
      "hotkeys",
      "about",
    ];
    expect(ids).toEqual(expected);
  });

  it("T2: paneRegistry length is exactly 14 (13 baseline + 'ai' from row #2)", () => {
    expect(paneRegistry).toHaveLength(14);
  });
});
