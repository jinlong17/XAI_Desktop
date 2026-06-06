/**
 * TasksSidebar.test.tsx — controlled smart/list/tag navigation.
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import React, { useState } from "react";
import { TasksSidebar } from "../TasksSidebar.js";
import type { SmartListId, TaskViewSelection } from "../types.js";
import { DEFAULT_TASK_LISTS, DEFAULT_TASK_TAGS } from "../internal/taskMeta.js";

const smartCounts = {
  all: 26,
  today: 10,
  tomorrow: 2,
  next7: 2,
  inbox: 11,
  summary: 26,
} satisfies Record<SmartListId, number>;

const listCounts = {
  inbox: 11,
  research: 5,
  personal: 4,
  career: 1,
  reminders: 1,
};

const tagCounts = {
  study: 5,
  work: 1,
  personal: 4,
  todo: 1,
  other: 1,
};

function renderSidebar(
  activeView: TaskViewSelection,
  overrides?: Partial<React.ComponentProps<typeof TasksSidebar>>,
) {
  const props: React.ComponentProps<typeof TasksSidebar> = {
    lang: "en",
    activeView,
    lists: DEFAULT_TASK_LISTS,
    tags: DEFAULT_TASK_TAGS,
    smartCounts,
    listCounts,
    tagCounts,
    onSelectSmart: vi.fn(),
    onSelectList: vi.fn(),
    onSelectTag: vi.fn(),
    onCreateList: vi.fn(),
    onCreateTag: vi.fn(),
    onEditList: vi.fn(),
    onEditTag: vi.fn(),
    onDeleteList: vi.fn(),
    onDeleteTag: vi.fn(),
    onReorderList: vi.fn(),
    onReorderTag: vi.fn(),
    onTaskDropToList: vi.fn(),
    onTaskDropToTag: vi.fn(),
    ...overrides,
  };
  return { ...render(<TasksSidebar {...props} />), props };
}

function SidebarWrapper({ initial }: { initial: TaskViewSelection }) {
  const [activeView, setActiveView] = useState<TaskViewSelection>(initial);
  return (
    <TasksSidebar
      lang="en"
      activeView={activeView}
      lists={DEFAULT_TASK_LISTS}
      tags={DEFAULT_TASK_TAGS}
      smartCounts={smartCounts}
      listCounts={listCounts}
      tagCounts={tagCounts}
      onSelectSmart={(id) => setActiveView({ kind: "smart", id })}
      onSelectList={(id) => setActiveView({ kind: "list", id })}
      onSelectTag={(id) => setActiveView({ kind: "tag", id })}
      onCreateList={() => {}}
      onCreateTag={() => {}}
      onEditList={() => {}}
      onEditTag={() => {}}
      onDeleteList={() => {}}
      onDeleteTag={() => {}}
      onReorderList={() => {}}
      onReorderTag={() => {}}
      onTaskDropToList={() => {}}
      onTaskDropToTag={() => {}}
    />
  );
}

describe("TasksSidebar smart filters", () => {
  it("marks the active smart row", () => {
    renderSidebar({ kind: "smart", id: "inbox" });

    expect(firstTextRow("Inbox")).toHaveAttribute("data-active", "true");
    expect(screen.getByText("All").closest(".list-row")).toHaveAttribute("data-active", "false");
  });

  it("calls onSelectSmart when smart rows are clicked or confirmed by keyboard", () => {
    const onSelectSmart = vi.fn<(id: SmartListId) => void>();
    renderSidebar({ kind: "smart", id: "all" }, { onSelectSmart });

    fireEvent.click(firstTextRow("Inbox"));
    expect(onSelectSmart).toHaveBeenCalledWith("inbox");

    const todayRow = screen.getByText("Today").closest("[role='button']")!;
    fireEvent.keyDown(todayRow, { key: "Enter" });
    expect(onSelectSmart).toHaveBeenCalledWith("today");
  });

  it("switches active smart row in a controlled wrapper", () => {
    render(<SidebarWrapper initial={{ kind: "smart", id: "all" }} />);

    expect(screen.getByText("All").closest(".list-row")).toHaveAttribute("data-active", "true");
    fireEvent.click(firstTextRow("Inbox"));
    expect(screen.getByText("All").closest(".list-row")).toHaveAttribute("data-active", "false");
    expect(firstTextRow("Inbox")).toHaveAttribute("data-active", "true");
  });
});

describe("TasksSidebar editable lists and tags", () => {
  it("selects custom lists and tags instead of rendering them inert", () => {
    const onSelectList = vi.fn<(id: string) => void>();
    const onSelectTag = vi.fn<(id: string) => void>();
    renderSidebar({ kind: "smart", id: "all" }, { onSelectList, onSelectTag });

    fireEvent.click(screen.getByText("Research Papers"));
    expect(onSelectList).toHaveBeenCalledWith("research");

    fireEvent.click(screen.getByText("Study"));
    expect(onSelectTag).toHaveBeenCalledWith("study");
  });

  it("exposes create actions for lists and tags", () => {
    const onCreateList = vi.fn();
    const onCreateTag = vi.fn();
    renderSidebar({ kind: "smart", id: "all" }, { onCreateList, onCreateTag });

    fireEvent.click(screen.getByLabelText("New list"));
    fireEvent.click(screen.getByLabelText("New tag"));

    expect(onCreateList).toHaveBeenCalledTimes(1);
    expect(onCreateTag).toHaveBeenCalledTimes(1);
  });

  it("drops a task onto a list or tag", () => {
    const onTaskDropToList = vi.fn();
    const onTaskDropToTag = vi.fn();
    renderSidebar({ kind: "smart", id: "all" }, { onTaskDropToList, onTaskDropToTag });

    const dataTransfer = makeDataTransfer({ "application/x-xai-task-id": "t1" });

    fireEvent.dragOver(screen.getByText("Research Papers").closest(".list-row")!, { dataTransfer, preventDefault: () => {} });
    fireEvent.drop(screen.getByText("Research Papers").closest(".list-row")!, { dataTransfer, preventDefault: () => {} });
    expect(onTaskDropToList).toHaveBeenCalledWith("t1", "research");

    fireEvent.dragOver(screen.getByText("Study").closest(".list-row")!, { dataTransfer, preventDefault: () => {} });
    fireEvent.drop(screen.getByText("Study").closest(".list-row")!, { dataTransfer, preventDefault: () => {} });
    expect(onTaskDropToTag).toHaveBeenCalledWith("t1", "study");
  });
});

function makeDataTransfer(seed: Record<string, string>) {
  return {
    effectAllowed: "" as string,
    dropEffect: "" as string,
    data: { ...seed } as Record<string, string>,
    setData(type: string, value: string) { this.data[type] = value; },
    getData(type: string) { return this.data[type] ?? ""; },
  };
}

function firstTextRow(text: string): HTMLElement {
  return screen.getAllByText(text)[0]!.closest(".list-row") as HTMLElement;
}
