/**
 * @internal — applyRestPanesToRegistry.ts
 *
 * Returns a new pane registry array with the 11 placeholder panes from the
 * chassis substituted by this row's panes. Preserves order, length, ids,
 * icons, i18nKeys.
 *
 * Idempotent: calling on an already-substituted registry returns equivalent output.
 *
 * API contract: packages/xai-web-settings-rest/docs/api.md §1.5
 */

import type { Pane } from "@repo/plugin-web-settings-shell";
import { restPanesById } from "./restPanesById.js";

/** The 11 pane ids this row owns. */
const OWNED_IDS = new Set<string>([
  "account",
  "premium",
  "smart_lists",
  "notifications",
  "date_time",
  "more",
  "integrations",
  "collaborate",
  "sticky",
  "hotkeys",
  "about",
]);

/**
 * Returns a new pane registry array with the 11 placeholder panes from the chassis
 * substituted by this row's panes. Preserves order, length, ids, icons, i18nKeys.
 *
 * The host composition seam at apps/web/src/routes/modules/settingsPaneComposition.ts
 * uses this helper to apply all 11 substitutions in one call. Alternatively, the
 * host can switch case per id — both forms are supported.
 */
export function applyRestPanesToRegistry(
  registry: readonly Pane[],
): readonly Pane[] {
  return registry.map((p) => {
    if (OWNED_IDS.has(p.id)) {
      const owned = restPanesById[p.id as keyof typeof restPanesById];
      return owned ?? p;
    }
    return p;
  });
}
