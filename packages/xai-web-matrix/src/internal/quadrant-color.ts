/**
 * @internal — quadrant-color.ts
 * Maps a Quadrant id to its semantic CSS custom property token.
 *
 * Design: zero hex literals — only `var(--token)` references.
 * Frozen assumption §8 from design.md §1.1:
 *   Q1 = var(--red), Q2 = var(--amber), Q3 = var(--blue), Q4 = var(--accent)
 */

import type { Quadrant } from "../types.js";

/** Returns the `var(--token)` string for the given quadrant's colored top-bar. */
export function quadrantColorToken(q: Quadrant): string {
  switch (q) {
    case "q1": return "var(--red)";
    case "q2": return "var(--amber)";
    case "q3": return "var(--blue)";
    case "q4": return "var(--accent)";
  }
}
