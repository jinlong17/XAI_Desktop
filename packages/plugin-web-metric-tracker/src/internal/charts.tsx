import type { ChartPoint } from "../types.js";

const W = 640;
const H = 190;
const PAD = 30;

interface LineChartProps {
  readonly points: readonly ChartPoint[];
  readonly mode: "weight" | "bmi";
  readonly colorVar: string;
}

export function MetricLineChart({ points, mode, colorVar }: LineChartProps) {
  const values = points
    .map((point) => (mode === "weight" ? point.weightKg : point.bmi))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (values.length === 0) {
    return (
      <div className="mt-line-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" />
      </div>
    );
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const denom = Math.max(1, values.length - 1);
  const pts = values.map((value, index) => {
    const x = PAD + (index * (W - PAD * 2)) / denom;
    const y = H - PAD - ((value - min) / span) * (H - PAD * 2);
    return { x, y, value };
  });
  const linePath = pts.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  const areaPath = `${linePath} L${last.x},${H - PAD} L${first.x},${H - PAD} Z`;
  const gradientId = `mt-${mode}-fill`;
  return (
    <div className="mt-line-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={mode === "weight" ? "体重曲线" : "BMI 曲线"}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={colorVar} stopOpacity=".22" />
            <stop offset="1" stopColor={colorVar} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = PAD + (line * (H - PAD * 2)) / 3;
          return <line key={line} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="var(--border-1)" strokeWidth="1" />;
        })}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={colorVar} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3.4" fill={colorVar} />
        ))}
      </svg>
      <div className="mt-chart-labels">
        {points.map((point, index) => (
          <span key={`${point.label}-${index}`}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

interface MiniShareLineProps {
  readonly points: readonly ChartPoint[];
}

export function MiniShareLine({ points }: MiniShareLineProps) {
  const values = points.map((point) => point.weightKg);
  if (values.length === 0) return <svg className="mt-share-line" viewBox="0 0 240 62" aria-hidden="true" />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const denom = Math.max(1, values.length - 1);
  const path = values.map((value, index) => {
    const x = 8 + (index * 224) / denom;
    const y = 52 - ((value - min) / span) * 42;
    return `${index === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  return (
    <svg className="mt-share-line" viewBox="0 0 240 62" aria-hidden="true">
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${path} L232,58 L8,58 Z`} fill="var(--accent-soft)" opacity=".7" />
    </svg>
  );
}
