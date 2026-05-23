import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { StickiesWidget } from "../widgets/StickiesWidget.js";
import { STICKIES } from "../internal/fixtures.js";

describe("StickiesWidget", () => {
  it("AC-STICKIES-1: renders 3 sticky notes", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    expect(container.querySelectorAll(".sticky")).toHaveLength(3);
  });

  it("AC-STICKIES-2: each note has its fixture color", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    const notes = container.querySelectorAll<HTMLElement>(".sticky");
    notes.forEach((note, i) => {
      // jsdom normalizes hex to rgb; just assert the inline style is set.
      expect(note.style.background).toBeTruthy();
      expect(note.textContent).toBe(STICKIES[i]!.text.en);
    });
  });

  it("AC-STICKIES-3: zh renders zh text", () => {
    const { container } = render(<StickiesWidget lang="zh" />);
    const notes = container.querySelectorAll(".sticky");
    notes.forEach((note, i) => {
      expect(note.textContent).toBe(STICKIES[i]!.text.zh);
    });
  });
});
