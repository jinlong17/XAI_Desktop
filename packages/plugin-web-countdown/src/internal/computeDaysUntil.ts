/**
 * @internal — computeDaysUntil.ts
 *
 * Pure function: given a target_date string and a reference `now` Date,
 * return the number of whole local-timezone days between today's midnight
 * and the target's midnight.
 *
 * Returns:
 *   - positive integer if target is in the future (including today: 0)
 *   - negative integer if target is in the past
 *   - NaN if target_date does not match /^\d{4}-\d{2}-\d{2}$/
 *
 * API contract: packages/xai-web-countdown/docs/api.md §6.3
 */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function computeDaysUntil(target_date: string, now: Date): number {
  const m = DATE_RE.exec(target_date);
  if (!m) return NaN;
  const y = m[1] as string;
  const mo = m[2] as string;
  const d = m[3] as string;
  const targetLocalMidnight = new Date(+y, +mo - 1, +d).setHours(0, 0, 0, 0);
  const todayLocalMidnight = new Date(now).setHours(0, 0, 0, 0);
  return Math.floor((targetLocalMidnight - todayLocalMidnight) / 86_400_000);
}
