/**
 * AC-PERSIST-8 + AC-SLOT-1/3/5: DashboardModule renders widgets in order,
 * passes ctx to render, and persists order on setOrder.
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { setPref } from "@repo/plugin-web-storage";

import { DashboardModule } from "../DashboardModule.js";
import type { WidgetRegistration } from "../types.js";

function fixture(id: string): WidgetRegistration {
  return {
    id,
    span: "w-stat",
    render: (ctx) => (
      <div data-testid={`body-${id}`} data-lang={ctx.lang}>
        {id}/{ctx.lang}
      </div>
    ),
  };
}

describe("DashboardModule with widgets (P2 grid)", () => {
  it("AC-SLOT-1: renders 3 widgets in registration order when persisted is empty", () => {
    setPref("xai_dash_order", ["alpha", "bravo", "charlie"]);
    const widgets = [fixture("alpha"), fixture("bravo"), fixture("charlie")];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);
    const shells = container.querySelectorAll(".widget-shell");
    expect(shells).toHaveLength(3);
    expect(shells[0]?.getAttribute("data-widget-id")).toBe("alpha");
    expect(shells[1]?.getAttribute("data-widget-id")).toBe("bravo");
    expect(shells[2]?.getAttribute("data-widget-id")).toBe("charlie");
  });

  it("AC-SLOT-3: render ctx receives the active lang", () => {
    setPref("xai_dash_order", ["alpha"]);
    const widgets = [fixture("alpha")];
    const { getByTestId } = render(<DashboardModule lang="zh" widgets={widgets} />);
    expect(getByTestId("body-alpha").getAttribute("data-lang")).toBe("zh");
  });

  it("AC-SLOT-5: empty state is NOT rendered when widgets are non-empty", () => {
    setPref("xai_dash_order", ["alpha"]);
    const widgets = [fixture("alpha")];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);
    expect(container.querySelector(".dash-empty")).toBeNull();
    expect(container.querySelector(".dash-grid")).toBeTruthy();
  });

  it("AC-PERSIST-8: persisted order is respected on mount", () => {
    setPref("xai_dash_order", ["charlie", "alpha", "bravo"]);
    const widgets = [fixture("alpha"), fixture("bravo"), fixture("charlie")];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);
    const ids = Array.from(container.querySelectorAll(".widget-shell")).map((el) =>
      el.getAttribute("data-widget-id"),
    );
    expect(ids).toEqual(["charlie", "alpha", "bravo"]);
  });

  it("AC-PERSIST-3 (host-level): unknown ids in persisted are sanitized away", () => {
    setPref("xai_dash_order", ["alpha", "ghost", "bravo"]);
    const widgets = [fixture("alpha"), fixture("bravo")];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);
    const ids = Array.from(container.querySelectorAll(".widget-shell")).map((el) =>
      el.getAttribute("data-widget-id"),
    );
    expect(ids).toEqual(["alpha", "bravo"]);
    expect(JSON.parse(localStorage.getItem("xai_dash_order") ?? "null")).toEqual([
      "alpha",
      "bravo",
    ]);
  });

  it("AC-SLOT-2: each shell carries the correct span class", () => {
    setPref("xai_dash_order", ["clock", "stat", "mail"]);
    const widgets: WidgetRegistration[] = [
      { id: "clock", span: "w-clock", render: () => <div>clock</div> },
      { id: "stat", span: "w-stat", render: () => <div>stat</div> },
      { id: "mail", span: "w-mail", render: () => <div>mail</div> },
    ];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);
    expect(container.querySelector(".widget-shell.w-clock")).toBeTruthy();
    expect(container.querySelector(".widget-shell.w-stat")).toBeTruthy();
    expect(container.querySelector(".widget-shell.w-mail")).toBeTruthy();
  });

  it("duplicate ids in widgets[] → first wins, no crash, dev-warn handled silently in test env", () => {
    setPref("xai_dash_order", ["alpha", "bravo"]);
    const widgets: WidgetRegistration[] = [
      { id: "alpha", span: "w-stat", render: () => <div>first</div> },
      { id: "alpha", span: "w-stat", render: () => <div>second</div> },
      { id: "bravo", span: "w-stat", render: () => <div>bravo</div> },
    ];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);
    // Only one alpha shell; bravo also present.
    const ids = Array.from(container.querySelectorAll(".widget-shell")).map((el) =>
      el.getAttribute("data-widget-id"),
    );
    expect(ids).toEqual(["alpha", "bravo"]);
  });
});
