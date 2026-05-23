import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionBlock } from "../index.js";

/**
 * SB1..SB2 — SectionBlock atom.
 */
describe("<SectionBlock>", () => {
  it("SB1: children rendered in .setting-block", () => {
    render(
      <SectionBlock>
        <div>inner content</div>
      </SectionBlock>,
    );
    const block = document.querySelector(".setting-block");
    expect(block?.contains(screen.getByText("inner content"))).toBe(true);
  });

  it("SB2: style prop passed to root", () => {
    render(
      <SectionBlock style={{ padding: "8px" }}>
        <span>x</span>
      </SectionBlock>,
    );
    const block = document.querySelector(".setting-block") as HTMLElement;
    expect(block.style.padding).toBe("8px");
  });
});
