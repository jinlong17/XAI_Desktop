/**
 * @internal — Inline SVG icons used by Calendar components.
 *
 * Paths copied byte-for-byte from `web design/icons.jsx` (the names referenced
 * by `module-calendar.jsx`: list, plus, arrowL, arrowR, dots, star, chevR).
 * Inline-icon approach matches matrix/habits/pet/countdown sibling pattern.
 */

import type { JSX } from "react";

export type CalIconName = "list" | "plus" | "arrowL" | "arrowR" | "dots" | "star" | "chevR";

interface IconProps {
  name: CalIconName;
  size?: number;
  className?: string;
}

export function CalIcon({ name, size = 16, className }: IconProps): JSX.Element {
  const stroke = "currentColor";
  const sw = 1.6;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  switch (name) {
    case "list":
      return (
        <svg {...common}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "arrowL":
      return (
        <svg {...common}>
          <polyline points="15 6 9 12 15 18" />
        </svg>
      );
    case "arrowR":
      return (
        <svg {...common}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
      );
    case "dots":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1.4" fill={stroke} stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill={stroke} stroke="none" />
          <circle cx="19" cy="12" r="1.4" fill={stroke} stroke="none" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <polygon points="12 3 14.5 9.2 21 9.7 16 14 17.6 20.4 12 16.9 6.4 20.4 8 14 3 9.7 9.5 9.2 12 3" />
        </svg>
      );
    case "chevR":
      return (
        <svg {...common}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
      );
    default: {
      // Exhaustiveness check.
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}
