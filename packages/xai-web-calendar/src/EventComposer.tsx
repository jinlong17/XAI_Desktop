/**
 * EventComposer — native <dialog> for creating / editing user calendar events.
 *
 * Pattern: HTML <dialog> + showModal()/close() + cancel-event + backdrop-click,
 * matching `SignOutConfirmDialog.tsx` + `CardDetailDialog.tsx` precedent.
 * No new npm dependencies.
 *
 * Props:
 *   open              — controls visibility (true → showModal, false → close)
 *   mode              — "create" = blank form (defaults); "edit" = pre-filled
 *   event             — required when mode === "edit"; ignored otherwise
 *   lang              — active language for STR_EVENT_COMPOSER + error messages
 *   defaultDateKey?   — default date for new events ("YYYY-MM-DD"); falls back
 *                       to today's local date when absent
 *   onSave            — called after validation passes; receives the built event
 *   onDelete?         — called when user clicks Delete (edit mode only)
 *   onClose           — called when user cancels (ESC / backdrop / Cancel)
 *
 * Behaviour:
 *   - On open with mode==="create": title="" / date=defaultDateKey ?? today /
 *     startTime="09:00" / endTime="10:00" / colorPreset="mint" / recurrence=null.
 *   - On open with mode==="edit": form pre-filled from `event` props.
 *   - Save runs validation; invalid → errors shown inline + composer stays open.
 *   - ESC / backdrop click / Cancel → onClose (changes discarded).
 *   - Delete (edit only) → onDelete(event.id) then onClose.
 *
 * a11y:
 *   - aria-modal="true" + aria-labelledby="event-composer-title"
 *   - Color picker = role="radiogroup" + per-chip aria-checked
 *   - Recurrence picker = role="radiogroup" + per-option aria-checked
 *   - Required field aria-required + aria-describedby for inline error
 *
 * Design: docs/design.md §16.4 + §16.8
 * API:    docs/api.md §11.5 + §11.9
 */

import type { ChangeEvent, MouseEvent, ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { accountScope } from "@repo/plugin-web-storage";
import type {
  EventColorPreset,
  EventReminderPreset,
  RecurrenceKind,
  RecurrenceRule,
  UserCalEvent,
} from "./internal/eventStore/types.js";
import {
  STR_EVENT_COMPOSER,
  s,
} from "./internal/strings.js";
import {
  validateUserCalEvent,
  type ValidationError,
} from "./internal/eventStore/validators.js";
import { createEventId } from "./internal/eventStore/ids.js";

export interface EventComposerProps {
  open: boolean;
  mode: "create" | "edit";
  event: UserCalEvent | null;
  lang: Lang;
  defaultDateKey?: string;
  onSave: (event: UserCalEvent) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  onClose: () => void;
}

const COLOR_OPTIONS: readonly EventColorPreset[] = [
  "mint",
  "amber",
  "blue",
  "violet",
  "rose",
] as const;

const RECUR_OPTIONS: readonly { key: "none" | RecurrenceKind; label: keyof typeof STR_EVENT_COMPOSER }[] = [
  { key: "none", label: "recur_none" },
  { key: "daily", label: "recur_daily" },
  { key: "weekly", label: "recur_weekly" },
] as const;

const REMINDER_OPTIONS: readonly { key: EventReminderPreset; label: keyof typeof STR_EVENT_COMPOSER }[] = [
  { key: "none", label: "reminder_none" },
  { key: "at_start", label: "reminder_at_start" },
  { key: "5m", label: "reminder_5m" },
  { key: "15m", label: "reminder_15m" },
  { key: "30m", label: "reminder_30m" },
  { key: "1h", label: "reminder_1h" },
  { key: "1d", label: "reminder_1d" },
] as const;

/** Today's "YYYY-MM-DD" in local time (no UTC drift for the date field). */
function todayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface FormState {
  title: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  colorPreset: EventColorPreset;
  recurrence: "none" | RecurrenceKind;
  tag: string;
  notes: string;
  allDay: boolean;
  reminder: EventReminderPreset;
}

function makeInitialState(
  mode: "create" | "edit",
  event: UserCalEvent | null,
  defaultDateKey: string | undefined,
): FormState {
  if (mode === "edit" && event) {
    return {
      title: event.title,
      date: event.startISO.slice(0, 10),
      startTime: event.startISO.slice(11, 16),
      endTime: event.endISO.slice(11, 16),
      colorPreset: event.colorPreset,
      recurrence: event.recurrence?.kind ?? "none",
      tag: event.tag ?? "",
      notes: event.notes ?? "",
      allDay: event.allDay === true,
      reminder: event.reminder ?? "none",
    };
  }
  return {
    title: "",
    date: defaultDateKey ?? todayDateKey(),
    startTime: "09:00",
    endTime: "10:00",
    colorPreset: "mint",
    recurrence: "none",
    tag: "",
    notes: "",
    allDay: false,
    reminder: "none",
  };
}

export function EventComposer(props: EventComposerProps): ReactElement | null {
  const { open, mode, event, lang, defaultDateKey, onSave, onDelete, onClose } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() =>
    makeInitialState(mode, event, defaultDateKey),
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [saveFailure, setSaveFailure] = useState<"save" | "delete" | null>(null);
  const [exportFailed, setExportFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const owner = useRef(accountScope.capture());

  // Reset form when (mode, event, defaultDateKey) changes — e.g. operator
  // re-opens the dialog for a different event without unmounting.
  useEffect(() => {
    setForm(makeInitialState(mode, event, defaultDateKey));
    setErrors([]);
    setSaveFailure(null);
    setExportFailed(false);
    owner.current = accountScope.capture();
  }, [mode, event, defaultDateKey]);

  // Open/close imperatively to keep HTML semantics.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
      // Focus the first input on open (jsdom-friendly: rAF via setTimeout 0).
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  // ESC fires the native `cancel` event on <dialog>.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      // Click directly on <dialog> element (not children) = backdrop click.
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSave = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (pending) return;
      const startTime = form.allDay ? "00:00" : form.startTime;
      const endTime = form.allDay ? "23:59" : form.endTime;
      const validationErrors = validateUserCalEvent({
        title: form.title,
        date: form.date,
        startTime,
        endTime,
        colorPreset: form.colorPreset,
        recurrence: form.recurrence === "none" ? null : { kind: form.recurrence },
      });
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      setErrors([]);
      const startISO = `${form.date}T${startTime}`;
      const endISO = `${form.date}T${endTime}`;
      const now = new Date().toISOString();
      const recurrence: RecurrenceRule | null =
        form.recurrence === "none" ? null : { kind: form.recurrence };
      const tag = form.tag.trim();
      const notes = form.notes.trim();

      if (mode === "edit" && event) {
        const patched: UserCalEvent = {
          ...event,
          title: form.title.trim(),
          startISO,
          endISO,
          colorPreset: form.colorPreset,
          recurrence,
          allDay: form.allDay,
          tag: tag || undefined,
          notes: notes || undefined,
          reminder: form.reminder,
          updatedAt: now,
        };
        try { setPending(true); await onSave(patched); setSaveFailure(null); } catch { setSaveFailure("save"); } finally { setPending(false); }
      } else {
        const created: UserCalEvent = {
          id: createEventId(),
          title: form.title.trim(),
          startISO,
          endISO,
          colorPreset: form.colorPreset,
          recurrence,
          allDay: form.allDay,
          tag: tag || undefined,
          notes: notes || undefined,
          reminder: form.reminder,
          createdAt: now,
          updatedAt: now,
        };
        try { setPending(true); await onSave(created); setSaveFailure(null); } catch { setSaveFailure("save"); } finally { setPending(false); }
      }
    },
    [form, mode, event, onSave, pending],
  );

  const handleDelete = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (pending || mode !== "edit" || !event || !onDelete) return;
      try {
        setPending(true);
        await onDelete(event.id);
        setSaveFailure(null);
        onClose();
      } catch { setSaveFailure("delete"); } finally { setPending(false); }
    },
    [mode, event, onDelete, onClose, pending],
  );

  const handleCancel = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  // Field-error lookup
  const errorsByField = useMemo(() => {
    const map = new Map<string, ValidationError>();
    for (const err of errors) {
      if (!map.has(err.field)) map.set(err.field, err);
    }
    return map;
  }, [errors]);

  const title =
    mode === "create"
      ? s(STR_EVENT_COMPOSER, "title_create", lang)
      : s(STR_EVENT_COMPOSER, "title_edit", lang);

  return (
    <dialog
      ref={dialogRef}
      className="event-composer"
      aria-modal="true"
      aria-labelledby="event-composer-title"
      onClick={handleBackdropClick}
    >
      <div className="event-composer__content">
        <h2 id="event-composer-title" className="event-composer__title">
          {title}
        </h2>

        {saveFailure && <div role="alert" className="event-composer__recovery">
          <p>{lang === "zh" ? "更改未保存。草稿仍保留在此页面；请重试，或导出后关闭并重新打开以处理账户或数据冲突。" : "Changes were not saved. Your draft is kept on this page. Retry, or export before reopening to resolve an account or data conflict."}</p>
          <button type="button" className="event-composer__btn" onClick={() => {
            try {
              if (!accountScope.isReady(owner.current)) throw new Error("Account changed");
              const blob = new Blob([JSON.stringify({ version: 1, kind: "calendar-unsaved-draft", operation: saveFailure, eventId: event?.id ?? null, form }, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url; link.download = "calendar-unsaved-draft.json";
              document.body.appendChild(link); link.click(); link.remove();
              setExportFailed(false);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch { setExportFailed(true); }
          }}>{lang === "zh" ? "导出当前草稿" : "Export current draft"}</button>
          {exportFailed && <p>{lang === "zh" ? "导出失败或账户已更改；未下载文件。" : "Export failed or the account changed; no file was downloaded."}</p>}
        </div>}

        {/* Title field */}
        <div className="event-composer__field">
          <label
            htmlFor="event-composer-title-input"
            className="event-composer__field-label"
          >
            {s(STR_EVENT_COMPOSER, "field_title", lang)}
          </label>
          <input
            id="event-composer-title-input"
            ref={titleInputRef}
            type="text"
            className="event-composer__input"
            value={form.title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("title", e.target.value)}
            aria-required="true"
            aria-describedby={errorsByField.has("title") ? "event-composer-err-title" : undefined}
          />
          {errorsByField.has("title") ? (
            <div id="event-composer-err-title" className="event-composer__error">
              {errorsByField.get("title")!.message[lang]}
            </div>
          ) : null}
        </div>

        {/* Date field */}
        <div className="event-composer__field">
          <label
            htmlFor="event-composer-date-input"
            className="event-composer__field-label"
          >
            {s(STR_EVENT_COMPOSER, "field_date", lang)}
          </label>
          <input
            id="event-composer-date-input"
            type="date"
            className="event-composer__input"
            value={form.date}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("date", e.target.value)}
            aria-required="true"
            aria-describedby={errorsByField.has("date") ? "event-composer-err-date" : undefined}
          />
          {errorsByField.has("date") ? (
            <div id="event-composer-err-date" className="event-composer__error">
              {errorsByField.get("date")!.message[lang]}
            </div>
          ) : null}
        </div>

        {/* All-day toggle */}
        <label className="event-composer__check">
          <input
            id="event-composer-all-day-input"
            type="checkbox"
            checked={form.allDay}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const checked = e.target.checked;
              setForm((prev) => ({
                ...prev,
                allDay: checked,
                startTime: checked ? "00:00" : (prev.startTime === "00:00" ? "09:00" : prev.startTime),
                endTime: checked ? "23:59" : (prev.endTime === "23:59" ? "10:00" : prev.endTime),
              }));
            }}
          />
          <span>{s(STR_EVENT_COMPOSER, "field_all_day", lang)}</span>
        </label>

        {/* Start + End row */}
        <div className="event-composer__row">
          <div className="event-composer__field">
            <label
              htmlFor="event-composer-start-input"
              className="event-composer__field-label"
            >
              {s(STR_EVENT_COMPOSER, "field_start", lang)}
            </label>
            <input
              id="event-composer-start-input"
              type="time"
              className="event-composer__input"
              value={form.startTime}
              disabled={form.allDay}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setField("startTime", e.target.value)
              }
              aria-required="true"
              aria-describedby={
                errorsByField.has("startTime") ? "event-composer-err-start" : undefined
              }
            />
            {errorsByField.has("startTime") ? (
              <div id="event-composer-err-start" className="event-composer__error">
                {errorsByField.get("startTime")!.message[lang]}
              </div>
            ) : null}
          </div>
          <div className="event-composer__field">
            <label
              htmlFor="event-composer-end-input"
              className="event-composer__field-label"
            >
              {s(STR_EVENT_COMPOSER, "field_end", lang)}
            </label>
            <input
              id="event-composer-end-input"
              type="time"
              className="event-composer__input"
              value={form.endTime}
              disabled={form.allDay}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setField("endTime", e.target.value)
              }
              aria-required="true"
              aria-describedby={
                errorsByField.has("endTime") ? "event-composer-err-end" : undefined
              }
            />
            {errorsByField.has("endTime") ? (
              <div id="event-composer-err-end" className="event-composer__error">
                {errorsByField.get("endTime")!.message[lang]}
              </div>
            ) : null}
          </div>
        </div>

        {/* Tag + reminder row */}
        <div className="event-composer__row">
          <div className="event-composer__field">
            <label
              htmlFor="event-composer-tag-input"
              className="event-composer__field-label"
            >
              {s(STR_EVENT_COMPOSER, "field_tag", lang)}
            </label>
            <input
              id="event-composer-tag-input"
              type="text"
              className="event-composer__input"
              value={form.tag}
              maxLength={32}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("tag", e.target.value)}
            />
          </div>
          <div className="event-composer__field">
            <label
              htmlFor="event-composer-reminder-input"
              className="event-composer__field-label"
            >
              {s(STR_EVENT_COMPOSER, "field_reminder", lang)}
            </label>
            <select
              id="event-composer-reminder-input"
              className="event-composer__input"
              value={form.reminder}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setField("reminder", e.target.value as EventReminderPreset)
              }
            >
              {REMINDER_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {s(STR_EVENT_COMPOSER, option.label, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Color picker */}
        <div className="event-composer__field">
          <span className="event-composer__field-label">
            {s(STR_EVENT_COMPOSER, "field_color", lang)}
          </span>
          <div
            className="event-composer__color-row"
            role="radiogroup"
            aria-label={s(STR_EVENT_COMPOSER, "field_color", lang)}
          >
            {COLOR_OPTIONS.map((preset) => {
              const selected = form.colorPreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  className={`event-composer__color-chip ev-${preset}`}
                  role="radio"
                  aria-checked={selected}
                  aria-label={preset}
                  data-selected={selected ? "true" : "false"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setField("colorPreset", preset);
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Notes / description */}
        <div className="event-composer__field">
          <label
            htmlFor="event-composer-notes-input"
            className="event-composer__field-label"
          >
            {s(STR_EVENT_COMPOSER, "field_notes", lang)}
          </label>
          <textarea
            id="event-composer-notes-input"
            className="event-composer__input event-composer__textarea"
            value={form.notes}
            rows={3}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setField("notes", e.target.value)}
          />
        </div>

        {/* Recurrence picker */}
        <div className="event-composer__field">
          <span className="event-composer__field-label">
            {s(STR_EVENT_COMPOSER, "field_recurrence", lang)}
          </span>
          <div
            className="event-composer__recurrence-row"
            role="radiogroup"
            aria-label={s(STR_EVENT_COMPOSER, "field_recurrence", lang)}
          >
            {RECUR_OPTIONS.map((opt) => {
              const selected = form.recurrence === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  className="event-composer__btn"
                  role="radio"
                  aria-checked={selected}
                  data-selected={selected ? "true" : "false"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setField("recurrence", opt.key as "none" | RecurrenceKind);
                  }}
                >
                  {s(STR_EVENT_COMPOSER, opt.label, lang)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="event-composer__actions">
          {mode === "edit" && event && onDelete ? (
            <button
              type="button"
              className="event-composer__btn event-composer__btn--danger"
              onClick={handleDelete}
              aria-label={`${s(STR_EVENT_COMPOSER, "btn_delete", lang)}: ${event.title}`}
            >
              {saveFailure === "delete" ? (lang === "zh" ? "重试删除" : "Retry delete") : s(STR_EVENT_COMPOSER, "btn_delete", lang)}
            </button>
          ) : (
            <span />
          )}
          <div className="event-composer__actions--right">
            <button
              type="button"
              className="event-composer__btn"
              onClick={handleCancel}
            >
              {s(STR_EVENT_COMPOSER, "btn_cancel", lang)}
            </button>
            <button
              type="button"
              className="event-composer__btn event-composer__btn--primary"
              onClick={handleSave}
            >
              {saveFailure === "save" ? (lang === "zh" ? "重试保存" : "Retry save") : s(STR_EVENT_COMPOSER, "btn_save", lang)}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
