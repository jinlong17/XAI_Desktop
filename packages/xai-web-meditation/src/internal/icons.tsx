/**
 * @internal — icons.tsx
 *
 * Inline SVG glyphs used by the meditation module. Inlined per Q4 resolution
 * (docs/dev_log.md) — the shell's Icon component is internal and not
 * exported on @repo/xai-web-shell's public surface.
 *
 * Paths are minimal stroked outlines; `currentColor` is the fill/stroke
 * source so callers can style via `color`. All icons render in a 24×24
 * viewBox.
 */

import type { JSX, CSSProperties } from "react";

export type MeditationIconName =
  | "leaf"
  | "clock"
  | "sound"
  | "soundOff"
  | "rain"
  | "timer"
  | "play"
  | "pause"
  | "sliders"
  | "trash"
  | "edit"
  | "save"
  | "plus"
  | "dots"
  | "fullscreen"
  | "fullscreenExit"
  | "close";

export interface IconProps {
  name: MeditationIconName;
  size?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 16, style }: IconProps): JSX.Element {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style,
    "aria-hidden": true,
  };

  switch (name) {
    case "leaf":
      return (
        <svg {...common}>
          <path d="M21 3c-7 0-13 5-13 12 0 3 1 5 3 6 1-7 5-12 10-13" />
          <path d="M5 21c2-6 6-10 12-12" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "sound":
      return (
        <svg {...common}>
          <path d="M3 10v4h4l5 4V6L7 10H3z" />
          <path d="M16 8a5 5 0 0 1 0 8" />
          <path d="M19 5a9 9 0 0 1 0 14" />
        </svg>
      );
    case "soundOff":
      return (
        <svg {...common}>
          <path d="M3 10v4h4l5 4V6L7 10H3z" />
          <path d="M16 9l5 6M21 9l-5 6" />
        </svg>
      );
    case "rain":
      return (
        <svg {...common}>
          <path d="M6 14a4 4 0 0 1 1-7.9A6 6 0 0 1 19 8a3 3 0 0 1 0 6" />
          <path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" />
        </svg>
      );
    case "timer":
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2M9 3h6" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="M6 4l14 8-14 8V4z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <path d="M8 5v14M16 5v14" />
        </svg>
      );
    case "sliders":
      return (
        <svg {...common}>
          <path d="M4 7h4M14 7h6M10 5v4" />
          <path d="M4 17h8M18 17h2M14 15v4" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 14h8l1-14" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
          <path d="M13 6l4 4" />
        </svg>
      );
    case "save":
      return (
        <svg {...common}>
          <path d="M5 4h12l2 2v16H5V4z" />
          <path d="M8 4v7h8V4M8 18h8" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "dots":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "fullscreen":
      return (
        <svg {...common}>
          <path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4" />
          <path d="M9 9 4 4M15 9l5-5M15 15l5 5M9 15l-5 5" />
        </svg>
      );
    case "fullscreenExit":
      return (
        <svg {...common}>
          <path d="M4 9h5V4M20 9h-5V4M15 20v-5h5M9 20v-5H4" />
          <path d="M9 4 4 9M15 4l5 5M20 15l-5 5M4 15l5 5" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
  }
}
