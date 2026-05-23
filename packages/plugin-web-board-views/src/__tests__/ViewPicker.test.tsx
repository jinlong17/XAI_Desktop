/**
 * Component tests for ViewPicker — VP1..VP5
 *
 * Test plan: packages/xai-web-board-views/docs/test.md §2.3
 */

import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewPicker } from "../ViewPicker.js";

const VIEW_IDS = ["board", "table", "calendar", "dashboard", "timeline", "map"] as const;

describe("ViewPicker", () => {
  test("VP1 renders 6 buttons matching BoardViewId literal union", () => {
    render(<ViewPicker activeView="board" onChange={() => {}} lang="en" />);
    VIEW_IDS.forEach((id) => {
      expect(screen.getByTestId(`vp-btn-${id}`)).toBeInTheDocument();
    });
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(6);
  });

  test("VP2 active view button has aria-pressed='true'", () => {
    render(<ViewPicker activeView="table" onChange={() => {}} lang="en" />);
    const tableBtn = screen.getByTestId("vp-btn-table");
    expect(tableBtn).toHaveAttribute("aria-pressed", "true");
    // Others must be false
    (["board", "calendar", "dashboard", "timeline", "map"] as const).forEach((id) => {
      expect(screen.getByTestId(`vp-btn-${id}`)).toHaveAttribute("aria-pressed", "false");
    });
  });

  test("VP3 clicking inactive view fires onChange with that view id", () => {
    const onChange = vi.fn();
    render(<ViewPicker activeView="board" onChange={onChange} lang="en" />);
    fireEvent.click(screen.getByTestId("vp-btn-timeline"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("timeline");
  });

  test("VP4 bilingual: button labels switch when lang prop flips en -> zh", () => {
    const { rerender } = render(<ViewPicker activeView="table" onChange={() => {}} lang="en" />);
    expect(screen.getByTestId("vp-btn-table").textContent).toContain("Table");
    rerender(<ViewPicker activeView="table" onChange={() => {}} lang="zh" />);
    expect(screen.getByTestId("vp-btn-table").textContent).toContain("表格");
  });

  test("VP5 clicking already-active view still fires onChange (consumer guards idempotency)", () => {
    const onChange = vi.fn();
    render(<ViewPicker activeView="board" onChange={onChange} lang="en" />);
    fireEvent.click(screen.getByTestId("vp-btn-board"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("board");
  });
});
