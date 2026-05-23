import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { paneRegistry } from "../index.js";

/**
 * P1..P3 — paneRegistry shape + placeholder render.
 */
describe("paneRegistry", () => {
  it("P1: length is 13", () => {
    expect(paneRegistry).toHaveLength(13);
  });

  it("P2: id order matches DESIGN.md §4.12 sequence", () => {
    expect(paneRegistry.map((p) => p.id)).toEqual([
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
