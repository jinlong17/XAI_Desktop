/**
 * @internal — usePersistedHabits.ts
 * usePref<HabitsState> wrapper with seed hydration and schemaVersion guard.
 *
 * Design: design.md §5.3
 * - On first mount when storage has the default empty state, seeds from internal/seed.ts.
 * - If stored schemaVersion !== 1, falls back to default via validateHabitsState.
 * - Exposes { state, setState } — callers compute postStreak and emit themselves.
 */

import { useEffect, useRef, useState } from "react";
import { accountScope, usePref } from "@repo/plugin-web-storage";
import type { WebPrefValue } from "@repo/plugin-web-storage";
import type { HabitsState } from "../types.js";
import { validateHabitsState } from "./validate.js";
import { buildSeedState } from "./seed.js";

const STORAGE_KEY = "xai_habits_state" as const;

// The registry entry types xai_habits_state as HabitsStateBlob = unknown.
// We read it as unknown and validate via validateHabitsState().
type RawBlob = WebPrefValue<typeof STORAGE_KEY>;

export interface HabitCommitOptions { id: string; kind: 'seed' | 'create' | 'checkin' | 'diary'; baseline?: string | null; after?: () => void }
export interface UsePersistedHabitsResult {
  state: HabitsState;
  setState: (next: HabitsState, options?: HabitCommitOptions) => boolean;
  recovery: { failure: 'write' | 'account' | 'conflict' | null; kind: HabitCommitOptions['kind'] | null; isPending: () => boolean; captureBaseline: () => string | null; retry: () => boolean; discard: () => void; snapshot: () => unknown };
  isDefault: boolean;
}

export function usePersistedHabits(): UsePersistedHabitsResult {
  const [rawState, setRawState, meta] = usePref(STORAGE_KEY);

  // Cast the raw (unknown) blob to HabitsState
  const state = validateHabitsState(rawState as RawBlob);
  const scope = useRef(accountScope.capture());
  const pending = useRef<{ next: HabitsState; options: HabitCommitOptions; baseline: string | null } | null>(null);
  const [failure, setFailure] = useState<'write' | 'account' | 'conflict' | null>(null);
  const physical = () => { accountScope.assertCurrent(scope.current); return accountScope.physicalKey(STORAGE_KEY, scope.current); };
  const setState = (next: HabitsState, options: HabitCommitOptions = { id: 'seed', kind: 'seed' }): boolean => {
    const previous = pending.current;
    if (previous && (previous.options.id !== options.id || !['create', 'diary'].includes(options.kind) && previous.next !== next)) return false;
    let key: string;
    try { key = physical(); } catch { pending.current ??= { next, options, baseline: null }; setFailure('account'); return false; }
    try {
      const current = localStorage.getItem(key);
      const baseline = previous ? previous.baseline : options.baseline !== undefined ? options.baseline : current;
      pending.current = { next, options, baseline };
      if (current !== baseline || options.kind !== 'seed' && current !== null && JSON.stringify(JSON.parse(current)) !== JSON.stringify(rawState)) { setFailure('conflict'); return false; }
      if (!setRawState(next as RawBlob)) { setFailure('write'); return false; }
      pending.current = null; setFailure(null); options.after?.(); return true;
    } catch { pending.current ??= { next, options, baseline: null }; setFailure('write'); return false; }
  };

  // First-launch seed: if state has no habits and key is absent from storage, seed.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    if (meta.isDefault || state.habits.length === 0) {
      setState(buildSeedState());
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, setState, isDefault: meta.isDefault, recovery: {
    failure, kind: pending.current?.options.kind ?? null, isPending: () => pending.current !== null,
    captureBaseline: () => localStorage.getItem(physical()),
    retry: () => { const proposal = pending.current; return proposal ? setState(proposal.next, proposal.options) : false; },
    discard: () => { pending.current = null; setFailure(null); },
    snapshot: () => ({ version: 1, kind: 'habits-unsaved-change', pending: pending.current?.next ?? null, stored: localStorage.getItem(physical()) }),
  } };
}
