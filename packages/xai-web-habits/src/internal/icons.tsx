/**
 * @internal — icons.tsx
 * Inline SVG icon components for HabitsModule.
 *
 * 10 glyphs: check, bolt, fire, target, plus, dots, arrowL, arrowR, list, grid4.
 * Paths copied from web design/icons.jsx (browser global Icon component).
 *
 * Per review Q5 resolution: inline to avoid upstream shell coordination.
 * A future row can promote these to a shared @repo/ui icon set without
 * changing public APIs.
 *
 * Design: design.md §1.1 frozen assumption 12
 */

import type { CSSProperties, SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  style?: CSSProperties;
}

export function CheckIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BoltIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <path d="M9.5 2L4 9h4.5l-2 5 6-7H8L9.5 2z" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FireIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <path d="M8 14c-2.5 0-4.5-2-4.5-4.5 0-2 1.5-4 2.5-5 0 1.5 1 2.5 2 3 .5-1.5 1.5-2.5 1.5-4 1.5 1.5 2.5 3.5 2.5 6C12 12 10 14 8 14z"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TargetIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function PlusIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DotsIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <circle cx="4" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function ArrowLIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <path d="M10 12l-4-4 4-4" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ListIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <path d="M4 5h8M4 8h8M4 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Grid4Icon({ size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <rect x="3" y="3" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="3" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="3" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
