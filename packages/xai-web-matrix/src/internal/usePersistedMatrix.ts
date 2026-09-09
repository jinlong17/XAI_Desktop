/**
 * @internal — usePersistedMatrix.ts
 * usePref<MatrixState> wrapper with first-launch seed hydration and schema version guard.
 *
 * Design: design.md §5.2
 * - On first mount when storage is at the registered default (all quadrants empty),
 *   seeds state from internal/seed.ts (the prototype's 8 cards in Q4).
 * - If stored schemaVersion !== 1, falls back to default (v2 will register a migration).
 * - Exposes { state, setState, moveCard(cardId, to), addCard(draft, to) }
 *   - moveCard calls moveCardTo reducer + emitPriorityTagged (unified emit path).
 *   - addCard calls addCardReducer + setState; does NOT emit (QE-D: create ≠ move).
 *
 * Extension: xai-web-matrix-card-create (design.md §E.1 #11)
 */

import { useEffect, useRef, useState } from "react";
import { accountScope, usePref } from "@repo/plugin-web-storage";
import type { WebPrefValue } from "@repo/plugin-web-storage";
import type { MatrixState, Quadrant, NewMatrixCardDraft } from "../types.js";
import { buildSeedState } from "./seed.js";
import { moveCardTo } from "./move.js";
import { addCard as addCardReducer } from "./create.js";
import { emitPriorityTagged } from "./emit.js";

const STORAGE_KEY = "xai_matrix_state" as const;

// The registry entry types xai_matrix_state as MatrixStateBlob = unknown.
// We read it as unknown and validate via asMatrixState().
type RawBlob = WebPrefValue<typeof STORAGE_KEY>;

export interface UsePersistedMatrixResult {
  state: MatrixState;
  setState: (next: MatrixState) => boolean;
  moveCard: (cardId: string, to: Quadrant) => boolean;
  /** Appends a new card to targetQuadrant. Does NOT emit web:matrix:priority-tagged. */
  addCard: (draft: NewMatrixCardDraft, to: Quadrant) => boolean;
  recovery: { failure: 'write' | 'account' | 'conflict' | null; kind: 'create' | 'move' | 'state' | null; retry: () => boolean; discard: () => void; snapshot: () => unknown };
}

export function usePersistedMatrix(): UsePersistedMatrixResult {
  const [rawState, setRawState, meta] = usePref(STORAGE_KEY);

  // Cast the raw (unknown) blob to MatrixState
  const state = asMatrixState(rawState as RawBlob);
  const scope = useRef(accountScope.capture());
  type Pending = { next: MatrixState; baseline: string | null; kind: 'create' | 'move' | 'state'; after?: () => void };
  const pending = useRef<Pending | null>(null);
  const [failure, setFailure] = useState<'write' | 'account' | 'conflict' | null>(null);
  const physical = () => { accountScope.assertCurrent(scope.current); return accountScope.physicalKey(STORAGE_KEY, scope.current); };
  const commit = (next: MatrixState, kind: Pending['kind'], after?: () => void): boolean => {
    if (pending.current && (kind !== pending.current.kind || kind !== 'create' && pending.current.next !== next)) return false;
    let key: string;
    try { key = physical(); } catch { setFailure('account'); return false; }
    try {
      const current = localStorage.getItem(key);
      const baseline = pending.current ? pending.current.baseline : current;
      pending.current = { next, kind, baseline, after };
      if (current !== baseline || current !== null && JSON.stringify(JSON.parse(current)) !== JSON.stringify(rawState)) { setFailure('conflict'); return false; }
      if (!setRawState(next as RawBlob)) { setFailure('write'); return false; }
      pending.current = null; setFailure(null); after?.(); return true;
    } catch { if (!pending.current) pending.current = { next, kind, baseline: null, after }; setFailure('write'); return false; }
  };
  const setState = (next: MatrixState) => commit(next, 'state');

  // First-launch seed: if state is empty (all quadrant arrays have zero cards)
  // and this is the default (key absent from storage), apply the seed.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    if (
      meta.isDefault ||
      (state.q1.length === 0 &&
        state.q2.length === 0 &&
        state.q3.length === 0 &&
        state.q4.length === 0)
    ) {
      setState(buildSeedState());
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveCard = (cardId: string, to: Quadrant) => {
    const { next, from } = moveCardTo(state, cardId, to);
    if (from === null || from === to) return false; // no-op
    return commit(next, 'move', () => emitPriorityTagged(cardId, from, to));
  };

  // addCard: creates a new card + persists; does NOT emit (QE-D — create ≠ move).
  const addCard = (draft: NewMatrixCardDraft, to: Quadrant) => {
    const next = addCardReducer(state, draft, to);
    if (next === state) return false; // no-op (empty title / bad quadrant)
    return commit(next, 'create');
  };

  return { state, setState, moveCard, addCard, recovery: {
    failure, kind: pending.current?.kind ?? null,
    retry: () => { const proposed = pending.current; return proposed ? commit(proposed.next, proposed.kind, proposed.after) : false; },
    discard: () => { pending.current = null; setFailure(null); },
    snapshot: () => { const key = physical(); return { version: 1, kind: 'matrix-unsaved-change', pending: pending.current?.next ?? null, stored: localStorage.getItem(key) }; },
  } };
}

/** Casts a potentially unknown blob to MatrixState, falling back to empty default. */
export function asMatrixState(raw: unknown): MatrixState {
  if (
    isRecord(raw) &&
    raw.schemaVersion === 1 &&
    isMatrixCardArray(raw.q1) &&
    isMatrixCardArray(raw.q2) &&
    isMatrixCardArray(raw.q3) &&
    isMatrixCardArray(raw.q4)
  ) {
    return raw as unknown as MatrixState;
  }
  // Corrupt blob or wrong schemaVersion — return empty default
  return { schemaVersion: 1, q1: [], q2: [], q3: [], q4: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isMatrixCardArray(value: unknown): value is MatrixState["q1"] {
  return Array.isArray(value) && value.every(isMatrixCard);
}

function isMatrixCard(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || value.id.length === 0) return false;
  if (!isRecord(value.title)) return false;
  if (typeof value.title.en !== "string" || typeof value.title.zh !== "string") return false;
  if (value.date !== undefined && typeof value.date !== "string") return false;
  if (value.dateZh !== undefined && typeof value.dateZh !== "string") return false;
  if (value.tag !== undefined && typeof value.tag !== "string") return false;
  if (value.taskId !== undefined && typeof value.taskId !== "string") return false;
  return true;
}
