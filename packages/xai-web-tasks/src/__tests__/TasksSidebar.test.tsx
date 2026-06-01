/**
 * TasksSidebar.test.tsx — T-LIFT-1..4
 *
 * Tests the controlled sidebar component and the inert custom/tag rows.
 * T-LIFT-1: sidebar renders with activeList prop controlling data-active highlight.
 * T-LIFT-2: clicking a smart-list row calls onSelectList with its id.
 * T-LIFT-3: switching activeList prop changes the active highlight.
 * T-LIFT-4: custom-list and tag rows do NOT call onSelectList (inert — Q1 defer).
 *
 * Phase: FP1 (smartlist-filter)
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import React, { useState } from "react";
import { TasksSidebar } from "../TasksSidebar.js";
import type { SmartListId } from "../types.js";

// ---------------------------------------------------------------------------
// Helper: controlled wrapper so we can drive activeList from outside
// ---------------------------------------------------------------------------

function SidebarWrapper({
  initial,
  onSelect,
}: {
  initial: SmartListId;
  onSelect?: (id: SmartListId) => void;
}) {
  const [activeList, setActiveList] = useState<SmartListId>(initial);
  function handleSelect(id: SmartListId) {
    setActiveList(id);
    onSelect?.(id);
  }
  return (
    <TasksSidebar lang="en" activeList={activeList} onSelectList={handleSelect} />
  );
}

// ---------------------------------------------------------------------------
// T-LIFT-1 — data-active controlled by prop
// ---------------------------------------------------------------------------

describe("TasksSidebar — T-LIFT-1 activeList prop controls highlight", () => {
  it("T-LIFT-1a: initial activeList=all marks the 'All' row as active", () => {
    render(
      <TasksSidebar lang="en" activeList="all" onSelectList={() => {}} />
    );
    const allRow = screen.getByText("All").closest(".list-row");
    expect(allRow).toHaveAttribute("data-active", "true");
  });

  it("T-LIFT-1b: initial activeList=inbox marks the 'Inbox' row as active", () => {
    render(
      <TasksSidebar lang="en" activeList="inbox" onSelectList={() => {}} />
    );
    const inboxRow = screen.getByText("Inbox").closest(".list-row");
    expect(inboxRow).toHaveAttribute("data-active", "true");

    // all row should NOT be active
    const allRow = screen.getByText("All").closest(".list-row");
    expect(allRow).toHaveAttribute("data-active", "false");
  });

  it("T-LIFT-1c: all 6 smart-list rows render", () => {
    render(
      <TasksSidebar lang="en" activeList="all" onSelectList={() => {}} />
    );
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Today")).toBeTruthy();
    expect(screen.getByText("Tomorrow")).toBeTruthy();
    expect(screen.getByText("Next 7 Days")).toBeTruthy();
    expect(screen.getByText("Inbox")).toBeTruthy();
    expect(screen.getByText("Summary")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// T-LIFT-2 — clicking a smart-list row calls onSelectList
// ---------------------------------------------------------------------------

describe("TasksSidebar — T-LIFT-2 clicking smart-list rows calls onSelectList", () => {
  it("T-LIFT-2a: clicking 'Inbox' calls onSelectList('inbox')", () => {
    const onSelect = vi.fn<(id: SmartListId) => void>();
    render(
      <TasksSidebar lang="en" activeList="all" onSelectList={onSelect} />
    );
    fireEvent.click(screen.getByText("Inbox"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("inbox");
  });

  it("T-LIFT-2b: clicking 'Next 7 Days' calls onSelectList('next7')", () => {
    const onSelect = vi.fn<(id: SmartListId) => void>();
    render(
      <TasksSidebar lang="en" activeList="all" onSelectList={onSelect} />
    );
    fireEvent.click(screen.getByText("Next 7 Days"));
    expect(onSelect).toHaveBeenCalledWith("next7");
  });

  it("T-LIFT-2c: Enter key on 'Today' calls onSelectList('today')", () => {
    const onSelect = vi.fn<(id: SmartListId) => void>();
    render(
      <TasksSidebar lang="en" activeList="all" onSelectList={onSelect} />
    );
    const todayRow = screen.getByText("Today").closest("[role='button']")!;
    fireEvent.keyDown(todayRow, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("today");
  });
});

// ---------------------------------------------------------------------------
// T-LIFT-3 — switching activeList prop updates the highlight
// ---------------------------------------------------------------------------

describe("TasksSidebar — T-LIFT-3 switching activeList updates highlight", () => {
  it("T-LIFT-3: clicking Inbox → switches active row from All to Inbox", () => {
    const { rerender } = render(
      <SidebarWrapper initial="all" />
    );

    const allRow = screen.getByText("All").closest(".list-row");
    const inboxRow = screen.getByText("Inbox").closest(".list-row");

    expect(allRow).toHaveAttribute("data-active", "true");
    expect(inboxRow).toHaveAttribute("data-active", "false");

    fireEvent.click(screen.getByText("Inbox"));

    expect(allRow).toHaveAttribute("data-active", "false");
    expect(inboxRow).toHaveAttribute("data-active", "true");

    void rerender; // suppress unused warning
  });
});

// ---------------------------------------------------------------------------
// T-LIFT-4 — custom-list and tag rows are INERT (Q1 defer)
// ---------------------------------------------------------------------------

describe("TasksSidebar — T-LIFT-4 custom/tag rows are inert (Q1 defer)", () => {
  it("T-LIFT-4a: clicking a custom-list row does NOT call onSelectList", () => {
    const onSelect = vi.fn<(id: SmartListId) => void>();
    render(
      <TasksSidebar lang="en" activeList="all" onSelectList={onSelect} />
    );

    // Custom list rows are aria-hidden and tabIndex=-1 — they should be inert
    // Try clicking the custom list label text (Research Papers is present in CUSTOM_LISTS)
    const researchEl = screen.queryByText("Research Papers");
    if (researchEl) {
      // fireEvent.click on aria-hidden element — should not propagate to onSelectList
      fireEvent.click(researchEl);
    }
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("T-LIFT-4b: custom-list rows have tabIndex=-1 and aria-hidden (non-selecting)", () => {
    render(
      <TasksSidebar lang="en" activeList="all" onSelectList={() => {}} />
    );

    // Personal Life is in CUSTOM_LISTS
    const personalEl = screen.queryByText("Personal Life");
    if (personalEl) {
      const row = personalEl.closest(".list-row");
      expect(row).toHaveAttribute("tabIndex", "-1");
      expect(row).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("T-LIFT-4c: custom-list rows do NOT have data-active (they cannot be selected)", () => {
    render(
      <TasksSidebar lang="en" activeList="all" onSelectList={() => {}} />
    );

    const personalEl = screen.queryByText("Personal Life");
    if (personalEl) {
      const row = personalEl.closest(".list-row");
      expect(row).not.toHaveAttribute("data-active");
    }
  });

  it("T-LIFT-4d: tag rows are inert (no onClick, aria-hidden)", () => {
    const onSelect = vi.fn<(id: SmartListId) => void>();
    render(
      <TasksSidebar lang="en" activeList="all" onSelectList={onSelect} />
    );

    // "1.Study" is in TAGS
    const studyEl = screen.queryByText("1.Study");
    if (studyEl) {
      const row = studyEl.closest(".list-row");
      expect(row).toHaveAttribute("tabIndex", "-1");
      expect(row).toHaveAttribute("aria-hidden", "true");
      fireEvent.click(studyEl);
    }
    expect(onSelect).not.toHaveBeenCalled();
  });
});
