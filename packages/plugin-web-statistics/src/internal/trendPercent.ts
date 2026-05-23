/**
 * @internal — trend percent formatter.
 *
 * Compares the current window's total to the prior window's total and
 * returns a display string with sign + percent suffix.
 *
 * - prior = 0 → "—" (em-dash). Never "+Infinity%" or "+0%".
 * - both = 0 → "—".
 * - otherwise → "{sign}{abs}%" rounded to whole percent.
 *
 * api.md §5.4.
 */

export function trendPercent(current: number, prior: number): string {
  if (prior === 0) return "—";
  const diff = current - prior;
  const pct = Math.round((diff / prior) * 100);
  if (pct === 0) return "+0%";
  const sign = pct > 0 ? "+" : "-";
  return `${sign}${Math.abs(pct)}%`;
}
