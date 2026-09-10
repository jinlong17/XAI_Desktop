import { accountScope, getPref } from "@repo/plugin-web-storage";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { TasksModule } from "../TasksModule.js";
import { groupTasksByDueDate } from "../internal/groupTasksByDueDate.js";
import { addCard, moveCard, updateCard } from "../internal/tasksReducer.js";
import { filterCardsByList } from "../internal/filterCardsByList.js";
import { SEED_TASK_COLS } from "../internal/seed/tasksMock.js";
import { isTaskColsArray } from "../internal/validate.js";
import { taskCardFromBoardLink } from "../taskLink.js";
import type { TaskCol } from "../types.js";
const empty = (): TaskCol[] => SEED_TASK_COLS.map(c => ({ ...c, tasks: [], completed: [], count: 0 }));
const stored = (): TaskCol[] => getPref("xai_task_cols") as unknown as TaskCol[];

describe("REL-01 dueDate lifecycle", () => {
  it("creates, patches, moves and roundtrips without losing source or legacy metadata", () => {
    let cols = addCard(empty(), { title: "dated", dueDate: "2028-02-29", withDate: true }, "later");
    const id = cols[2]!.tasks[0]!.id;
    cols = updateCard(cols, id, { dueDate: "2027-01-01" });
    expect(filterCardsByList(cols, "tomorrow", new Date(2026, 11, 31)).flatMap(c => c.tasks).map(t => t.id)).toEqual([id]);
    const linked = taskCardFromBoardLink({ type: "board-card", boardId: "b", listId: "l", cardId: "c", title: { en: "linked", zh: "linked" }, dueDate: "2027-01-01" });
    cols[2] = { ...cols[2]!, tasks: [linked], count: 1 };
    const moved = moveCard(cols, linked.id, "later", "next7", new Date(2027, 0, 1));
    expect(moved[1]!.tasks[0]).toMatchObject({ dueDate: "2027-01-02", source: linked.source });
    const restored = JSON.parse(JSON.stringify(moved));
    expect(isTaskColsArray(restored)).toBe(true);
    expect(restored).toEqual(moved);
    expect(updateCard(moved, linked.id, { dueDate: "2027-02-29" })).toBe(moved);
    const cleared = updateCard(moved, linked.id, { dueDate: null });
    expect(cleared.flatMap(c => c.tasks)[0]!.dueDate).toBeUndefined();
    expect(cleared.flatMap(c => c.tasks)[0]!.source).toEqual(linked.source);
    expect(taskCardFromBoardLink({ ...linked.source!, title: linked.title, dueDate: "2027-02-30" }).dueDate).toBeUndefined();
  });

  it("reassigns known dates, preserves legacy/completed records and distinguishes a 7-day boundary", () => {
    const cols = empty();
    cols[2] = { ...cols[2]!, tasks: [
      { id: "today", dueDate: "2027-01-01", title: { en: "today", zh: "today" } },
      { id: "legacy", date: "1/1", title: { en: "legacy", zh: "legacy" } },
      { id: "week", dueDate: "2027-01-08", title: { en: "week", zh: "week" } },
      { id: "later", dueDate: "2027-01-09", title: { en: "later", zh: "later" } },
    ], completed: [{ id: "done", dueDate: "2027-01-01", title: { en: "done", zh: "done" }, done: true }] };
    const snapshot = JSON.stringify(cols);
    const grouped = groupTasksByDueDate(cols, new Date(2027, 0, 1));
    expect(grouped[0]!.tasks.map(t => t.id)).toEqual(["today"]);
    expect(grouped[0]!.completed?.map(t => t.id)).toEqual(["done"]);
    expect(grouped[1]!.tasks.map(t => t.id)).toEqual(["week"]);
    expect(grouped[2]!.tasks.map(t => t.id)).toEqual(["legacy", "later"]);
    expect(JSON.stringify(cols)).toBe(snapshot);
  });

  it("actual composer → detail edit → reload → local midnight refresh", async () => {
    vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 58));
    localStorage.setItem(accountScope.physicalKey("xai_task_cols"), JSON.stringify(empty()));
    const view = render(<TasksModule lang="en" />);
    fireEvent.click(screen.getByRole("button", { name: "New task" }));
    const dialog = document.querySelector("dialog.task-composer")!;
    fireEvent.change(dialog.querySelector('input[type="text"]')!, { target: { value: "Year boundary" } });
    fireEvent.click(within(dialog as HTMLElement).getByLabelText("Add a date"));
    fireEvent.change(within(dialog as HTMLElement).getByLabelText("Due date"), { target: { value: "2027-01-02" } });
    fireEvent.click(dialog.querySelector(".task-composer__btn--primary")!);
    await act(async () => {});
    expect(stored().flatMap(c => c.tasks)[0]?.dueDate).toBe("2027-01-02");
    fireEvent.click(screen.getByText("Year boundary"));
    const detail = screen.getByLabelText("Task details");
    fireEvent.change(within(detail).getByLabelText("Due date"), { target: { value: "2027-01-01" } });
    act(() => { window.dispatchEvent(new Event("focus")); });
    expect(within(detail).getByLabelText("Due date")).toHaveValue("2027-01-01");
    fireEvent.click(within(detail).getByRole("button", { name: /^Save$/ }));
    await act(async () => {});
    expect(stored().flatMap(c => c.tasks)[0]?.dueDate).toBe("2027-01-01");
    view.unmount();
    render(<TasksModule lang="en" />);
    fireEvent.click(within(document.querySelector(".module-sidebar") as HTMLElement).getByText("Tomorrow"));
    expect(screen.getByText("Year boundary")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.queryByText("Year boundary")).not.toBeInTheDocument();
    fireEvent.click(within(document.querySelector(".module-sidebar") as HTMLElement).getByText("Today"));
    expect(screen.getByText("Year boundary")).toBeInTheDocument();
    expect(stored().flatMap(c => c.tasks)[0]?.dueDate).toBe("2027-01-01");
    expect(stored().flatMap(c => c.tasks).find(task => task.title.en === "Year boundary")).toBeDefined();
  });
});
