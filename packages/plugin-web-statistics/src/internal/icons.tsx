/**
 * @internal — inline SVG icons for the Statistics module.
 *
 * These mirror the shell's icon vocabulary but live here to keep this
 * module self-contained. All icons inherit `currentColor` so they can be
 * recolored via CSS variables on the parent.
 */

import * as React from "react";

interface IconProps {
  size?: number;
  className?: string;
  ["aria-hidden"]?: boolean;
}

function makeIcon(path: React.ReactNode) {
  return function Icon({ size = 14, className, ...rest }: IconProps): React.ReactElement {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden={rest["aria-hidden"] ?? true}
      >
        {path}
      </svg>
    );
  };
}

export const IconCheck = makeIcon(<polyline points="20 6 9 17 4 12" />);
export const IconTimer = makeIcon(
  <>
    <circle cx="12" cy="13" r="8" />
    <line x1="12" y1="13" x2="15" y2="10" />
    <line x1="9" y1="2" x2="15" y2="2" />
  </>,
);
export const IconPin = makeIcon(
  <>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14l-1.405-1.405A2 2 0 0 1 17 14.172V12a5 5 0 0 0-10 0v2.172a2 2 0 0 1-.595 1.423L5 17z" />
  </>,
);
export const IconFlame = makeIcon(
  <path d="M12 2c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-5 2 1 3 0 3-4z" />,
);
export const IconFire = IconFlame;
export const IconSparkle = makeIcon(
  <>
    <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
  </>,
);
export const IconChart = makeIcon(
  <>
    <line x1="4" y1="20" x2="4" y2="10" />
    <line x1="10" y1="20" x2="10" y2="4" />
    <line x1="16" y1="20" x2="16" y2="14" />
    <line x1="22" y1="20" x2="22" y2="2" />
  </>,
);
