/**
 * @internal — pure date-offset helpers for Calendar and Timeline views.
 *
 * All functions operate relative to a caller-supplied `today` Date so they
 * can be tested deterministically without touching the system clock.
 */

const DAYS = 30;

/**
 * Parse a due string into a day-offset from `today` (0 = today).
 *
 * Accepted formats:
 *  - "M/D"   — matched by /^(\d+)\/(\d+)/
 *  - "Today" or "今天" — returns 0
 *  - anything else → null
 */
export function parseDay(due: string | undefined | null, today: Date): number | null {
  if (!due) return null;
  const m = String(due).match(/^(\d+)\/(\d+)/);
  if (m) {
    const monthDate = new Date(
      today.getFullYear(),
      parseInt(m[1]!, 10) - 1,
      parseInt(m[2]!, 10),
    );
    return Math.round(
      (monthDate.getTime() -
        new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
        86_400_000,
    );
  }
  if (due === "Today" || due === "今天") return 0;
  return null;
}

/**
 * Convert a day-offset back to "M/D" format.
 */
export function dayToStr(offset: number, today: Date): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * Clamp a day offset to [0, DAYS-1] (30-day gantt window).
 */
export function clampDay(n: number): number {
  return Math.max(0, Math.min(DAYS - 1, n));
}
