/**
 * AB1..AB4 — aboutPane tests (test.md §3 P1)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { aboutPane } from "../panes/aboutPane.js";

describe("aboutPane", () => {
  it("AB1: renders without error", () => {
    const { container } = render(aboutPane.render({ lang: "en" }));
    expect(container.querySelector(".about-pane")).toBeTruthy();
  });

  it("AB2: shows version string", () => {
    render(aboutPane.render({ lang: "en" }));
    expect(screen.getByText(/v 1\.2\.0/)).toBeInTheDocument();
    expect(screen.getByText(/2026\.05\.23/)).toBeInTheDocument();
  });

  it("AB3: bilingual — EN shows English description", () => {
    render(aboutPane.render({ lang: "en" }));
    expect(screen.getByText("A focused, bilingual productivity workspace.")).toBeInTheDocument();
  });

  it("AB4: bilingual — ZH shows Chinese description", () => {
    render(aboutPane.render({ lang: "zh" }));
    expect(screen.getByText("一款轻盈、专注、面向中英双语用户的生产力工作台。")).toBeInTheDocument();
  });
});
