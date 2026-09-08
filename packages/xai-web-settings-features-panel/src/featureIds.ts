/**
 * featureIds.ts — closed enum of user-toggleable feature ids.
 *
 * Authoritative for: storage key suffixes (`xai_pref_features_<id>`),
 * pane display order, and `filterModulesByFeaturePrefs` membership test.
 *
 * Closed list — adding a 9th feature is a SemVer minor per api.md §7.
 *
 * Source: roadmap row #23 deps + DESIGN.md §4.12.
 */

export type FeatureId =
  | "tasks"
  | "board"
  | "dashboard"
  | "calendar"
  | "matrix"
  | "pomodoro"
  | "habits"
  | "meditation";

/**
 * Stable display order for the FeaturesPane and any caller that needs a
 * deterministic iteration. Order matches `web design/module-settings.jsx`
 * FEATURES array minus pet/countdown plus tasks/dashboard (per discovery
 * review §1 table).
 */
export const featureIdOrder: readonly FeatureId[] = [
  "tasks",
  "board",
  "dashboard",
  "calendar",
  "matrix",
  "pomodoro",
  "habits",
  "meditation",
] as const;

const FEATURE_ID_SET: ReadonlySet<string> = new Set(featureIdOrder);

/** Type guard — returns true iff `id` is one of the 8 closed FeatureId values. */
export function isFeatureId(id: string): id is FeatureId {
  return FEATURE_ID_SET.has(id);
}

/** Map FeatureId → storage key (`xai_pref_features_<id>`). */
export function featurePrefKey(id: FeatureId): string {
  return `xai_pref_features_${id}`;
}
