import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { TimeTrackerModule } from "../TimeTrackerModule.js";
import { readTimeTrackerEntries } from "../internal/storage.js";

describe("TimeTrackerModule", () => {
  it("renders bilingual module title and default categories", () => {
    const { rerender } = render(<TimeTrackerModule lang="en" />);
    expect(screen.getByText("Time Tracker")).toBeInTheDocument();
    expect(screen.getByText("Study")).toBeInTheDocument();

    rerender(<TimeTrackerModule lang="zh" />);
    expect(screen.getByText("时间追踪")).toBeInTheDocument();
    expect(screen.getByText("学习")).toBeInTheDocument();
  });

  it("starts, pauses, resumes, and stops a tracked entry", () => {
    render(<TimeTrackerModule lang="en" />);

    act(() => {
      fireEvent.click(screen.getAllByText("Start")[0]!);
    });
    expect(readTimeTrackerEntries()).toHaveLength(1);
    expect(screen.getByText("Active sessions")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5_000);
      fireEvent.click(screen.getByLabelText("Pause"));
    });
    expect(readTimeTrackerEntries()[0]?.segments.at(-1)?.end).not.toBeNull();

    act(() => {
      fireEvent.click(screen.getByLabelText("Resume"));
    });
    expect(readTimeTrackerEntries()[0]?.segments).toHaveLength(2);

    act(() => {
      fireEvent.click(screen.getByLabelText("End"));
    });
    expect(readTimeTrackerEntries()[0]?.done).toBe(true);
  });

  it("adds a manual record", () => {
    render(<TimeTrackerModule lang="en" />);
    act(() => {
      fireEvent.click(screen.getByText("Add record"));
    });
    act(() => {
      fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Deep work" } });
      fireEvent.click(screen.getByText("Save"));
    });

    const entries = readTimeTrackerEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.note.en).toBe("Deep work");
    expect(entries[0]?.done).toBe(true);
  });
});
