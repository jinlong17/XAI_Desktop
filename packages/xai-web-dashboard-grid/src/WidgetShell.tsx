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
import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import type { Lang } from "@repo/plugin-web-tokens";

import {
  DEFAULT_WIDGET_APPEARANCE,
  WIDGET_GLASS_TONES,
  widgetAppearanceCssVars,
  type WidgetAppearanceItem,
} from "./internal/useWidgetAppearance.js";
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
  resize_aria: {
    en: "Resize {title}",
    zh: "调整 {title} 大小",
  },
  appearance_aria: {
    en: "Customize {title} background",
    zh: "设置 {title} 背景",
  },
  color_label: {
    en: "Color",
    zh: "颜色",
  },
  opacity_label: {
    en: "Transparency",
    zh: "透明度",
  },
  reset_label: {
    en: "Reset",
    zh: "还原",
  },
  opacity_decrease_aria: {
    en: "Reduce transparency",
    zh: "降低透明度",
  },
  opacity_increase_aria: {
    en: "Increase transparency",
    zh: "提高透明度",
  },
} as const;

function removeAriaLabel(lang: Lang, title: string): string {
  return WIDGET_SHELL_STRINGS.remove_aria[lang].replace("{title}", title);
}

function resizeAriaLabel(lang: Lang, title: string): string {
  return WIDGET_SHELL_STRINGS.resize_aria[lang].replace("{title}", title);
}

function appearanceAriaLabel(lang: Lang, title: string): string {
  return WIDGET_SHELL_STRINGS.appearance_aria[lang].replace("{title}", title);
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
  /** Optional persisted layout hints expressed as CSS variables. */
  layout?: { cols: number; minHeight: number };
  /** Optional resize-start callback. When provided, renders a resize handle. */
  onResizePointerDown?: (id: string, event: PointerEvent<HTMLButtonElement>) => void;
  /** Optional persisted glass appearance for this widget shell. */
  appearance?: WidgetAppearanceItem;
  /** Optional appearance update callback. When provided, renders appearance controls. */
  onAppearanceChange?: (id: string, appearance: WidgetAppearanceItem) => void;
  /** Optional appearance reset callback. */
  onAppearanceReset?: (id: string) => void;
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
  layout,
  onResizePointerDown,
  appearance,
  onAppearanceChange,
  onAppearanceReset,
}: WidgetShellProps) {
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const ariaLabelText = ariaLabel?.[lang];
  // Derive the title for the remove button's aria-label:
  // prefer the same bilingual label used for the shell itself; fall back to id.
  const removeTitle = ariaLabel?.[lang] ?? id;
  const activeAppearance = appearance ?? DEFAULT_WIDGET_APPEARANCE;
  const styleVars: Record<string, string> = {
    ...widgetAppearanceCssVars(activeAppearance),
  };
  if (layout !== undefined) {
    styleVars["--dash-widget-cols"] = String(layout.cols);
    styleVars["--dash-widget-min-height"] = `${layout.minHeight}px`;
  }
  const style = styleVars as CSSProperties;
  const canCustomizeAppearance = onAppearanceChange !== undefined;

  function setTone(tone: WidgetAppearanceItem["tone"]) {
    onAppearanceChange?.(id, { ...activeAppearance, tone });
  }

  function setAlpha(alphaPercent: number) {
    const nextPercent = Math.max(18, Math.min(72, Math.round(alphaPercent)));
    onAppearanceChange?.(id, { ...activeAppearance, alpha: nextPercent / 100 });
  }

  function stepAlpha(delta: number) {
    setAlpha(Math.round(activeAppearance.alpha * 100) + delta);
  }

  return (
    <div
      ref={(el) => setRef(id, el)}
      data-widget-id={id}
      className={`widget-shell ${span}${isDragging ? " dragging" : ""}`}
      style={style}
      aria-label={ariaLabelText}
      onPointerDown={(e) => onPointerDown(id, e)}
    >
      {children}
      {canCustomizeAppearance && (
        <>
          <button
            type="button"
            className="widget-shell__appearance"
            data-no-drag
            aria-label={appearanceAriaLabel(lang, removeTitle)}
            title={appearanceAriaLabel(lang, removeTitle)}
            aria-expanded={appearanceOpen}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              setAppearanceOpen((open) => !open);
            }}
          >
            <span className="widget-shell__appearance-dot" aria-hidden="true" />
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4 10.8a4.7 4.7 0 0 1 0-6.63 4.7 4.7 0 0 1 6.63 0l1.2 1.2a1.9 1.9 0 0 1 0 2.68l-3.78 3.78a1.9 1.9 0 0 1-2.68 0L4 10.8Z"
                stroke="currentColor"
                strokeWidth="1.35"
              />
              <path
                d="M10.7 8.9 13 11.2M3 13h6.4"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {appearanceOpen && (
            <div
              className="widget-shell__appearance-panel"
              data-no-drag
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="widget-shell__appearance-row">
                <span className="widget-shell__appearance-label">
                  {WIDGET_SHELL_STRINGS.color_label[lang]}
                </span>
                <div className="widget-shell__swatches">
                  {WIDGET_GLASS_TONES.map((tone) => (
                    <button
                      key={tone.tone}
                      type="button"
                      className="widget-shell__swatch"
                      style={{ "--widget-swatch-rgb": tone.rgb } as CSSProperties}
                      aria-label={tone.label[lang]}
                      aria-pressed={activeAppearance.tone === tone.tone}
                      title={tone.label[lang]}
                      onClick={() => setTone(tone.tone)}
                    />
                  ))}
                </div>
              </div>
              <div className="widget-shell__appearance-row widget-shell__opacity-row">
                <span className="widget-shell__appearance-label">
                  {WIDGET_SHELL_STRINGS.opacity_label[lang]}
                </span>
                <span className="widget-shell__opacity-control">
                  <button
                    type="button"
                    className="widget-shell__opacity-step"
                    aria-label={WIDGET_SHELL_STRINGS.opacity_decrease_aria[lang]}
                    onClick={() => stepAlpha(-6)}
                  >
                    -
                  </button>
                  <input
                    className="widget-shell__opacity"
                    type="range"
                    min="18"
                    max="72"
                    step="2"
                    value={Math.round(activeAppearance.alpha * 100)}
                    aria-label={WIDGET_SHELL_STRINGS.opacity_label[lang]}
                    onInput={(e) => setAlpha(Number(e.currentTarget.value))}
                    onChange={(e) => setAlpha(Number(e.currentTarget.value))}
                  />
                  <button
                    type="button"
                    className="widget-shell__opacity-step"
                    aria-label={WIDGET_SHELL_STRINGS.opacity_increase_aria[lang]}
                    onClick={() => stepAlpha(6)}
                  >
                    +
                  </button>
                </span>
              </div>
              <button
                type="button"
                className="widget-shell__appearance-reset"
                onClick={() => {
                  onAppearanceReset?.(id);
                }}
              >
                {WIDGET_SHELL_STRINGS.reset_label[lang]}
              </button>
            </div>
          )}
        </>
      )}
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
      {onResizePointerDown !== undefined && (
        <button
          type="button"
          className="widget-shell__resize"
          data-no-drag
          aria-label={resizeAriaLabel(lang, removeTitle)}
          title={resizeAriaLabel(lang, removeTitle)}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResizePointerDown(id, e);
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M5 12h7V5M8 12l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
