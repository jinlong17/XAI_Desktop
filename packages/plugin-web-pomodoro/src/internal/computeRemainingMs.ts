/**
 * Pure function: compute how many milliseconds remain in a running timer.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §6 (T-A absolute-timestamp)
 * API contract: packages/xai-web-pomodoro/docs/api.md §6.3
 *
 * @param startedAt         - Date.now() at the moment the current run-segment began (epoch ms).
 * @param remainingAtStartMs - Milliseconds remaining when this run-segment started.
 * @param nowMs             - Date.now() at the moment of the query (epoch ms).
 * @returns Remaining milliseconds, clamped to [0, ∞).
 */
export function computeRemainingMs(
  startedAt: number,
  remainingAtStartMs: number,
  nowMs: number,
): number {
  return Math.max(0, remainingAtStartMs - (nowMs - startedAt));
}
