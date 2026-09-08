/**
 * Notifications feature-flag stub (v1 — always off).
 *
 * Settings W4 will flip NOTIFICATIONS_ENABLED to true (or replace with a usePref read).
 * No Notification.permission request is made in v1.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §8 (N-A)
 * API contract: packages/xai-web-pomodoro/docs/api.md §6.1
 */

import type { PomodoroMode } from "../types.js";

/** Feature flag. Settings W4 sets this to true when the row ships. */
export const NOTIFICATIONS_ENABLED = false;

/**
 * Attempt to send a browser notification that a Pomodoro session has ended.
 *
 * No-op when NOTIFICATIONS_ENABLED is false (v1 default).
 * When true, checks Notification.permission before calling new Notification().
 *
 * @param mode       - The mode that just finished.
 * @param durationMs - Actual elapsed duration in ms.
 */
export function notifySessionEnd(mode: PomodoroMode, durationMs: number): void {
  if (!NOTIFICATIONS_ENABLED) return;

  // Guard for environments where Notification API is unavailable
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  const minutes = Math.floor(durationMs / 60_000);
  const title =
    mode === "focus"
      ? `Focus complete — ${minutes}m`
      : mode === "short-break"
        ? "Short break over"
        : "Long break over";

  try {
    new Notification(title);
  } catch {
    // Silently ignore — non-blocking stub
  }
}
