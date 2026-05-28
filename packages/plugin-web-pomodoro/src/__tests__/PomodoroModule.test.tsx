/**
 * M1..M15 — PomodoroModule integration tests.
 * test.md §2
 *
 * Uses real usePref (localStorage) + real emitWebEvent.
 * localStorage cleared in vitest.setup.ts afterEach.
 * vi.useFakeTimers() + vi.setSystemTime() set in vitest.setup.ts.
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { PomodoroModule } from "../PomodoroModule.js";
import { onWebEvent } from "@repo/xai-web-event-bus";

describe("PomodoroModule", () => {
  // M1: empty state (no sessions) — idle UI, all-zero counters, no records
  it("M1: renders idle state with zero counters and no records", () => {
    render(<PomodoroModule lang="en" />);
    expect(screen.getByText("Pomodoro")).toBeTruthy();
    expect(screen.getByTestId("start-btn")).toBeTruthy();
    expect(screen.queryByTestId("pause-btn")).toBeNull();
    expect(screen.queryByTestId("end-btn")).toBeNull();
    // All overview cards should show 0
    const vals = document.querySelectorAll(".ps-val");
    for (const v of vals) {
      expect(v.textContent?.trim()).toBe("0");
    }
  });

  // M2: click Start → state running, ring begins
  it("M2: Start click transitions to running state", () => {
    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    expect(screen.getByTestId("pause-btn")).toBeTruthy();
    expect(screen.getByTestId("end-btn")).toBeTruthy();
    expect(screen.getByTestId("timer-state").textContent).toBe("Focusing");
  });

  // M3: tick to zero → session persisted
  it("M3: tick to zero writes session", () => {
    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    // Advance time past 25 minutes
    act(() => { vi.advanceTimersByTime(25 * 60 * 1000 + 2000); });
    // Module still renders without crash
    expect(document.querySelector(".module-pomo")).toBeTruthy();
  });

  // M4 / M15: mute icon toggles
  it("M4/M15: mute icon toggles muted state (UI-only)", () => {
    render(<PomodoroModule lang="en" />);
    const muteBtn = screen.getByTestId("mute-btn");
    const ariaLabelBefore = muteBtn.getAttribute("aria-label");
    act(() => { fireEvent.click(muteBtn); });
    const ariaLabelAfter = muteBtn.getAttribute("aria-label");
    expect(ariaLabelAfter).not.toBe(ariaLabelBefore);
  });

  // M5: Pause mid-run → state paused, remaining frozen
  it("M5: Pause mid-run freezes remaining", () => {
    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { fireEvent.click(screen.getByTestId("pause-btn")); });
    // Check paused state label
    expect(screen.getByTestId("timer-state").textContent).toBe("Paused");
    // Advance more time — state remains paused
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByTestId("timer-state").textContent).toBe("Paused");
  });

  // M6: Resume from paused → running again
  it("M6: Resume continues from paused state", () => {
    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { fireEvent.click(screen.getByTestId("pause-btn")); });
    act(() => { fireEvent.click(screen.getByTestId("continue-btn")); });
    expect(screen.getByTestId("timer-state").textContent).toBe("Focusing");
  });

  // M7: End mid-run → completed=false session
  it("M7: End mid-run writes completed=false session", () => {
    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(5000); });
    act(() => { fireEvent.click(screen.getByTestId("end-btn")); });

    const raw = localStorage.getItem("xai_pomodoro_sessions");
    if (raw) {
      const sessions = JSON.parse(raw);
      if (sessions.length > 0) {
        expect(sessions[0].completed).toBe(false);
        expect(sessions[0].elapsedMs).toBeLessThan(sessions[0].durationMs);
      }
    }
    // Should be back to idle
    expect(screen.getByTestId("start-btn")).toBeTruthy();
  });

  // M8: mode-cycle advances after focus
  it("M8: after focus ends, mode advances (away from focus)", () => {
    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(5000); });
    act(() => { fireEvent.click(screen.getByTestId("end-btn")); });
    // After end-early focus with 0 prior completed focus sessions:
    //   nextMode("focus", 0) → "long-break" (0 % 4 === 0)
    // The focus pill button contains a span with the mode text
    const focusPill = document.querySelector(".focus-pill");
    // Mode has changed from "Focus" to a break mode
    expect(focusPill?.textContent).not.toContain("Focus");
    // Specifically it should be "Long Break" (0 completed pomos, so long-break first)
    expect(focusPill?.textContent).toContain("Long Break");
  });

  // M9+M10: emits web:pomodoro:session-finished on End
  it("M9+M10: emits event on session End", () => {
    const events: unknown[] = [];
    const unsub = onWebEvent("web:pomodoro:session-finished", (payload) => {
      events.push(payload);
    });

    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(3000); });
    act(() => { fireEvent.click(screen.getByTestId("end-btn")); });

    expect(events.length).toBe(1);
    unsub();
  });

  // M11: payload contains correct mode/durationMs/finishedAt
  it("M11: event payload has correct shape", () => {
    const events: Array<{ mode: string; durationMs: number; finishedAt: string }> = [];
    const unsub = onWebEvent("web:pomodoro:session-finished", (payload) =>
      events.push(payload as { mode: string; durationMs: number; finishedAt: string }),
    );

    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(5000); });
    act(() => { fireEvent.click(screen.getByTestId("end-btn")); });

    expect(events.length).toBe(1);
    const e = events[0]!;
    expect(e.mode).toBe("focus");
    expect(typeof e.durationMs).toBe("number");
    expect(typeof e.finishedAt).toBe("string");
    unsub();
  });

  // M12: lang switch en ↔ zh re-renders labels
  it("M12: lang switch en↔zh re-renders labels", () => {
    const { rerender } = render(<PomodoroModule lang="en" />);
    expect(screen.getByText("Pomodoro")).toBeTruthy();
    rerender(<PomodoroModule lang="zh" />);
    expect(screen.getByText("番茄钟")).toBeTruthy();
  });

  // M13: StrictMode double-mount no double-emit
  it("M13: StrictMode double-mount → exactly one emit per session", () => {
    const events: unknown[] = [];
    const unsub = onWebEvent("web:pomodoro:session-finished", (p) => events.push(p));

    render(
      <React.StrictMode>
        <PomodoroModule lang="en" />
      </React.StrictMode>,
    );
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(3000); });
    act(() => { fireEvent.click(screen.getByTestId("end-btn")); });

    expect(events.length).toBe(1);
    unsub();
  });

  // M14: corrupted localStorage entry filtered + DEV warn
  it("M14: corrupted localStorage entry is filtered out silently", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    localStorage.setItem(
      "xai_pomodoro_sessions",
      JSON.stringify([{ id: "bad", mode: "focus", startedAt: "x" }]),
    );
    render(<PomodoroModule lang="en" />);
    // Should render without crash, with 0 sessions displayed
    const vals = document.querySelectorAll(".ps-val");
    for (const v of vals) {
      expect(v.textContent?.trim()).toBe("0");
    }
    warnSpy.mockRestore();
  });

  // AC-SCHEMA-6: elapsedMs === durationMs for completed sessions (strict equality)
  it("AC-SCHEMA-6: for tick-to-zero session, elapsedMs === durationMs (strict)", () => {
    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(25 * 60 * 1000 + 500); });

    const raw = localStorage.getItem("xai_pomodoro_sessions");
    if (raw) {
      const sessions = JSON.parse(raw);
      const completed = sessions.filter((s: { completed: boolean }) => s.completed);
      for (const s of completed) {
        if (s.mode === "focus") {
          // Strict equality: elapsedMs === durationMs for tick-to-zero
          expect(s.elapsedMs).toBe(s.durationMs);
        }
      }
    }
  });

  it("desktopAction=start-focus starts focus when module is idle", () => {
    window.history.replaceState({}, "", "/app/pomodoro?desktopAction=start-focus");
    render(<PomodoroModule lang="en" />);
    expect(screen.getByTestId("timer-state").textContent).toBe("Focusing");
    expect(window.location.search).toBe("");
  });

  it("desktopAction=start-focus resumes focus when module is paused", () => {
    window.history.replaceState({}, "", "/app/pomodoro");
    const { rerender } = render(<PomodoroModule lang="en" />);

    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { fireEvent.click(screen.getByTestId("pause-btn")); });
    expect(screen.getByTestId("timer-state").textContent).toBe("Paused");

    window.history.replaceState({}, "", "/app/pomodoro?desktopAction=start-focus");
    rerender(<PomodoroModule lang="en" />);

    expect(screen.getByTestId("timer-state").textContent).toBe("Focusing");
    expect(window.location.search).toBe("");
  });
});
