import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { setPref } from "@repo/plugin-web-storage";
import { CalendarModule } from "../CalendarModule.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";

function userEvent(
  id: string,
  title: string,
  startISO: string,
  endISO: string,
): UserCalEvent {
  return {
    id,
    title,
    startISO,
    endISO,
    colorPreset: "rose",
    recurrence: null,
    createdAt: "2026-05-22T00:00:00.000Z",
    updatedAt: "2026-05-22T00:00:00.000Z",
  };
}

describe("CalendarModule event CRUD integration (P4)", () => {
  it("AC-CREATE-7: toolbar + opens create composer on today (not activeDate)", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-06-10T10:00:00.000Z"));
      render(<CalendarModule lang="en" />);

      fireEvent.click(screen.getByLabelText("Add event"));
      const dateInput = document.getElementById("event-composer-date-input") as HTMLInputElement;
      expect(dateInput.value).toBe("2026-06-10");
    } finally {
      vi.useRealTimers();
    }
  });

  it("AC-EDIT-4: clicking a user block in Week view opens edit composer", () => {
    setPref("xai_calendar_view", "week");
    setPref("xai_calendar_events", {
      w1: userEvent("w1", "Week Edit Target", "2026-05-22T09:00", "2026-05-22T10:00"),
    });
    render(<CalendarModule lang="en" />);

    fireEvent.click(screen.getByTitle("Week Edit Target"));
    expect(screen.getByText("Edit event")).toBeTruthy();
    const input = document.getElementById("event-composer-title-input") as HTMLInputElement;
    expect(input.value).toBe("Week Edit Target");
  });

  it("AC-EDIT-5: clicking a user block in Day view opens edit composer", () => {
    setPref("xai_calendar_view", "day");
    setPref("xai_calendar_events", {
      d1: userEvent("d1", "Day Edit Target", "2026-05-22T14:00", "2026-05-22T15:00"),
    });
    render(<CalendarModule lang="en" />);

    fireEvent.click(screen.getByTitle("Day Edit Target"));
    expect(screen.getByText("Edit event")).toBeTruthy();
    const input = document.getElementById("event-composer-title-input") as HTMLInputElement;
    expect(input.value).toBe("Day Edit Target");
  });

  it("AC-OVERLAP-1: two overlapping user events render side-by-side in Week view", () => {
    setPref("xai_calendar_view", "week");
    setPref("xai_calendar_events", {
      o1: userEvent("o1", "Overlap A", "2026-05-21T09:00", "2026-05-21T11:00"),
      o2: userEvent("o2", "Overlap B", "2026-05-21T10:00", "2026-05-21T12:00"),
    });
    render(<CalendarModule lang="en" />);

    const a = screen.getByTitle("Overlap A");
    const b = screen.getByTitle("Overlap B");
    expect(a.getAttribute("style")).toContain("calc(50%");
    expect(b.getAttribute("style")).toContain("calc(50%");
  });

  it("AC-OVERLAP-2: three overlapping user events render 3-way columns", () => {
    setPref("xai_calendar_view", "week");
    setPref("xai_calendar_events", {
      o1: userEvent("o1", "Overlap 3A", "2026-05-22T09:00", "2026-05-22T11:00"),
      o2: userEvent("o2", "Overlap 3B", "2026-05-22T09:30", "2026-05-22T11:30"),
      o3: userEvent("o3", "Overlap 3C", "2026-05-22T10:00", "2026-05-22T12:00"),
    });
    render(<CalendarModule lang="en" />);

    const a = screen.getByTitle("Overlap 3A");
    const b = screen.getByTitle("Overlap 3B");
    const c = screen.getByTitle("Overlap 3C");
    expect(a.getAttribute("style")).toContain("33.333");
    expect(b.getAttribute("style")).toContain("33.333");
    expect(c.getAttribute("style")).toContain("33.333");
  });

  it("AC-OVERLAP-3: fixture and user events in same slot both render and keep source tags", () => {
    setPref("xai_calendar_view", "week");
    setPref("xai_calendar_events", {
      fxu: userEvent("fxu", "User Fixture Overlap", "2026-05-22T11:30", "2026-05-22T12:00"),
    });
    render(<CalendarModule lang="en" />);

    const user = screen.getByTitle("User Fixture Overlap");
    const fixture = screen.getByTitle("Brainstorming");
    expect(user.getAttribute("data-source")).toBe("user");
    expect(fixture.getAttribute("data-source")).toBe("fixture");
    expect(user.getAttribute("style")).not.toContain("calc(100%");
  });
});
