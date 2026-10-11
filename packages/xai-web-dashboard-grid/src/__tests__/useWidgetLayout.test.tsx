import { accountScope } from "@repo/plugin-web-storage";
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import type { WidgetRegistration } from "../types.js";
import {
  defaultWidgetLayout,
  layoutFromResize,
  useWidgetLayout,
} from "../internal/useWidgetLayout.js";

function fixture(id: string, span: WidgetRegistration["span"] = "w-weather"): WidgetRegistration {
  return { id, span, render: () => null };
}

describe("useWidgetLayout", () => {
  it("returns span defaults when no saved layout exists", () => {
    const { result } = renderHook(() => useWidgetLayout([fixture("weather")]));
    expect(result.current.getLayout("weather", "w-weather")).toEqual(
      defaultWidgetLayout("w-weather"),
    );
  });

  it("persists normalized widget layout to xai_pref_dashboard_widget_layout", () => {
    const { result } = renderHook(() => useWidgetLayout([fixture("weather")]));
    act(() => {
      result.current.setWidgetLayout("weather", { cols: 9, minHeight: 288 });
    });
    expect(JSON.parse(localStorage.getItem(accountScope.physicalKey("xai_pref_dashboard_widget_layout")) ?? "{}")).toEqual({
      weather: { cols: 9, minHeight: 288 },
    });
    expect(result.current.getLayout("weather", "w-weather")).toEqual({
      cols: 9,
      minHeight: 288,
    });
  });

  it("ignores unknown widget ids", () => {
    const { result } = renderHook(() => useWidgetLayout([fixture("weather")]));
    act(() => {
      result.current.setWidgetLayout("ghost", { cols: 12, minHeight: 360 });
    });
    expect(localStorage.getItem(accountScope.physicalKey("xai_pref_dashboard_widget_layout"))).toBeNull();
  });

  it("layoutFromResize clamps grid cols and height", () => {
    expect(
      layoutFromResize(
        { id: "weather", startX: 0, startY: 0, startCols: 6, startHeight: 160, colWidth: 50 },
        600,
        600,
      ),
    ).toEqual({ cols: 12, minHeight: 460 });
  });
});
