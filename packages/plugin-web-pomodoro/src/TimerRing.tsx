/**
 * TimerRing — SVG circular progress ring with rotating accent dot.
 *
 * Pure visual component — receives `progress` and `running` as props.
 * No timer state lives here. The accent dot's transform is driven by
 * the parent via `accentDotRef` for sub-second updates (avoids 60 Hz
 * React re-renders per design.md §6 / api.md §6.2).
 *
 * Ring geometry:
 *   cx = cy = 160, r = 140 → circumference = 2π * 140 ≈ 879.65 px
 *   strokeDashoffset = circumference * (1 - progress), clamped to [0, circumference]
 *   Dot placed at the arc tip using rotate(progress * 360) around center.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §6 (H-A — rotating accent dot)
 * API contract: packages/xai-web-pomodoro/docs/api.md §2.2
 */

import React, { forwardRef } from "react";

const CX = 160;
const CY = 160;
const R = 140;
const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 879.646 px

export interface TimerRingProps {
  /**
   * Progress from 0.0 (session start / empty) to 1.0 (full / complete).
   * We fill clockwise as time elapses, so progress = elapsedFraction.
   *
   * Interpreted as: progress = 1 − remainingFraction
   * At idle (just started) progress=0; at completion progress=1.
   */
  progress: number;
  /** Whether the timer is actively running (accent dot pulses / rotates). */
  running: boolean;
  /** Visual display style selected by the user. */
  variant?: "digital" | "ring" | "clockwise" | "apple" | "minimal" | "focus";
}

/**
 * TimerRing renders the SVG track + progress arc + accent dot.
 *
 * The `ref` is forwarded to the accent dot `<circle>` element so the
 * parent can perform direct DOM transforms at 60 Hz without React re-renders.
 */
export const TimerRing = forwardRef<SVGCircleElement, TimerRingProps>(
  function TimerRing({ progress, running, variant = "clockwise" }, dotRef) {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const ringProgress = variant === "ring" ? 1 - clampedProgress : clampedProgress;
    const dashOffset = CIRCUMFERENCE * (1 - ringProgress);

    // Dot angle in degrees (0 = top / 12 o'clock, clockwise)
    const dotAngleDeg = ringProgress * 360;
    // Dot position on circle at angle (measured from top, clockwise)
    const dotAngleRad = ((dotAngleDeg - 90) * Math.PI) / 180;
    const dotX = CX + R * Math.cos(dotAngleRad);
    const dotY = CY + R * Math.sin(dotAngleRad);

    return (
      <div
        className="timer-ring"
        data-running={running ? "true" : "false"}
        data-variant={variant}
      >
        <svg
          className="ring-svg"
          viewBox="0 0 320 320"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Grey track (full circle) */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="var(--pomo-ring-track, var(--border-1))"
            strokeWidth={variant === "apple" ? 12 : 8}
          />

          {variant === "apple" && (
            <circle
              cx={CX}
              cy={CY}
              r={R - 24}
              fill="none"
              stroke="var(--pomo-ring-track, var(--border-1))"
              strokeWidth={1}
              strokeDasharray="2 14"
            />
          )}

          {/* Accent progress arc — fills clockwise from top */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={variant === "apple" ? 12 : 8}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 160 160)"
            data-testid="ring-progress-arc"
          />

          {/* Accent dot at the arc tip */}
          <circle
            ref={dotRef}
            cx={dotX}
            cy={dotY}
            r={variant === "minimal" || variant === "digital" ? 0 : 7}
            fill="var(--accent)"
            data-testid="ring-accent-dot"
            style={{ transform: "none" }}
          />
        </svg>
      </div>
    );
  },
);

TimerRing.displayName = "TimerRing";
