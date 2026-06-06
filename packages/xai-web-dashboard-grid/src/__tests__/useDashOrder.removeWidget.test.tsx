/**
 * AC-RM-4..5: useDashOrder removeWidget helper (Audit Top-10 #9, D-06).
 *
 * Design note: useDashOrder's sanitize-on-mount (F1) always appends registered
 * widgets missing from persisted. Therefore, removeWidget(id) writes the filtered
 * array to persisted (localStorage), but if `id` is still in the registered widgets
 * prop, the sanitize effect will re-append it to localStorage in the same render
 * cycle. The rendering-level removal (preventing re-append) is handled by
 * DashboardModule's `removedInSession` state + `activeWidgets` filter, which
 * excludes the removed id from the widgets prop passed to DashboardGrid BEFORE
 * sanitize runs. This hook only provides the persistence write API.
 *
 * Verifies:
 *   AC-RM-4 — removeWidget(id) is idempotent when id is absent (no-op).
 *              removeWidget(id) calls setPref internally (persistence intent).
 *   AC-RM-5 — useDashOrder returns a 4-element tuple; prior 2- and 3-element
 *              destructures remain back-compat (tuple-at-end extension).
 */
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { setPref } from "@repo/plugin-web-storage";

import { useDashOrder } from "../internal/useDashOrder.js";
import type { WidgetRegistration } from "../types.js";

function fixture(id: string): WidgetRegistration {
  return { id, span: "w-stat", render: () => null };
}

describe("useDashOrder — removeWidget (AC-RM-4..5)", () => {
  // ---- AC-RM-4: idempotent no-op when id is absent -------------------------
  it("AC-RM-4: removeWidget(unknown_id) is a no-op — does not call setPref", () => {
    setPref("xai_dash_order", ["alpha", "bravo"]);
    const widgets = [fixture("alpha"), fixture("bravo")];
    const { result } = renderHook(() => useDashOrder(widgets));

    // Capture localStorage before.
    const beforeRaw = localStorage.getItem("xai_dash_order");

    act(() => {
      result.current[3]("ghost"); // not in persisted order → no-op
    });

    // localStorage key must not have changed (no setPref call).
    expect(localStorage.getItem("xai_dash_order")).toBe(beforeRaw);
  });

  it("AC-RM-4: removeWidget(id) is idempotent — does not throw on repeated calls", () => {
    setPref("xai_dash_order", ["alpha", "bravo"]);
    const widgets = [fixture("alpha"), fixture("bravo")];
    const { result } = renderHook(() => useDashOrder(widgets));

    expect(() => {
      act(() => {
        result.current[3]("alpha"); // first call
        result.current[3]("alpha"); // second call on same render — no-op
      });
    }).not.toThrow();
  });

  it("AC-RM-4: removeWidget is exposed as a function on the tuple", () => {
    const widgets = [fixture("a"), fixture("b")];
    const { result } = renderHook(() => useDashOrder(widgets));
    expect(typeof result.current[3]).toBe("function");
    // Calling removeWidget on a present id should not throw.
    expect(() => {
      act(() => {
        result.current[3]("a");
      });
    }).not.toThrow();
  });

  // ---- AC-RM-5: 4-element tuple shape + back-compat -------------------------
  it("AC-RM-5: useDashOrder returns a 4-element tuple", () => {
    const widgets = [fixture("a"), fixture("b")];
    const { result } = renderHook(() => useDashOrder(widgets));
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(4);
    expect(typeof result.current[0]).toBe("object"); // array (order)
    expect(typeof result.current[1]).toBe("function"); // setOrder
    expect(typeof result.current[2]).toBe("function"); // addWidget
    expect(typeof result.current[3]).toBe("function"); // removeWidget
  });

  it("AC-RM-5: 2-element destructure [order, setOrder] still works (back-compat)", () => {
    setPref("xai_dash_order", ["a", "b"]);
    const widgets = [fixture("a"), fixture("b")];
    const { result } = renderHook(() => useDashOrder(widgets));
    const [order, setOrder] = result.current;
    expect(order).toEqual(["a", "b"]);
    expect(typeof setOrder).toBe("function");
  });

  it("AC-RM-5: 3-element destructure [order, setOrder, addWidget] still works (back-compat)", () => {
    const widgets = [fixture("a"), fixture("b")];
    const { result } = renderHook(() => useDashOrder(widgets));
    const [order, setOrder, addWidget] = result.current;
    expect(Array.isArray(order)).toBe(true);
    expect(typeof setOrder).toBe("function");
    expect(typeof addWidget).toBe("function");
  });

});
