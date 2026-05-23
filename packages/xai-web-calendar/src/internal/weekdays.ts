/**
 * @internal — Weekday label rotation.
 *
 * `@repo/plugin-web-tokens` exposes `weekdays_short` as a 7-element array
 * starting Sunday: ["Sun", "Mon", ..., "Sat"]. We rotate by weekStart so a
 * Mon-first user sees ["Mon", ..., "Sun"].
 *
 * See docs/design.md §6.5.
 */

/**
 * Returns a 7-element tuple of weekday labels, rotated by `weekStart`.
 *
 * @param weekdaysShort Sun..Sat array (length 7).
 * @param weekStart 0 = Sun, 1 = Mon.
 */
export function weekdayLabels(
  weekdaysShort: readonly string[],
  weekStart: 0 | 1,
): readonly [string, string, string, string, string, string, string] {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    out.push(weekdaysShort[(i + weekStart) % 7] ?? "");
  }
  return out as unknown as readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
}
