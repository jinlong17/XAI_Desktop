/**
 * Public types for @repo/plugin-web-countdown.
 * Re-exported from src/index.ts.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 * Design: packages/xai-web-countdown/docs/design.md §3
 * API contract: packages/xai-web-countdown/docs/api.md §1
 */

// --------------------------------------------------------------------------
// CountdownVariant
// --------------------------------------------------------------------------

/**
 * Visual style of a countdown card.
 * - "image" — card uses a colored gradient background; cover_url is non-null.
 * - "light" — card uses the default light panel background; cover_url is null.
 */
export type CountdownVariant = "image" | "light";

// --------------------------------------------------------------------------
// CountdownCard — locked schema (byte-for-byte storage shape)
// --------------------------------------------------------------------------

/**
 * A single countdown card persisted under the "xai_countdowns" pref key.
 *
 * Validated at the storage boundary via `isCountdownCard(x)` in
 * `src/internal/validate.ts`. Invalid entries are filtered and a DEV warn
 * is emitted.
 */
export interface CountdownCard {
  /** Stable id. Generated via `cd_<base36(rand)>` on creation. */
  id: string;
  /** Bilingual title — both keys required. Empty string allowed. */
  title: { en: string; zh: string };
  /**
   * ISO 8601 calendar date "YYYY-MM-DD" (NOT a full ISO timestamp).
   * Interpreted as local midnight in the user's TZ at render time.
   * Validation: /^\d{4}-\d{2}-\d{2}$/ AND new Date(y, m-1, d) round-trip.
   */
  target_date: string;
  /** See CountdownVariant above. */
  variant: CountdownVariant;
  /**
   * Cover spec.
   *   - When variant="light": MUST be null.
   *   - When variant="image": MUST be either:
   *       * "preset:<id>" where <id> matches an IMAGE_PRESETS entry, OR
   *       * (future) a real URL — out of scope for v1 but the parser tolerates it.
   */
  cover_url: string | null;
}

// --------------------------------------------------------------------------
// ImagePresetId / ImagePreset
// --------------------------------------------------------------------------

/** Stable identifiers for bundled CSS gradient presets. */
export type ImagePresetId =
  | "dusk"
  | "midnight"
  | "sand"
  | "forest"
  | "peach"
  | "lavender";

/**
 * A single image preset entry bundled with the package.
 * The gradient string is used directly as a CSS `background-image` value.
 */
export interface ImagePreset {
  readonly id: ImagePresetId;
  /** CSS gradient string usable directly as `background-image`. */
  readonly gradient: string;
  readonly label_en: string;
  readonly label_zh: string;
}
