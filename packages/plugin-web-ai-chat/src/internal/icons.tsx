/**
 * Inline SVG icon components for the AI Chat module.
 *
 * Inlined locally — mirrors web design/icons.jsx so we don't widen
 * WebShellIconName for module-internal needs (sibling-pattern precedent:
 * plugin-web-pomodoro/src/internal/icons.tsx).
 *
 * Design: packages/xai-web-ai-chat/docs/design.md "Component graph" — icons.tsx
 */

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
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

/** List / collapse toggle. */
export function IconList({ size = 16, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

/** Plus. */
export function IconPlus({ size = 14, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/** Search magnifier. */
export function IconSearch({ size = 13, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/** Sparkle (AI / star burst). */
export function IconSparkle({ size = 13, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M6 18l4-4" />
    </svg>
  );
}

/** Paperclip / attachment. */
export function IconPaperclip({ size = 11, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <path d="M19 12.5L11.5 20a4 4 0 1 1-5.7-5.7l9.4-9.4a3 3 0 0 1 4.3 4.3l-9 9a2 2 0 1 1-2.8-2.8l7.6-7.6" />
    </svg>
  );
}

/** Close / remove. */
export function IconClose({ size = 10, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/** Chevron down. */
export function IconChevD({ size = 11, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/** Check (model selected). */
export function IconCheck2({ size = 14, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Speaker on. */
export function IconSound({ size = 15, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

/** Speaker off. */
export function IconSoundOff({ size = 15, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

/** Arrow right (send). */
export function IconArrowR({ size = 14, className }: IconProps) {
  return (
    <svg {...iconBase(size, className)}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  );
}
