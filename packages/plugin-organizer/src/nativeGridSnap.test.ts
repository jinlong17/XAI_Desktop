import { describe, expect, it } from "vitest";
import {
  EDGE_HIDE_REVEAL_PX,
  applyNativeEdgeSnap,
  rectsNearlyEqual,
  type NativeMonitorBounds,
  type NativeWindowRect,
} from "./nativeGridSnap";

const secondaryMonitor: NativeMonitorBounds = {
  x: 1920,
  y: 0,
  width: 1440,
  height: 900,
};

const gridRect: NativeWindowRect = {
  x: 2000,
  y: 100,
  width: 352,
  height: 220,
};

describe("applyNativeEdgeSnap", () => {
  it("keeps secondary-monitor positions in global coordinates when not near an edge", () => {
    expect(applyNativeEdgeSnap(gridRect, false, secondaryMonitor)).toEqual(gridRect);
  });

  it("snaps an expanded grid to the current monitor left edge", () => {
    expect(
      applyNativeEdgeSnap(
        { ...gridRect, x: secondaryMonitor.x + 10 },
        false,
        secondaryMonitor,
      ).x,
    ).toBe(secondaryMonitor.x);
  });

  it("hides a folded grid against the current monitor left edge", () => {
    expect(
      applyNativeEdgeSnap(
        { ...gridRect, x: secondaryMonitor.x + 10 },
        true,
        secondaryMonitor,
      ).x,
    ).toBe(secondaryMonitor.x + EDGE_HIDE_REVEAL_PX - gridRect.width);
  });

  it("hides a folded grid against the current monitor right edge", () => {
    expect(
      applyNativeEdgeSnap(
        { ...gridRect, x: secondaryMonitor.x + secondaryMonitor.width - gridRect.width + 8 },
        true,
        secondaryMonitor,
      ).x,
    ).toBe(secondaryMonitor.x + secondaryMonitor.width - EDGE_HIDE_REVEAL_PX);
  });

  it("pulls a previously hidden grid back inside the monitor when unfolded", () => {
    const hidden = secondaryMonitor.x + EDGE_HIDE_REVEAL_PX - gridRect.width;
    expect(
      applyNativeEdgeSnap({ ...gridRect, x: hidden }, false, secondaryMonitor).x,
    ).toBe(secondaryMonitor.x);
  });
});

describe("rectsNearlyEqual", () => {
  it("tolerates one logical pixel of native move jitter", () => {
    expect(
      rectsNearlyEqual(gridRect, {
        ...gridRect,
        x: gridRect.x + 1,
        y: gridRect.y - 1,
      }),
    ).toBe(true);
  });

  it("detects movement beyond the jitter threshold", () => {
    expect(rectsNearlyEqual(gridRect, { ...gridRect, x: gridRect.x + 2 })).toBe(false);
  });
});
