/**
 * filterModulesByFeaturePrefs — pure helper.
 *
 * Removes any module whose `moduleId` matches a `FeatureId` with `prefs[id] === false`.
 * Modules whose `moduleId` is NOT a `FeatureId` (e.g. countdown / ai / statistics /
 * settings) always pass through.
 *
 * Pure: same inputs → structurally equal output array (by value).
 * Caller is responsible for memoizing the result if reference stability is needed.
 *
 * API contract: packages/xai-web-settings-features-panel/docs/api.md §1 + §5
 */

import { isFeatureId } from "./featureIds.js";
import type { FeaturePrefs } from "./types.js";

export function filterModulesByFeaturePrefs<T extends { moduleId: string }>(
  modules: readonly T[],
  prefs: FeaturePrefs,
): T[] {
  return modules.filter((m) => {
    if (!isFeatureId(m.moduleId)) return true;
    return prefs[m.moduleId] !== false;
  });
}
