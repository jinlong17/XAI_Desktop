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
 *   - `listStickies` returns stickies sorted by createdAt ASC, then id ASC
 *     for stable tie-break (deterministic test fixtures).
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §E.3
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §E
 */

import type { UserSticky, NewStickyDraft } from "./types.js";
import { createStickyId } from "./ids.js";

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
  const created: UserSticky = {
    id,
    text: draft.text.trim(),
    color: draft.color,
    createdAt: now,
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

/** Pure: array view sorted by `createdAt` ASC, then `id` ASC. */
export function listStickies(
  store: Record<string, UserSticky>,
): UserSticky[] {
  return Object.values(store).slice().sort((a, b) => {
    if (a.createdAt < b.createdAt) return -1;
    if (a.createdAt > b.createdAt) return 1;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });
}
