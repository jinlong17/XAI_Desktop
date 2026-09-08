/**
 * Vitest setup — @repo/plugin-web-dashboard-widgets.
 *
 * Re-uses the same minimal jsdom polyfill surface as row #10. Widgets in this
 * row do not handle pointer events directly (drag is owned by row #10), so
 * we keep this lean.
 */
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

type PointerEventLikeInit = MouseEventInit & {
  pointerId?: number;
  width?: number;
  height?: number;
  pressure?: number;
  pointerType?: string;
  isPrimary?: boolean;
};

if (typeof globalThis.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    width: number;
    height: number;
    pressure: number;
    pointerType: string;
    isPrimary: boolean;
    constructor(type: string, init: PointerEventLikeInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.width = init.width ?? 1;
      this.height = init.height ?? 1;
      this.pressure = init.pressure ?? 0;
      this.pointerType = init.pointerType ?? "mouse";
      this.isPrimary = init.isPrimary ?? true;
    }
  }
  Object.defineProperty(globalThis, "PointerEvent", {
    configurable: true,
    writable: true,
    value: PointerEventPolyfill,
  });
}

afterEach(() => {
  cleanup();
  // Reset persisted prefs between tests so order doesn't leak.
  try {
    localStorage.clear();
  } catch {
    /* jsdom edge: nothing to do */
  }
});
