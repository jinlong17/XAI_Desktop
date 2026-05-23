/**
 * AC-PERSIST-1..6: useDashOrder hook contract.
 */
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { setPref } from "@repo/plugin-web-storage";

import { useDashOrder } from "../internal/useDashOrder.js";
import type { WidgetRegistration } from "../types.js";

function fixture(id: string): WidgetRegistration {
  return { id, span: "w-stat", render: () => null };
}

describe("useDashOrder", () => {
  it("AC-PERSIST-1: empty persisted (default first-visit) → falls back to registry default + sanitized further by widgets", () => {
    // The registry default for xai_dash_order is
    // ["clock","minicalendar","worldclocks","weather","stickies","mail","upcoming","stats"].
    // With widgets = [a, b, c], sanitize drops all 8 default ids and returns
    // [a, b, c].
    const widgets = [fixture("a"), fixture("b"), fixture("c")];
    const { result } = renderHook(() => useDashOrder(widgets));
    expect(result.current.order).toEqual(["a", "b", "c"]);
  });

  it("AC-PERSIST-2: persisted matches registered → returned as-is", () => {
    setPref("xai_dash_order", ["a", "b"]);
    const widgets = [fixture("a"), fixture("b")];
    const { result } = renderHook(() => useDashOrder(widgets));
    expect(result.current.order).toEqual(["a", "b"]);
  });

  it("AC-PERSIST-3: persisted contains unknown id → drop and write back", () => {
    setPref("xai_dash_order", ["a", "ghost", "b"]);
    const widgets = [fixture("a"), fixture("b")];
    renderHook(() => useDashOrder(widgets));
    // The effect writes back the sanitized value; localStorage now equals
    // JSON.stringify(["a","b"]).
    expect(JSON.parse(localStorage.getItem("xai_dash_order") ?? "null")).toEqual(["a", "b"]);
  });

  it("AC-PERSIST-4: persisted missing some ids → append missing + write back", () => {
    setPref("xai_dash_order", ["a"]);
    const widgets = [fixture("a"), fixture("b"), fixture("c")];
    renderHook(() => useDashOrder(widgets));
    expect(JSON.parse(localStorage.getItem("xai_dash_order") ?? "null")).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("AC-PERSIST-5: persisted contains duplicate ids → dedupe + write back", () => {
    setPref("xai_dash_order", ["a", "a", "b"]);
    const widgets = [fixture("a"), fixture("b")];
    renderHook(() => useDashOrder(widgets));
    expect(JSON.parse(localStorage.getItem("xai_dash_order") ?? "null")).toEqual(["a", "b"]);
  });

  it("AC-PERSIST-6: empty widgets → empty order", () => {
    setPref("xai_dash_order", ["a", "b", "c"]);
    const { result } = renderHook(() => useDashOrder([]));
    expect(result.current.order).toEqual([]);
  });

  it("setOrder writes through to localStorage", () => {
    const widgets = [fixture("a"), fixture("b")];
    const { result } = renderHook(() => useDashOrder(widgets));
    act(() => {
      result.current.setOrder(["b", "a"]);
    });
    expect(JSON.parse(localStorage.getItem("xai_dash_order") ?? "null")).toEqual(["b", "a"]);
  });

  it("does NOT write back when sanitized equals persisted", () => {
    setPref("xai_dash_order", ["a", "b"]);
    const widgets = [fixture("a"), fixture("b")];
    renderHook(() => useDashOrder(widgets));
    // No change → storage stays at ["a","b"].
    expect(JSON.parse(localStorage.getItem("xai_dash_order") ?? "null")).toEqual(["a", "b"]);
  });
});
