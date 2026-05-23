/**
 * sanitizeOrder — pure helper implementing F1 reconciliation.
 *
 * Given the persisted xai_dash_order array + the currently-registered widgets,
 * produce a sanitized order that:
 *   1. Drops ids not present in registered widgets.
 *   2. Appends newly-registered widget ids that weren't in persisted.
 *   3. Deduplicates persisted ids (keeps first occurrence).
 *
 * Output length === number of unique registered widget ids.
 *
 * api.md §S6 documents the algorithm + invariants + edge cases.
 */
import type { WidgetRegistration } from "../types.js";

export function sanitizeOrder(
  persisted: readonly string[],
  registered: readonly WidgetRegistration[],
): string[] {
  // Deduplicate registered ids on the first occurrence basis (R5 multi-instance
  // collision policy — first wins).
  const knownIds = new Set<string>();
  for (const reg of registered) {
    knownIds.add(reg.id);
  }

  const sanitized: string[] = [];
  const seen = new Set<string>();

  // Pass 1: keep persisted ids that are known AND not yet seen.
  for (const id of persisted) {
    if (knownIds.has(id) && !seen.has(id)) {
      sanitized.push(id);
      seen.add(id);
    }
  }

  // Pass 2: append registered ids missing from persisted, in registration order.
  for (const reg of registered) {
    if (!seen.has(reg.id)) {
      sanitized.push(reg.id);
      seen.add(reg.id);
    }
  }

  return sanitized;
}

/** True iff two string arrays are deep-equal (used to skip needless writes). */
export function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
