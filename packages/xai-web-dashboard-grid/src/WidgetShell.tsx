/**
 * WidgetShell — per-widget container.
 *
 * Renders a <div className="widget-shell w-<span>"> wrapping the widget's
 * rendered body. Carries:
 *   - ref tracking via `setRef(id, el)` so the parent grid can include this
 *     element in FLIP measurements + drag bbox lookups.
 *   - pointerdown handler that calls `startDrag(id, e)` UNLESS the target
 *     is a button/input/textarea/[data-no-drag] (drag-exclude per api.md §S4).
 *     The exclude check lives in useGridDrag.startDrag — this component
 *     just forwards the event.
 *   - `.dragging` class while this shell is the active drag source (so CSS
 *     fades it out per styles.css).
 *   - optional aria-label sourced from caller-supplied ariaLabel.lang.
 */
import type { PointerEvent, ReactNode } from "react";

import type { Lang } from "@repo/plugin-web-tokens";

import type { WidgetRegistration, WidgetSpanClass } from "./types.js";

export interface WidgetShellProps {
  /** Widget id (used by parent for ref tracking + drag detection). */
  id: string;
  /** Grid span class — controls CSS grid-column footprint. */
  span: WidgetSpanClass;
  /** Body content (widget render output). */
  children: ReactNode;
  /** Currently-active lang (for aria-label localisation). */
  lang: Lang;
  /** Optional bilingual aria-label from WidgetRegistration. */
  ariaLabel?: WidgetRegistration["ariaLabel"];
  /** True if this shell is the active drag source — applies .dragging class. */
  isDragging: boolean;
  /** Ref setter — parent stores el under `id` for FLIP + drag bbox. */
  setRef: (id: string, el: HTMLDivElement | null) => void;
  /** Pointerdown handler — parent calls startDrag(id, event). */
  onPointerDown: (id: string, event: PointerEvent<HTMLDivElement>) => void;
}

export function WidgetShell({
  id,
  span,
  children,
  lang,
  ariaLabel,
  isDragging,
  setRef,
  onPointerDown,
}: WidgetShellProps) {
  const ariaLabelText = ariaLabel?.[lang];
  return (
    <div
      ref={(el) => setRef(id, el)}
      data-widget-id={id}
      className={`widget-shell ${span}${isDragging ? " dragging" : ""}`}
      aria-label={ariaLabelText}
      onPointerDown={(e) => onPointerDown(id, e)}
    >
      {children}
    </div>
  );
}
