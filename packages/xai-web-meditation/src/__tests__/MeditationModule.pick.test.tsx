/**
 * MeditationModule — picker interactions.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MeditationModule } from "../MeditationModule.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 23, 10, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

/** Find the scene picker button whose label text matches `label`. */
function sceneButton(container: HTMLElement, label: string): HTMLButtonElement {
  const buttons = Array.from(container.querySelectorAll(".scene-card")) as HTMLButtonElement[];
  const match = buttons.find((b) => b.querySelector(".scene-label")?.textContent === label);
  if (!match) throw new Error(`No scene button with label "${label}"`);
  return match;
}

describe("MeditationModule pick interactions", () => {
  it("AC-PICK-2: clicking a scene card toggles aria-pressed", () => {
    const { container } = render(<MeditationModule lang="en" />);
    const forest = sceneButton(container, "Forest");
    expect(forest).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(forest);
    expect(forest).toHaveAttribute("aria-pressed", "true");
  });

  it("AC-PICK-4: clicking a clock card updates preview clock variant", () => {
    const { container } = render(<MeditationModule lang="en" />);
    const digitalBtn = screen.getByRole("button", { name: /Digital/i });
    fireEvent.click(digitalBtn);
    const previewClock = container.querySelector(".med-preview .clk-digital");
    expect(previewClock).not.toBeNull();
  });

  it("AC-PICK-7: clicking a duration chip updates state (45 selected)", () => {
    render(<MeditationModule lang="en" />);
    const chip45 = screen.getByRole("button", { name: /^45/ });
    expect(chip45).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(chip45);
    expect(chip45).toHaveAttribute("aria-pressed", "true");
  });

  it("AC-PICK-2: only one scene card has aria-pressed=true at a time", () => {
    const { container } = render(<MeditationModule lang="en" />);
    fireEvent.click(sceneButton(container, "Night Sky"));
    expect(sceneButton(container, "Night Sky")).toHaveAttribute("aria-pressed", "true");
    expect(sceneButton(container, "Forest")).toHaveAttribute("aria-pressed", "false");
  });

  it("AC-PICK-8: clicking the same picker twice is idempotent (no error)", () => {
    const { container } = render(<MeditationModule lang="en" />);
    const forest = sceneButton(container, "Forest");
    fireEvent.click(forest);
    fireEvent.click(forest);
    expect(forest).toHaveAttribute("aria-pressed", "true");
  });

  it("AC-PICK-5: sound 'none' card uses soundOff icon (svg)", () => {
    render(<MeditationModule lang="en" />);
    const silenceBtn = screen.getByRole("button", { name: /Silence/i });
    fireEvent.click(silenceBtn);
    expect(silenceBtn.querySelector("svg")).not.toBeNull();
  });
});
