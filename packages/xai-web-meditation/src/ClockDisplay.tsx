/**
 * <ClockDisplay> — pure live clock renderer.
 *
 * Supports digital, split, analog, minimal, and meditation-atmosphere variants.
 *
 * `static` mode freezes the displayed time at 2024-01-01T03:44:17 and
 * skips the setInterval entirely — used for the clock-picker mini
 * previews so they don't trigger 4 simultaneous ticks (Q5).
 *
 * Live mode runs a single setInterval at 1000ms (Q12). The interval is
 * cleaned up on unmount or when `staticMode` toggles to true.
 *
 * Analog hands use the active clock color palette; the second hand uses the
 * palette highlight color when that style renders one.
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
  /** Remove panel / ring styling when the clock is used as a focus display. */
  frameless?: boolean;
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

function baseClockClass(variant: ClockVariant): "digital" | "split" | "analog" | "minimal" | "breathRing" {
  if (variant === "split" || variant === "splitStack") return "split";
  if (variant.startsWith("analog")) return "analog";
  if (variant === "minimal" || variant === "minimalDots") return "minimal";
  if (variant === "breathRing") return "breathRing";
  return "digital";
}

export function ClockDisplay({
  variant,
  accent = "currentColor",
  scale = "normal",
  colors,
  mini = false,
  frameless = false,
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
    "--clk-ring": palette.ring,
  } as CSSProperties;
  const classSuffix = `${mini ? " mini" : ""}${frameless ? " frameless" : ""} clock-scale-${scale} clock-variant-${variant}`;
  const base = baseClockClass(variant);

  if (base === "split") {
    if (variant === "splitStack") {
      return (
        <div className={"clk-split clk-split-stack mono" + classSuffix} style={clockStyle}>
          <span>{hh}</span>
          <span>{mm}</span>
          <span className="dim">{ss}</span>
        </div>
      );
    }
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

  if (base === "digital") {
    return (
      <div className={"clk-digital mono" + classSuffix} style={clockStyle}>
        {hh}:{mm}
        <span className="dim">:{ss}</span>
      </div>
    );
  }

  if (base === "minimal") {
    if (variant === "minimalDots") {
      return (
        <div className={"clk-minimal clk-minimal-dots mono" + classSuffix} style={clockStyle}>
          <span>{hh}</span>
          <i />
          <span>{mm}</span>
        </div>
      );
    }
    return (
      <div className={"clk-minimal mono" + classSuffix} style={clockStyle}>
        {hh}
        <span className="dim">{mm}</span>
      </div>
    );
  }

  if (base === "breathRing") {
    return (
      <div className={"clk-breath-ring mono" + classSuffix} style={clockStyle}>
        <span className="clk-breath-core">
          {hh}
          <em>{mm}</em>
        </span>
      </div>
    );
  }

  if (base === "analog") {
    const { h: hAng, m: mAng, s: sAng } = computeAnalogAngles(t);
    const sizeByScale: Record<ClockScale, number> = {
      compact: 184,
      normal: 260,
      large: 336,
      larger: 420,
    };
    const size = mini ? 88 : sizeByScale[scale];
    const isFine = variant === "analogFine";
    const isBold = variant === "analogBold";
    const isZen = variant === "analogZen";
    const ringWidth = isBold ? 2 : isFine ? 0.65 : 1.1;
    const hourWidth = isBold ? 3.2 : isFine ? 1.6 : 2.4;
    const minuteWidth = isBold ? 2.4 : isFine ? 1.05 : 1.6;
    const markerCount = isZen ? 4 : 12;
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={"clk-analog" + classSuffix}
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="47" fill={palette.background} fillOpacity={isZen ? 0.46 : 0.72} />
        {isZen && <circle cx="50" cy="50" r="34" fill={palette.highlight} fillOpacity={0.1} />}
        <circle cx="50" cy="50" r="46" fill="none" stroke={palette.ring} strokeOpacity={0.75} strokeWidth={ringWidth} />
        {isBold && (
          <circle cx="50" cy="50" r="40" fill="none" stroke={palette.ring} strokeOpacity={0.24} strokeWidth={1.5} />
        )}
        {Array.from({ length: markerCount }).map((_, i) => {
          const a = ((i * 360 / markerCount) * Math.PI) / 180;
          const x1 = 50 + Math.sin(a) * (isFine ? 43 : 41);
          const y1 = 50 - Math.cos(a) * (isFine ? 43 : 41);
          const x2 = 50 + Math.sin(a) * 46;
          const y2 = 50 - Math.cos(a) * 46;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={palette.digits}
              strokeOpacity={isZen ? 0.28 : 0.55}
              strokeWidth={isBold ? 1.4 : 1}
            />
          );
        })}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2={isZen ? "26" : "22"}
          stroke={palette.hands}
          strokeWidth={hourWidth}
          strokeLinecap="round"
          transform={`rotate(${hAng} 50 50)`}
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2={isFine ? "12" : "14"}
          stroke={palette.hands}
          strokeWidth={minuteWidth}
          strokeLinecap="round"
          transform={`rotate(${mAng} 50 50)`}
        />
        {!isZen && (
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="10"
            stroke={palette.highlight}
            strokeWidth={isFine ? 0.55 : 0.8}
            strokeLinecap="round"
            transform={`rotate(${sAng} 50 50)`}
          />
        )}
        <circle cx="50" cy="50" r={isBold ? "2.4" : "1.8"} fill={palette.highlight} />
      </svg>
    );
  }

  return null;
}
