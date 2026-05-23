/**
 * apply* DOM helpers — typed wrappers for the data-* attribute mutations
 * that web design/app.jsx performs in useEffect hooks.
 *
 * These are the CANONICAL write paths. Callers (row #5, row #22) MUST use
 * these rather than calling document.documentElement.setAttribute directly.
 *
 * All functions are SSR-safe: they no-op when `document` is undefined.
 */

import type { BgTone, Density, RailPos, Theme } from "./types.js";

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

/**
 * Sets `data-theme` on <html>:
 *   - "light"  → <html data-theme="light">
 *   - "dark"   → <html data-theme="dark">
 *   - "system" → resolves via window.matchMedia("(prefers-color-scheme: dark)")
 *                and applies "light" or "dark" accordingly.
 *
 * SAFE in SSR: when `document` is undefined (no-op).
 * Does NOT subscribe to system theme change events; caller wires a
 * media-query listener if needed.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  if (theme === "system") {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

// ---------------------------------------------------------------------------
// Density
// ---------------------------------------------------------------------------

/**
 * Sets `data-density` on <html>:
 *   - "comfortable" → <html data-density="comfortable">  (default)
 *   - "compact"     → <html data-density="compact">
 */
export function applyDensity(density: Density): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-density", density);
}

// ---------------------------------------------------------------------------
// Font scale
// ---------------------------------------------------------------------------

/**
 * Sets `font-size` on <html> to `${scale * 16}px`.
 * Caller is responsible for clamping; this function validates that
 * scale is finite and > 0. Recommended range 0.85..1.15.
 * Throws RangeError for non-finite or non-positive values.
 */
export function applyFontScale(scale: number): void {
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new RangeError(
      `[applyFontScale] scale must be a finite positive number, got: ${scale}`
    );
  }
  if (typeof document === "undefined") return;
  document.documentElement.style.fontSize = `${scale * 16}px`;
}

// ---------------------------------------------------------------------------
// Accent hue
// ---------------------------------------------------------------------------

/**
 * Sets `--accent-hue` inline-style on <html>. Pass any number 0..360.
 * Out-of-range values are passed through unchanged (CSS handles them).
 * Throws RangeError if not finite.
 */
export function applyAccentHue(hue: number): void {
  if (!Number.isFinite(hue)) {
    throw new RangeError(
      `[applyAccentHue] hue must be a finite number, got: ${hue}`
    );
  }
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--accent-hue", String(hue));
}

// ---------------------------------------------------------------------------
// Background tone
// ---------------------------------------------------------------------------

/**
 * Sets `data-bg-tone` on <html>:
 *   - "default"   → REMOVES the attribute (`:root` defaults apply).
 *   - "cream"|"mist"|"lavender"|"peach"|"graphite" → <html data-bg-tone="X">
 */
export function applyBgTone(tone: BgTone): void {
  if (typeof document === "undefined") return;
  if (tone === "default") {
    document.documentElement.removeAttribute("data-bg-tone");
  } else {
    document.documentElement.setAttribute("data-bg-tone", tone);
  }
}

// ---------------------------------------------------------------------------
// Rail position
// ---------------------------------------------------------------------------

/**
 * Sets `data-rail-pos` on <html>:
 *   - "left"|"right"|"top"|"bottom" → <html data-rail-pos="X">
 *
 * Note: web design/app.jsx applies this on `.app` not `<html>`. We hoist
 * to `<html>` so utility classes in layout.css can target it without
 * requiring the `.app` wrapper to be present at all times. layout.css
 * selectors are ported to match.
 *
 * If row #5 needs to keep `.app[data-rail-pos]` selectors verbatim, this
 * function can be re-targeted in P3 with no API change.
 */
export function applyRailPos(pos: RailPos): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-rail-pos", pos);
}
