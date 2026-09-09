import { accountScope } from "@repo/plugin-web-storage";
import { TaskSaveFailure } from "./TaskSaveFailure.js";
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
import { localDateKey } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";
import type { BucketId, TaskTagId, NewTaskDraft, TaskListMeta, TaskTagMeta, TaskPriority } from "./types.js";
import { STR_TASK_COMPOSER } from "./internal/strings.js";
import { DEFAULT_TASK_LISTS, DEFAULT_TASK_TAGS, taskListLabel, taskTagLabel } from "./internal/taskMeta.js";

export interface TaskComposerProps {
  /** Controls visibility: true → showModal(), false → close(). */
  open: boolean;
  /** Active language for STR_TASK_COMPOSER labels + inline error. */
  lang: Lang;
  /** Bucket pre-selected when the dialog opens. */
  defaultBucket: BucketId;
  lists?: ReadonlyArray<TaskListMeta>;
  tags?: ReadonlyArray<TaskTagMeta>;
  defaultListId?: string;
  /** Called after validation passes with the draft + chosen bucket. */
  onSave: (draft: NewTaskDraft, targetBucket: BucketId) => boolean | void;
  /** Called on ESC / backdrop click / Cancel (changes discarded). */
  onClose: () => void;
}

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
  const {
    open,
    lang,
    defaultBucket,
    lists = DEFAULT_TASK_LISTS,
    tags = DEFAULT_TASK_TAGS,
    defaultListId,
    onSave,
    onClose,
  } = props;
  const owner = useRef(accountScope.capture()).current;
  const [saveFailed, setSaveFailed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form state — reset whenever (open, defaultBucket) changes
  const [title, setTitle]       = useState("");
  const [tag, setTag]           = useState<TaskTagId | "none">("none");
  const [bucket, setBucket]     = useState<BucketId>(defaultBucket);
  const [listId, setListId]     = useState(defaultListId ?? lists[0]?.id ?? "inbox");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [dueDate, setDueDate] = useState("");
  const [withDate, setWithDate] = useState(false);
  const [titleErr, setTitleErr] = useState(false);

  useEffect(() => {
    setTitle("");
    setTag("none");
    setBucket(defaultBucket);
    setListId(defaultListId ?? lists[0]?.id ?? "inbox");
    setPriority("normal");
    setWithDate(false);
    setDueDate("");
    setTitleErr(false);
    setSaveFailed(false);
  }, [open, defaultBucket, defaultListId, lists]);

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
        ...(tag !== "none" ? { tags: [tag] } : {}),
        listId,
        priority,
        withDate,
        ...(withDate && bucket !== "nodate" && dueDate ? { dueDate } : {}),
      };
      setSaveFailed(onSave(draft, bucket) === false);
    },
    [title, tag, listId, priority, bucket, withDate, dueDate, onSave],
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
            {[{ id: "none", name: { en: str("tag_none", lang), zh: str("tag_none", lang) }, color: "" }, ...tags].map((option) => {
              const value = option.id as TaskTagId | "none";
              const selected = tag === value;
              const label = value === "none"
                ? str("tag_none", lang)
                : taskTagLabel(option as TaskTagMeta, lang);
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

        <div className="task-composer__field">
          <label htmlFor="task-composer-list" className="task-composer__label">
            {lang === "zh" ? "清单" : "List"}
          </label>
          <select
            id="task-composer-list"
            className="task-composer__input"
            value={listId}
            onChange={(e) => setListId(e.target.value)}
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {taskListLabel(list, lang)}
              </option>
            ))}
          </select>
        </div>

        <div className="task-composer__field">
          <label htmlFor="task-composer-priority" className="task-composer__label">
            {lang === "zh" ? "优先级" : "Priority"}
          </label>
          <select
            id="task-composer-priority"
            className="task-composer__input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">{lang === "zh" ? "低" : "Low"}</option>
            <option value="normal">{lang === "zh" ? "普通" : "Normal"}</option>
            <option value="high">{lang === "zh" ? "高" : "High"}</option>
            <option value="urgent">{lang === "zh" ? "紧急" : "Urgent"}</option>
          </select>
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
              onChange={(e) => { setWithDate(e.target.checked); if (!dueDate) setDueDate(localDateKey(new Date())); }}
            />
            <label htmlFor="task-composer-with-date" className="task-composer__label">
              {str("field_add_date", lang)}
            </label>
          </div>
        )}

        {withDate && bucket !== "nodate" && <label className="task-composer__field">
          <span>{lang === "zh" ? "截止日期" : "Due date"}</span>
          <input type="date" className="task-composer__input" value={dueDate} onChange={e => { setDueDate(e.target.value); if (!e.target.value) setWithDate(false); }} />
        </label>}
        {withDate && <p>{lang === "zh" ? "任务将按截止日期自动分组。" : "Tasks are grouped automatically by their due date."}</p>}
        {saveFailed && <TaskSaveFailure lang={lang} owner={owner} draft={{ title, tag, bucket, listId, priority, withDate, dueDate }} />}
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
