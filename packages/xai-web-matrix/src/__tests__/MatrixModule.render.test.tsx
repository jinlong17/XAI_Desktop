/**
 * AC-RENDER-1..4: Read-only rendering correctness tests.
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { matrixSlotRegistration } from "../registration.js";
import { MatrixModule } from "../MatrixModule.js";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <WebShellProvider
      modules={[matrixSlotRegistration]}
      lang="en"
      railPos="left"
      petOn={false}
      setPetOn={() => {}}
    >
      {children}
    </WebShellProvider>
  );
}

describe("MatrixModule render", () => {
  it("AC-RENDER-1: renders 4 quadrant sections with correct data-quadrant attrs", () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    const sections = document.querySelectorAll("section[data-quadrant]");
    expect(sections).toHaveLength(4);
    const ids = Array.from(sections).map((s) => s.getAttribute("data-quadrant"));
    expect(ids).toEqual(["q1", "q2", "q3", "q4"]);
  });

  it("AC-RENDER-2: each quadrant header has --qc custom property in style", () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    const q1 = document.querySelector("[data-quadrant='q1']") as HTMLElement;
    const q2 = document.querySelector("[data-quadrant='q2']") as HTMLElement;
    const q3 = document.querySelector("[data-quadrant='q3']") as HTMLElement;
    const q4 = document.querySelector("[data-quadrant='q4']") as HTMLElement;

    // --qc is set inline via style attribute on the <section>
    expect(q1.style.getPropertyValue("--qc")).toBe("var(--red)");
    expect(q2.style.getPropertyValue("--qc")).toBe("var(--amber)");
    expect(q3.style.getPropertyValue("--qc")).toBe("var(--blue)");
    expect(q4.style.getPropertyValue("--qc")).toBe("var(--accent)");
  });

  it("AC-RENDER-3: quadrants appear in Q1, Q2, Q3, Q4 DOM order", () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    const sections = document.querySelectorAll("[data-quadrant]");
    const orderedIds = Array.from(sections)
      .filter((el) => el.tagName === "SECTION")
      .map((s) => s.getAttribute("data-quadrant"));
    expect(orderedIds).toEqual(["q1", "q2", "q3", "q4"]);
  });

  it("AC-RENDER-4: each quadrant header contains span.q-number with 1..4", () => {
    render(
      <Wrapper>
        <MatrixModule lang="en" />
      </Wrapper>
    );
    const numbers = document.querySelectorAll(".q-number");
    expect(numbers).toHaveLength(4);
    expect(Array.from(numbers).map((n) => n.textContent)).toEqual(["1", "2", "3", "4"]);
  });
});
