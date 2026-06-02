/**
 * @internal — Pure CRUD over `Record<string, UserSticky>`.
 *
 * All functions are PURE: they NEVER mutate `store` and they return a
 * new store snapshot. The React hook wrapper (`useStickies`)
 * commits the new snapshot via `setPref` to localStorage.
 *
 * Verbatim port of xai-web-calendar/src/internal/eventStore/eventStore.ts
 * scaled down to the simpler sticky model (no update, no recurrence).
 *
 * Invariants:
 *   - `createSticky` generates a fresh `id` + `createdAt`.
 *   - `deleteSticky` is a no-op if `id` is missing — same reference back.
 *   - `listStickies` returns stickies sorted by user order ASC, then createdAt
 *     ASC, then id ASC for stable tie-break (deterministic test fixtures).
 *   - `moveSticky` updates only the free-form canvas coordinates.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §E.3
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §E
 */

import type { UserSticky, NewStickyDraft, StickyPosition, StickySize } from "./types.js";
import { STICKY_DEFAULT_SIZE, STICKY_SIZE_LIMITS } from "./types.js";
import { createStickyId } from "./ids.js";

const STICKY_CANVAS_GAP = 12;
const STICKY_FALLBACK_COLUMNS = 2;
const STICKY_FALLBACK_ROWS = 3;

function clampStickyDimension(value: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeStickySize(size: Partial<StickySize> | undefined): StickySize {
  return {
    width: clampStickyDimension(
      size?.width,
      STICKY_SIZE_LIMITS.minWidth,
      STICKY_SIZE_LIMITS.maxWidth,
      STICKY_DEFAULT_SIZE.width,
    ),
    height: clampStickyDimension(
      size?.height,
      STICKY_SIZE_LIMITS.minHeight,
      STICKY_SIZE_LIMITS.maxHeight,
      STICKY_DEFAULT_SIZE.height,
    ),
  };
}

function normalizeStickyCoordinate(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.round(value));
}

export function fallbackStickyPosition(index: number, size: StickySize = STICKY_DEFAULT_SIZE): StickyPosition {
  const safeIndex = Math.max(0, index);
  return {
    x: STICKY_CANVAS_GAP + (safeIndex % STICKY_FALLBACK_COLUMNS) * (size.width + STICKY_CANVAS_GAP),
    y:
      STICKY_CANVAS_GAP +
      (Math.floor(safeIndex / STICKY_FALLBACK_COLUMNS) % STICKY_FALLBACK_ROWS) * (size.height + STICKY_CANVAS_GAP),
  };
}

export function normalizeStickyPosition(
  position: Partial<StickyPosition> | undefined,
  fallback: StickyPosition,
): StickyPosition {
  return {
    x: normalizeStickyCoordinate(position?.x, fallback.x),
    y: normalizeStickyCoordinate(position?.y, fallback.y),
  };
}

function hasNumericOrder(sticky: Pick<UserSticky, "order">): sticky is Pick<UserSticky, "order"> & { order: number } {
  return typeof sticky.order === "number" && Number.isFinite(sticky.order);
}

function compareCreatedAtThenId(a: UserSticky, b: UserSticky): number {
  if (a.createdAt < b.createdAt) return -1;
  if (a.createdAt > b.createdAt) return 1;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

function fallbackOrderMap(store: Record<string, UserSticky>): Map<string, number> {
  const map = new Map<string, number>();
  Object.values(store).slice().sort(compareCreatedAtThenId).forEach((sticky, index) => {
    map.set(sticky.id, index);
  });
  return map;
}

function stickyOrderValue(sticky: UserSticky, fallback: Map<string, number>): number {
  if (hasNumericOrder(sticky)) return sticky.order;
  return fallback.get(sticky.id) ?? 0;
}

function nextStickyOrder(store: Record<string, UserSticky>): number {
  const fallback = fallbackOrderMap(store);
  const maxOrder = Object.values(store).reduce((max, sticky) => {
    return Math.max(max, stickyOrderValue(sticky, fallback));
  }, -1);
  return maxOrder + 1;
}

/**
 * Pure: create a new sticky in the given store.
 * Returns `{ next, created }`. Does NOT mutate `store`.
 */
export function createSticky(
  store: Record<string, UserSticky>,
  draft: NewStickyDraft,
): { next: Record<string, UserSticky>; created: UserSticky } {
  const id = createStickyId();
  const now = new Date().toISOString();
  const size = normalizeStickySize(draft);
  const order = nextStickyOrder(store);
  const position = normalizeStickyPosition(draft, fallbackStickyPosition(order, size));
  const created: UserSticky = {
    id,
    text: draft.text.trim(),
    color: draft.color,
    createdAt: now,
    width: size.width,
    height: size.height,
    x: position.x,
    y: position.y,
    order,
    ...(draft.source ? { source: draft.source } : {}),
  };
  const next: Record<string, UserSticky> = { ...store, [id]: created };
  return { next, created };
}

/**
 * Pure: remove `id`. No-op (same reference) when missing.
 */
export function deleteSticky(
  store: Record<string, UserSticky>,
  id: string,
): Record<string, UserSticky> {
  if (!(id in store)) {
    return store;
  }
  const next: Record<string, UserSticky> = { ...store };
  delete next[id];
  return next;
}

/**
 * Pure: update an existing sticky while preserving its id + createdAt.
 * No-op (same reference) when the id is missing.
 */
export function updateSticky(
  store: Record<string, UserSticky>,
  id: string,
  draft: NewStickyDraft,
): Record<string, UserSticky> {
  const current = store[id];
  if (!current) return store;
  const size = normalizeStickySize({
    width: draft.width ?? current.width,
    height: draft.height ?? current.height,
  });
  const updated: UserSticky = {
    ...current,
    text: draft.text.trim(),
    color: draft.color,
    width: size.width,
    height: size.height,
    ...(draft.source ? { source: draft.source } : {}),
  };
  if (!draft.source) delete updated.source;
  return { ...store, [id]: updated };
}

/**
 * Pure: update only user-controlled sticky dimensions.
 * No-op (same reference) when the id is missing.
 */
export function resizeSticky(
  store: Record<string, UserSticky>,
  id: string,
  size: StickySize,
): Record<string, UserSticky> {
  const current = store[id];
  if (!current) return store;
  const nextSize = normalizeStickySize(size);
  if (current.width === nextSize.width && current.height === nextSize.height) {
    return store;
  }
  return {
    ...store,
    [id]: {
      ...current,
      width: nextSize.width,
      height: nextSize.height,
    },
  };
}

/**
 * Pure: update only free-form sticky canvas coordinates.
 * No-op (same reference) when the id is missing.
 */
export function moveSticky(
  store: Record<string, UserSticky>,
  id: string,
  position: StickyPosition,
): Record<string, UserSticky> {
  const current = store[id];
  if (!current) return store;
  const fallback = normalizeStickyPosition(current, fallbackStickyPosition(stickyOrderValue(current, fallbackOrderMap(store))));
  const nextPosition = normalizeStickyPosition(position, fallback);
  if (current.x === nextPosition.x && current.y === nextPosition.y) {
    return store;
  }
  return {
    ...store,
    [id]: {
      ...current,
      x: nextPosition.x,
      y: nextPosition.y,
    },
  };
}

/**
 * Pure: rewrite user-controlled sticky display order.
 * Missing IDs are ignored; store entries not listed are appended in current
 * list order so no sticky disappears.
 */
export function reorderStickies(
  store: Record<string, UserSticky>,
  orderedIds: readonly string[],
): Record<string, UserSticky> {
  const seen = new Set<string>();
  const currentOrder = listStickies(store).map((sticky) => sticky.id);
  const nextOrder = [
    ...orderedIds.filter((id) => {
      if (!(id in store) || seen.has(id)) return false;
      seen.add(id);
      return true;
    }),
    ...currentOrder.filter((id) => !seen.has(id)),
  ];
  let changed = false;
  const next: Record<string, UserSticky> = { ...store };
  nextOrder.forEach((id, order) => {
    const sticky = store[id];
    if (!sticky) return;
    if (sticky.order !== order) {
      changed = true;
      next[id] = { ...sticky, order };
    }
  });
  return changed ? next : store;
}

/** Pure: array view sorted by `order` ASC, then `createdAt` ASC, then `id` ASC. */
export function listStickies(
  store: Record<string, UserSticky>,
): UserSticky[] {
  const fallback = fallbackOrderMap(store);
  return Object.values(store).slice().sort((a, b) => {
    const orderDelta = stickyOrderValue(a, fallback) - stickyOrderValue(b, fallback);
    if (orderDelta !== 0) return orderDelta;
    return compareCreatedAtThenId(a, b);
  });
}
