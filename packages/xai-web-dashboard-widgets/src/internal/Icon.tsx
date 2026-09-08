/**
 * Icon — minimal inline-SVG icon library used by widgets.
 *
 * Ported subset from `web design/index.html` Icon component. Only the icons
 * actually referenced by widgets in this package are implemented. Unknown
 * names fall through to a 1×1 transparent rect (dev warning in console).
 */
import type { CSSProperties } from "react";

export type IconName =
  | "globe"
  | "chevD"
  | "clock"
  | "list"
  | "type"
  | "timer"
  | "pin"
  | "check2"
  | "plus"
  | "close"
  | "grid4"
  | "arrowL"
  | "arrowR"
  | "note"
  | "mail"
  | "calendar"
  | "flame"
  | "sun"
  | "cloud"
  | "rain";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 14, color = "currentColor", style }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style,
    "aria-hidden": true,
    role: "img",
    "data-icon": name,
  };
  switch (name) {
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "chevD":
      return (
        <svg {...props}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "list":
      return (
        <svg {...props}>
          <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      );
    case "type":
      return (
        <svg {...props}>
          <path d="M4 7V5h16v2M12 5v14M9 19h6" />
        </svg>
      );
    case "timer":
      return (
        <svg {...props}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4M9 2h6" />
        </svg>
      );
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
          <circle cx="12" cy="9" r="2.5" fill={color} />
        </svg>
      );
    case "check2":
      return (
        <svg {...props}>
          <path d="M5 12l5 5 9-11" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case "grid4":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="7" height="7" />
          <rect x="13" y="4" width="7" height="7" />
          <rect x="4" y="13" width="7" height="7" />
          <rect x="13" y="13" width="7" height="7" />
        </svg>
      );
    case "arrowL":
      return (
        <svg {...props}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      );
    case "arrowR":
      return (
        <svg {...props}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case "note":
      return (
        <svg {...props}>
          <path d="M5 4h10l4 4v12H5zM15 4v4h4" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
      );
    case "flame":
      return (
        <svg {...props} fill={color} stroke="none">
          <path d="M12 2c1 5 5 6 5 11a5 5 0 1 1-10 0c0-2 1-3 2-4-.5 2 .5 4 2 4 1-3-1-7 1-11z" />
        </svg>
      );
    case "sun":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...props}>
          <path d="M7 18a4 4 0 1 1 1-7.9A5 5 0 0 1 18 11a3.5 3.5 0 0 1 0 7H7z" />
        </svg>
      );
    case "rain":
      return (
        <svg {...props}>
          <path d="M7 14a4 4 0 1 1 1-7.9A5 5 0 0 1 18 8a3.5 3.5 0 0 1 0 7H7zM8 18l-1 3M12 18l-1 3M16 18l-1 3" />
        </svg>
      );
    default:
      // Exhaustiveness guard for IconName — TS will complain if a new name is added without handling.
      ((_: never) => _)(name);
      return <svg {...props} />;
  }
}
