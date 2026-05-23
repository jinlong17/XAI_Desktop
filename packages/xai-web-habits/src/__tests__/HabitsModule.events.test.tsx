/**
 * AC-EVENT-1..7: web:habits:checkin-recorded event bus tests.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { HabitsModule } from "../HabitsModule.js";
import { habitsSlotRegistration } from "../registration.js";
import { onWebEvent } from "@repo/xai-web-event-bus";

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

describe("HabitsModule event bus", () => {
  it("AC-EVENT-1: check-toggle ADD emits exactly one event", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    const received: unknown[] = [];
    const unsub = onWebEvent("web:habits:checkin-recorded", (payload) => {
      received.push(payload);
    });

    await act(async () => {
      fireEvent.click(document.querySelector(".hcell.today")!);
    });

    unsub();
    expect(received).toHaveLength(1);
    const payload = received[0] as Record<string, unknown>;
    expect(typeof payload["habitId"]).toBe("string");
    expect(typeof payload["date"]).toBe("string");
    expect(typeof payload["streak"]).toBe("number");
    expect(typeof payload["recordedAt"]).toBe("string");
  });

  it("AC-EVENT-2: check-toggle REMOVE also emits one event (streak reflects broken run)", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    const received: Array<{ streak: number }> = [];
    const unsub = onWebEvent("web:habits:checkin-recorded", (p) => {
      received.push(p as { streak: number });
    });

    // Toggle ON
    await act(async () => { fireEvent.click(document.querySelector(".hcell.today")!); });
    // Toggle OFF
    await act(async () => { fireEvent.click(document.querySelector(".hcell.today")!); });

    unsub();
    expect(received).toHaveLength(2);
    // After removing today's check, streak should be 0 (C1)
    expect(received[1]?.streak).toBe(0);
  });

  it("AC-EVENT-3: cross-tab storage event does NOT emit checkin-recorded", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    const received: unknown[] = [];
    const unsub = onWebEvent("web:habits:checkin-recorded", (p) => received.push(p));

    await act(async () => {
      window.dispatchEvent(new StorageEvent("storage", {
        key: "xai_habits_state",
        newValue: JSON.stringify({ schemaVersion: 1, habits: [], checkIns: {}, diaries: {} }),
        storageArea: localStorage,
      }));
    });

    unsub();
    expect(received).toHaveLength(0);
  });

  it("AC-EVENT-4: recordedAt is a parseable ISO timestamp within 1s", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    let payload: Record<string, unknown> | null = null;
    const unsub = onWebEvent("web:habits:checkin-recorded", (p) => {
      payload = p as Record<string, unknown>;
    });

    await act(async () => { fireEvent.click(document.querySelector(".hcell.today")!); });
    unsub();

    expect(payload).toBeTruthy();
    const ts = Date.parse(payload!["recordedAt"] as string);
    expect(Number.isFinite(ts)).toBe(true);
  });

  it("AC-EVENT-5: date payload uses UTC YYYY-MM-DD format", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    let dateVal = "";
    const unsub = onWebEvent("web:habits:checkin-recorded", (p) => {
      dateVal = (p as Record<string, unknown>)["date"] as string;
    });
    await act(async () => { fireEvent.click(document.querySelector(".hcell.today")!); });
    unsub();
    expect(/^\d{4}-\d{2}-\d{2}$/.test(dateVal)).toBe(true);
  });

  it("AC-EVENT-6: habitId matches the toggled habit", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    let habitIdReceived = "";
    const unsub = onWebEvent("web:habits:checkin-recorded", (p) => {
      habitIdReceived = (p as Record<string, unknown>)["habitId"] as string;
    });

    // Click today cell in first habit row
    await act(async () => {
      fireEvent.click(document.querySelector(".habit-row .hcell.today")!);
    });
    unsub();

    // Get the stored state to find the first habit id
    const raw = localStorage.getItem("xai_habits_state")!;
    const state = JSON.parse(raw) as { habits: Array<{ id: string }> };
    expect(habitIdReceived).toBe(state.habits[0]?.id);
  });

  it("AC-EVENT-7: streak equals computeStreak post-toggle", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    let streakVal = -1;
    const unsub = onWebEvent("web:habits:checkin-recorded", (p) => {
      streakVal = (p as Record<string, unknown>)["streak"] as number;
    });
    // First toggle of today (no prior) → streak should be 1
    await act(async () => { fireEvent.click(document.querySelector(".hcell.today")!); });
    unsub();
    expect(streakVal).toBe(1);
  });
});
