/**
 * TaskComposer — native <dialog> for creating a new task.
 *
 * Pattern mirrors EventComposer.tsx (xai-web-calendar):
 *   - showModal()/close() driven by `open` prop
 *   - native `cancel` event for ESC
 *   - backdrop click via e.target === dialogRef.current
 *   - setTimeout(0) autofocus on title input
 *   - role="radiogroup" for tag + bucket pickers
 *
 * Props:
 *   open            — controls visibility (true → showModal, false → close)
 *   lang            — active language for STR_TASK_COMPOSER labels + error
 *   defaultBucket   — bucket pre-selected when the dialog opens
 *   onSave          — called with (draft, targetBucket) after validation passes
 *   onClose         — called on ESC / backdrop click / Cancel (changes discarded)
 *
 * a11y:
 *   - aria-modal="true" + aria-labelledby="task-composer-title"
 *   - title input aria-required + aria-describedby when error present
 *   - tag/bucket radiogroups with role="radiogroup"; each option role="radio" + aria-checked
 *
 * Design:  packages/xai-web-tasks/docs/design.md §E.1 #7
 * API:     packages/xai-web-tasks/docs/api.md §E.4
 */

import type { MouseEvent, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { BucketId, TaskTagId, NewTaskDraft } from "./types.js";
import { STR_TASK_COMPOSER } from "./internal/strings.js";

export interface TaskComposerProps {
  /** Controls visibility: true → showModal(), false → close(). */
  open: boolean;
  /** Active language for STR_TASK_COMPOSER labels + inline error. */
  lang: Lang;
  /** Bucket pre-selected when the dialog opens. */
  defaultBucket: BucketId;
  /** Called after validation passes with the draft + chosen bucket. */
  onSave: (draft: NewTaskDraft, targetBucket: BucketId) => void;
  /** Called on ESC / backdrop click / Cancel (changes discarded). */
  onClose: () => void;
}

const TAG_OPTIONS: readonly { value: TaskTagId | "none"; labelKey: string }[] = [
  { value: "none",     labelKey: "tag_none" },
  { value: "study",    labelKey: "tag.study" },
  { value: "work",     labelKey: "tag.work" },
  { value: "personal", labelKey: "tag.personal" },
  { value: "todo",     labelKey: "tag.todo" },
  { value: "other",    labelKey: "tag.other" },
] as const;

const BUCKET_OPTIONS: readonly { value: BucketId; labelKey: keyof typeof STR_TASK_COMPOSER }[] = [
  { value: "overdue", labelKey: "bucket_overdue" },
  { value: "next7",   labelKey: "bucket_next7" },
  { value: "later",   labelKey: "bucket_later" },
  { value: "nodate",  labelKey: "bucket_nodate" },
] as const;

function str(key: keyof typeof STR_TASK_COMPOSER, lang: Lang): string {
  return STR_TASK_COMPOSER[key][lang];
}

export function TaskComposer(props: TaskComposerProps): ReactElement | null {
  const { open, lang, defaultBucket, onSave, onClose } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { s } = useI18n(lang);

  // Form state — reset whenever (open, defaultBucket) changes
  const [title, setTitle]       = useState("");
  const [tag, setTag]           = useState<TaskTagId | "none">("none");
  const [bucket, setBucket]     = useState<BucketId>(defaultBucket);
  const [withDate, setWithDate] = useState(false);
  const [titleErr, setTitleErr] = useState(false);

  useEffect(() => {
    setTitle("");
    setTag("none");
    setBucket(defaultBucket);
    setWithDate(false);
    setTitleErr(false);
  }, [open, defaultBucket]);

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

  const handleSave = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const trimmed = title.trim();
      if (trimmed.length === 0) {
        setTitleErr(true);
        return;
      }
      setTitleErr(false);
      const draft: NewTaskDraft = {
        title: trimmed,
        ...(tag !== "none" ? { tag } : {}),
        withDate,
      };
      onSave(draft, bucket);
    },
    [title, tag, bucket, withDate, onSave],
  );

  const handleCancel = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      className="task-composer"
      aria-modal="true"
      aria-labelledby="task-composer-title"
      onClick={handleBackdropClick}
    >
      <div className="task-composer__content">
        <h2 id="task-composer-title" className="task-composer__title">
          {str("title_create", lang)}
        </h2>

        {/* Title field */}
        <div className="task-composer__field">
          <label htmlFor="task-composer-title-input" className="task-composer__label">
            {str("field_title", lang)}
          </label>
          <input
            id="task-composer-title-input"
            ref={titleInputRef}
            type="text"
            className={"task-composer__input" + (titleErr ? " task-composer__input--error" : "")}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleErr && e.target.value.trim().length > 0) setTitleErr(false);
            }}
            aria-required="true"
            aria-describedby={titleErr ? "task-composer-err-title" : undefined}
          />
          {titleErr && (
            <div id="task-composer-err-title" className="task-composer__error">
              {str("err_title_required", lang)}
            </div>
          )}
        </div>

        {/* Tag picker */}
        <div className="task-composer__field">
          <span className="task-composer__label">{str("field_tag", lang)}</span>
          <div
            className="task-composer__radio-row"
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
                  className={"task-composer__btn" + (selected ? " task-composer__btn--selected" : "")}
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

        {/* Bucket picker */}
        <div className="task-composer__field">
          <span className="task-composer__label">{str("field_bucket", lang)}</span>
          <div
            className="task-composer__radio-row"
            role="radiogroup"
            aria-label={str("field_bucket", lang)}
          >
            {BUCKET_OPTIONS.map(({ value, labelKey }) => {
              const selected = bucket === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={"task-composer__btn" + (selected ? " task-composer__btn--selected" : "")}
                  role="radio"
                  aria-checked={selected}
                  onClick={(e) => { e.stopPropagation(); setBucket(value); }}
                >
                  {str(labelKey, lang)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date opt-in (hidden/no-op when bucket is nodate) */}
        {bucket !== "nodate" && (
          <div className="task-composer__field task-composer__field--inline">
            <input
              id="task-composer-with-date"
              type="checkbox"
              checked={withDate}
              onChange={(e) => setWithDate(e.target.checked)}
            />
            <label htmlFor="task-composer-with-date" className="task-composer__label">
              {str("field_add_date", lang)}
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="task-composer__actions">
          <button
            type="button"
            className="task-composer__btn"
            onClick={handleCancel}
          >
            {str("btn_cancel", lang)}
          </button>
          <button
            type="button"
            className="task-composer__btn task-composer__btn--primary"
            onClick={handleSave}
          >
            {str("btn_save", lang)}
          </button>
        </div>
      </div>
    </dialog>
  );
}
