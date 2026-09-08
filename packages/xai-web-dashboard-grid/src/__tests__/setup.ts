/**
 * Vitest global setup for @repo/plugin-web-dashboard-grid tests.
 * Clears localStorage + DOM state between tests.
 * Polyfills PointerEvent in jsdom (jsdom does not implement it; pointer DnD
 * tests need it).
 * Mirrors xai-web-matrix/src/__tests__/setup.ts.
 */
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// PointerEvent polyfill for jsdom — degrades to MouseEvent with the relevant
// pointer fields attached. Sufficient for our drag tests, which only read
// .clientX, .clientY, and .target.
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
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
