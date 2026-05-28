/**
 * AB1..AB4 — aboutPane tests (test.md §3 P1)
 * AB5..AB7 — disabled link regression (Audit Top-10 #10, Set-About-01..04)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
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

  it("AB5: all 4 about-links carry aria-disabled='true'", () => {
    const { container } = render(aboutPane.render({ lang: "en" }));
    const links = container.querySelectorAll(".about-links .link");
    expect(links).toHaveLength(4);
    links.forEach((el) => {
      expect(el.getAttribute("aria-disabled")).toBe("true");
    });
  });

  it("AB6: all 4 about-links carry title='Coming soon' (EN)", () => {
    const { container } = render(aboutPane.render({ lang: "en" }));
    const links = container.querySelectorAll(".about-links .link");
    expect(links).toHaveLength(4);
    links.forEach((el) => {
      expect(el.getAttribute("title")).toBe("Coming soon");
    });
  });

  it("AB7: clicking about-links does not trigger navigation or side-effects", () => {
    const { container } = render(aboutPane.render({ lang: "en" }));
    const links = container.querySelectorAll<HTMLElement>(".about-links .link");
    expect(links).toHaveLength(4);
    const initialHref = window.location.href;
    links.forEach((el) => {
      // Elements are <span> — no href attribute, no onClick handler
      expect(el.tagName).toBe("SPAN");
      expect(el.getAttribute("href")).toBeNull();
      // Firing click must not throw and must not change location
      fireEvent.click(el);
    });
    expect(window.location.href).toBe(initialHref);
  });
});
