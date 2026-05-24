/**
 * PR1..PR3 — premiumPane tests (test.md §3 P1)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { premiumPane } from "../panes/premiumPane.js";

describe("premiumPane", () => {
  it("PR1: renders without error (EN)", () => {
    const { container } = render(premiumPane.render({ lang: "en" }));
    expect(container.querySelector(".premium-pane")).toBeTruthy();
  });

  it("PR2: bilingual — EN shows English headline", () => {
    render(premiumPane.render({ lang: "en" }));
    expect(screen.getByText("Unlock Premium Features")).toBeInTheDocument();
  });

  it("PR3: bilingual — ZH shows Chinese headline", () => {
    render(premiumPane.render({ lang: "zh" }));
    expect(screen.getByText("解锁高级功能")).toBeInTheDocument();
  });
});
