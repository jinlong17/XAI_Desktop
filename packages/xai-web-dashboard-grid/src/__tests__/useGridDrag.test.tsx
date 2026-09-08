/**
 * AC-DRAG-2/3/4/6/7/8: useGridDrag pointerdown exclude + start/cancel lifecycle.
 *
 * jsdom can synthesize PointerEvents but does not maintain a layout engine,
 * so over-other-widget swap detection is exercised via mocked bounding rects.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, fireEvent, render, renderHook } from "@testing-library/react";
import { useRef } from "react";

import { useGridDrag } from "../internal/useGridDrag.js";

function setup(initialOrder: string[]) {
  const setOrder = vi.fn();
  const refs: Record<string, HTMLElement | null> = {};
  for (const id of initialOrder) {
    const el = document.createElement("div");
    el.dataset.widgetId = id;
    document.body.appendChild(el);
    refs[id] = el;
  }
  // Stub bounding rect — jsdom returns zeros by default.
  // Make widget bbox 100x100 starting at x = index * 110, y = 0.
  initialOrder.forEach((id, idx) => {
    const el = refs[id]!;
    el.getBoundingClientRect = () =>
      ({
        left: idx * 110,
        top: 0,
        right: idx * 110 + 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: idx * 110,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
  });
  const itemRefs = { current: refs };
  return { setOrder, itemRefs };
}

beforeEach(() => {
  // Clean DOM from previous test.
  document.body.innerHTML = "";
});

describe("useGridDrag", () => {
  it("AC-DRAG-1: startDrag on a known id sets drag state", () => {
    const order = ["a", "b"];
    const { setOrder, itemRefs } = setup(order);
    const { result } = renderHook(() => useGridDrag({ order, setOrder, itemRefs }));
    expect(result.current.drag).toBeNull();
    act(() => {
      // Synthesise a minimum-viable PointerEvent shape.
      const ev = {
        button: 0,
        clientX: 30,
        clientY: 30,
        target: itemRefs.current["a"]!,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    expect(result.current.drag).not.toBeNull();
    expect(result.current.drag?.id).toBe("a");
  });

  it("AC-DRAG-2: pointerdown on a <button> child does NOT start drag", () => {
    const order = ["a"];
    const { setOrder, itemRefs } = setup(order);
    const { result } = renderHook(() => useGridDrag({ order, setOrder, itemRefs }));
    const btn = document.createElement("button");
    itemRefs.current["a"]!.appendChild(btn);
    act(() => {
      const ev = {
        button: 0,
        clientX: 30,
        clientY: 30,
        target: btn,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    expect(result.current.drag).toBeNull();
  });

  it("AC-DRAG-3: pointerdown on an <input> child does NOT start drag", () => {
    const order = ["a"];
    const { setOrder, itemRefs } = setup(order);
    const { result } = renderHook(() => useGridDrag({ order, setOrder, itemRefs }));
    const inp = document.createElement("input");
    itemRefs.current["a"]!.appendChild(inp);
    act(() => {
      const ev = {
        button: 0,
        clientX: 30,
        clientY: 30,
        target: inp,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    expect(result.current.drag).toBeNull();
  });

  it("AC-DRAG-4: pointerdown on an element with [data-no-drag] does NOT start drag", () => {
    const order = ["a"];
    const { setOrder, itemRefs } = setup(order);
    const { result } = renderHook(() => useGridDrag({ order, setOrder, itemRefs }));
    const noDrag = document.createElement("div");
    noDrag.setAttribute("data-no-drag", "");
    itemRefs.current["a"]!.appendChild(noDrag);
    act(() => {
      const ev = {
        button: 0,
        clientX: 30,
        clientY: 30,
        target: noDrag,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    expect(result.current.drag).toBeNull();
  });

  it("AC-DRAG-8: right-click (button !== 0) does NOT start drag", () => {
    const order = ["a"];
    const { setOrder, itemRefs } = setup(order);
    const { result } = renderHook(() => useGridDrag({ order, setOrder, itemRefs }));
    act(() => {
      const ev = {
        button: 2,
        clientX: 30,
        clientY: 30,
        target: itemRefs.current["a"]!,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    expect(result.current.drag).toBeNull();
  });

  it("AC-DRAG-6: pointerup on window resets drag state", () => {
    const order = ["a"];
    const { setOrder, itemRefs } = setup(order);
    const { result } = renderHook(() => useGridDrag({ order, setOrder, itemRefs }));
    act(() => {
      const ev = {
        button: 0,
        clientX: 30,
        clientY: 30,
        target: itemRefs.current["a"]!,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    expect(result.current.drag).not.toBeNull();
    act(() => {
      fireEvent(window, new PointerEvent("pointerup"));
    });
    expect(result.current.drag).toBeNull();
  });

  it("AC-DRAG-7: pointercancel on window resets drag state", () => {
    const order = ["a"];
    const { setOrder, itemRefs } = setup(order);
    const { result } = renderHook(() => useGridDrag({ order, setOrder, itemRefs }));
    act(() => {
      const ev = {
        button: 0,
        clientX: 30,
        clientY: 30,
        target: itemRefs.current["a"]!,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    act(() => {
      fireEvent(window, new PointerEvent("pointercancel"));
    });
    expect(result.current.drag).toBeNull();
  });

  it("pointermove updates drag.x / drag.y to follow cursor", () => {
    const order = ["a"];
    const { setOrder, itemRefs } = setup(order);
    const { result } = renderHook(() => useGridDrag({ order, setOrder, itemRefs }));
    act(() => {
      const ev = {
        button: 0,
        clientX: 30,
        clientY: 30,
        target: itemRefs.current["a"]!,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    // offsetX = 30 - 0 = 30, offsetY = 30 - 0 = 30 (rect.left=0, rect.top=0)
    act(() => {
      fireEvent(window, new PointerEvent("pointermove", { clientX: 80, clientY: 60 }));
    });
    expect(result.current.drag?.x).toBe(50);
    expect(result.current.drag?.y).toBe(30);
  });

  it("pointermove over another widget swaps order", () => {
    // Layout: a at x=0..100, b at x=110..210; drag a to within b's bbox.
    const order = ["a", "b"];
    const { setOrder, itemRefs } = setup(order);
    const { result, rerender } = renderHook(
      ({ ord }: { ord: string[] }) => useGridDrag({ order: ord, setOrder, itemRefs }),
      { initialProps: { ord: order } },
    );
    act(() => {
      const ev = {
        button: 0,
        clientX: 50,
        clientY: 50,
        target: itemRefs.current["a"]!,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    act(() => {
      fireEvent(window, new PointerEvent("pointermove", { clientX: 160, clientY: 50 }));
    });
    // setOrder should have been called with ["b", "a"] (a moved to b's index 1).
    expect(setOrder).toHaveBeenCalledWith(["b", "a"]);
    rerender({ ord: ["b", "a"] });
  });

  it("cleanup: listeners are removed on unmount", () => {
    const order = ["a"];
    const { setOrder, itemRefs } = setup(order);
    const { result, unmount } = renderHook(() =>
      useGridDrag({ order, setOrder, itemRefs }),
    );
    act(() => {
      const ev = {
        button: 0,
        clientX: 30,
        clientY: 30,
        target: itemRefs.current["a"]!,
      } as unknown as React.PointerEvent<HTMLElement>;
      result.current.startDrag("a", ev);
    });
    unmount();
    // Subsequent pointermove should NOT throw or update state (already
    // unmounted; we just assert no exception).
    expect(() => {
      fireEvent(window, new PointerEvent("pointermove", { clientX: 90, clientY: 50 }));
    }).not.toThrow();
  });

  it("renders nothing visible itself — the hook is state-only", () => {
    // Smoke: rendering a consumer that mounts the hook without invoking
    // startDrag leaves drag = null.
    function Consumer() {
      const order = ["a"];
      const refs = useRef<Record<string, HTMLElement | null>>({});
      const { drag } = useGridDrag({ order, setOrder: () => {}, itemRefs: refs });
      return <div data-testid="drag-state">{drag === null ? "null" : "active"}</div>;
    }
    const { getByTestId } = render(<Consumer />);
    expect(getByTestId("drag-state").textContent).toBe("null");
  });
});
