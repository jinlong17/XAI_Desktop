/**
 * @internal — create.ts
 * Pure reducer for card creation.
 *
 * Mirrors move.ts structure (single-purpose, pure, no React imports).
 * APPENDS to the target quadrant (Matrix move-convention: move.ts:73 appends)
 * which is DIVERGENT from Tasks addCard which prepends.
 *
 * Guards:
 * - Empty/whitespace title → returns the SAME state reference (no-op).
 * - Unknown targetQuadrant → returns the SAME state reference (defensive).
 * - Untouched quadrants preserve referential equality.
 *
 * Does NOT emit web:matrix:priority-tagged (create is not a move; QE-D).
 *
 * Design:  packages/xai-web-matrix/docs/design.md §E.1 #3
 * API:     packages/xai-web-matrix/docs/api.md §E (extension)
 */

import type { MatrixCard, MatrixState, Quadrant } from "../types.js";
import { createMatrixId } from "./ids.js";

/** Draft type for creating a new matrix card (no date model in v1). */
export interface NewMatrixCardDraftInternal {
  /** Single string; stored as both en + zh. */
  title: string;
  /** Optional tag/label class. */
  tag?: string;
}

const VALID_QUADRANTS: readonly Quadrant[] = ["q1", "q2", "q3", "q4"];

/**
 * Appends a new card to `targetQuadrant`.
 *
 * - Returns the same state reference if title is empty/whitespace.
 * - Returns the same state reference if targetQuadrant is not a valid Quadrant.
 * - Untouched quadrants preserve referential equality.
 * - New card id is created via createMatrixId().
 * - title.en === title.zh === trimmed input (single bilingual title design.md §E.1 #8).
 * - date/dateZh/taskId are all undefined (no date model in v1; taskId reserved).
 */
export function addCard(
  state: MatrixState,
  draft: NewMatrixCardDraftInternal,
  targetQuadrant: Quadrant,
): MatrixState {
  const trimmed = draft.title.trim();
  // Empty/whitespace title → no-op (defensive; UI layer also validates)
  if (trimmed.length === 0) {
    return state;
  }

  // Unknown quadrant → no-op (defensive guard)
  if (!VALID_QUADRANTS.includes(targetQuadrant)) {
    return state;
  }

  const newCard: MatrixCard = {
    id: createMatrixId(),
    title: { en: trimmed, zh: trimmed },
    ...(draft.tag !== undefined ? { tag: draft.tag } : {}),
    // date, dateZh, taskId: intentionally omitted (undefined in v1)
  };

  // Build next state — only rebuild the target quadrant array
  // Untouched quadrants preserve referential equality.
  const next: MatrixState = {
    schemaVersion: 1,
    q1: targetQuadrant === "q1" ? ([...(state.q1 as MatrixCard[]), newCard]) : (state.q1 as MatrixCard[]),
    q2: targetQuadrant === "q2" ? ([...(state.q2 as MatrixCard[]), newCard]) : (state.q2 as MatrixCard[]),
    q3: targetQuadrant === "q3" ? ([...(state.q3 as MatrixCard[]), newCard]) : (state.q3 as MatrixCard[]),
    q4: targetQuadrant === "q4" ? ([...(state.q4 as MatrixCard[]), newCard]) : (state.q4 as MatrixCard[]),
  };

  return next;
}
