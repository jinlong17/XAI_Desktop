/**
 * Inline SVG icon components for the Pomodoro module.
 *
 * Inlined locally to avoid extending WebShellIconName for module-internal needs.
 * Each icon is 12–18px stroke-based, matching the prototype's web design/icons.jsx definitions.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §12 (CSS surface — icon precedent)
 * API contract: packages/xai-web-pomodoro/docs/api.md §2.2 (internal, NOT exported)
 */

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
}

function iconBase(size: number, className?: string) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
  };
}

/** Chevron pointing right: › */
export function IconChevR({ size = 14, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/** Three vertical dots (ellipsis menu) */
export function IconDots({ size = 16, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

/** Speaker on (sound) */
export function IconSound({ size = 16, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

/** Speaker off (muted) */
export function IconSoundOff({ size = 16, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

/** Plus / add */
export function IconPlus({ size = 14, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/** Timer / clock */
export function IconTimer({ size = 16, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
