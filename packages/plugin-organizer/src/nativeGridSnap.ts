export const EDGE_SNAP_THRESHOLD = 24;
export const EDGE_HIDE_REVEAL_PX = 52;
export const RECT_SYNC_EPSILON = 1;

export type NativeWindowRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type NativeMonitorBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function rectsNearlyEqual(a: NativeWindowRect, b: NativeWindowRect): boolean {
  return (
    Math.abs(a.x - b.x) <= RECT_SYNC_EPSILON &&
    Math.abs(a.y - b.y) <= RECT_SYNC_EPSILON &&
    Math.abs(a.width - b.width) <= RECT_SYNC_EPSILON &&
    Math.abs(a.height - b.height) <= RECT_SYNC_EPSILON
  );
}

export function applyNativeEdgeSnap(
  rect: NativeWindowRect,
  isFolded: boolean,
  monitorBounds: NativeMonitorBounds,
): NativeWindowRect {
  const localX = rect.x - monitorBounds.x;
  const localY = rect.y - monitorBounds.y;
  const maxLocalX = Math.max(0, monitorBounds.width - rect.width);
  const maxLocalY = Math.max(0, monitorBounds.height - rect.height);
  let x = localX;
  let y = localY;

  if (localX <= EDGE_SNAP_THRESHOLD) {
    x = isFolded ? Math.min(0, EDGE_HIDE_REVEAL_PX - rect.width) : 0;
  } else if (localX >= maxLocalX - EDGE_SNAP_THRESHOLD) {
    x = isFolded ? Math.max(0, monitorBounds.width - EDGE_HIDE_REVEAL_PX) : maxLocalX;
  }

  if (localY <= EDGE_SNAP_THRESHOLD) {
    y = 0;
  } else if (localY >= maxLocalY - EDGE_SNAP_THRESHOLD) {
    y = maxLocalY;
  }

  return { ...rect, x: monitorBounds.x + x, y: monitorBounds.y + y };
}
