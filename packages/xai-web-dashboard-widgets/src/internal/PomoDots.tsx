/**
 * PomoDots — small 8-dot grid helper for StatPomos.
 *
 * Ported from `web design/module-dashboard.jsx` lines 767-775 verbatim.
 */

export interface PomoDotsProps {
  /** Number of completed pomodoros (filled dots). Clamped to [0, total]. */
  count: number;
  /** Total dot count. */
  total: number;
}

export function PomoDots({ count, total }: PomoDotsProps) {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeCount = Math.max(0, Math.min(safeTotal, Math.floor(count)));
  return (
    <div className="pomo-dots" role="img" aria-label={`${safeCount} of ${safeTotal} pomodoros`}>
      {Array.from({ length: safeTotal }).map((_, i) => (
        <span key={i} className={"pd-dot" + (i < safeCount ? " on" : "")} />
      ))}
    </div>
  );
}
