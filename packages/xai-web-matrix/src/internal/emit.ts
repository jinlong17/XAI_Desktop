/**
 * @internal — emit.ts
 * Helper to emit the web:matrix:priority-tagged event.
 *
 * Policy (design.md §7.2):
 * - Emit ONCE per successful drag-between or keyboard-move that changes quadrant.
 * - Do NOT emit if from === to (no-op; handled by moveCardTo guard).
 * - Do NOT emit if from === null (card not found; handled by caller guard).
 * - Swallows emitWebEvent errors with DEV console.warn (event-bus semantics).
 */

import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { Quadrant } from "../types.js";

/**
 * Emits `web:matrix:priority-tagged` with a fresh ISO timestamp.
 * Only call this after confirming `from !== null && from !== to`.
 */
export function emitPriorityTagged(
  cardId: string,
  from: Quadrant,
  to: Quadrant,
): void {
  try {
    emitWebEvent("web:matrix:priority-tagged", {
      cardId,
      from,
      to,
      taggedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[xai-web-matrix] emitPriorityTagged failed", err);
    }
  }
}
