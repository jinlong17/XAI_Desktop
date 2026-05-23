/**
 * Format a duration in milliseconds as "M:SS" (minutes:seconds, no leading zero on minutes).
 *
 * Examples:
 *   25*60_000 ms → "25:00"
 *   12*60_000 + 34_000 ms → "12:34"
 *   0 ms → "0:00"
 *   12_500 ms → "0:12"  (sub-second flooring)
 *   3700_000 ms → "61:40"  (over an hour — no hours separator)
 *
 * API contract: packages/xai-web-pomodoro/docs/api.md §4
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
