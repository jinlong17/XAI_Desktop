/**
 * UpcomingWidget — real-data tests (§F rewrite).
 *
 * Seeds `xai_calendar_events` via `localStorage` before rendering.
 * Old fixture-based assertions are REPLACED.
 *
 * AC-UPCOMING-REAL-1: empty store → empty label
 * AC-UPCOMING-REAL-2: future events rendered correctly
 * AC-UPCOMING-REAL-3: past events excluded
 * AC-UPCOMING-REAL-4: `now` prop threads through correctly (N1 build note)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { UpcomingWidget } from "../widgets/UpcomingWidget.js";

function seedCalEvents(store: unknown) {
  localStorage.setItem("xai_calendar_events", JSON.stringify(store));
}

function makeEvent(
  id: string,
  startISO: string,
  title: string,
  recurrence: null | { kind: "daily" | "weekly" } = null,
) {
  const [datePart, timePart] = startISO.split("T");
  const [h, m] = (timePart ?? "10:00").split(":");
  const endHour = String(Math.min(23, (parseInt(h ?? "10", 10) + 1))).padStart(2, "0");
  const endISO = `${datePart}T${endHour}:${m}`;
  return {
    id,
    title,
    startISO,
    endISO,
    colorPreset: "mint",
    recurrence,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// "now" for all tests: May 28, 2026 at 12:00 local
const NOW = new Date(2026, 4, 28, 12, 0, 0);

beforeEach(() => {
  localStorage.clear();
});

describe("UpcomingWidget — real data", () => {
  // AC-UPCOMING-REAL-1: empty store → empty label
  it("AC-UPCOMING-REAL-1: shows empty label when no events", () => {
    render(<UpcomingWidget lang="en" now={NOW} />);
    expect(screen.getByText("No upcoming events")).toBeTruthy();
  });

  it("AC-UPCOMING-REAL-1: empty label in Chinese", () => {
    render(<UpcomingWidget lang="zh" now={NOW} />);
    expect(screen.getByText("暂无近期事件")).toBeTruthy();
  });

  it("AC-UPCOMING-REAL-1: shows empty label when all events are in the past", () => {
    seedCalEvents({
      e1: makeEvent("e1", "2026-05-28T11:00", "Past event"), // before noon
    });
    render(<UpcomingWidget lang="en" now={NOW} />);
    expect(screen.getByText("No upcoming events")).toBeTruthy();
  });

  // AC-UPCOMING-REAL-2: future events rendered
  it("AC-UPCOMING-REAL-2: renders a future event's title and date", () => {
    seedCalEvents({
      e1: makeEvent("e1", "2026-05-29T10:00", "Team meeting"),
    });
    render(<UpcomingWidget lang="en" now={NOW} />);
    expect(screen.getByText("Team meeting")).toBeTruthy();
    expect(screen.getByText("29")).toBeTruthy(); // day
    expect(screen.getByText("May")).toBeTruthy(); // month
  });

  it("AC-UPCOMING-REAL-2: renders time string", () => {
    seedCalEvents({
      e1: makeEvent("e1", "2026-05-29T10:00", "Test"),
    });
    render(<UpcomingWidget lang="en" now={NOW} />);
    expect(screen.getByText("10:00")).toBeTruthy();
  });

  it("AC-UPCOMING-REAL-2: renders month in Chinese", () => {
    seedCalEvents({
      e1: makeEvent("e1", "2026-06-05T10:00", "June event"),
    });
    render(<UpcomingWidget lang="zh" now={NOW} />);
    expect(screen.getByText("6月")).toBeTruthy();
  });

  // AC-UPCOMING-REAL-3: past events excluded
  it("AC-UPCOMING-REAL-3: excludes past events", () => {
    seedCalEvents({
      past: makeEvent("past", "2026-05-28T11:00", "Past"), // before NOW 12:00
      future: makeEvent("future", "2026-05-29T10:00", "Future"),
    });
    render(<UpcomingWidget lang="en" now={NOW} />);
    expect(screen.queryByText("Past")).toBeNull();
    expect(screen.getByText("Future")).toBeTruthy();
  });

  // AC-UPCOMING-REAL-4: now prop threads correctly (N1 guard)
  it("AC-UPCOMING-REAL-4: now prop determines the cutoff correctly", () => {
    seedCalEvents({
      e1: makeEvent("e1", "2026-05-28T13:00", "After now"),
      e2: makeEvent("e2", "2026-05-28T11:00", "Before now"),
    });
    render(<UpcomingWidget lang="en" now={NOW} />); // now = 12:00
    expect(screen.getByText("After now")).toBeTruthy();
    expect(screen.queryByText("Before now")).toBeNull();
  });

  // Stable re-render (RD6 guard)
  it("re-renders without crash when now changes", () => {
    seedCalEvents({ e1: makeEvent("e1", "2026-05-29T10:00", "Event") });
    const { rerender, container } = render(<UpcomingWidget lang="en" now={NOW} />);
    expect(container.querySelector(".w-upcoming-body")).not.toBeNull();
    const later = new Date(2026, 4, 28, 13, 0, 0);
    rerender(<UpcomingWidget lang="en" now={later} />);
    expect(container.querySelector(".w-upcoming-body")).not.toBeNull();
  });
});
