import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { setPref } from "@repo/plugin-web-storage";
import { CalendarModule } from "../CalendarModule.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-05-22T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

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

describe("CalendarModule recurrence integration (P4)", () => {
  it("AC-RECUR-1: daily recurring event over Week view renders 7 blocks", () => {
    setPref("xai_calendar_view", "week");
    setPref("xai_calendar_events", {
      r1: userEvent("r1", "Recurring Daily Week", "2026-05-17T09:00", "2026-05-17T10:00", { kind: "daily" }),
    });
    render(<CalendarModule lang="en" />);
    expect(screen.getAllByTitle("Recurring Daily Week")).toHaveLength(7);
  });

  it("AC-RECUR-2: weekly recurring event over Week view renders exactly one block", () => {
    setPref("xai_calendar_view", "week");
    setPref("xai_calendar_events", {
      r2: userEvent("r2", "Recurring Weekly Week", "2026-05-22T09:00", "2026-05-22T10:00", { kind: "weekly" }),
    });
    render(<CalendarModule lang="en" />);
    expect(screen.getAllByTitle("Recurring Weekly Week")).toHaveLength(1);
  });

  it("AC-RECUR-3: daily recurring event over Month view renders all month-window instances", () => {
    setPref("xai_calendar_view", "month");
    setPref("xai_calendar_events", {
      r3: userEvent("r3", "Recurring Daily Month", "2026-05-22T09:00", "2026-05-22T10:00", { kind: "daily" }),
    });
    render(<CalendarModule lang="en" />);
    expect(screen.getAllByText("Recurring Daily Month")).toHaveLength(10);
  });

  it("AC-RECUR-5: daily recurring event over Day view renders exactly one block", () => {
    setPref("xai_calendar_view", "day");
    setPref("xai_calendar_events", {
      r4: userEvent("r4", "Recurring Daily Day", "2026-05-22T09:00", "2026-05-22T10:00", { kind: "daily" }),
    });
    render(<CalendarModule lang="en" />);
    expect(screen.getAllByTitle("Recurring Daily Day")).toHaveLength(1);
  });

  it("AC-RECUR-6: editing a recurring event updates all rendered instances", () => {
    setPref("xai_calendar_view", "week");
    setPref("xai_calendar_events", {
      r5: userEvent("r5", "Recurring Edit Target", "2026-05-17T09:00", "2026-05-17T10:00", { kind: "daily" }),
    });
    render(<CalendarModule lang="en" />);

    fireEvent.click(screen.getAllByTitle("Recurring Edit Target")[0]!);
    const input = document.getElementById("event-composer-title-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Recurring Edited" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.queryAllByTitle("Recurring Edit Target")).toHaveLength(0);
    expect(screen.getAllByTitle("Recurring Edited")).toHaveLength(7);
  });

  it("AC-RECUR-7: deleting a recurring event removes all rendered instances", () => {
    setPref("xai_calendar_view", "week");
    setPref("xai_calendar_events", {
      r6: userEvent("r6", "Recurring Delete Target", "2026-05-17T09:00", "2026-05-17T10:00", { kind: "daily" }),
    });
    render(<CalendarModule lang="en" />);

    fireEvent.click(screen.getAllByTitle("Recurring Delete Target")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Delete: Recurring Delete Target" }));

    expect(screen.queryAllByTitle("Recurring Delete Target")).toHaveLength(0);
  });
});
