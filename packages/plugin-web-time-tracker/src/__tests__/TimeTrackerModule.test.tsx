import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { TimeTrackerModule } from "../TimeTrackerModule.js";
import { readTimeTrackerCategories, readTimeTrackerEntries } from "../internal/storage.js";

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

    const restCard = screen.getByText("Rest").closest("article");
    expect(restCard).not.toBeNull();
    act(() => {
      fireEvent.click(within(restCard!).getByText("Start"));
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

  it("opens the subcategory picker before starting a categorized session", () => {
    render(<TimeTrackerModule lang="en" />);
    const studyCard = screen.getByText("Study").closest("article");
    expect(studyCard).not.toBeNull();

    act(() => {
      fireEvent.click(within(studyCard!).getByText("Start"));
    });
    expect(screen.getByText("Pick subcategory")).toBeInTheDocument();

    act(() => {
      const paperChoice = screen
        .getAllByText("Paper")
        .find((element) => element.tagName.toLowerCase() === "button");
      expect(paperChoice).toBeDefined();
      fireEvent.click(paperChoice!);
    });
    expect(readTimeTrackerEntries()[0]?.subId).toBe("sub_paper");
  });

  it("creates a custom category from the category editor", () => {
    render(<TimeTrackerModule lang="en" />);

    act(() => {
      fireEvent.click(screen.getByText("New category"));
    });
    act(() => {
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Admin" } });
      fireEvent.click(screen.getByText("Save"));
    });

    expect(readTimeTrackerCategories().some((category) => category.name.en === "Admin")).toBe(true);
  });

  it("renders the configurable insights board", () => {
    render(<TimeTrackerModule lang="en" />);

    act(() => {
      fireEvent.click(screen.getAllByText("Insights")[0]!);
    });

    expect(screen.getByText("Add widget")).toBeInTheDocument();
    expect(screen.getByText("Today total")).toBeInTheDocument();
    expect(screen.getByText("Category ranking")).toBeInTheDocument();
    expect(screen.getByText("Range summary")).toBeInTheDocument();
    expect(screen.getByText("Category mosaic")).toBeInTheDocument();
    expect(screen.getByText("Focus rhythm")).toBeInTheDocument();
    expect(screen.getByText("Recent sessions")).toBeInTheDocument();
  });

  it("renders detailed insight hover metadata after tracking time", () => {
    render(<TimeTrackerModule lang="en" />);

    act(() => {
      fireEvent.click(screen.getByText("Add record"));
    });
    act(() => {
      fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Research notes" } });
      fireEvent.click(screen.getByText("Save"));
    });
    act(() => {
      fireEvent.click(screen.getAllByText("Insights")[0]!);
    });

    expect(screen.getByText("Range summary")).toBeInTheDocument();
    expect(screen.getByText("Longest session").closest(".tt-tip")?.getAttribute("data-tip")).toContain("Research notes");
    const studyTip = screen
      .getAllByText("Study")
      .map((element) => element.closest(".tt-tip")?.getAttribute("data-tip") ?? "")
      .find((tip) => tip.includes("1 entry"));
    expect(studyTip).toContain("1 entry");
    expect(screen.getByText("Research notes").closest(".tt-tip")?.getAttribute("data-tip")).toContain("Duration");
  });
});
