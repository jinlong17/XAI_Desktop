/**
 * Boundary narrowing guards for the two opaque registry slots.
 *
 * See api.md §1 (Persistence narrowing contract).
 */

import type { BoardPanelStateShape, InboxCardShape } from "./types.js";

/**
 * Narrow an unknown value to `BoardPanelStateShape`.
 *
 * Accepts ONLY the bare-object form here; `loadPanelsOrDefault` separately
 * unwraps the length-1 array form (the canonical write shape) before calling
 * this guard.
 */
export function isBoardPanelState(value: unknown): value is BoardPanelStateShape {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.inbox === "boolean" &&
    typeof v.planner === "boolean" &&
    typeof v.board === "boolean"
  );
}

/**
 * Narrow an unknown value to `InboxCardShape[]`.
 *
 * Each element must have `id: string` and `text: { en: string; zh: string }`.
 * An empty array `[]` is valid.
 */
export function isInboxCardArray(value: unknown): value is InboxCardShape[] {
  if (!Array.isArray(value)) return false;
  for (const item of value) {
    if (typeof item !== "object" || item === null) return false;
    const it = item as Record<string, unknown>;
    if (typeof it.id !== "string") return false;
    if (typeof it.text !== "object" || it.text === null) return false;
    const text = it.text as Record<string, unknown>;
    if (typeof text.en !== "string" || typeof text.zh !== "string") return false;
  }
  return true;
}
