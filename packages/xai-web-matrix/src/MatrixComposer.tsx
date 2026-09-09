/**
 * MatrixComposer — native <dialog> for creating a new matrix card.
 *
 * Pattern mirrors TaskComposer.tsx (xai-web-tasks):
 *   - showModal()/close() driven by `open` prop
 *   - native `cancel` event for ESC
 *   - backdrop click via e.target === dialogRef.current
 *   - setTimeout(0) autofocus on title input
 *   - role="radiogroup" for tag + quadrant pickers
 *
 * Quadrant radio labels use the existing matrix.* i18n keys (reviewer rec 2 —
 * prefer existing keys over duplicating them in STR_MATRIX_COMPOSER).
 *
 * Props:
 *   open              — controls visibility (true → showModal, false → close)
 *   lang              — active language for STR_MATRIX_COMPOSER labels + error
 *   defaultQuadrant   — quadrant pre-selected when the dialog opens
 *   onSave            — called with (draft, targetQuadrant) after validation passes
 *   onClose           — called on ESC / backdrop click / Cancel (changes discarded)
 *
 * a11y:
 *   - aria-modal="true" + aria-labelledby="matrix-composer-title"
 *   - title input aria-required + aria-describedby when error present
 *   - tag/quadrant radiogroups with role="radiogroup"; each option role="radio" + aria-checked
 *
 * Does NOT emit web:matrix:priority-tagged (create-only; QE-D).
 *
 * Design:  packages/xai-web-matrix/docs/design.md §E.1 #7
 * API:     packages/xai-web-matrix/docs/api.md §E (extension)
 */

import type { MouseEvent, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Quadrant, NewMatrixCardDraft } from "./types.js";
import { STR_MATRIX_COMPOSER } from "./internal/strings.js";

export interface MatrixComposerProps {
  /** Controls visibility: true → showModal(), false → close(). */
  open: boolean;
  /** Active language for STR_MATRIX_COMPOSER labels + inline error. */
  lang: Lang;
  /** Quadrant pre-selected when the dialog opens. */
  defaultQuadrant: Quadrant;
  /** Called after validation passes with the draft + chosen quadrant. */
  onSave: (draft: NewMatrixCardDraft, targetQuadrant: Quadrant) => void;
  /** Called on ESC / backdrop click / Cancel (changes discarded). */
  onClose: () => void;
  saveError?: string | null;
  exportFailed?: boolean;
  onExportDraft?: (draft: NewMatrixCardDraft, target: Quadrant) => void;
  onDiscard?: () => void;
}

type TagOption = "none" | "study" | "work" | "personal" | "todo" | "other";

const TAG_OPTIONS: readonly { value: TagOption; labelKey: string }[] = [
  { value: "none",     labelKey: "tag_none" },
  { value: "study",    labelKey: "tag.study" },
  { value: "work",     labelKey: "tag.work" },
  { value: "personal", labelKey: "tag.personal" },
  { value: "todo",     labelKey: "tag.todo" },
  { value: "other",    labelKey: "tag.other" },
] as const;

// Quadrant options use existing matrix.* i18n keys (reviewer rec: prefer reuse)
const QUADRANT_OPTIONS: readonly { value: Quadrant; titleKey: string }[] = [
  { value: "q1", titleKey: "matrix.urgent_important" },
  { value: "q2", titleKey: "matrix.not_urgent_important" },
  { value: "q3", titleKey: "matrix.urgent_unimportant" },
  { value: "q4", titleKey: "matrix.not_urgent_unimportant" },
] as const;

function str(key: keyof typeof STR_MATRIX_COMPOSER, lang: Lang): string {
  return STR_MATRIX_COMPOSER[key][lang];
}

export function MatrixComposer(props: MatrixComposerProps): ReactElement | null {
  const { open, lang, defaultQuadrant, onSave, onClose, saveError, exportFailed, onExportDraft, onDiscard } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { s } = useI18n(lang);

  // Form state — reset whenever (open, defaultQuadrant) changes
  const [title, setTitle]       = useState("");
  const [tag, setTag]           = useState<TagOption>("none");
  const [quadrant, setQuadrant] = useState<Quadrant>(defaultQuadrant);
  const [titleErr, setTitleErr] = useState(false);

  useEffect(() => {
    setTitle("");
    setTag("none");
    setQuadrant(defaultQuadrant);
    setTitleErr(false);
  }, [open, defaultQuadrant]);

  // Open/close imperatively (HTML semantics)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
      // autofocus title input (jsdom-friendly via setTimeout 0)
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  // ESC fires native `cancel` event on <dialog>
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = (event: Event) => { if (saveError) event.preventDefault(); else onClose(); };
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose, saveError]);

  // Backdrop click: direct click on the <dialog> element (not its children)
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSave = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const trimmed = title.trim();
      if (trimmed.length === 0) {
        setTitleErr(true);
        return;
      }
      setTitleErr(false);
      const draft: NewMatrixCardDraft = {
        title: trimmed,
        ...(tag !== "none" ? { tag } : {}),
      };
      onSave(draft, quadrant);
    },
    [title, tag, quadrant, onSave],
  );

  const handleCancel = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (saveError) onDiscard?.(); else onClose();
    },
    [onClose, saveError, onDiscard],
  );

  return (
    <dialog
      ref={dialogRef}
      className="matrix-composer"
      aria-modal="true"
      aria-labelledby="matrix-composer-title"
      onClick={handleBackdropClick}
    >
      <div className="matrix-composer__content">
        <h2 id="matrix-composer-title" className="matrix-composer__title">
          {str("title_create", lang)}
        </h2>

        {/* Title field */}
        <div className="matrix-composer__field">
          <label htmlFor="matrix-composer-title-input" className="matrix-composer__label">
            {str("field_title", lang)}
          </label>
          <input
            id="matrix-composer-title-input"
            ref={titleInputRef}
            type="text"
            className={"matrix-composer__input" + (titleErr ? " matrix-composer__input--error" : "")}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleErr && e.target.value.trim().length > 0) setTitleErr(false);
            }}
            aria-required="true"
            aria-describedby={titleErr ? "matrix-composer-err-title" : undefined}
          />
          {titleErr && (
            <div id="matrix-composer-err-title" className="matrix-composer__error">
              {str("err_title_required", lang)}
            </div>
          )}
        </div>

        {/* Tag picker */}
        <div className="matrix-composer__field">
          <span className="matrix-composer__label">{str("field_tag", lang)}</span>
          <div
            className="matrix-composer__radio-row"
            role="radiogroup"
            aria-label={str("field_tag", lang)}
          >
            {TAG_OPTIONS.map(({ value, labelKey }) => {
              const selected = tag === value;
              const label = value === "none"
                ? str("tag_none", lang)
                : s(labelKey as `tag.${string}`);
              return (
                <button
                  key={value}
                  type="button"
                  className={"matrix-composer__btn" + (selected ? " matrix-composer__btn--selected" : "")}
                  role="radio"
                  aria-checked={selected}
                  onClick={(e) => { e.stopPropagation(); setTag(value); }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quadrant picker — uses existing matrix.* i18n keys (reviewer rec 2) */}
        <div className="matrix-composer__field">
          <span className="matrix-composer__label">{str("field_quadrant", lang)}</span>
          <div
            className="matrix-composer__radio-row"
            role="radiogroup"
            aria-label={str("field_quadrant", lang)}
          >
            {QUADRANT_OPTIONS.map(({ value, titleKey }) => {
              const selected = quadrant === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={"matrix-composer__btn" + (selected ? " matrix-composer__btn--selected" : "")}
                  role="radio"
                  aria-checked={selected}
                  onClick={(e) => { e.stopPropagation(); setQuadrant(value); }}
                >
                  {s(titleKey as Parameters<typeof s>[0])}
                </button>
              );
            })}
          </div>
        </div>

        {saveError && <div className="matrix-save-recovery" role="alert">
          <p>{saveError}</p>
          <button type="button" onClick={() => onExportDraft?.({ title, ...(tag !== 'none' ? { tag } : {}) }, quadrant)}>{lang === 'zh' ? '导出草稿' : 'Export draft'}</button>
          <p>{lang === 'zh' ? '导出仅供手动恢复，当前不支持导入。' : 'Export is for manual recovery; import is not supported.'}</p>
          {exportFailed && <p>{lang === 'zh' ? '导出失败，请检查账户和存储权限。' : 'Export failed. Check account and storage access.'}</p>}
        </div>}
        {/* Actions */}
        <div className="matrix-composer__actions">
          <button
            type="button"
            className="matrix-composer__btn"
            onClick={handleCancel}
          >
            {saveError ? (lang === "zh" ? "放弃草稿" : "Discard draft") : str("btn_cancel", lang)}
          </button>
          <button
            type="button"
            className="matrix-composer__btn matrix-composer__btn--primary"
            onClick={handleSave}
          >
            {saveError ? (lang === "zh" ? "重试保存" : "Retry save") : str("btn_save", lang)}
          </button>
        </div>
      </div>
    </dialog>
  );
}
