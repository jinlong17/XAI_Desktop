/**
 * @internal — move.ts
 * Pure reducer for card quadrant moves.
 *
 * Used by both the DnD handlers and the keyboard a11y fallback.
 * Pure function — no side effects, no React imports.
 *
 * Design: design.md §6.2
 */

import type { MatrixCard, MatrixState, Quadrant } from "../types.js";

export interface MoveResult {
  /** Next state (may be same reference as input if no-op). */
  next: MatrixState;
  /**
   * The source quadrant the card was found in.
   * null if the card was not found (should not happen with consistent state).
   * equal to `to` if the card was already in the target quadrant (no-op path).
   */
  from: Quadrant | null;
}

/**
 * Moves `cardId` from its current quadrant to `to`.
 *
 * Guards:
 * - If `cardId` is not found in any quadrant → returns `{ next: state, from: null }`.
 * - If `cardId` is already in `to` → returns `{ next: state, from: to }` (no-op).
 * - Otherwise → removes from source quadrant, appends to target quadrant.
 */
export function moveCardTo(
  state: MatrixState,
  cardId: string,
  to: Quadrant,
): MoveResult {
  const QUADRANTS: readonly Quadrant[] = ["q1", "q2", "q3", "q4"];

  // Find which quadrant currently holds the card
  let from: Quadrant | null = null;
  let card: MatrixCard | undefined;

  for (const q of QUADRANTS) {
    const found = (state[q] as readonly MatrixCard[]).find((c) => c.id === cardId);
    if (found !== undefined) {
      from = q;
      card = found;
      break;
    }
  }

  // Card not found — return no-op (defensive guard)
  if (from === null || card === undefined) {
    return { next: state, from: null };
  }

  // Already in the target quadrant — no-op
  if (from === to) {
    return { next: state, from: to };
  }

  // Build next state
  const next: MatrixState = {
    schemaVersion: 1,
    q1: from === "q1" ? (state.q1 as MatrixCard[]).filter((c) => c.id !== cardId) : (state.q1 as MatrixCard[]),
    q2: from === "q2" ? (state.q2 as MatrixCard[]).filter((c) => c.id !== cardId) : (state.q2 as MatrixCard[]),
    q3: from === "q3" ? (state.q3 as MatrixCard[]).filter((c) => c.id !== cardId) : (state.q3 as MatrixCard[]),
    q4: from === "q4" ? (state.q4 as MatrixCard[]).filter((c) => c.id !== cardId) : (state.q4 as MatrixCard[]),
  };

  // Append to target — cast through unknown to allow mutable write
  const mutableNext = next as unknown as Record<Quadrant, MatrixCard[]>;
  mutableNext[to] = [...(next[to] as MatrixCard[]), card];

  return { next, from };
}
