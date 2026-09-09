import { describe, it, expect } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { accountScope, setPref } from "@repo/plugin-web-storage";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { CalendarModule } from "../CalendarModule.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";

function userEvent(
  id: string,
  title: string,
  startISO: string,
  endISO: string,
  recurrence: UserCalEvent["recurrence"],
): UserCalEvent {
  return {
    id,
    title,
    startISO,
    endISO,
    colorPreset: "rose",
    recurrence,
    createdAt: "2026-05-22T00:00:00.000Z",
    updatedAt: "2026-05-22T00:00:00.000Z",
  };
}

function seedCalendarEvents(events: Record<string, UserCalEvent>) {
  localStorage.setItem(accountScope.physicalKey("xai_calendar_events"), JSON.stringify(events));
}

function focusDate(dateKey: string): void {
  act(() => {
    emitWebEvent("web:shell:module-change", {
      moduleId: "calendar",
      focusDate: dateKey,
      source: "programmatic",
    });
  });
}

function switchToDay(): void {
  fireEvent.click(screen.getByRole("tab", { name: "Day" }));
}

describe("CalendarModule DST x recurrence integration (P4)", () => {
  it("AC-DST-RECUR-1: daily 09:30 recurrence is stable across Mar 7/8/9 around spring-forward", () => {
    setPref("xai_calendar_view", "month");
    seedCalendarEvents({
      dr1: userEvent(
        "dr1",
        "DST Daily 09:30",
        "2026-03-07T09:30",
        "2026-03-07T10:00",
        { kind: "daily" },
      ),
    });
    render(<CalendarModule lang="en" />);

    focusDate("2026-03-07");
    switchToDay();
    const mar7 = screen.getByTitle("DST Daily 09:30");
    expect(mar7).toBeTruthy();
    expect(mar7.style.top).toBe("456px");

    focusDate("2026-03-08");
    switchToDay();
    const mar8 = screen.getByTitle("DST Daily 09:30");
    expect(mar8).toBeTruthy();
    // Spring-forward day compresses the row index by 1 after 03:00.
    expect(mar8.style.top).toBe("408px");

    focusDate("2026-03-09");
    switchToDay();
    const mar9 = screen.getByTitle("DST Daily 09:30");
    expect(mar9).toBeTruthy();
    expect(mar9.style.top).toBe("456px");
  });

  it("AC-DST-RECUR-2: weekly recurrence anchored on fall-back day appears on Nov 8 + Nov 15", () => {
    setPref("xai_calendar_view", "month");
    seedCalendarEvents({
      dr2: userEvent(
        "dr2",
        "DST Weekly 09:30",
        "2026-11-01T09:30",
        "2026-11-01T10:00",
        { kind: "weekly" },
      ),
    });
    render(<CalendarModule lang="en" />);

    focusDate("2026-11-08");
    switchToDay();
    expect(screen.getByTitle("DST Weekly 09:30")).toBeTruthy();

    focusDate("2026-11-15");
    switchToDay();
    expect(screen.getByTitle("DST Weekly 09:30")).toBeTruthy();
  });
});
