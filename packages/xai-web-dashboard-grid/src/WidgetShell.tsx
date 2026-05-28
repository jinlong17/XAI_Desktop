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
 *   - optional onRemove callback — when provided renders a `.widget-shell__remove`
 *     button (native <button>, auto-excluded from drag by useGridDrag.NO_DRAG_SELECTOR).
 *     Visible on hover / :focus-within via CSS. i18n via local WIDGET_SHELL_STRINGS
 *     (Calendar event-create precedent — NOT plugin-web-tokens).
 */
import type { PointerEvent, ReactNode } from "react";

import type { Lang } from "@repo/plugin-web-tokens";

import type { WidgetRegistration, WidgetSpanClass } from "./types.js";

/**
 * Local bilingual string table for WidgetShell chrome.
 * Mirrors the Calendar event-create pattern: small per-package STR table
 * instead of editing plugin-web-tokens (audit Top-10 #9 boundary constraint).
 */
const WIDGET_SHELL_STRINGS = {
  remove_aria: {
    en: "Remove {title} from dashboard",
    zh: "从工作台移除 {title}",
  },
} as const;

function removeAriaLabel(lang: Lang, title: string): string {
  return WIDGET_SHELL_STRINGS.remove_aria[lang].replace("{title}", title);
}

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
  /**
   * Optional remove callback. When provided, a native <button> with
   * class="widget-shell__remove" is rendered inside the shell. The button is
   * auto-excluded from drag via useGridDrag's NO_DRAG_SELECTOR ("button, …").
   * Omit to render the shell without any remove affordance (backward-compat).
   */
  onRemove?: (id: string) => void;
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
  onRemove,
}: WidgetShellProps) {
  const ariaLabelText = ariaLabel?.[lang];
  // Derive the title for the remove button's aria-label:
  // prefer the same bilingual label used for the shell itself; fall back to id.
  const removeTitle = ariaLabel?.[lang] ?? id;
  return (
    <div
      ref={(el) => setRef(id, el)}
      data-widget-id={id}
      className={`widget-shell ${span}${isDragging ? " dragging" : ""}`}
      aria-label={ariaLabelText}
      onPointerDown={(e) => onPointerDown(id, e)}
    >
      {children}
      {onRemove !== undefined && (
        <button
          type="button"
          className="widget-shell__remove"
          aria-label={removeAriaLabel(lang, removeTitle)}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          {/* 16px inline × glyph — no icon library (no-third-party-dep convention) */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 4L4 12M4 4l8 8"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
