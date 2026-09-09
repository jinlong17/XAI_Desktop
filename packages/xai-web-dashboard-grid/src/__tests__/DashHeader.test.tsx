/**
 * AC-RENDER-2 + AC-LANG-3/4: DashHeader renders greeting + date + Add-widget button.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";

import { accountScope } from "@repo/plugin-web-storage";
import { DashHeader } from "../DashHeader.js";

const TIME_MORNING = new Date(2026, 4, 23, 8, 0, 0);
const TIME_AFTERNOON = new Date(2026, 4, 23, 14, 0, 0);
const TIME_EVENING = new Date(2026, 4, 23, 20, 0, 0);
let HEADER_NOTE_KEY = "";
const HEADER_NOTE_OFFSET_KEY = "xai_pref_dashboard_header_note_x";

beforeEach(() => {
  localStorage.clear();
  accountScope.activate(accountScope.lock("fixture-A"), "A");
  HEADER_NOTE_KEY = accountScope.physicalKey("xai_pref_dashboard_header_note");
});

describe("DashHeader", () => {
  it("AC-RENDER-2: renders greeting + date + Add-widget button", () => {
    const { container, getByRole } = render(<DashHeader lang="en" now={TIME_MORNING} />);
    expect(container.querySelector(".dash-greeting")).toBeTruthy();
    expect(container.querySelector(".dash-date")).toBeTruthy();
    expect(getByRole("button", { name: /add a new dashboard widget/i })).toBeTruthy();
  });

  it("AC-LANG-3: en label uses 'Add widget'", () => {
    const { getByRole } = render(<DashHeader lang="en" now={TIME_MORNING} />);
    const btn = getByRole("button", { name: /add a new dashboard widget/i });
    expect(btn.textContent ?? "").toContain("Add widget");
  });

  it("AC-LANG-3: zh label uses '添加组件'", () => {
    const { getByRole } = render(<DashHeader lang="zh" now={TIME_MORNING} />);
    const btn = getByRole("button", { name: /添加新的工作台组件/i });
    expect(btn.textContent ?? "").toContain("添加组件");
  });

  it("AC-LANG-4: en aria-label uses 'Add a new dashboard widget'", () => {
    const { getByRole } = render(<DashHeader lang="en" now={TIME_MORNING} />);
    const btn = getByRole("button", { name: /add a new dashboard widget/i });
    expect(btn.getAttribute("aria-label")).toBe("Add a new dashboard widget");
  });

  it("AC-LANG-4: zh aria-label uses '添加新的工作台组件'", () => {
    const { getByRole } = render(<DashHeader lang="zh" now={TIME_MORNING} />);
    const btn = getByRole("button", { name: /添加新的工作台组件/i });
    expect(btn.getAttribute("aria-label")).toBe("添加新的工作台组件");
  });

  it("greeting uses good_morning in the morning", () => {
    const { container } = render(<DashHeader lang="en" now={TIME_MORNING} />);
    expect(container.querySelector(".dash-greeting")!.textContent).toContain("Good morning");
  });

  it("greeting uses good_afternoon in the afternoon", () => {
    const { container } = render(<DashHeader lang="en" now={TIME_AFTERNOON} />);
    expect(container.querySelector(".dash-greeting")!.textContent).toContain("Good afternoon");
  });

  it("greeting uses good_evening in the evening", () => {
    const { container } = render(<DashHeader lang="en" now={TIME_EVENING} />);
    expect(container.querySelector(".dash-greeting")!.textContent).toContain("Good evening");
  });

  it("date string follows zh format on lang='zh'", () => {
    const { container } = render(<DashHeader lang="zh" now={TIME_MORNING} />);
    const date = container.querySelector(".dash-date")!.textContent ?? "";
    expect(date).toContain("2026 年 5 月 23 日");
    expect(date).toContain("周六");
  });

  it("button onClick fires when supplied", () => {
    const onAdd = vi.fn();
    const { getByRole } = render(<DashHeader lang="en" now={TIME_MORNING} onAddWidget={onAdd} />);
    fireEvent.click(getByRole("button", { name: /add a new dashboard widget/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("button click is a no-op when onAddWidget omitted", () => {
    const { getByRole } = render(<DashHeader lang="en" now={TIME_MORNING} />);
    expect(() => fireEvent.click(getByRole("button", { name: /add a new dashboard widget/i })))
      .not.toThrow();
  });

  it("renders an editable center note placeholder", () => {
    const { container, getByRole } = render(<DashHeader lang="en" now={TIME_MORNING} />);
    const note = getByRole("button", { name: /edit dashboard note/i });
    expect(container.querySelector(".dash-note__label")).toBeNull();
    expect(note.textContent).toContain("Add a focus note");
  });

  it("lets the user drag the center note horizontally and persists the position", async () => {
    localStorage.setItem(HEADER_NOTE_KEY, "Move me");
    const { container, getByRole, queryByRole } = render(
      <DashHeader lang="en" now={TIME_MORNING} />,
    );
    const lane = container.querySelector(".dash-note-lane") as HTMLDivElement;
    const note = container.querySelector(".dash-note") as HTMLDivElement;
    Object.defineProperty(lane, "clientWidth", { configurable: true, value: 760 });
    Object.defineProperty(note, "offsetWidth", { configurable: true, value: 360 });

    fireEvent.pointerDown(note, { button: 0, clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(note, { clientX: 260, pointerId: 1 });
    fireEvent.pointerUp(note, { clientX: 260, pointerId: 1 });
    fireEvent.click(getByRole("button", { name: /edit dashboard note/i }));

    expect(note.style.getPropertyValue("--dash-note-x")).toBe("60px");
    expect(queryByRole("textbox", { name: /add a focus note/i })).toBeNull();
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(HEADER_NOTE_OFFSET_KEY) ?? "null")).toBe(60);
    });
  });

  it("clicking the center note lets the user save text with Enter", async () => {
    const { getByRole } = render(<DashHeader lang="en" now={TIME_MORNING} />);
    fireEvent.click(getByRole("button", { name: /edit dashboard note/i }));
    const input = getByRole("textbox", { name: /add a focus note/i });
    fireEvent.change(input, { target: { value: "  Review top three tasks  " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(getByRole("button", { name: /edit dashboard note/i }).textContent).toContain(
      "Review top three tasks",
    );
    await waitFor(() => {
      expect(localStorage.getItem(HEADER_NOTE_KEY)).toBe("Review top three tasks");
    });
  });

  it("loads a saved center note from localStorage", () => {
    localStorage.setItem(HEADER_NOTE_KEY, "Prepare weekly review");
    const { getByRole } = render(<DashHeader lang="en" now={TIME_MORNING} />);
    expect(getByRole("button", { name: /edit dashboard note/i }).textContent).toContain(
      "Prepare weekly review",
    );
  });

  it("can clear a saved center note", async () => {
    localStorage.setItem(HEADER_NOTE_KEY, "Clear me");
    const { getByRole } = render(<DashHeader lang="en" now={TIME_MORNING} />);
    fireEvent.click(getByRole("button", { name: /clear dashboard note/i }));
    expect(getByRole("button", { name: /edit dashboard note/i }).textContent).toContain(
      "Add a focus note",
    );
    await waitFor(() => {
      expect(localStorage.getItem(HEADER_NOTE_KEY)).toBe("");
    });
  });
});
