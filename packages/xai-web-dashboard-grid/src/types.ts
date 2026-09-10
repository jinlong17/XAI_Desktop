/**
 * Public type contract for @repo/plugin-web-dashboard-grid.
 *
 * Stability promise (api.md §S2): downstream rows (row #11 dashboard-widgets,
 * future widget contributors) consume these names as a stable surface. Any
 * breaking change requires an ADR amendment per ADR-0007 §S4 frozen-assumption 14.
 */
import type { ReactNode } from "react";
import type { Lang } from "@repo/plugin-web-tokens";

/** Optional host capability for protecting current Header recovery work. */
export interface DashboardHeaderDepartureGuard {
  readonly token: object;
  readonly label?: string;
  readonly isBlocking: () => boolean;
  readonly isCurrent: () => boolean;
  readonly exportDraft: () => void;
  readonly discardDraft: () => void;
}

export type DashboardHeaderDepartureGuardRegistration = (
  guard: DashboardHeaderDepartureGuard,
) => () => void;

/**
 * Supported grid span classes — each matches a CSS rule in @repo/plugin-web-tokens
 * (layout.css). Ported from web design/module-dashboard.jsx:9-20.
 */
export type WidgetSpanClass =
  | "w-clock"
  | "w-stat"
  | "w-weather"
  | "w-timetrack"
  | "w-mini-cal"
  | "w-timezones"
  | "w-stickies"
  | "w-mail"
  | "w-upcoming";

/**
 * Runtime context the grid passes to every widget render function.
 * The grid does not inspect what the widget renders; it only forwards this
 * context to allow the widget to derive locale-correct + tick-driven UI.
 */
export interface WidgetRenderContext {
  /** Active language for bilingual rendering. */
  lang: Lang;
  /** Current tick — refreshed every second by DashboardModule. */
  now: Date;
  /**
   * Deep-link to another module via the shell — emits web:shell:module-change.
   * Used by MiniCal widget (row #11) to jump to Calendar on click.
   */
  goTo: (moduleId: string) => void;
}

/**
 * A single widget registration — supplied by the caller (typically row #11's
 * dashboardWidgetRegistrations array). The grid renders widgets in the order
 * derived from sanitize-on-mount + drag-induced reorders.
 *
 * Caller invariants:
 * - `id` values are unique within the array. Duplicates → dev-warn + first wins.
 * - `render` is pure w.r.t. ctx; the grid calls it on every render.
 * - Interactive children inside `render`'s output (custom popovers, segmented
 *   controls, etc.) MUST be marked with `data-no-drag` to prevent
 *   pointerdown from initiating drag. Built-in `<button>` / `<input>` /
 *   `<textarea>` are auto-excluded.
 */
export interface WidgetRegistration {
  /** Stable instance id used as key in xai_dash_order. Caller-controlled. */
  id: string;
  /** Default grid span class. Determines initial CSS grid footprint. */
  span: WidgetSpanClass;
  /** Render function — invoked once per render with the active context. */
  render: (ctx: WidgetRenderContext) => ReactNode;
  /** Optional bilingual aria-label for the widget-shell drag handle. */
  ariaLabel?: { en: string; zh: string };
}

/**
 * Props for the DashboardModule component (and the slot host that mounts it).
 */
export interface DashboardModuleProps {
  /** Active language. */
  lang: Lang;
  /** Widget registrations supplied by the host. */
  widgets: WidgetRegistration[];
  /**
   * Optional deep-link callback. If omitted, no goTo plumbing is provided
   * to widgets. The slot host (registration.tsx) supplies a default that
   * emits web:shell:module-change.
   */
  goTo?: (moduleId: string) => void;
  /** App-owned departure coordinator registration. Optional for standalone use. */
  registerDepartureGuard?: DashboardHeaderDepartureGuardRegistration;
}

/**
 * Internal drag state — kept for tests + helpers; not part of the public surface.
 */
export interface WidgetGridDragState {
  id: string;
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
