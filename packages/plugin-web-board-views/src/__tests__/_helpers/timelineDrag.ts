/**
 * Timeline pointer-DnD simulator for TimelineView tests.
 *
 * Uses @testing-library/react fireEvent helpers to trigger React synthetic
 * events for pointerdown, then dispatches native pointermove/pointerup on
 * the window for the window-level listeners.
 *
 * Track width stub (900px / 30 days = 30px per day) must be set up via
 * vi.spyOn(Element.prototype, 'getBoundingClientRect') BEFORE calling these
 * helpers — see TimelineView.test.tsx stubTracks().
 */

import { fireEvent } from "@testing-library/react";

const START_X = 400;

/**
 * Simulate a full pointer drag: pointerdown on handle → pointermove on window
 * → pointerup on window.
 *
 * @param handleEl - The DOM element to fire pointerdown on.
 * @param deltaPx  - Total pixel offset (positive=right). At 30px/day this is
 *                   3 days for deltaPx=90.
 */
export function simulateTimelineDrag(handleEl: HTMLElement, deltaPx: number): void {
  const endX = START_X + deltaPx;

  // 1. pointerdown on handle (React synthetic event via fireEvent)
  fireEvent.pointerDown(handleEl, { clientX: START_X, pointerId: 1 });

  // 2. pointermove on window (native event — triggers window listener in useEffect)
  window.dispatchEvent(
    new PointerEvent("pointermove", {
      bubbles: true,
      cancelable: true,
      clientX: endX,
      pointerId: 1,
    }),
  );

  // 3. pointerup on window (native — triggers commit in useEffect)
  window.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      cancelable: true,
      clientX: endX,
      pointerId: 1,
    }),
  );
}

/**
 * Simulate pointerdown + immediate pointerup with NO pointermove.
 * This should trigger NO updateCard call (TL12 / TL16).
 */
export function simulateTimelineDragNoMove(handleEl: HTMLElement): void {
  fireEvent.pointerDown(handleEl, { clientX: START_X, pointerId: 1 });
  window.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      cancelable: true,
      clientX: START_X,
      pointerId: 1,
    }),
  );
}
