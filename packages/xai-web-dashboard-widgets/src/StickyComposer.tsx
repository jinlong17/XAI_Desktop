/**
 * StickyComposer — native <dialog> for creating a new sticky note.
 *
 * Pattern mirrors TaskComposer.tsx (xai-web-tasks) and MatrixComposer.tsx:
 *   - showModal()/close() driven by `open` prop
 *   - native `cancel` event for ESC
 *   - backdrop click via e.target === dialogRef.current
 *   - setTimeout(0) autofocus on textarea
 *   - role="radiogroup" for color preset picker
 *
 * Props:
 *   open     — controls visibility (true → showModal, false → close)
 *   lang     — active language for STR_STICKY_COMPOSER labels
 *   onSave   — called with (draft) after validation passes (non-empty text)
 *   onClose  — called on ESC / backdrop click / Cancel (changes discarded)
 *
 * a11y:
 *   - aria-modal="true" + aria-labelledby="sticky-composer-title"
 *   - textarea aria-required + aria-describedby when error present
 *   - color picker: role="radiogroup" + per-chip role="radio" + aria-checked
 *
 * Design:  packages/xai-web-dashboard-widgets/docs/design.md §E
 * API:     packages/xai-web-dashboard-widgets/docs/api.md §E
 */

import type { MouseEvent, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { StickyColor, NewStickyDraft } from "./internal/stickiesStore/types.js";
import { STICKY_COLORS } from "./internal/stickiesStore/types.js";
import { str } from "./internal/strings.js";

export interface StickyComposerProps {
  /** Controls visibility: true → showModal(), false → close(). */
  open: boolean;
  /** Active language for STR_STICKY_COMPOSER labels. */
  lang: Lang;
  /** Called after validation passes with the draft. */
  onSave: (draft: NewStickyDraft) => void;
  /** Called on ESC / backdrop click / Cancel (changes discarded). */
  onClose: () => void;
}

const COLOR_OPTIONS: readonly StickyColor[] = ["sun", "mint", "peach", "sky", "lilac"] as const;

const COLOR_LABEL_KEYS: Readonly<Record<StickyColor, keyof typeof import("./internal/strings.js").STR_STICKY_COMPOSER>> = {
  sun:   "color_sun",
  mint:  "color_mint",
  peach: "color_peach",
  sky:   "color_sky",
  lilac: "color_lilac",
} as const;

export function StickyComposer(props: StickyComposerProps): ReactElement | null {
  const { open, lang, onSave, onClose } = props;
  const dialogRef   = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form state — reset whenever open changes
  const [text, setTextState] = useState("");
  const [color, setColor]    = useState<StickyColor>("sun");
  const [textErr, setTextErr] = useState(false);

  useEffect(() => {
    setTextState("");
    setColor("sun");
    setTextErr(false);
  }, [open]);

  // Open/close imperatively (HTML semantics)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
      // autofocus textarea (jsdom-friendly via setTimeout 0)
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  // ESC fires native `cancel` event on <dialog>
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose]);

  // Backdrop click: direct click on the <dialog> element (not its children)
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSave = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      setTextErr(true);
      return;
    }
    onSave({ text: trimmed, color });
  }, [text, color, onSave]);

  return (
    <dialog
      ref={dialogRef}
      className="sticky-composer"
      aria-modal="true"
      aria-labelledby="sticky-composer-title"
      onClick={handleBackdropClick}
    >
      <div className="sticky-composer-panel">
        <h2 id="sticky-composer-title" className="sticky-composer-title">
          {str("title", lang)}
        </h2>

        {/* Note textarea */}
        <div className="sticky-composer-field">
          <label htmlFor="sticky-composer-text" className="sticky-composer-label">
            {str("field_note", lang)}
          </label>
          <textarea
            ref={textareaRef}
            id="sticky-composer-text"
            className="sticky-composer-textarea"
            value={text}
            onChange={(e) => {
              setTextState(e.target.value);
              if (e.target.value.trim()) setTextErr(false);
            }}
            rows={4}
            aria-required="true"
            aria-describedby={textErr ? "sticky-composer-err" : undefined}
          />
          {textErr && (
            <span id="sticky-composer-err" className="sticky-composer-error" role="alert">
              {lang === "zh" ? "内容不能为空" : "Note cannot be empty"}
            </span>
          )}
        </div>

        {/* Color preset radiogroup */}
        <div className="sticky-composer-field">
          <span className="sticky-composer-label">{str("field_color", lang)}</span>
          <div role="radiogroup" aria-label={str("field_color", lang)} className="sticky-composer-colors">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={str(COLOR_LABEL_KEYS[c], lang)}
                className={`sticky-composer-chip${color === c ? " selected" : ""}`}
                style={{ background: STICKY_COLORS[c] }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="sticky-composer-actions">
          <button
            type="button"
            className="sticky-composer-btn sticky-composer-btn--cancel"
            onClick={onClose}
          >
            {str("btn_cancel", lang)}
          </button>
          <button
            type="button"
            className="sticky-composer-btn sticky-composer-btn--save"
            onClick={handleSave}
          >
            {str("btn_save", lang)}
          </button>
        </div>
      </div>
    </dialog>
  );
}
