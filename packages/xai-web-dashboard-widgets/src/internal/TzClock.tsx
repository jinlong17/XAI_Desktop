/**
 * TzClock — small analog clock used by WorldClocks "analog" view.
 *
 * Ported from `web design/module-dashboard.jsx` lines 729-748 verbatim.
 */

export interface TzClockProps {
  h: number;
  m: number;
  s: number;
  size?: number;
}

export function TzClock({ h, m, s, size = 48 }: TzClockProps) {
  const hAng = ((h % 12) + m / 60) * 30;
  const mAng = (m + s / 60) * 6;
  const sAng = s * 6;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="tz-clock"
      role="img"
      aria-hidden
    >
      <circle cx="50" cy="50" r="46" fill="var(--bg-panel-2)" stroke="var(--border-1)" strokeWidth="1.5" />
      {[0, 3, 6, 9].map((i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x = 50 + Math.sin(a) * 38;
        const y = 50 - Math.cos(a) * 38;
        return <circle key={i} cx={x} cy={y} r="1.6" fill="var(--text-2)" />;
      })}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="26"
        stroke="var(--text-1)"
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${hAng} 50 50)`}
        data-tz-hand="hour"
      />
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="14"
        stroke="var(--text-1)"
        strokeWidth="2.4"
        strokeLinecap="round"
        transform={`rotate(${mAng} 50 50)`}
        data-tz-hand="minute"
      />
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="10"
        stroke="oklch(60% 0.18 25)"
        strokeWidth="1.2"
        strokeLinecap="round"
        transform={`rotate(${sAng} 50 50)`}
        data-tz-hand="second"
      />
      <circle cx="50" cy="50" r="3" fill="var(--text-1)" />
      <circle cx="50" cy="50" r="1.4" fill="oklch(60% 0.18 25)" />
    </svg>
  );
}
