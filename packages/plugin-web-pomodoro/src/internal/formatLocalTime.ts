/**
 * Format an ISO 8601 timestamp as "HH:MM" in the user's local timezone.
 *
 * API contract: packages/xai-web-pomodoro/docs/api.md §4
 */

/**
 * @param isoTimestamp - An ISO 8601 date-time string (e.g. "2026-05-23T14:32:00.000Z").
 * @returns "HH:MM" formatted string in local timezone (zero-padded).
 */
export function formatLocalTime(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
