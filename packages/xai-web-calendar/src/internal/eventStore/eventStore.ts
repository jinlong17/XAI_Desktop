/**
 * @internal — Pure CRUD over `Record<string, UserCalEvent>`.
 *
 * All functions are PURE: they NEVER mutate `store` and they return a
 * new store snapshot. The React hook wrapper (`useUserCalEvents`)
 * commits the new snapshot via `setPref` to localStorage.
 *
 * Design: docs/design.md §16.7
 * API:    docs/api.md §11.3
 *
 * Invariants:
 *   - `createEvent` generates a fresh `id` + `createdAt` + `updatedAt`.
 *   - `updateEvent` preserves `createdAt`; bumps `updatedAt`.
 *   - `deleteEvent` is a no-op if `id` is missing — same reference back.
 *   - `listEvents` returns events sorted by createdAt ASC, then id ASC
 *     for stable tie-break (deterministic test fixtures).
 */

import type { UserCalEvent } from "./types.js";
import { createEventId } from "./ids.js";

/**
 * Pure: create a new event in the given store.
 * Returns `{ next, created }`. Does NOT mutate `store`.
 */
export function createEvent(
  store: Record<string, UserCalEvent>,
  partial: Omit<UserCalEvent, "id" | "createdAt" | "updatedAt">,
): { next: Record<string, UserCalEvent>; created: UserCalEvent } {
  const id = createEventId();
  const now = new Date().toISOString();
  const created: UserCalEvent = {
    ...partial,
    id,
    createdAt: now,
    updatedAt: now,
  };
  const next: Record<string, UserCalEvent> = { ...store, [id]: created };
  return { next, created };
}

/**
 * Pure: apply patch on top of existing event; bumps `updatedAt`.
 * Returns `{ next, updated: null }` when id is missing (same store reference).
 */
export function updateEvent(
  store: Record<string, UserCalEvent>,
  id: string,
  patch: Partial<Omit<UserCalEvent, "id" | "createdAt">>,
): { next: Record<string, UserCalEvent>; updated: UserCalEvent | null } {
  const prev = store[id];
  if (!prev) {
    return { next: store, updated: null };
  }
  const updated: UserCalEvent = {
    ...prev,
    ...patch,
    id: prev.id,
    createdAt: prev.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const next: Record<string, UserCalEvent> = { ...store, [id]: updated };
  return { next, updated };
}

/**
 * Pure: remove `id`. No-op (same reference) when missing.
 */
export function deleteEvent(
  store: Record<string, UserCalEvent>,
  id: string,
): Record<string, UserCalEvent> {
  if (!(id in store)) {
    return store;
  }
  const next: Record<string, UserCalEvent> = { ...store };
  delete next[id];
  return next;
}

/** Pure: read by id, or null when missing. */
export function getEvent(
  store: Record<string, UserCalEvent>,
  id: string,
): UserCalEvent | null {
  return store[id] ?? null;
}

/** Pure: array view sorted by `createdAt` ASC, then `id` ASC. */
export function listEvents(
  store: Record<string, UserCalEvent>,
): UserCalEvent[] {
  return Object.values(store).slice().sort((a, b) => {
    if (a.createdAt < b.createdAt) return -1;
    if (a.createdAt > b.createdAt) return 1;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });
}
