/**
 * @internal — cardsReducer.ts
 *
 * Pure functions for mutating CountdownCard arrays.
 * None of these functions perform storage IO — callers pass the prev array
 * and receive a new array.
 *
 * API contract: packages/xai-web-countdown/docs/api.md §5.2–5.3
 */

import type { CountdownCard } from "../types.js";

// --------------------------------------------------------------------------
// ID generation
// --------------------------------------------------------------------------

/**
 * Generate a new card id of the form "cd_<8-char base36>".
 * Collision probability is negligible at human-scale card counts.
 */
export function newCardId(): string {
  return "cd_" + Math.floor(Math.random() * 36 ** 8).toString(36).padStart(8, "0");
}

// --------------------------------------------------------------------------
// Mutation functions — all pure, return new arrays
// --------------------------------------------------------------------------

/**
 * Append a new card (auto-generated id) to the array.
 *
 * If the generated id collides with an existing card, re-rolls once.
 * (Double-collision probability is astronomically low.)
 */
export function addCard(
  prev: CountdownCard[],
  draft: Omit<CountdownCard, "id">,
): CountdownCard[] {
  let id = newCardId();
  if (prev.some((c) => c.id === id)) {
    id = newCardId();
  }
  return [...prev, { ...draft, id }];
}

/**
 * Replace fields on the card with the matching id.
 * If `id` is not found, returns the same array reference (no-op).
 */
export function updateCard(
  prev: CountdownCard[],
  id: string,
  patch: Partial<Omit<CountdownCard, "id">>,
): CountdownCard[] {
  const idx = prev.findIndex((c) => c.id === id);
  if (idx === -1) return prev;
  const updated = [...prev];
  const existing = prev[idx];
  if (!existing) return prev;
  updated[idx] = { ...existing, ...patch };
  return updated;
}

/**
 * Remove the card with the matching id.
 * If `id` is not found, returns the same array reference (no-op).
 */
export function deleteCard(prev: CountdownCard[], id: string): CountdownCard[] {
  const idx = prev.findIndex((c) => c.id === id);
  if (idx === -1) return prev;
  return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
}
