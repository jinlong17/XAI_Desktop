/**
 * Donut — small SVG donut chart helper for StatTasks.
 *
 * Ported from `web design/module-dashboard.jsx` lines 751-765 verbatim.
 */

export interface DonutProps {
  /** 0..1 progress fraction. Clamped to [0, 1]. */
  value: number;
  /** Filled stroke color (defaults to var(--accent) via inline). */
  color?: string;
  /** Square size in pixels. */
  size?: number;
}

export function Donut({ value, color = "var(--accent)", size = 56 }: DonutProps) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="donut"
      role="img"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border-1)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        data-value={clamped}
      />
    </svg>
  );
}
