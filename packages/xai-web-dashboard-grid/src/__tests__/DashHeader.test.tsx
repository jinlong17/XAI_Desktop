/**
 * AC-RENDER-2 + AC-LANG-3/4: DashHeader renders greeting + date + Add-widget button.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { DashHeader } from "../DashHeader.js";

const TIME_MORNING = new Date(2026, 4, 23, 8, 0, 0);
const TIME_AFTERNOON = new Date(2026, 4, 23, 14, 0, 0);
const TIME_EVENING = new Date(2026, 4, 23, 20, 0, 0);

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
});
