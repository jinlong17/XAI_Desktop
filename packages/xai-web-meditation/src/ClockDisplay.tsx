/**
 * <ClockDisplay> — pure live clock renderer.
 *
 * Supports 4 variants: digital / split / analog / minimal.
 *
 * `static` mode freezes the displayed time at 2024-01-01T03:44:17 and
 * skips the setInterval entirely — used for the clock-picker mini
 * previews so they don't trigger 4 simultaneous ticks (Q5).
 *
 * Live mode runs a single setInterval at 1000ms (Q12). The interval is
 * cleaned up on unmount or when `staticMode` toggles to true.
 *
 * Analog hands use the active clock color palette; the second hand uses
 * the palette highlight color.
 */

import { useEffect, useState, type CSSProperties, type JSX } from "react";
import type { ClockColorPalette, ClockScale, ClockVariant } from "./types.js";
import { computeAnalogAngles } from "./internal/computeAnalogAngles.js";
import { DEFAULT_CLOCK_COLORS } from "./constants.js";

export interface ClockDisplayProps {
  variant: ClockVariant;
  accent?: string;
  scale?: ClockScale;
  colors?: ClockColorPalette;
  mini?: boolean;
  /**
   * If true: time is frozen at 03:44:17 and no setInterval is started.
   * Prop is named `staticMode` because `static` is a reserved word in
   * some JSX tooling pipelines.
   */
  staticMode?: boolean;
}

const FROZEN_TIME = new Date(2024, 0, 1, 3, 44, 17);

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function ClockDisplay({
  variant,
  accent = "currentColor",
  scale = "normal",
  colors,
  mini = false,
  staticMode = false,
}: ClockDisplayProps): JSX.Element | null {
  const [now, setNow] = useState<Date>(staticMode ? FROZEN_TIME : new Date());

  useEffect(() => {
    if (staticMode) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [staticMode]);

  const t = staticMode ? FROZEN_TIME : now;
  const hh = pad2(t.getHours());
  const mm = pad2(t.getMinutes());
  const ss = pad2(t.getSeconds());
  const palette: ClockColorPalette = {
    ...DEFAULT_CLOCK_COLORS,
    digits: accent === "currentColor" ? DEFAULT_CLOCK_COLORS.digits : accent,
    hands: accent === "currentColor" ? DEFAULT_CLOCK_COLORS.hands : accent,
    ring: accent === "currentColor" ? DEFAULT_CLOCK_COLORS.ring : accent,
    highlight: accent === "currentColor" ? DEFAULT_CLOCK_COLORS.highlight : accent,
    ...colors,
  };
  const clockStyle = {
    color: palette.digits,
    backgroundColor: palette.background,
    "--clk-highlight": palette.highlight,
  } as CSSProperties;
  const classSuffix = `${mini ? " mini" : ""} clock-scale-${scale}`;

  if (variant === "split") {
    return (
      <div className={"clk-split mono" + classSuffix} style={clockStyle}>
        <span>{hh}</span>
        <span className="clk-colon">:</span>
        <span>{mm}</span>
        <span className="clk-colon dim">:</span>
        <span className="dim">{ss}</span>
      </div>
    );
  }

  if (variant === "digital") {
    return (
      <div className={"clk-digital mono" + classSuffix} style={clockStyle}>
        {hh}:{mm}
        <span className="dim">:{ss}</span>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={"clk-minimal mono" + classSuffix} style={clockStyle}>
        {hh}
        <span className="dim">{mm}</span>
      </div>
    );
  }

  if (variant === "analog") {
    const { h: hAng, m: mAng, s: sAng } = computeAnalogAngles(t);
    const sizeByScale: Record<ClockScale, number> = {
      compact: 220,
      normal: 280,
      large: 340,
      larger: 400,
    };
    const size = mini ? 88 : sizeByScale[scale];
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className="clk-analog" aria-hidden="true">
        <circle cx="50" cy="50" r="47" fill={palette.background} fillOpacity={0.72} />
        <circle cx="50" cy="50" r="46" fill="none" stroke={palette.ring} strokeOpacity={0.75} strokeWidth={1.1} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x1 = 50 + Math.sin(a) * 42;
          const y1 = 50 - Math.cos(a) * 42;
          const x2 = 50 + Math.sin(a) * 46;
          const y2 = 50 - Math.cos(a) * 46;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={palette.digits} strokeOpacity={0.55} strokeWidth={1} />
          );
        })}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="22"
          stroke={palette.hands}
          strokeWidth={2.4}
          strokeLinecap="round"
          transform={`rotate(${hAng} 50 50)`}
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="14"
          stroke={palette.hands}
          strokeWidth={1.6}
          strokeLinecap="round"
          transform={`rotate(${mAng} 50 50)`}
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke={palette.highlight}
          strokeWidth={0.8}
          strokeLinecap="round"
          transform={`rotate(${sAng} 50 50)`}
        />
        <circle cx="50" cy="50" r="1.8" fill={palette.highlight} />
      </svg>
    );
  }

  return null;
}
