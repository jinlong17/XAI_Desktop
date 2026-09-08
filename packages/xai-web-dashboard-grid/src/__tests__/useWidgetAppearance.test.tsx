import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import type { WidgetRegistration } from "../types.js";
import {
  DEFAULT_WIDGET_APPEARANCE,
  useWidgetAppearance,
  widgetAppearanceCssVars,
} from "../internal/useWidgetAppearance.js";

function fixture(id: string): WidgetRegistration {
  return { id, span: "w-weather", render: () => null };
}

describe("useWidgetAppearance", () => {
  it("returns the default glass appearance when no saved preference exists", () => {
    const { result } = renderHook(() => useWidgetAppearance([fixture("weather")]));
    expect(result.current.getAppearance("weather")).toEqual(DEFAULT_WIDGET_APPEARANCE);
  });

  it("persists normalized widget appearance to xai_pref_dashboard_widget_appearance", () => {
    const { result } = renderHook(() => useWidgetAppearance([fixture("weather")]));
    act(() => {
      result.current.setWidgetAppearance("weather", { tone: "rose", alpha: 0.91 });
    });
    expect(
      JSON.parse(localStorage.getItem("xai_pref_dashboard_widget_appearance") ?? "{}"),
    ).toEqual({
      weather: { tone: "rose", alpha: 0.72 },
    });
    expect(result.current.getAppearance("weather")).toEqual({ tone: "rose", alpha: 0.72 });
  });

  it("ignores unknown widget ids", () => {
    const { result } = renderHook(() => useWidgetAppearance([fixture("weather")]));
    act(() => {
      result.current.setWidgetAppearance("ghost", { tone: "mint", alpha: 0.44 });
    });
    expect(localStorage.getItem("xai_pref_dashboard_widget_appearance")).toBeNull();
  });

  it("removes the saved item when a widget appearance is reset", () => {
    const { result } = renderHook(() => useWidgetAppearance([fixture("weather")]));
    act(() => {
      result.current.setWidgetAppearance("weather", { tone: "amber", alpha: 0.5 });
    });
    act(() => {
      result.current.resetWidgetAppearance("weather");
    });
    expect(JSON.parse(localStorage.getItem("xai_pref_dashboard_widget_appearance") ?? "{}")).toEqual(
      {},
    );
    expect(result.current.getAppearance("weather")).toEqual(DEFAULT_WIDGET_APPEARANCE);
  });

  it("maps appearance preferences into widget glass CSS variables", () => {
    expect(widgetAppearanceCssVars({ tone: "sky", alpha: 0.36 })).toMatchObject({
      "--dash-widget-glass-rgb": "190 220 255",
      "--dash-widget-glass-alpha": "0.36",
      "--dash-widget-glass-hover-alpha": "0.48",
    });
  });
});
