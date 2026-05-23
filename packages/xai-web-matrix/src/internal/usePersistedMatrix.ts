/**
 * @internal — usePersistedMatrix.ts
 * usePref<MatrixState> wrapper with first-launch seed hydration and schema version guard.
 *
 * Design: design.md §5.2
 * - On first mount when storage is at the registered default (all quadrants empty),
 *   seeds state from internal/seed.ts (the prototype's 8 cards in Q4).
 * - If stored schemaVersion !== 1, falls back to default (v2 will register a migration).
 * - Exposes { state, setState, moveCard(cardId, to) } — the moveCard path calls
 *   the moveCardTo reducer + emitPriorityTagged so event-emit is always unified.
 */

import { useEffect, useRef } from "react";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefValue } from "@repo/plugin-web-storage";
import type { MatrixState, Quadrant } from "../types.js";
import { buildSeedState } from "./seed.js";
import { moveCardTo } from "./move.js";
import { emitPriorityTagged } from "./emit.js";

const STORAGE_KEY = "xai_matrix_state" as const;

// The registry entry types xai_matrix_state as MatrixStateBlob = unknown.
// We read it as unknown and validate via asMatrixState().
type RawBlob = WebPrefValue<typeof STORAGE_KEY>;

export interface UsePersistedMatrixResult {
  state: MatrixState;
  setState: (next: MatrixState) => void;
  moveCard: (cardId: string, to: Quadrant) => void;
}

export function usePersistedMatrix(): UsePersistedMatrixResult {
  const [rawState, setRawState, meta] = usePref(STORAGE_KEY);

  // Cast the raw (unknown) blob to MatrixState
  const state = asMatrixState(rawState as RawBlob);
  const setState = (next: MatrixState) => setRawState(next as unknown as RawBlob);

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
    if (from === null || from === to) return; // no-op
    setState(next);
    emitPriorityTagged(cardId, from, to);
  };

  return { state, setState, moveCard };
}

/** Casts a potentially unknown blob to MatrixState, falling back to empty default. */
function asMatrixState(raw: unknown): MatrixState {
  if (
    raw !== null &&
    typeof raw === "object" &&
    (raw as MatrixState).schemaVersion === 1 &&
    Array.isArray((raw as MatrixState).q1) &&
    Array.isArray((raw as MatrixState).q2) &&
    Array.isArray((raw as MatrixState).q3) &&
    Array.isArray((raw as MatrixState).q4)
  ) {
    return raw as MatrixState;
  }
  // Corrupt blob or wrong schemaVersion — return empty default
  return { schemaVersion: 1, q1: [], q2: [], q3: [], q4: [] };
}
