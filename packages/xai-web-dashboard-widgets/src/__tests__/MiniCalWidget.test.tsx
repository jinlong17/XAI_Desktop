import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { MiniCalWidget } from "../widgets/MiniCalWidget.js";

const MAY_22_2026 = new Date(2026, 4, 22, 10, 30, 0);

describe("MiniCalWidget", () => {
  it("AC-MINICAL-1: renders en month label 'May 2026'", () => {
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    expect(container.querySelector(".mc-m")?.textContent).toBe("May 2026");
  });

  it("AC-MINICAL-1: renders zh month label '2026 年 5 月'", () => {
    const { container } = render(
      <MiniCalWidget lang="zh" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    expect(container.querySelector(".mc-m")?.textContent).toBe("2026 年 5 月");
  });

  it("AC-MINICAL-2: en weekday headers M T W T F S S", () => {
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    const headers = Array.from(container.querySelectorAll(".mc-wd")).map((h) => h.textContent);
    expect(headers).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it("AC-MINICAL-2: zh weekday headers 一 二 三 四 五 六 日", () => {
    const { container } = render(
      <MiniCalWidget lang="zh" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    const headers = Array.from(container.querySelectorAll(".mc-wd")).map((h) => h.textContent);
    expect(headers).toEqual(["一", "二", "三", "四", "五", "六", "日"]);
  });

  it("AC-MINICAL-3: today cell carries 'today' class", () => {
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    const todayCell = container.querySelector("[data-day='22']");
    expect(todayCell?.className).toContain("today");
  });

  it("AC-MINICAL-4: days with fixtures render up to 3 dots", () => {
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    // day 16 has 3 events in fixtures
    const day16 = container.querySelector("[data-day='16']");
    expect(day16?.querySelectorAll(".mc-dot")).toHaveLength(3);
    // day 22 has 2 events
    const day22 = container.querySelector("[data-day='22']");
    expect(day22?.querySelectorAll(".mc-dot")).toHaveLength(2);
  });

  it("AC-MINICAL-5: prev/next nav buttons change month", () => {
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    const navButtons = container.querySelectorAll(".mc-nav");
    // next
    fireEvent.click(navButtons[1]!);
    expect(container.querySelector(".mc-m")?.textContent).toBe("June 2026");
    // back twice → April 2026
    fireEvent.click(navButtons[0]!);
    fireEvent.click(navButtons[0]!);
    expect(container.querySelector(".mc-m")?.textContent).toBe("April 2026");
  });

  it("AC-MINICAL-6: clicking inside .mc-grid calls goTo('calendar')", () => {
    const goTo = vi.fn();
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={goTo} />,
    );
    fireEvent.click(container.querySelector(".mc-grid")!);
    expect(goTo).toHaveBeenCalledWith("calendar");
  });

  it("AC-MINICAL-7: clicking Open Calendar footer button calls goTo('calendar')", () => {
    const goTo = vi.fn();
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={goTo} />,
    );
    fireEvent.click(container.querySelector(".mc-jump")!);
    expect(goTo).toHaveBeenCalledWith("calendar");
  });

  it("AC-MINICAL-8: clicking prev/next nav does NOT call goTo (data-no-drag + stopPropagation)", () => {
    const goTo = vi.fn();
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={goTo} />,
    );
    const navButtons = container.querySelectorAll(".mc-nav");
    fireEvent.click(navButtons[0]!);
    fireEvent.click(navButtons[1]!);
    expect(goTo).not.toHaveBeenCalled();
  });

  it("AC-MINICAL-9: .mc-head and .mc-foot carry data-no-drag", () => {
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    expect(container.querySelector(".mc-head")?.getAttribute("data-no-drag")).not.toBeNull();
    expect(container.querySelector(".mc-foot")?.getAttribute("data-no-drag")).not.toBeNull();
  });
});
