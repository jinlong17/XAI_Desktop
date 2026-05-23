/**
 * @internal — icons.tsx
 * Inline SVG components for the 3 glyphs used by MatrixModule.
 * These are private to xai-web-matrix; not exported via index.ts.
 *
 * Per review Q2 resolution: inline to avoid upstream shell coordination.
 * If a later row promotes a shared icon set to @repo/xai-web-shell,
 * these can be swapped out without changing public APIs.
 */

import type { CSSProperties, SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  style?: CSSProperties;
}

/** Plus (+) icon for the add-card stub buttons. */
export function PlusIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Dots (···) icon for the more-actions stub buttons. */
export function DotsIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <circle cx="4"  cy="8" r="1.25" fill="currentColor" />
      <circle cx="8"  cy="8" r="1.25" fill="currentColor" />
      <circle cx="12" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

/** Chevron-down (v) icon for the collapsible group header. */
export function ChevDIcon({ size = 13, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d="M3 5l3.5 3.5L10 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
