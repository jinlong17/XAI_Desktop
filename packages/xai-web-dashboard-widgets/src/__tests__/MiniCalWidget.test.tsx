import { accountScope } from "@repo/plugin-web-storage";
/**
 * MiniCalWidget — real-data tests (§F rewrite).
 *
 * Seeds `xai_calendar_events` via `localStorage`.
 * SHIPPED nav/goTo/data-no-drag ACs (AC-MINICAL-1..9) are RE-HOMED unchanged.
 * New ACs: AC-MINICAL-REAL-1..5.
 *
 * Old AC-MINICAL-4 asserted dots from CAL_EVENTS fixture.
 * AC-MINICAL-REAL-2 replaces it with real data from localStorage seed.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { MiniCalWidget } from "../widgets/MiniCalWidget.js";

const MAY_22_2026 = new Date(2026, 4, 22, 10, 30, 0);

function seedCalEvents(store: unknown) {
  localStorage.setItem(accountScope.physicalKey("xai_calendar_events"), JSON.stringify(store));
}

function makeEvent(id: string, startISO: string, colorPreset = "mint") {
  const [d, t] = startISO.split("T");
  const [h] = (t ?? "10:00").split(":");
  const endHour = String(Math.min(23, parseInt(h ?? "10", 10) + 1)).padStart(2, "0");
  return {
    id,
    title: "Event " + id,
    startISO,
    endISO: `${d}T${endHour}:00`,
    colorPreset,
    recurrence: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// SHIPPED nav/goTo/data-no-drag ACs — re-homed unchanged (AC-MINICAL-1..9)
// ---------------------------------------------------------------------------
describe("MiniCalWidget — SHIPPED nav/goTo/drag-exclude (AC-MINICAL-1..9)", () => {
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

  it("AC-MINICAL-5: prev/next nav buttons change month", () => {
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    const navButtons = container.querySelectorAll(".mc-nav");
    fireEvent.click(navButtons[1]!);
    expect(container.querySelector(".mc-m")?.textContent).toBe("June 2026");
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

  it("AC-MINICAL-8: clicking prev/next nav does NOT call goTo", () => {
    const goTo = vi.fn();
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
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

// ---------------------------------------------------------------------------
// REAL DATA ACs — AC-MINICAL-REAL-1..5
// ---------------------------------------------------------------------------
describe("MiniCalWidget — real data (AC-MINICAL-REAL-1..5)", () => {
  // AC-MINICAL-REAL-1: empty store → no dots
  it("AC-MINICAL-REAL-1: no dots when calendar store is empty", () => {
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    // No dots in May when store is empty
    expect(container.querySelectorAll(".mc-dot")).toHaveLength(0);
  });

  // AC-MINICAL-REAL-2: real event shows dot on correct day
  it("AC-MINICAL-REAL-2: event on day 15 shows dot on day 15", () => {
    seedCalEvents({
      e15: makeEvent("e15", "2026-05-15T10:00", "blue"),
    });
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    const day15 = container.querySelector("[data-day='15']");
    expect(day15?.querySelectorAll(".mc-dot")).toHaveLength(1);
    expect(day15?.querySelector(".mc-dot-blue")).not.toBeNull();
  });

  // AC-MINICAL-REAL-3: up to 3 dots per day
  it("AC-MINICAL-REAL-3: at most 3 dots per day (cap enforced)", () => {
    seedCalEvents({
      e1: makeEvent("e1", "2026-05-10T09:00", "mint"),
      e2: makeEvent("e2", "2026-05-10T11:00", "amber"),
      e3: makeEvent("e3", "2026-05-10T13:00", "blue"),
      e4: makeEvent("e4", "2026-05-10T15:00", "violet"), // 4th → capped
    });
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    const day10 = container.querySelector("[data-day='10']");
    expect(day10?.querySelectorAll(".mc-dot")).toHaveLength(3);
  });

  // AC-MINICAL-REAL-4: rose colorPreset renders mc-dot-rose (RD4 guard)
  it("AC-MINICAL-REAL-4: rose colorPreset renders .mc-dot-rose class (RD4)", () => {
    seedCalEvents({
      r1: makeEvent("r1", "2026-05-20T10:00", "rose"),
    });
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    expect(container.querySelector(".mc-dot-rose")).not.toBeNull();
  });

  // AC-MINICAL-REAL-5: events from other months don't show in current month
  it("AC-MINICAL-REAL-5: events from June don't appear in May view", () => {
    seedCalEvents({
      june1: makeEvent("june1", "2026-06-01T10:00", "mint"),
    });
    const { container } = render(
      <MiniCalWidget lang="en" now={MAY_22_2026} goTo={vi.fn()} />,
    );
    expect(container.querySelectorAll(".mc-dot")).toHaveLength(0);
  });
});
