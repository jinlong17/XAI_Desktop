import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { paneRegistry } from "../index.js";

/**
 * P1..P3 — paneRegistry shape + placeholder render.
 */
describe("paneRegistry", () => {
  // Pre-existing count drift fixed 2026-05-26 alongside codex C3-CHROME-1.
  // Row #2 (xai-web-ai-chat-real-llm-adapter) added the "ai" pane between
  // "appearance" and "more" but didn't update these tests. Updated now.

  it("P1: length is 14 (13 baseline + 'ai' from row #2)", () => {
    expect(paneRegistry).toHaveLength(14);
  });

  it("P2: id order matches DESIGN.md §4.12 sequence + row #2 'ai' insertion", () => {
    expect(paneRegistry.map((p) => p.id)).toEqual([
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
    ]);
  });

  it("P3: each render({ lang: 'en' }) returns the EN placeholder text", () => {
    for (const pane of paneRegistry) {
      const { container, unmount } = render(pane.render({ lang: "en" }));
      expect(container.textContent).toContain("This pane is not yet available.");
      unmount();
    }
  });
});
