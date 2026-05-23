/**
 * @internal — drag-reorder reducer helper for AppRail.
 *
 * Pure function — no side effects, no imports beyond types.
 * Tested in isolation via src/__tests__/internal/dnd.test.ts.
 */

/**
 * Reorders an array by moving the element with `fromId` to the position
 * of the element with `toId`.
 *
 * - If either id is not found, returns the original array unchanged.
 * - If fromId === toId, returns the original array unchanged.
 * - The returned array is always a new instance (safe for React state).
 */
export function reorderArray<T extends string>(
  items: T[],
  fromId: T,
  toId: T,
): T[] {
  if (fromId === toId) return items;
  const fromIdx = items.indexOf(fromId);
  const toIdx = items.indexOf(toId);
  if (fromIdx < 0 || toIdx < 0) return items;
  const next = [...items];
  next.splice(fromIdx, 1);
  next.splice(toIdx, 0, fromId);
  return next;
}
