/**
 * AC-AWO-2..5: useDashOrder.addWidget semantics (gap-closure row #5, P2).
 * api.md §S14.3 addWidget contract.
 */
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { setPref } from "@repo/plugin-web-storage";

import { useDashOrder } from "../internal/useDashOrder.js";
import type { WidgetRegistration } from "../types.js";

function fixture(id: string): WidgetRegistration {
  return { id, span: "w-stat", render: () => null };
}

const THREE = [fixture("a"), fixture("b"), fixture("c")];

describe("useDashOrder addWidget (AC-AWO-2..5)", () => {
  // ---- AC-AWO-2: addWidget appends + persists --------------------------------
  it("AC-AWO-2: addWidget(newId) appends to order and persists via setPref", () => {
    setPref("xai_dash_order", ["a", "b"]);
    const { result } = renderHook(() => useDashOrder(THREE));
    const [orderBefore] = result.current;
    expect(orderBefore).toEqual(["a", "b"]); // sanitized preserves user removals

    // Add a different widget after reset
    setPref("xai_dash_order", ["a", "b"]);
    const { result: result2 } = renderHook(() => useDashOrder(THREE));
    act(() => {
      result2.current[2]("c"); // addWidget("c")
    });
    expect(JSON.parse(localStorage.getItem("xai_dash_order") ?? "null")).toContain("c");
    const [orderAfter] = result2.current;
    expect(orderAfter).toContain("c");
  });

  it("AC-AWO-2b: addWidget appends id at the end of the current order", () => {
    setPref("xai_dash_order", ["a", "b"]);
    const { result } = renderHook(() => useDashOrder(THREE));
    act(() => {
      result.current[2]("c"); // addWidget("c")
    });
    const [order] = result.current;
    expect(order[order.length - 1]).toBe("c");
  });

  // ---- AC-AWO-3: addWidget(existingId) is a no-op ---------------------------
  it("AC-AWO-3: addWidget(existingId) is a no-op — order and storage unchanged", () => {
    setPref("xai_dash_order", ["a", "b", "c"]);
    const { result } = renderHook(() => useDashOrder(THREE));
    const orderBefore = [...result.current[0]];

    // Capture current storage value before add
    const storageBefore = localStorage.getItem("xai_dash_order");

    act(() => {
      result.current[2]("a"); // addWidget("a") — already present
    });

    const [orderAfter] = result.current;
    expect(orderAfter).toEqual(orderBefore);
    // Storage should not have changed (no extra write)
    expect(localStorage.getItem("xai_dash_order")).toBe(storageBefore);
  });

  // ---- AC-AWO-4: addWidget(unknownId) is a no-op ----------------------------
  it("AC-AWO-4: addWidget(unknownId) is a no-op — id not in widgets[]", () => {
    setPref("xai_dash_order", ["a", "b"]);
    const { result } = renderHook(() => useDashOrder(THREE));
    const orderBefore = [...result.current[0]];

    act(() => {
      result.current[2]("zzz-not-registered"); // addWidget with unknown id
    });

    const [orderAfter] = result.current;
    expect(orderAfter).toEqual(orderBefore);
    expect(orderAfter).not.toContain("zzz-not-registered");
  });

  // ---- AC-AWO-5: after addWidget, next sanitize-on-mount keeps newId --------
  it("AC-AWO-5: after addWidget(newId), subsequent remount preserves the id", () => {
    const widgets = [fixture("a"), fixture("b"), fixture("c")];
    setPref("xai_dash_order", ["a", "b"]);

    const { result } = renderHook(() => useDashOrder(widgets));
    act(() => {
      result.current[2]("c"); // addWidget("c")
    });

    // Simulate remount by re-rendering the hook — it re-reads from storage.
    const { result: remounted } = renderHook(() => useDashOrder(widgets));
    const [remountedOrder] = remounted.current;
    expect(remountedOrder).toContain("c");
  });
});
