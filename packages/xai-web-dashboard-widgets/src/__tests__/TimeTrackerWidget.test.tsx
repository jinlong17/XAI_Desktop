import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { createTimeTrackerEntry, writeTimeTrackerEntries } from "@repo/plugin-web-time-tracker";
import { TimeTrackerWidget } from "../widgets/TimeTrackerWidget.js";

describe("TimeTrackerWidget", () => {
  it("renders today's total and opens the Time Tracker module", () => {
    writeTimeTrackerEntries([
      createTimeTrackerEntry(
        "cat_work",
        null,
        new Date(2026, 4, 23, 9, 0).getTime(),
        new Date(2026, 4, 23, 10, 15).getTime(),
        { en: "", zh: "" },
      ),
    ]);
    const goTo = vi.fn();
    render(<TimeTrackerWidget lang="en" now={new Date(2026, 4, 23, 10, 30)} goTo={goTo} />);

    expect(screen.getByText("Time tracked")).toBeTruthy();
    expect(screen.getByText("1h 15m")).toBeTruthy();

    fireEvent.click(screen.getByRole("button"));
    expect(goTo).toHaveBeenCalledWith("timetrack");
  });
});
