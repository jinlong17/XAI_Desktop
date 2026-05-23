/**
 * AC-RENDER-1..7: HabitsModule render correctness tests.
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

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <WebShellProvider
      modules={[habitsSlotRegistration]}
      lang="en"
      railPos="left"
      petOn={false}
      setPetOn={() => {}}
    >
      {children}
    </WebShellProvider>
  );
}

describe("HabitsModule render", () => {
  it("AC-RENDER-1: renders both left-pane and right-pane sections", () => {
    render(
      <Wrapper>
        <HabitsModule lang="en" />
      </Wrapper>
    );
    expect(document.querySelector(".habits-list")).toBeTruthy();
    expect(document.querySelector(".habits-detail")).toBeTruthy();
  });

  it("AC-RENDER-2: week strip shows 7 weekday cells, last cell is today", () => {
    render(
      <Wrapper>
        <HabitsModule lang="en" />
      </Wrapper>
    );
    const weekdays = document.querySelectorAll(".weekday");
    expect(weekdays).toHaveLength(7);
    // 2026-05-23 is Saturday — the last day in a Sun-start week
    expect(weekdays[6]?.classList.contains("today")).toBe(true);
  });

  it("AC-RENDER-3: each seeded habit row has emoji + title + stats + 7 hcell buttons", () => {
    render(
      <Wrapper>
        <HabitsModule lang="en" />
      </Wrapper>
    );
    const rows = document.querySelectorAll(".habit-row");
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row.querySelector(".habit-emoji")).toBeTruthy();
      expect(row.querySelector(".habit-title")).toBeTruthy();
      expect(row.querySelector(".habit-stats")).toBeTruthy();
      const cells = row.querySelectorAll(".hcell");
      expect(cells).toHaveLength(7);
    });
  });

  it("AC-RENDER-4: 4 stat cards render with correct labels (EN)", async () => {
    await act(async () => {
      render(
        <Wrapper>
          <HabitsModule lang="en" />
        </Wrapper>
      );
    });
    const cards = document.querySelectorAll(".stat-card");
    expect(cards).toHaveLength(4);
    const labels = Array.from(document.querySelectorAll(".stat-label")).map(
      (el) => el.textContent
    );
    expect(labels).toContain("Monthly check-ins");
    expect(labels).toContain("Total check-ins");
    expect(labels).toContain("Monthly rate");
    expect(labels).toContain("Streak");
  });

  it("AC-RENDER-5: progress card shows numerator/denominator format", async () => {
    await act(async () => {
      render(
        <Wrapper>
          <HabitsModule lang="en" />
        </Wrapper>
      );
    });
    const progressNum = document.querySelector(".progress-num");
    expect(progressNum).toBeTruthy();
    expect(progressNum?.textContent).toMatch(/\d+\/(?:365|366)/);
    const sub = document.querySelector(".progress-sub");
    expect(sub).toBeTruthy();
  });

  it("AC-RENDER-6: month calendar shows 7 weekday headers + 35 day cells + today", async () => {
    await act(async () => {
      render(
        <Wrapper>
          <HabitsModule lang="en" />
        </Wrapper>
      );
    });
    const calHeaders = document.querySelectorAll(".cal-h");
    expect(calHeaders).toHaveLength(7);
    const calCells = document.querySelectorAll(".cal-cell");
    expect(calCells).toHaveLength(35);
    const todayCells = document.querySelectorAll(".cal-cell.today");
    expect(todayCells).toHaveLength(1);
  });

  it("AC-RENDER-7: diary card shows log-title and empty-state hint", async () => {
    await act(async () => {
      render(
        <Wrapper>
          <HabitsModule lang="en" />
        </Wrapper>
      );
    });
    expect(screen.getByText("Habit Log")).toBeTruthy();
    expect(screen.getByText("No check-ins shared this month yet.")).toBeTruthy();
  });
});
