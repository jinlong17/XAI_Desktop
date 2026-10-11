import { accountScope } from "@repo/plugin-web-storage";
/**
 * AC-ANALOG-1..5: analog clock SVG renders 60 minor + 12 major + 12 numerals + 3 hands.
 *
 * Style is forced to "analog" via localStorage before mount (usePref reads from
 * registry default + storage).
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import { ClockWidget } from "../widgets/ClockWidget.js";

beforeEach(() => {
  try {
    localStorage.setItem(accountScope.physicalKey("xai_clock_style"), "analog");
  } catch {
    /* ignore */
  }
});

describe("AC-ANALOG: analog clock SVG", () => {
  it("AC-ANALOG-5: viewBox is 0 0 100 100", () => {
    const { container } = render(<ClockWidget lang="en" now={new Date(2026, 4, 22, 3, 0, 0)} />);
    const svg = container.querySelector("svg.clock-analog");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("viewBox")).toBe("0 0 100 100");
  });

  it("AC-ANALOG-1: 48 minor ticks (60 minus 12 multiples of 5)", () => {
    const { container } = render(<ClockWidget lang="en" now={new Date(2026, 4, 22, 3, 0, 0)} />);
    const minorTicks = container.querySelectorAll("line[data-tick='minor']");
    expect(minorTicks).toHaveLength(48);
  });

  it("AC-ANALOG-2: 12 major ticks", () => {
    const { container } = render(<ClockWidget lang="en" now={new Date(2026, 4, 22, 3, 0, 0)} />);
    const majorTicks = container.querySelectorAll("line[data-tick='major']");
    expect(majorTicks).toHaveLength(12);
  });

  it("AC-ANALOG-3: 12 numerals [12, 1..11]", () => {
    const { container } = render(<ClockWidget lang="en" now={new Date(2026, 4, 22, 3, 0, 0)} />);
    const numerals = container.querySelectorAll("text[data-numeral]");
    expect(numerals).toHaveLength(12);
    const labels = Array.from(numerals).map((n) => n.getAttribute("data-numeral"));
    expect(labels).toEqual(["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]);
  });

  it("AC-ANALOG-4: hour hand rotates 90° at 03:00:00", () => {
    const { container } = render(<ClockWidget lang="en" now={new Date(2026, 4, 22, 3, 0, 0)} />);
    const hour = container.querySelector("line[data-hand='hour']");
    expect(hour?.getAttribute("transform")).toBe("rotate(90 50 50)");
    const minute = container.querySelector("line[data-hand='minute']");
    expect(minute?.getAttribute("transform")).toBe("rotate(0 50 50)");
    const second = container.querySelector("line[data-hand='second']");
    expect(second?.getAttribute("transform")).toBe("rotate(0 50 50)");
  });
});
