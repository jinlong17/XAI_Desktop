/**
 * AC-PERSIST-1..6: useDashOrder hook contract.
 * AC-AWO-1: 3-element tuple shape (gap-closure row #5 extension).
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
  // ---- AC-AWO-1: 4-element tuple shape (extended by Audit Top-10 #9 D-06) --
  // Originally 3-element [order, setOrder, addWidget] (gap-closure row #5).
  // Extended to 4-element [order, setOrder, addWidget, removeWidget] by
  // Audit Top-10 #9 (D-06) — tuple-at-end extension is non-breaking.
  it("AC-AWO-1: returns a 4-element tuple [order, setOrder, addWidget, removeWidget]", () => {
    const widgets = [fixture("a"), fixture("b")];
    const { result } = renderHook(() => useDashOrder(widgets));
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(4);
    expect(typeof result.current[0]).toBe("object"); // array (order)
    expect(typeof result.current[1]).toBe("function"); // setOrder
    expect(typeof result.current[2]).toBe("function"); // addWidget
    expect(typeof result.current[3]).toBe("function"); // removeWidget
  });

  // --- existing tests (destructure as tuple now) ----------------------------
  it("AC-PERSIST-1: default first-visit order is sanitized by registered widgets", () => {
    setPref("xai_dash_order", ["a", "b", "c"]);
    const widgets = [fixture("a"), fixture("b"), fixture("c")];
    const { result } = renderHook(() => useDashOrder(widgets));
    const [order] = result.current;
    expect(order).toEqual(["a", "b", "c"]);
  });

  it("AC-PERSIST-2: persisted matches registered → returned as-is", () => {
    setPref("xai_dash_order", ["a", "b"]);
    const widgets = [fixture("a"), fixture("b")];
    const { result } = renderHook(() => useDashOrder(widgets));
    const [order] = result.current;
    expect(order).toEqual(["a", "b"]);
  });

  it("AC-PERSIST-3: persisted contains unknown id → drop and write back", () => {
    setPref("xai_dash_order", ["a", "ghost", "b"]);
    const widgets = [fixture("a"), fixture("b")];
    renderHook(() => useDashOrder(widgets));
    // The effect writes back the sanitized value; localStorage now equals
    // JSON.stringify(["a","b"]).
    expect(JSON.parse(localStorage.getItem("xai_dash_order") ?? "null")).toEqual(["a", "b"]);
  });

  it("AC-PERSIST-4: persisted missing some ids → preserves user removals", () => {
    setPref("xai_dash_order", ["a"]);
    const widgets = [fixture("a"), fixture("b"), fixture("c")];
    renderHook(() => useDashOrder(widgets));
    expect(JSON.parse(localStorage.getItem("xai_dash_order") ?? "null")).toEqual(["a"]);
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
    const [order] = result.current;
    expect(order).toEqual([]);
  });

  it("setOrder writes through to localStorage", () => {
    const widgets = [fixture("a"), fixture("b")];
    const { result } = renderHook(() => useDashOrder(widgets));
    act(() => {
      result.current[1](["b", "a"]); // setOrder
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
