/**
 * Public types for @repo/plugin-web-settings-features-panel.
 *
 * Roadmap row #23 · W4b · 2026-05-23.
 * API contract: packages/xai-web-settings-features-panel/docs/api.md
 */

import type { Lang } from "@repo/plugin-web-tokens";
import type { PaneDepartureGuardRegistration } from "@repo/plugin-web-settings-shell";
import type { FeatureId } from "./featureIds.js";

export type { FeatureId };

/** Map of feature id → enabled boolean. Default for every id is `true`. */
export type FeaturePrefs = Readonly<Record<FeatureId, boolean>>;

export interface FeaturesPaneProps {
  /** Active language. Threaded via `featuresPane.render({ lang })`. */
  readonly lang: Lang;
  /**
   * Optional host departure-guard bridge, forwarded by `featuresPane.render`.
   * The pane registers whenever the host provides it and blocks only while
   * unresolved drafts exist.
   */
  readonly registerDepartureGuard?: PaneDepartureGuardRegistration;
}

export interface DisabledFeatureFallbackProps {
  /**
   * Module id whose route was reached while the user pref is off.
   * Unknown ids render a generic copy (DEV warn).
   */
  readonly moduleId: FeatureId;
  /** Active language. */
  readonly lang: Lang;
}
