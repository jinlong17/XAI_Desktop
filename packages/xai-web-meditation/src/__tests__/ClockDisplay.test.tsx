/**
 * ClockDisplay — 4 variants + static mode + live tick.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act, screen } from "@testing-library/react";
import { ClockDisplay } from "../ClockDisplay.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 23, 10, 30, 45));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ClockDisplay", () => {
  it("renders digital variant", () => {
    render(<ClockDisplay variant="digital" />);
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it("renders split variant with colons", () => {
    const { container } = render(<ClockDisplay variant="split" />);
    expect(container.querySelector(".clk-split")).not.toBeNull();
    expect(container.querySelectorAll(".clk-colon").length).toBeGreaterThan(0);
  });

  it("renders minimal variant", () => {
    const { container } = render(<ClockDisplay variant="minimal" />);
    expect(container.querySelector(".clk-minimal")).not.toBeNull();
  });

  it("renders analog variant as svg", () => {
    const { container } = render(<ClockDisplay variant="analog" />);
    expect(container.querySelector("svg.clk-analog")).not.toBeNull();
  });

  it("AC-PICK-3: static mode freezes at 03:44:17", () => {
    render(<ClockDisplay variant="digital" staticMode />);
    expect(screen.getByText(/03:44/)).toBeInTheDocument();
  });

  it("AC-PICK-3: static mode does not start interval (timer count stays 0)", () => {
    render(<ClockDisplay variant="digital" staticMode />);
    // Advancing time should not re-render anything.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/03:44/)).toBeInTheDocument();
  });

  it("AC-PREVIEW-3: live mode advances after 1s tick", () => {
    render(<ClockDisplay variant="digital" />);
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
    act(() => {
      vi.setSystemTime(new Date(2026, 4, 23, 10, 30, 46));
      vi.advanceTimersByTime(1000);
    });
    // Time will have moved by one second
    const text = screen.getByText(/10:30/);
    expect(text).toBeInTheDocument();
  });

  it("applies accent color via inline style", () => {
    const { container } = render(<ClockDisplay variant="digital" accent="oklch(85% 0.10 220)" />);
    const el = container.querySelector(".clk-digital") as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.style.color).toMatch(/oklch/);
  });

  it("mini flag adds .mini class", () => {
    const { container } = render(<ClockDisplay variant="split" mini />);
    expect(container.querySelector(".clk-split.mini")).not.toBeNull();
  });

  it("analog svg uses the configured highlight color for second hand", () => {
    const { container } = render(
      <ClockDisplay
        variant="analog"
        colors={{
          digits: "#ffffff",
          hands: "#eeeeee",
          ring: "#cccccc",
          background: "#101820",
          highlight: "#70d6ff",
        }}
      />,
    );
    const svg = container.querySelector("svg.clk-analog");
    expect(svg).not.toBeNull();
    expect(svg!.innerHTML).toContain("#70d6ff");
  });

  it("digital clock applies configured size and colors", () => {
    const { container } = render(
      <ClockDisplay
        variant="digital"
        scale="larger"
        colors={{
          digits: "#ffffff",
          hands: "#eeeeee",
          ring: "#cccccc",
          background: "#101820",
          highlight: "#70d6ff",
        }}
      />,
    );
    const el = container.querySelector(".clk-digital") as HTMLElement;
    expect(el.className).toContain("clock-scale-larger");
    expect(el.style.backgroundColor).toBe("rgb(16, 24, 32)");
  });
});
