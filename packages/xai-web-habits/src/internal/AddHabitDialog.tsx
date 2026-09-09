import { localDateKey } from "@repo/plugin-web-tokens";
/**
 * @internal — AddHabitDialog.tsx
 * Complete modal for habit creation.
 *
 * Mirrors the shipped CountdownEditDialog pattern (native <dialog> element;
 * escape/backdrop closes). Fields: name, icon, color, category, start date,
 * reminder, and frequency.
 *
 * Design: design.md §9
 * AC: AC-ADD-3..6
 */

import React, { useRef, useEffect, useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type {
  HabitCategory,
  HabitColorName,
  HabitFrequencyName,
  HabitIconName,
} from "../types.js";
import {
  HABIT_CATEGORY_CHOICES,
  HABIT_COLOR_CHOICES,
  HABIT_FREQUENCY_CHOICES,
  HABIT_ICON_CHOICES,
  HabitIcon,
  habitEmojiForIcon,
} from "./habitMeta.js";

export interface HabitDraft {
  emoji: string;
  icon: HabitIconName;
  color: HabitColorName;
  category: HabitCategory;
  startDate: string;
  reminder: { enabled: boolean; time: string };
  frequency: { type: HabitFrequencyName };
  title: { en: string; zh: string };
}

export interface AddHabitDialogProps {
  open: boolean;
  lang: Lang;
  onClose: () => void;
  onSave: (habit: HabitDraft) => void;
}

function todayKey(): string {
  return localDateKey(new Date());
}

export function AddHabitDialog({ open, lang, onClose, onSave }: AddHabitDialogProps) {
  const { t } = useI18n(lang);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const explicitCloseRef = useRef(false);

  const [title, setTitle] = useState("");
  const [titleAlt, setTitleAlt] = useState("");
  const [icon, setIcon] = useState<HabitIconName>("run");
  const [color, setColor] = useState<HabitColorName>("accent");
  const [category, setCategory] = useState<HabitCategory>("health");
  const [startDate, setStartDate] = useState(() => todayKey());
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [frequency, setFrequency] = useState<HabitFrequencyName>("daily");

  // Open / close the native dialog
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  // Handle native "close" event (Escape key)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => {
      if (!explicitCloseRef.current) {
        onClose();
      }
      explicitCloseRef.current = false;
    };
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onClose]);

  const canSave = title.trim() !== "";

  function handleSave() {
    if (!canSave) return;
    const primary = title.trim();
    const secondary = titleAlt.trim() || primary;
    const finalTitle = lang === "zh"
      ? { en: secondary, zh: primary }
      : { en: primary, zh: secondary };
    explicitCloseRef.current = true;
    dialogRef.current?.close();
    onSave({
      emoji: habitEmojiForIcon(icon),
      icon,
      color,
      category,
      startDate,
      reminder: { enabled: reminderEnabled, time: reminderTime },
      frequency: { type: frequency },
      title: finalTitle,
    });
    resetForm();
  }

  function handleCancel() {
    explicitCloseRef.current = true;
    dialogRef.current?.close();
    onClose();
  }

  function resetForm() {
    setTitle("");
    setTitleAlt("");
    setIcon("run");
    setColor("accent");
    setCategory("health");
    setStartDate(todayKey());
    setReminderEnabled(true);
    setReminderTime("08:00");
    setFrequency("daily");
  }

  const modalTitle = lang === "zh" ? "新建习惯" : "New Habit";
  const altLabel = lang === "zh" ? "英文名称（可选）" : "Chinese name (optional)";

  return (
    <>
      <div
        className="hb-dialog-scrim"
        aria-hidden="true"
        onClick={handleCancel}
      />
      <dialog ref={dialogRef} className="hb-dialog" aria-modal="true">
        <h2 className="hb-dialog-title">{modalTitle}</h2>

        <div className="hb-form-row">
          <label htmlFor="hb-title">
            {lang === "zh" ? "习惯名称" : "Habit name"}
          </label>
          <input
            id="hb-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={lang === "zh" ? "晨跑、喝水、阅读..." : "Morning run, hydration, reading..."}
            autoFocus
          />
        </div>

        <div className="hb-form-row">
          <label htmlFor="hb-title-alt">
            {altLabel}
          </label>
          <input
            id="hb-title-alt"
            type="text"
            value={titleAlt}
            onChange={(e) => setTitleAlt(e.target.value)}
          />
        </div>

        <div className="hb-form-row hb-form-row-wide">
          <span className="hb-field-label">{lang === "zh" ? "图标" : "Icon"}</span>
          <div className="hb-icon-grid" role="radiogroup" aria-label={lang === "zh" ? "图标" : "Icon"}>
            {HABIT_ICON_CHOICES.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="hb-icon-choice"
                aria-pressed={icon === choice.id}
                title={choice.label[lang]}
                onClick={() => setIcon(choice.id)}
              >
                <HabitIcon name={choice.id} size={17} />
              </button>
            ))}
          </div>
        </div>

        <div className="hb-form-row hb-form-row-wide">
          <span className="hb-field-label">{lang === "zh" ? "颜色" : "Color"}</span>
          <div className="hb-color-row" role="radiogroup" aria-label={lang === "zh" ? "颜色" : "Color"}>
            {HABIT_COLOR_CHOICES.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="hb-color-choice"
                aria-label={choice.label[lang]}
                aria-pressed={color === choice.id}
                onClick={() => setColor(choice.id)}
                style={{ "--hb-choice-color": choice.cssVar } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        <div className="hb-form-grid">
          <div className="hb-form-row">
            <label htmlFor="hb-category">{lang === "zh" ? "分类" : "Category"}</label>
            <select
              id="hb-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategory)}
            >
              {HABIT_CATEGORY_CHOICES.map((choice) => (
                <option key={choice.id} value={choice.id}>{choice.label[lang]}</option>
              ))}
            </select>
          </div>

          <div className="hb-form-row">
            <label htmlFor="hb-start-date">{lang === "zh" ? "开始日期" : "Start date"}</label>
            <input
              id="hb-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value || todayKey())}
            />
          </div>

          <div className="hb-form-row">
            <label htmlFor="hb-frequency">{lang === "zh" ? "打卡频率" : "Frequency"}</label>
            <select
              id="hb-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as HabitFrequencyName)}
            >
              {HABIT_FREQUENCY_CHOICES.map((choice) => (
                <option key={choice.id} value={choice.id}>{choice.label[lang]}</option>
              ))}
            </select>
          </div>

          <div className="hb-form-row">
            <label htmlFor="hb-reminder-time">{lang === "zh" ? "提醒时间" : "Reminder"}</label>
            <div className="hb-reminder-row">
              <input
                id="hb-reminder-enabled"
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
              />
              <input
                id="hb-reminder-time"
                type="time"
                value={reminderTime}
                disabled={!reminderEnabled}
                onChange={(e) => setReminderTime(e.target.value || "08:00")}
              />
            </div>
          </div>
        </div>

        <div className="hb-dialog-actions">
          <button type="button" className="hb-btn" onClick={handleCancel}>
            {t.common.cancel}
          </button>
          <button
            type="button"
            className="hb-btn primary"
            onClick={handleSave}
            disabled={!canSave}
          >
            {t.common.save}
          </button>
        </div>
      </dialog>
    </>
  );
}
