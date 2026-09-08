/**
 * AC-RENDER-4 + AC-LANG-5: EmptyState bilingual title + subtitle + CTA.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { EmptyState } from "../EmptyState.js";

describe("EmptyState", () => {
  it("AC-RENDER-4: en renders English title + subtitle + CTA", () => {
    const { container, getByRole } = render(<EmptyState lang="en" />);
    expect(container.querySelector(".dash-empty__title")!.textContent).toBe("No widgets yet");
    expect(container.querySelector(".dash-empty__subtitle")!.textContent).toBe(
      "Install dashboard widgets to get started.",
    );
    expect(getByRole("button", { name: /add a new dashboard widget/i }).textContent).toBe(
      "Add widget",
    );
  });

  it("AC-LANG-5: zh renders Chinese title + subtitle + CTA", () => {
    const { container, getByRole } = render(<EmptyState lang="zh" />);
    expect(container.querySelector(".dash-empty__title")!.textContent).toBe("暂无组件");
    expect(container.querySelector(".dash-empty__subtitle")!.textContent).toBe(
      "安装 dashboard-widgets 后即可开始。",
    );
    expect(getByRole("button", { name: /添加新的工作台组件/i }).textContent).toBe("添加组件");
  });

  it("AC-RENDER-4: role='status' on the panel for a11y", () => {
    const { getByRole } = render(<EmptyState lang="en" />);
    expect(getByRole("status")).toBeTruthy();
  });

  it("CTA onClick fires when supplied", () => {
    const onAdd = vi.fn();
    const { getByRole } = render(<EmptyState lang="en" onAddWidget={onAdd} />);
    fireEvent.click(getByRole("button", { name: /add a new dashboard widget/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("CTA click is a no-op when onAddWidget omitted", () => {
    const { getByRole } = render(<EmptyState lang="en" />);
    expect(() => fireEvent.click(getByRole("button", { name: /add a new dashboard widget/i })))
      .not.toThrow();
  });
});
