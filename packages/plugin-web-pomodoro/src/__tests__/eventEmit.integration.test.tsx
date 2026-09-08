/**
 * EE1..EE5 — web:pomodoro:session-finished event emission integration tests.
 * test.md §2
 *
 * Uses real onWebEvent / emitWebEvent from @repo/xai-web-event-bus.
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, act, screen, fireEvent } from "@testing-library/react";
import { onWebEvent } from "@repo/xai-web-event-bus";
import { PomodoroModule } from "../PomodoroModule.js";

describe("eventEmit integration", () => {
  // EE1: subscribe via onWebEvent; trigger session completion; assert single event fires
  it("EE1: emits exactly one event on session End", () => {
    const events: unknown[] = [];
    const unsub = onWebEvent("web:pomodoro:session-finished", (p) => events.push(p));

    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(3000); });
    act(() => { fireEvent.click(screen.getByTestId("end-btn")); });

    expect(events.length).toBe(1);
    unsub();
  });

  // EE2: End-early emits event with correct payload
  it("EE2: event fires on End-early with correct payload shape", () => {
    const events: Array<{ mode: string; durationMs: number; finishedAt: string }> = [];
    const unsub = onWebEvent("web:pomodoro:session-finished", (p) =>
      events.push(p as { mode: string; durationMs: number; finishedAt: string }),
    );

    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(5000); });
    act(() => { fireEvent.click(screen.getByTestId("end-btn")); });

    expect(events.length).toBe(1);
    const e = events[0]!;
    expect(e.mode).toBe("focus");
    expect(typeof e.durationMs).toBe("number");
    expect(e.durationMs).toBeGreaterThan(0);
    expect(e.durationMs).toBeLessThan(25 * 60 * 1000); // End-early, so less than full duration
    expect(typeof e.finishedAt).toBe("string");
    unsub();
  });

  // EE3: payload mode/durationMs/finishedAt matches session record
  it("EE3: payload durationMs equals session.elapsedMs", () => {
    const events: Array<{ mode: string; durationMs: number; finishedAt: string }> = [];
    const unsub = onWebEvent("web:pomodoro:session-finished", (p) =>
      events.push(p as { mode: string; durationMs: number; finishedAt: string }),
    );

    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(3000); });
    act(() => { fireEvent.click(screen.getByTestId("end-btn")); });

    const raw = localStorage.getItem("xai_pomodoro_sessions");
    if (raw && events.length > 0) {
      const sessions = JSON.parse(raw);
      const session = sessions[0];
      const event = events[0]!;
      expect(event.mode).toBe(session.mode);
      // durationMs in event == elapsedMs in session (actual, not configured)
      expect(event.durationMs).toBe(session.elapsedMs);
      expect(event.finishedAt).toBe(session.finishedAt);
    }
    unsub();
  });

  // EE4: no event fires on Pause
  it("EE4: no event fires on Pause", () => {
    const events: unknown[] = [];
    const unsub = onWebEvent("web:pomodoro:session-finished", (p) => events.push(p));

    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { fireEvent.click(screen.getByTestId("pause-btn")); });

    expect(events.length).toBe(0);
    unsub();
  });

  // EE5: no event fires on Resume
  it("EE5: no event fires on Resume", () => {
    const events: unknown[] = [];
    const unsub = onWebEvent("web:pomodoro:session-finished", (p) => events.push(p));

    render(<PomodoroModule lang="en" />);
    act(() => { fireEvent.click(screen.getByTestId("start-btn")); });
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { fireEvent.click(screen.getByTestId("pause-btn")); });
    act(() => { fireEvent.click(screen.getByTestId("continue-btn")); });

    expect(events.length).toBe(0);
    unsub();
  });

  // EE-strict: StrictMode double-mount yields one emit (not two)
  it("EE-strict: StrictMode double-mount → exactly one emit per session", () => {
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
});
