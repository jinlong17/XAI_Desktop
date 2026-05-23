import { beforeEach } from "vitest";

/** Clear localStorage before each test to ensure test isolation. */
beforeEach(() => {
  localStorage.clear();
});

/** Patch window.innerWidth / innerHeight to deterministic defaults (1280 × 800). */
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1280,
});
Object.defineProperty(window, "innerHeight", {
  writable: true,
  configurable: true,
  value: 800,
});

/**
 * jsdom does not define PointerEvent. Polyfill it by extending MouseEvent
 * so that tests can dispatch PointerEvent with clientX/clientY/movementX.
 *
 * Only installed if not already present.
 */
if (typeof window.PointerEvent === "undefined") {
  class PointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    readonly pressure: number;
    readonly movementX: number;
    readonly movementY: number;

    constructor(type: string, init: PointerEventInit & { movementX?: number; movementY?: number } = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "mouse";
      this.pressure = init.pressure ?? 0;
      this.movementX = (init as { movementX?: number }).movementX ?? 0;
      this.movementY = (init as { movementY?: number }).movementY ?? 0;
    }
  }
  // @ts-expect-error — extending jsdom's window with PointerEvent polyfill
  window.PointerEvent = PointerEvent;
}
