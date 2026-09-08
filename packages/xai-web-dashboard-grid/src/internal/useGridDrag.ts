/**
 * useGridDrag — pointer-event driven drag state for the dashboard grid.
 *
 * Drag lifecycle:
 *   1. WidgetShell.onPointerDown(id, e) — if e.target.closest("button,
 *      input, textarea, [data-no-drag]") returns true, abort. Otherwise
 *      capture the widget's bounding rect and set drag = { id, offsetX,
 *      offsetY, x, y, w, h }. Mark widget-shell as .dragging.
 *   2. window.pointermove — update drag.x / drag.y to follow the cursor;
 *      detect when the cursor's centre overlaps another widget's bbox;
 *      if so, swap the dragged id to the over'd id's index in `order`.
 *   3. window.pointerup / pointercancel — set drag = null. The widget-shell
 *      loses .dragging; FLIP effect from the prior reorders settles.
 *
 * Caller responsibility:
 *   - keep itemRefs.current[id] populated for each widget-shell;
 *   - call `startDrag(id, event)` from each widget-shell's pointerdown;
 *   - render <WidgetGhost> when `drag !== null`.
 *
 * Matches web design/module-dashboard.jsx:70-130 verbatim, ported to TS.
 */
import { useCallback, useEffect, useState, type MutableRefObject } from "react";

import type { WidgetGridDragState } from "../types.js";

export interface UseGridDragOptions {
  /** Working order of widget ids (in render order). */
  order: readonly string[];
  /** Setter that updates the working order. */
  setOrder: (next: string[]) => void;
  /** Map of widget id → mounted HTMLElement (for bbox lookup). */
  itemRefs: MutableRefObject<Record<string, HTMLElement | null>>;
}

export interface UseGridDragResult {
  /** Active drag state, or null if no drag is in progress. */
  drag: WidgetGridDragState | null;
  /** Start a drag from a widget-shell pointerdown event. */
  startDrag: (id: string, event: React.PointerEvent<HTMLElement>) => void;
}

/** Selector that matches elements which must NOT initiate a drag. */
const NO_DRAG_SELECTOR = "button, input, textarea, [data-no-drag]";

/** Check whether the pointerdown event target is excluded from drag-start. */
function isExcluded(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest(NO_DRAG_SELECTOR) !== null;
}

export function useGridDrag({ order, setOrder, itemRefs }: UseGridDragOptions): UseGridDragResult {
  const [drag, setDrag] = useState<WidgetGridDragState | null>(null);

  const startDrag = useCallback(
    (id: string, event: React.PointerEvent<HTMLElement>) => {
      // Right-click / middle-click are not drags.
      if (event.button !== 0) return;
      if (isExcluded(event.target)) return;
      const el = itemRefs.current[id];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDrag({
        id,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    },
    [itemRefs],
  );

  // Window-level pointermove + pointerup listeners while a drag is active.
  useEffect(() => {
    if (!drag) return;

    const dragId = drag.id;

    const onMove = (event: PointerEvent) => {
      setDrag((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          x: event.clientX - prev.offsetX,
          y: event.clientY - prev.offsetY,
        };
      });

      // Detect over-which-other-widget.
      const cx = event.clientX;
      const cy = event.clientY;
      let bestId: string | null = null;
      let bestDist = Infinity;
      for (const [otherId, el] of Object.entries(itemRefs.current)) {
        if (otherId === dragId || !el) continue;
        const r = el.getBoundingClientRect();
        if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
          const mx = (r.left + r.right) / 2;
          const my = (r.top + r.bottom) / 2;
          const d = Math.hypot(cx - mx, cy - my);
          if (d < bestDist) {
            bestDist = d;
            bestId = otherId;
          }
        }
      }
      if (bestId && bestId !== dragId) {
        const i1 = order.indexOf(dragId);
        const i2 = order.indexOf(bestId);
        if (i1 >= 0 && i2 >= 0) {
          const next = [...order];
          next.splice(i1, 1);
          next.splice(i2, 0, dragId);
          setOrder(next);
        }
      }
    };

    const onUp = () => setDrag(null);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.id, order.join("|")]);

  return { drag, startDrag };
}
