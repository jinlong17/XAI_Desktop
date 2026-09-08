/**
 * AC-I18N-1..5: Internationalization tests for HabitsModule.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { HabitsModule } from "../HabitsModule.js";
import { habitsSlotRegistration } from "../registration.js";

vi.useFakeTimers();
vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));

afterEach(() => {
  vi.useRealTimers();
});

function Wrapper({ children, lang }: { children: React.ReactNode; lang: "en" | "zh" }) {
  return (
    <WebShellProvider
      modules={[habitsSlotRegistration]}
      lang={lang}
      railPos="left"
      petOn={false}
      setPetOn={() => {}}
    >
      {children}
    </WebShellProvider>
  );
}

describe("HabitsModule i18n", () => {
  it("AC-I18N-1: EN mode renders expected strings", async () => {
    await act(async () => {
      render(<Wrapper lang="en"><HabitsModule lang="en" /></Wrapper>);
    });
    expect(screen.getByText("Habits")).toBeTruthy();
    expect(screen.getByText("Monthly check-ins")).toBeTruthy();
    expect(screen.getByText("Total check-ins")).toBeTruthy();
    expect(screen.getByText("Monthly rate")).toBeTruthy();
    // "Streak" appears both in stat card label and habit stats row
    const streakElements = screen.getAllByText("Streak");
    expect(streakElements.length).toBeGreaterThan(0);
    expect(screen.getByText("Habit Log")).toBeTruthy();
  });

  it("AC-I18N-1: ZH mode renders expected strings", async () => {
    localStorage.clear();
    await act(async () => {
      render(<Wrapper lang="zh"><HabitsModule lang="zh" /></Wrapper>);
    });
    expect(screen.getByText("习惯")).toBeTruthy();
    expect(screen.getByText("本月打卡")).toBeTruthy();
    expect(screen.getByText("累计打卡")).toBeTruthy();
    expect(screen.getByText("本月打卡率")).toBeTruthy();
    expect(screen.getByText("习惯日记")).toBeTruthy();
  });

  it("AC-I18N-2: seeded habit title renders in active language", () => {
    render(<Wrapper lang="en"><HabitsModule lang="en" /></Wrapper>);
    // Seeded habit "Morning Run" appears in both the list and the detail pane
    expect(screen.getAllByText("Morning Run").length).toBeGreaterThan(0);
  });

  it("AC-I18N-2: ZH mode shows ZH habit title", () => {
    localStorage.clear();
    render(<Wrapper lang="zh"><HabitsModule lang="zh" /></Wrapper>);
    expect(screen.getAllByText("晨跑").length).toBeGreaterThan(0);
  });

  it("AC-I18N-3: EN mode weekday labels start with Sun", () => {
    render(<Wrapper lang="en"><HabitsModule lang="en" /></Wrapper>);
    const weekdays = document.querySelectorAll(".wd-name");
    // With weekStart="sun" and today=Saturday 2026-05-23, week starts Sun
    expect(weekdays[0]?.textContent).toBe("Sun");
  });

  it("AC-I18N-3: ZH mode weekday labels start with 周日", () => {
    localStorage.clear();
    render(<Wrapper lang="zh"><HabitsModule lang="zh" /></Wrapper>);
    const weekdays = document.querySelectorAll(".wd-name");
    expect(weekdays[0]?.textContent).toBe("周日");
  });

  it("AC-I18N-4: common units come from i18n", async () => {
    await act(async () => {
      render(<Wrapper lang="en"><HabitsModule lang="en" /></Wrapper>);
    });
    // stat units appear in .stat-unit elements
    const units = Array.from(document.querySelectorAll(".stat-unit")).map(
      (el) => el.textContent
    );
    expect(units).toContain("Day");
    expect(units).toContain("Days");
  });

  it("AC-I18N-5: empty diary hint uses habits.empty_log (EN)", async () => {
    await act(async () => {
      render(<Wrapper lang="en"><HabitsModule lang="en" /></Wrapper>);
    });
    expect(screen.getByText("No check-ins shared this month yet.")).toBeTruthy();
  });

  it("AC-I18N-5: empty diary hint uses habits.empty_log (ZH)", async () => {
    localStorage.clear();
    await act(async () => {
      render(<Wrapper lang="zh"><HabitsModule lang="zh" /></Wrapper>);
    });
    expect(screen.getByText("本月还没有打卡心得。")).toBeTruthy();
  });
});
