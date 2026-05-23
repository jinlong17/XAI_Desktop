/**
 * useFlipReorder — useLayoutEffect-driven FLIP animation.
 *
 * For each tracked element, measure its bounding rect on every render;
 * compare with the previous frame's rect; if it moved (>1px), apply an
 * inverse-translate transform with no transition, force reflow, then
 * remove the inverse-translate with a 380ms cubic-bezier transition.
 * The element appears to slide smoothly from its old position to its
 * new one.
 *
 * Matches web design/module-dashboard.jsx:46-68 verbatim.
 *
 * Caller responsibility: maintain `itemRefs.current[id] = el` on each
 * widget-shell render. This hook reads and mutates the same map.
 *
 * Test note (R2): the first render seeds lastRects without animating;
 * subsequent renders animate from the seeded baseline. jsdom returns
 * zero rects by default — visual verification deferred to manual
 * cross-vendor smoke (test.md §6).
 */
import { useLayoutEffect, type MutableRefObject } from "react";

const FLIP_TRANSITION = "transform 380ms cubic-bezier(.34, 1.3, .42, 1)";

export function useFlipReorder(
  order: readonly string[],
  itemRefs: MutableRefObject<Record<string, HTMLElement | null>>,
  lastRects: MutableRefObject<Record<string, DOMRect>>,
): void {
  // Track `order` so the effect re-runs after a reorder; the `.join("|")`
  // turns the array into a primitive change-key.
  const orderKey = order.join("|");

  useLayoutEffect(() => {
    const refs = itemRefs.current;
    const rectsMap = lastRects.current;

    for (const id of Object.keys(refs)) {
      const el = refs[id];
      if (!el) continue;
      const rectNow = el.getBoundingClientRect();
      const rectPrev = rectsMap[id];
      if (rectPrev) {
        const dx = rectPrev.left - rectNow.left;
        const dy = rectPrev.top - rectNow.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          el.style.transition = "none";
          el.style.transform = `translate(${dx}px, ${dy}px)`;
          // Force reflow so the no-transition transform is applied before
          // we set the transition + reset to identity.
          void el.offsetWidth;
          el.style.transition = FLIP_TRANSITION;
          el.style.transform = "";
        }
      }
      rectsMap[id] = rectNow;
    }
    // Clean up rects for ids that are no longer mounted.
    for (const id of Object.keys(rectsMap)) {
      if (!refs[id]) {
        delete rectsMap[id];
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey]);
}
