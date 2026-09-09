import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { accountScope, setPref } from "@repo/plugin-web-storage";
import { CalendarModule } from "../CalendarModule.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";

function event(over: Partial<UserCalEvent> = {}): UserCalEvent {
  return {
    id: "year-evt-1",
    title: "Year Target",
    startISO: "2026-05-18T09:00",
    endISO: "2026-05-18T10:00",
    colorPreset: "blue",
    recurrence: null,
    tag: "work",
    reminder: "15m",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...over,
  };
}

function seedCalendarEvents(events: Record<string, UserCalEvent>) {
  localStorage.setItem(accountScope.physicalKey("xai_calendar_events"), JSON.stringify(events));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-22T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("YearView", () => {
  it("renders a 12-month year grid from the persisted year view", () => {
    setPref("xai_calendar_view", "year");
    render(<CalendarModule lang="en" />);

    expect(screen.getByTestId("cal-year-view")).toBeTruthy();
    expect(document.querySelectorAll(".cal-year-month")).toHaveLength(12);
    expect(document.querySelector(".module-title")?.textContent).toBe("2026");
  });

  it("clicking a year-view date opens day overview before quick-create", () => {
    setPref("xai_calendar_view", "year");
    render(<CalendarModule lang="en" />);

    fireEvent.click(document.querySelector('[data-testid="cal-year-day-2026-05-18"]') as HTMLElement);

    expect(document.querySelector('[data-testid="day-overview"]')).toBeTruthy();
    expect(document.querySelector(".day-overview__title")?.textContent).toBe("Monday, May 18, 2026");
    expect((document.querySelector("dialog.event-composer") as HTMLDialogElement).open).toBe(false);

    fireEvent.click(document.querySelector(".day-overview__actions .event-composer__btn--primary") as HTMLButtonElement);

    expect((document.querySelector("dialog.event-composer") as HTMLDialogElement).open).toBe(true);
    expect((document.getElementById("event-composer-date-input") as HTMLInputElement).value).toBe("2026-05-18");
  }, 10_000);

  it("shows month-view fixture events as same-color dots in the year grid", () => {
    setPref("xai_calendar_view", "year");
    render(<CalendarModule lang="en" />);

    const mayFirst = screen.getByTestId("cal-year-day-2026-05-01");
    const dots = Array.from(mayFirst.querySelectorAll(".cal-year-event-dot"));

    expect(dots).toHaveLength(4);
    expect(dots.map((dot) => dot.className)).toEqual([
      "cal-year-event-dot ev-amber",
      "cal-year-event-dot ev-blue",
      "cal-year-event-dot ev-mint",
      "cal-year-event-dot ev-mint",
    ]);
    expect(mayFirst.querySelector(".cal-year-more")).toBeNull();
    expect(screen.getByTestId("cal-year-day-2026-06-01").querySelectorAll(".cal-year-event-dot")).toHaveLength(0);

    fireEvent.click(dots[0] as HTMLElement);

    expect(document.querySelector('[data-testid="day-overview"]')).toBeTruthy();
    expect(document.querySelector(".day-overview__title")?.textContent).toBe("Friday, May 1, 2026");
  }, 10_000);

  it("caps year-view dots at six and renders overflow as +N", () => {
    setPref("xai_calendar_view", "year");
    seedCalendarEvents(Object.fromEntries(
      Array.from({ length: 8 }, (_, index) => {
        const id = `year-overflow-${index + 1}`;
        const hour = String(9 + index).padStart(2, "0");
        return [id, event({
          id,
          title: `Overflow ${index + 1}`,
          startISO: `2026-05-31T${hour}:00`,
          endISO: `2026-05-31T${hour}:30`,
          colorPreset: index % 2 === 0 ? "mint" : "amber",
        })];
      }),
    ));
    render(<CalendarModule lang="en" />);

    const mayLast = screen.getByTestId("cal-year-day-2026-05-31");

    expect(mayLast.querySelectorAll(".cal-year-event-dot")).toHaveLength(6);
    expect(mayLast.querySelector(".cal-year-more")?.textContent).toBe("+2");
  }, 10_000);

  it("shows user event colors/tags and opens edit from the event dot", () => {
    setPref("xai_calendar_view", "year");
    seedCalendarEvents({
      "year-evt-1": event(),
    });
    render(<CalendarModule lang="en" />);

    const eventDot = document.querySelector('.cal-year-event-dot[aria-label="Year Target, work"]') as HTMLButtonElement;
    expect(eventDot.className).toContain("ev-blue");
    fireEvent.click(eventDot);

    expect(document.querySelector(".event-composer__title")?.textContent).toBe("Edit event");
    expect((document.getElementById("event-composer-title-input") as HTMLInputElement).value).toBe("Year Target");
    expect((document.getElementById("event-composer-tag-input") as HTMLInputElement).value).toBe("work");
  }, 10_000);
});
