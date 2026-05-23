/**
 * @internal — emit.ts
 * Helper to emit the web:habits:checkin-recorded event.
 *
 * The channel is pre-declared in packages/core/src/types/events.ts:209-218.
 * No edit to EventMap required.
 *
 * Design: design.md §7
 * Policy: emit on every successful toggle (add AND remove). Q7 resolution.
 */

import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { HabitId, DateKey } from "../types.js";

/**
 * Emits `web:habits:checkin-recorded` with a fresh ISO timestamp.
 * Swallows emitWebEvent errors — state change still persists.
 */
export function emitCheckInRecorded(args: {
  habitId: HabitId;
  date: DateKey;
  streak: number;
}): void {
  try {
    emitWebEvent("web:habits:checkin-recorded", {
      habitId: args.habitId,
      date: args.date,
      streak: args.streak,
      recordedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[xai-web-habits] emitCheckInRecorded failed", err);
    }
  }
}
