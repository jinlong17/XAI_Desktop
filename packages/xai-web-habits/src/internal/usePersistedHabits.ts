/**
 * @internal — usePersistedHabits.ts
 * usePref<HabitsState> wrapper with seed hydration and schemaVersion guard.
 *
 * Design: design.md §5.3
 * - On first mount when storage has the default empty state, seeds from internal/seed.ts.
 * - If stored schemaVersion !== 1, falls back to default via validateHabitsState.
 * - Exposes { state, setState } — callers compute postStreak and emit themselves.
 */

import { useEffect, useRef } from "react";
import { usePref } from "@repo/plugin-web-storage";
import type { WebPrefValue } from "@repo/plugin-web-storage";
import type { HabitsState } from "../types.js";
import { validateHabitsState } from "./validate.js";
import { buildSeedState } from "./seed.js";

const STORAGE_KEY = "xai_habits_state" as const;

// The registry entry types xai_habits_state as HabitsStateBlob = unknown.
// We read it as unknown and validate via validateHabitsState().
type RawBlob = WebPrefValue<typeof STORAGE_KEY>;

export interface UsePersistedHabitsResult {
  state: HabitsState;
  setState: (next: HabitsState) => void;
  isDefault: boolean;
}

export interface UsePersistedHabitsOptions {
  enableSeedHydration?: boolean;
}

export function usePersistedHabits(
  options?: UsePersistedHabitsOptions,
): UsePersistedHabitsResult {
  const enableSeedHydration = options?.enableSeedHydration ?? true;
  const [rawState, setRawState, meta] = usePref(STORAGE_KEY);

  // Cast the raw (unknown) blob to HabitsState
  const state = validateHabitsState(rawState as RawBlob);
  const setState = (next: HabitsState) => setRawState(next as unknown as RawBlob);

  // First-launch seed: if state has no habits and key is absent from storage, seed.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    if (!enableSeedHydration) {
      return;
    }

    if (meta.isDefault || state.habits.length === 0) {
      setState(buildSeedState());
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableSeedHydration, meta.isDefault, state.habits.length]);

  return { state, setState, isDefault: meta.isDefault };
}
