/**
 * HK1..HK3 — hotkeysPane tests (test.md §3 P1)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { hotkeysPane } from "../panes/hotkeysPane.js";

describe("hotkeysPane", () => {
  it("HK1: renders 10 rows in the hotkeys list", () => {
    const { container } = render(hotkeysPane.render({ lang: "en" }));
    const rows = container.querySelectorAll(".hk-row");
    expect(rows.length).toBe(10);
  });

  it("HK2: no input or edit affordance (read-only)", () => {
    const { container } = render(hotkeysPane.render({ lang: "en" }));
    expect(container.querySelectorAll("input").length).toBe(0);
    // No edit/rebind buttons
    const editBtns = container.querySelectorAll('button[aria-label*="edit"], button[aria-label*="Edit"]');
    expect(editBtns.length).toBe(0);
  });

  it("HK3: bilingual — ZH shows Chinese action labels", () => {
    render(hotkeysPane.render({ lang: "zh" }));
    expect(screen.getByText("快速添加")).toBeInTheDocument();
    expect(screen.getByText("全局搜索")).toBeInTheDocument();
    expect(screen.getByText("切换深色")).toBeInTheDocument();
  });
});
