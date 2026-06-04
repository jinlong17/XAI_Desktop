import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { StrictMode } from "react";
import { TimeTrackerModule } from "../TimeTrackerModule.js";
import { TIME_TRACKER_CATEGORIES_KEY, readTimeTrackerCategories, readTimeTrackerEntries } from "../internal/storage.js";
import { TIME_TRACKER_CATEGORY_COLORS } from "../internal/defaults.js";

describe("TimeTrackerModule", () => {
  it("renders bilingual module title and default categories", () => {
    const { rerender } = render(<TimeTrackerModule lang="en" />);
    expect(screen.getByText("Time Tracker")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Study" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Code" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Paper" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Code" })).not.toHaveTextContent("Today");
    expect(screen.queryByLabelText("Time tracker mode")).not.toBeInTheDocument();

    rerender(<TimeTrackerModule lang="zh" />);
    expect(screen.getByText("时间追踪")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "学习" })).toBeInTheDocument();
  });

  it("starts, pauses, resumes, and stops a tracked entry", () => {
    render(<TimeTrackerModule lang="en" />);

    const restCard = screen.getByRole("heading", { name: "Rest" }).closest("article");
    expect(restCard).not.toBeNull();
    act(() => {
      fireEvent.click(within(restCard!).getByRole("button", { name: "Start Whole category" }));
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

  it("starts one entry per click under React StrictMode", () => {
    render(
      <StrictMode>
        <TimeTrackerModule lang="en" />
      </StrictMode>,
    );

    const studyCard = screen.getByRole("heading", { name: "Study" }).closest("article");
    expect(studyCard).not.toBeNull();
    act(() => {
      fireEvent.click(within(studyCard!).getByRole("button", { name: "Start Code" }));
    });

    expect(readTimeTrackerEntries()).toHaveLength(1);
    expect(screen.getByText("Active sessions").closest("section")).toHaveTextContent("Code · Study");
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

  it("collapses and restores day record details", () => {
    const { unmount } = render(<TimeTrackerModule lang="en" />);
    act(() => {
      fireEvent.click(screen.getByText("Add record"));
    });
    act(() => {
      fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Review notes" } });
      fireEvent.click(screen.getByText("Save"));
    });
    expect(screen.getByText("Review notes")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByLabelText("Hide records"));
    });

    expect(screen.queryByText("Review notes")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Show records")).toHaveAttribute("aria-expanded", "false");
    expect(localStorage.getItem("xai_tt_day_records_collapsed_v1")).toBe("1");

    unmount();
    render(<TimeTrackerModule lang="en" />);
    expect(screen.queryByText("Review notes")).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByLabelText("Show records"));
    });

    expect(screen.getByText("Review notes")).toBeInTheDocument();
    expect(screen.getByLabelText("Hide records")).toHaveAttribute("aria-expanded", "true");
    expect(localStorage.getItem("xai_tt_day_records_collapsed_v1")).toBe("0");
  });

  it("adjusts a completed record time with inline hour minute second controls", () => {
    render(<TimeTrackerModule lang="en" />);
    act(() => {
      fireEvent.click(screen.getByText("Add record"));
    });
    act(() => {
      fireEvent.click(screen.getByText("Save"));
    });

    act(() => {
      fireEvent.click(screen.getByLabelText("Adjust time"));
    });
    expect(screen.getByRole("spinbutton", { name: "Start time Hour" })).toHaveAttribute("aria-valuemax", "23");
    expect(screen.getByRole("spinbutton", { name: "End time Second" })).toHaveAttribute("aria-valuemax", "59");
    act(() => {
      fireEvent.click(screen.getByLabelText("Increase Start time Hour"));
      fireEvent.click(screen.getByLabelText("Increase End time Minute"));
      fireEvent.change(screen.getByLabelText("End time Second"), { target: { value: "30" } });
    });
    act(() => {
      fireEvent.click(within(screen.getByRole("dialog", { name: "Adjust time" })).getByText("Save"));
    });

    const entry = readTimeTrackerEntries()[0];
    expect(entry).toBeDefined();
    expect(new Date(entry!.segments[0]!.start).getHours()).toBe(10);
    expect(new Date(entry!.segments[0]!.end!).getMinutes()).toBe(1);
    expect(new Date(entry!.segments[0]!.end!).getSeconds()).toBe(30);
    expect(screen.getByLabelText("Adjust time")).toHaveTextContent("10:00:00 - 10:01:30");
  });

  it("renders subcategory cards and starts a categorized session directly", () => {
    render(<TimeTrackerModule lang="en" />);
    const studyCard = screen.getByRole("heading", { name: "Study" }).closest("article");
    expect(studyCard).not.toBeNull();
    expect(within(studyCard!).getByRole("button", { name: "Start Code" })).toBeInTheDocument();
    expect(within(studyCard!).getByRole("button", { name: "Start Paper" })).toBeInTheDocument();

    act(() => {
      fireEvent.click(within(studyCard!).getByRole("button", { name: "Start Paper" }));
    });
    expect(screen.queryByText("Pick subcategory")).not.toBeInTheDocument();
    expect(readTimeTrackerEntries()[0]?.subId).toBe("sub_paper");
    const activePanel = screen.getByText("Active sessions").closest("section");
    expect(activePanel).not.toBeNull();
    expect(within(activePanel!).getByText("Paper")).toBeInTheDocument();
    expect(activePanel).toHaveTextContent("Paper · Study");
  });

  it("collapses and restores subcategory cards per category", () => {
    const { unmount } = render(<TimeTrackerModule lang="en" />);
    const studyCard = screen.getByRole("heading", { name: "Study" }).closest("article");
    expect(studyCard).not.toBeNull();
    expect(within(studyCard!).getByRole("button", { name: "Start Code" })).toBeInTheDocument();

    act(() => {
      fireEvent.click(within(studyCard!).getByLabelText("Hide subcategories Study"));
    });

    expect(within(studyCard!).queryByRole("button", { name: "Start Code" })).not.toBeInTheDocument();
    expect(within(studyCard!).getByLabelText("Show subcategories Study")).toHaveAttribute("aria-expanded", "false");
    expect(localStorage.getItem("xai_tt_category_collapsed_v1")).toContain("cat_study");

    unmount();
    render(<TimeTrackerModule lang="en" />);
    const restoredStudyCard = screen.getByRole("heading", { name: "Study" }).closest("article");
    expect(restoredStudyCard).not.toBeNull();
    expect(within(restoredStudyCard!).queryByRole("button", { name: "Start Code" })).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(within(restoredStudyCard!).getByLabelText("Show subcategories Study"));
    });

    expect(within(restoredStudyCard!).getByRole("button", { name: "Start Code" })).toBeInTheDocument();
    expect(within(restoredStudyCard!).getByLabelText("Hide subcategories Study")).toHaveAttribute("aria-expanded", "true");
    expect(localStorage.getItem("xai_tt_category_collapsed_v1")).toBe("[]");
  });

  it("starts multiple subcategory sessions in parallel without switch confirmation", () => {
    render(<TimeTrackerModule lang="en" />);
    const studyCard = screen.getByRole("heading", { name: "Study" }).closest("article");
    expect(studyCard).not.toBeNull();

    act(() => {
      fireEvent.click(within(studyCard!).getByRole("button", { name: "Start Paper" }));
    });
    act(() => {
      fireEvent.click(within(studyCard!).getByRole("button", { name: "Start Code" }));
    });

    const entries = readTimeTrackerEntries();
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.subId)).toEqual(["sub_paper", "sub_code"]);
    expect(screen.queryByText(/Switch from/)).not.toBeInTheDocument();
    const activePanel = screen.getByText("Active sessions").closest("section");
    expect(activePanel).not.toBeNull();
    expect(activePanel).toHaveTextContent("Paper · Study");
    expect(activePanel).toHaveTextContent("Code · Study");
  });

  it("keeps parent category totals when tracking a subcategory", () => {
    render(<TimeTrackerModule lang="en" />);
    const studyCard = screen.getByRole("heading", { name: "Study" }).closest("article");
    expect(studyCard).not.toBeNull();

    act(() => {
      fireEvent.click(within(studyCard!).getByRole("button", { name: "Start Paper" }));
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    act(() => {
      fireEvent.click(screen.getByLabelText("End"));
    });

    expect(readTimeTrackerEntries()[0]?.categoryId).toBe("cat_study");
    expect(readTimeTrackerEntries()[0]?.subId).toBe("sub_paper");
    expect(within(studyCard!).getByText("1m / 120m goal")).toBeInTheDocument();
  });

  it("creates a custom category from the category editor", () => {
    const { container } = render(<TimeTrackerModule lang="en" />);
    expect(container.querySelector(".tt-category-new")).toBeNull();

    act(() => {
      fireEvent.click(screen.getByLabelText("New category"));
    });
    act(() => {
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Admin" } });
      fireEvent.click(screen.getByText("Save"));
    });

    expect(readTimeTrackerCategories().some((category) => category.name.en === "Admin")).toBe(true);
  });

  it("saves subcategory color and icon from the category editor", () => {
    render(<TimeTrackerModule lang="en" />);
    const studyCard = screen.getByRole("heading", { name: "Study" }).closest("article");
    expect(studyCard).not.toBeNull();

    act(() => {
      fireEvent.click(within(studyCard!).getByLabelText("Edit category"));
    });

    const codeRow = screen.getByLabelText("Subcategory 1").closest("li");
    expect(codeRow).not.toBeNull();
    act(() => {
      fireEvent.change(within(codeRow!).getByLabelText("Code Icon"), { target: { value: "paper" } });
      fireEvent.click(within(codeRow!).getByLabelText(`Color ${TIME_TRACKER_CATEGORY_COLORS[5]}`));
    });
    act(() => {
      fireEvent.click(screen.getByText("Save"));
    });

    const study = readTimeTrackerCategories().find((category) => category.id === "cat_study");
    expect(study?.subs[0]?.icon).toBe("paper");
    expect(study?.subs[0]?.color).toBe(TIME_TRACKER_CATEGORY_COLORS[5]);
  });

  it("adds a subcategory from the category card quick action", () => {
    render(<TimeTrackerModule lang="en" />);
    const studyCard = screen.getByRole("heading", { name: "Study" }).closest("article");
    expect(studyCard).not.toBeNull();

    act(() => {
      fireEvent.click(within(studyCard!).getByLabelText("Add subcategory Study"));
    });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Add subcategory · Study");
    for (const item of TIME_TRACKER_CATEGORY_COLORS) {
      expect(within(dialog).getByLabelText(item)).toBeInTheDocument();
    }
    expect(within(dialog).getByLabelText("writing")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("fitness")).toBeInTheDocument();

    act(() => {
      fireEvent.change(within(dialog).getByLabelText("Subcategory Name"), { target: { value: "Review" } });
      fireEvent.click(within(dialog).getByLabelText(TIME_TRACKER_CATEGORY_COLORS[8]!));
      fireEvent.click(within(dialog).getByLabelText("paper"));
    });
    act(() => {
      fireEvent.click(within(dialog).getByText("Save"));
    });

    const study = readTimeTrackerCategories().find((category) => category.id === "cat_study");
    const review = study?.subs.find((sub) => sub.name.en === "Review");
    expect(review?.color).toBe(TIME_TRACKER_CATEGORY_COLORS[8]);
    expect(review?.icon).toBe("paper");
    expect(screen.getByRole("button", { name: "Start Review" })).toBeInTheDocument();
  });

  it("opens a subcategory dialog from category settings before appending the row", () => {
    render(<TimeTrackerModule lang="en" />);
    const studyCard = screen.getByRole("heading", { name: "Study" }).closest("article");
    expect(studyCard).not.toBeNull();

    act(() => {
      fireEvent.click(within(studyCard!).getByLabelText("Edit category"));
    });
    const editor = screen.getByRole("dialog");
    expect(within(editor).getAllByLabelText(/^Subcategory \d+$/)).toHaveLength(4);

    act(() => {
      fireEvent.click(within(editor).getByText("Add subcategory"));
    });
    const dialogs = screen.getAllByRole("dialog");
    const subDialog = dialogs[dialogs.length - 1]!;
    expect(subDialog).toHaveTextContent("Add subcategory");
    expect(within(editor).getAllByLabelText(/^Subcategory \d+$/)).toHaveLength(4);

    act(() => {
      fireEvent.change(within(subDialog).getByLabelText("Subcategory Name"), { target: { value: "Labs" } });
      fireEvent.click(within(subDialog).getByLabelText(TIME_TRACKER_CATEGORY_COLORS[15]!));
      fireEvent.click(within(subDialog).getByLabelText("meeting"));
    });
    act(() => {
      fireEvent.click(within(subDialog).getByText("Save"));
    });

    const updatedEditor = screen.getByRole("dialog");
    expect(within(updatedEditor).getAllByLabelText(/^Subcategory \d+$/)).toHaveLength(5);
    expect(within(updatedEditor).getByDisplayValue("Labs")).toBeInTheDocument();
    act(() => {
      fireEvent.click(within(updatedEditor).getByText("Save"));
    });

    const study = readTimeTrackerCategories().find((category) => category.id === "cat_study");
    const labs = study?.subs.find((sub) => sub.name.en === "Labs");
    expect(labs?.color).toBe(TIME_TRACKER_CATEGORY_COLORS[15]);
    expect(labs?.icon).toBe("meeting");
  });

  it("backfills missing stored subcategory color and icon without dropping old data", () => {
    localStorage.setItem(TIME_TRACKER_CATEGORIES_KEY, JSON.stringify([
      {
        id: "cat_study",
        name: { en: "Study", zh: "学习" },
        color: TIME_TRACKER_CATEGORY_COLORS[2],
        icon: "study",
        goalMin: 120,
        subs: [{ id: "sub_code", name: { en: "Code", zh: "代码" } }],
        createdAt: 1,
        updatedAt: 1,
      },
    ]));

    const categories = readTimeTrackerCategories();
    expect(categories[0]?.subs[0]?.name.en).toBe("Code");
    expect(categories[0]?.subs[0]?.color).toBe(TIME_TRACKER_CATEGORY_COLORS[2]);
    expect(categories[0]?.subs[0]?.icon).toBe("code");
  });

  it("hides and restores tracker sidebar insights", () => {
    render(<TimeTrackerModule lang="en" />);

    expect(screen.getByText("Where time went")).toBeInTheDocument();
    expect(screen.getByText("7-day trend")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getAllByLabelText("Hide insight preview")[0]!);
    });

    expect(screen.queryByText("Where time went")).not.toBeInTheDocument();
    expect(screen.queryByText("7-day trend")).not.toBeInTheDocument();
    expect(screen.getByText("Insights hidden")).toBeInTheDocument();
    expect(localStorage.getItem("xai_tt_sidebar_insights_hidden_v1")).toBe("1");

    act(() => {
      fireEvent.click(screen.getByText("Show"));
    });

    expect(screen.getByText("Where time went")).toBeInTheDocument();
    expect(screen.getByText("7-day trend")).toBeInTheDocument();
    expect(localStorage.getItem("xai_tt_sidebar_insights_hidden_v1")).toBe("0");
  });

  it("renders the configurable insights board", () => {
    render(<TimeTrackerModule lang="en" />);

    act(() => {
      fireEvent.click(screen.getAllByText("Insights")[0]!);
    });

    expect(screen.getByText("Add widget")).toBeInTheDocument();
    expect(screen.getByText("Today total")).toBeInTheDocument();
    expect(screen.getByText("Category ranking")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Export CSV")).toBeInTheDocument();
    expect(screen.getByText("Delete range")).toBeDisabled();
    expect(screen.getByText("Range summary")).toBeInTheDocument();
    expect(screen.getByText("Category mosaic")).toBeInTheDocument();
    expect(screen.getByText("Focus rhythm")).toBeInTheDocument();
    expect(screen.getByText("Recent sessions")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText("Filters"));
    });
    expect(screen.getByText("Year")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText("Custom"));
    });
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
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

  it("deletes records in the selected insight range after confirmation", () => {
    render(<TimeTrackerModule lang="en" />);

    act(() => {
      fireEvent.click(screen.getByText("Add record"));
    });
    act(() => {
      fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Temporary report row" } });
      fireEvent.click(screen.getByText("Save"));
    });
    expect(readTimeTrackerEntries()).toHaveLength(1);

    act(() => {
      fireEvent.click(screen.getAllByText("Insights")[0]!);
    });
    act(() => {
      fireEvent.click(screen.getByText("Delete range"));
    });

    expect(screen.getByText(/Delete 1 records/)).toBeInTheDocument();
    act(() => {
      fireEvent.click(within(screen.getByRole("dialog")).getByText("Delete"));
    });

    expect(readTimeTrackerEntries()).toHaveLength(0);
  });
});
