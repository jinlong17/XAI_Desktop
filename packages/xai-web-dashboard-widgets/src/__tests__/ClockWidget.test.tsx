import { accountScope } from "@repo/plugin-web-storage";
/**
 * AC-CLOCK-1..8: ClockWidget behavior — 4 styles + timezone picker + persistence.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { ClockWidget } from "../widgets/ClockWidget.js";

const FIXED_NOW = new Date(2026, 4, 22, 14, 5, 30); // May 22 2026 14:05:30 local

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

describe("AC-CLOCK: ClockWidget", () => {
  it("AC-CLOCK-1: default render is 'classic' style with HH:MM:SS", () => {
    const { container } = render(<ClockWidget lang="en" now={FIXED_NOW} />);
    expect(container.querySelector("[data-testid='clock-classic']")).not.toBeNull();
    // Text content includes hh + : + mm + : + ss
    const time = container.querySelector(".clock-time")?.textContent;
    expect(time).toContain("14");
    expect(time).toContain("05");
    expect(time).toContain("30");
  });

  it("AC-CLOCK-2: clicking each of 4 style buttons swaps rendered content", () => {
    const { container } = render(<ClockWidget lang="en" now={FIXED_NOW} />);

    fireEvent.click(container.querySelector("[data-clock-style='split']")!);
    expect(container.querySelector("[data-testid='clock-split']")).not.toBeNull();

    fireEvent.click(container.querySelector("[data-clock-style='minimal']")!);
    expect(container.querySelector("[data-testid='clock-minimal']")).not.toBeNull();

    fireEvent.click(container.querySelector("[data-clock-style='analog']")!);
    expect(container.querySelector("[data-testid='clock-analog']")).not.toBeNull();

    fireEvent.click(container.querySelector("[data-clock-style='classic']")!);
    expect(container.querySelector("[data-testid='clock-classic']")).not.toBeNull();
  });

  it("AC-CLOCK-3: style persists to xai_clock_style", () => {
    const { container, unmount } = render(<ClockWidget lang="en" now={FIXED_NOW} />);
    fireEvent.click(container.querySelector("[data-clock-style='analog']")!);
    expect(localStorage.getItem(accountScope.physicalKey("xai_clock_style"))).toBe("analog");
    unmount();

    const { container: c2 } = render(<ClockWidget lang="en" now={FIXED_NOW} />);
    expect(c2.querySelector("[data-testid='clock-analog']")).not.toBeNull();
  });

  it("AC-CLOCK-4: timezone popover opens, lists Local + 12 cities, selection updates tz", () => {
    const { container } = render(<ClockWidget lang="en" now={FIXED_NOW} />);
    // Open popover
    fireEvent.click(container.querySelector(".clk-tz-btn")!);
    const popover = container.querySelector(".clk-tz-popover");
    expect(popover).not.toBeNull();

    // 1 local + 12 cities + divider in between → 13 popover-item buttons
    const items = popover!.querySelectorAll(".popover-item");
    expect(items).toHaveLength(13);

    // Select Shanghai
    fireEvent.click(container.querySelector("[data-tz-id='shanghai']")!);
    expect(localStorage.getItem(accountScope.physicalKey("xai_clock_tz"))).toBe("shanghai");
    // Popover closes after selection
    expect(container.querySelector(".clk-tz-popover")).toBeNull();
  });

  it("AC-CLOCK-5: tz=shanghai shifts displayed time by +8 UTC from local", () => {
    // Force a known local timezone offset: jsdom uses the runtime's tz. We
    // compute the expected hour from the math used in the widget itself.
    localStorage.setItem(accountScope.physicalKey("xai_clock_tz"), "shanghai");
    const { container } = render(<ClockWidget lang="en" now={FIXED_NOW} />);
    // Compute expected
    const utcMs = FIXED_NOW.getTime() + FIXED_NOW.getTimezoneOffset() * 60 * 1000;
    const shanghai = new Date(utcMs + 8 * 3600 * 1000);
    const expectedHH = String(shanghai.getHours()).padStart(2, "0");
    const expectedMM = String(shanghai.getMinutes()).padStart(2, "0");
    const time = container.querySelector(".clock-time")?.textContent;
    expect(time).toContain(expectedHH);
    expect(time).toContain(expectedMM);
    // Location label = Shanghai
    expect(container.querySelector(".clock-sub")?.textContent).toBe("Shanghai");
  });

  it("AC-CLOCK-6: .clock-toolbar carries data-no-drag", () => {
    const { container } = render(<ClockWidget lang="en" now={FIXED_NOW} />);
    expect(container.querySelector(".clock-toolbar")?.getAttribute("data-no-drag")).not.toBeNull();
  });

  it("AC-CLOCK-7: zh labels via useI18n", () => {
    const { container } = render(<ClockWidget lang="zh" now={FIXED_NOW} />);
    // toolbar style button titles → 经典 / 分段 / 极简 / 模拟
    expect(container.querySelector("[data-clock-style='classic']")?.getAttribute("title")).toBe(
      "经典",
    );
    expect(container.querySelector("[data-clock-style='analog']")?.getAttribute("title")).toBe(
      "模拟",
    );
    // location label for local time
    expect(container.querySelector(".clock-sub")?.textContent).toBe("本地时间");
  });

  it("AC-CLOCK-8: switching to analog mounts <svg class='clock-analog'>", () => {
    const { container } = render(<ClockWidget lang="en" now={FIXED_NOW} />);
    fireEvent.click(container.querySelector("[data-clock-style='analog']")!);
    expect(container.querySelector("svg.clock-analog")).not.toBeNull();
  });

  it("AC-CLOCK-extra: invalid stored style falls back to classic", () => {
    localStorage.setItem(accountScope.physicalKey("xai_clock_style"), "bogus");
    const { container } = render(<ClockWidget lang="en" now={FIXED_NOW} />);
    expect(container.querySelector("[data-testid='clock-classic']")).not.toBeNull();
  });

  it("AC-CLOCK-extra: clicking scrim closes popover without changing tz", () => {
    const { container } = render(<ClockWidget lang="en" now={FIXED_NOW} />);
    fireEvent.click(container.querySelector(".clk-tz-btn")!);
    expect(container.querySelector(".clk-tz-popover")).not.toBeNull();
    fireEvent.click(container.querySelector(".popover-scrim")!);
    expect(container.querySelector(".clk-tz-popover")).toBeNull();
  });
});
