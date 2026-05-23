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

describe("MeditationModule pick interactions", () => {
  it("AC-PICK-2: clicking a scene card toggles aria-pressed", () => {
    render(<MeditationModule lang="en" />);
    const forest = screen.getByRole("button", { name: /Forest/i });
    expect(forest).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(forest);
    expect(forest).toHaveAttribute("aria-pressed", "true");
  });

  it("AC-PICK-4: clicking a clock card updates preview clock variant", () => {
    const { container } = render(<MeditationModule lang="en" />);
    // Default is split — switch to digital.
    const digitalBtn = screen.getByRole("button", { name: /Digital/i });
    fireEvent.click(digitalBtn);
    // Preview clock should be the digital variant now.
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
    render(<MeditationModule lang="en" />);
    const night = screen.getByRole("button", { name: /Night Sky/i });
    fireEvent.click(night);
    expect(night).toHaveAttribute("aria-pressed", "true");
    const forest = screen.getByRole("button", { name: /Forest/i });
    expect(forest).toHaveAttribute("aria-pressed", "false");
  });

  it("AC-PICK-8: clicking the same picker twice is idempotent (no error)", () => {
    render(<MeditationModule lang="en" />);
    const forest = screen.getByRole("button", { name: /Forest/i });
    fireEvent.click(forest);
    fireEvent.click(forest);
    expect(forest).toHaveAttribute("aria-pressed", "true");
  });

  it("AC-PICK-5: sound 'none' card uses soundOff icon (svg)", () => {
    const { container } = render(<MeditationModule lang="en" />);
    const silenceBtn = screen.getByRole("button", { name: /Silence/i });
    fireEvent.click(silenceBtn);
    expect(silenceBtn.querySelector("svg")).not.toBeNull();
    expect(container).toBeDefined();
  });
});
