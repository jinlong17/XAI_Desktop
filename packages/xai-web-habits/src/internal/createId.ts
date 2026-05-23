/**
 * @internal — createId.ts
 * Habit id generator.
 *
 * Primary: crypto.randomUUID() (all target browsers).
 * Fallback: timestamp + Math.random() for very old browsers.
 *
 * Design: design.md §9
 */

import type { HabitId } from "../types.js";

/**
 * Generates a unique HabitId.
 * Format: `"h_" + 8 random hex chars`.
 */
export function createId(): HabitId {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    // e.g. "110e8400-e29b-41d4-a716-446655440000" → take first 8 hex chars
    return "h_" + globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  }
  /* c8 ignore next 3 */
  // Fallback: timestamp + random (very old browser)
  return "h_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
