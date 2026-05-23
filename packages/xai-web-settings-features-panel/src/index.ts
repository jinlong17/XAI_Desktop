/**
 * @repo/plugin-web-settings-features-panel — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * Roadmap row #23 · W4b — Settings → Features pane (8-module on/off + SVG thumbs).
 * API contract: packages/xai-web-settings-features-panel/docs/api.md
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4 + §S7 + §S8
 *
 * P1 surface (this commit): types + featureIds + storage keys (registry-side).
 * P2 lands FeaturesPane / FeatureThumb / DisabledFeatureFallback / withDisabledFallback / useFeaturePrefs / filterModulesByFeaturePrefs.
 * P3 lands host wiring + integration tests.
 */

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Types -----------------------------------------------------------------
export type {
  FeatureId,
  FeaturePrefs,
  FeaturesPaneProps,
  DisabledFeatureFallbackProps,
} from "./types.js";

// ---- Constants + utilities -------------------------------------------------
export { featureIdOrder, isFeatureId, featurePrefKey } from "./featureIds.js";
