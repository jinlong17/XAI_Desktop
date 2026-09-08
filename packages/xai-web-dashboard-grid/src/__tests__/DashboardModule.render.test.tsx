/**
 * AC-RENDER-1, AC-RENDER-3, AC-SLOT-1 (placeholder), AC-SLOT-5.
 *
 * P1: when widgets=[], EmptyState renders.
 * P2 will extend: AC-SLOT-1/2/3 wired to <DashboardGrid>.
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { DashboardModule } from "../DashboardModule.js";
import type { WidgetRegistration } from "../types.js";

const EMPTY: WidgetRegistration[] = [];

describe("DashboardModule render path (P1)", () => {
  it("AC-RENDER-1: renders without throwing with widgets=[]", () => {
    expect(() => render(<DashboardModule lang="en" widgets={EMPTY} />)).not.toThrow();
  });

  it("AC-RENDER-3: widgets=[] → EmptyState is rendered", () => {
    const { container } = render(<DashboardModule lang="en" widgets={EMPTY} />);
    expect(container.querySelector(".dash-empty")).toBeTruthy();
    expect(container.querySelector(".dash-empty__title")!.textContent).toBe("No widgets yet");
  });

  it("AC-RENDER-3: header is rendered alongside the empty state", () => {
    const { container } = render(<DashboardModule lang="en" widgets={EMPTY} />);
    expect(container.querySelector(".dash-head")).toBeTruthy();
    expect(container.querySelector(".dash-greeting")).toBeTruthy();
  });

  it("AC-SLOT-5: widgets non-empty → EmptyState is NOT rendered, .dash-grid container is", () => {
    const widgets: WidgetRegistration[] = [
      { id: "alpha", span: "w-clock", render: () => <div>alpha</div> },
    ];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);
    expect(container.querySelector(".dash-empty")).toBeNull();
    expect(container.querySelector(".dash-grid")).toBeTruthy();
  });

  it("module root has the right class", () => {
    const { container } = render(<DashboardModule lang="en" widgets={EMPTY} />);
    expect(container.querySelector(".module.module-dashboard")).toBeTruthy();
  });
});
