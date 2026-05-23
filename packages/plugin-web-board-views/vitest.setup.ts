import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

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
