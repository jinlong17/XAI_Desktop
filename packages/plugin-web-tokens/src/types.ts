/**
 * Primitive union types for @repo/plugin-web-tokens.
 * These drive the data-* attribute API and apply* helpers.
 */

/** Supported UI languages. */
export type Lang = "en" | "zh";

/** Theme mode — resolved at runtime for "system". */
export type Theme = "light" | "dark" | "system";

/** Density preset — maps to [data-density] on <html>. */
export type Density = "comfortable" | "compact";

/** Background tone — maps to [data-bg-tone] on <html>. "default" REMOVES the attribute. */
export type BgTone =
  | "default"
  | "cream"
  | "mist"
  | "lavender"
  | "peach"
  | "graphite";

/** Rail position — maps to [data-rail-pos] on <html>. */
export type RailPos = "left" | "right" | "top" | "bottom";
