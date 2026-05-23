import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// Defensive rAF polyfill — jsdom provides one but we keep the seam for clarity.
if (typeof globalThis.requestAnimationFrame !== "function") {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback): number => {
    return setTimeout(() => cb(performance.now()), 16) as unknown as number;
  }) as typeof globalThis.requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number): void => {
    clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
  }) as typeof globalThis.cancelAnimationFrame;
}

// jsdom does not implement scrollIntoView — provide a no-op so the bottom-
// sentinel scroll effect doesn't throw.
if (!("scrollIntoView" in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: function scrollIntoViewStub() {
      /* no-op */
    },
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
