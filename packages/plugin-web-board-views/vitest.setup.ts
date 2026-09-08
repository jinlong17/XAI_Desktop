import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// PointerEvent polyfill — jsdom does not implement PointerEvent natively.
// We map it to MouseEvent so pointer-DnD tests work.
if (typeof globalThis.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    constructor(type: string, init?: PointerEventInit) {
      super(type, init);
      this.pointerId = init?.pointerId ?? 1;
      this.pointerType = init?.pointerType ?? "mouse";
    }
  }
  Object.defineProperty(globalThis, "PointerEvent", {
    writable: true,
    configurable: true,
    value: PointerEventPolyfill,
  });
}

// requestAnimationFrame polyfill for DnD tests
if (typeof globalThis.requestAnimationFrame !== "function") {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback): number => {
    return setTimeout(() => cb(performance.now()), 16) as unknown as number;
  }) as typeof globalThis.requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number): void => {
    clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
  }) as typeof globalThis.cancelAnimationFrame;
}

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
