/**
 * SL1..SL6 — smartListsPane tests (test.md §3 P2)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { smartListsPane } from "../panes/smartListsPane.js";
import { getPref } from "@repo/plugin-web-storage";

describe("smartListsPane", () => {
  it("SL1: renders 3 sections", () => {
    const { container } = render(smartListsPane.render({ lang: "en" }));
    const sections = container.querySelectorAll(".sl-section");
    expect(sections.length).toBe(3);
  });

  it("SL2: renders 12 list rows total", () => {
    const { container } = render(smartListsPane.render({ lang: "en" }));
    const rows = container.querySelectorAll(".sl-row");
    expect(rows.length).toBe(12);
  });

  it("SL3: each row has a visibility select with 3 options", () => {
    const { container } = render(smartListsPane.render({ lang: "en" }));
    const selects = container.querySelectorAll<HTMLSelectElement>(".sl-select");
    for (const sel of Array.from(selects)) {
      expect(sel.options.length).toBe(3);
    }
  });

  it("SL4: bilingual — EN section headers are in English", () => {
    render(smartListsPane.render({ lang: "en" }));
    expect(screen.getByText("Default lists")).toBeInTheDocument();
    expect(screen.getByText("Organize")).toBeInTheDocument();
    expect(screen.getByText("Others")).toBeInTheDocument();
  });

  it("SL5: bilingual — ZH section headers are in Chinese", () => {
    render(smartListsPane.render({ lang: "zh" }));
    expect(screen.getByText("默认清单")).toBeInTheDocument();
    expect(screen.getByText("组织")).toBeInTheDocument();
    expect(screen.getByText("其他")).toBeInTheDocument();
  });

  it("SL6: pref key xai_pref_smart_lists is a JSON entry (default is {})", () => {
    render(smartListsPane.render({ lang: "en" }));
    const val = getPref("xai_pref_smart_lists");
    // Default from registry is {} (empty record)
    expect(typeof val).toBe("object");
  });
});
