/**
 * @internal — AddHabitDialog.tsx
 * Minimal modal for habit creation.
 *
 * Mirrors the shipped CountdownEditDialog pattern (native <dialog> element;
 * escape/backdrop closes). Fields: emoji + EN title + ZH title.
 *
 * Design: design.md §9
 * AC: AC-ADD-3..6
 */

import React, { useRef, useEffect, useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";

export interface AddHabitDialogProps {
  open: boolean;
  lang: Lang;
  onClose: () => void;
  onSave: (habit: { emoji: string; title: { en: string; zh: string } }) => void;
}

export function AddHabitDialog({ open, lang, onClose, onSave }: AddHabitDialogProps) {
  const { t } = useI18n(lang);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const explicitCloseRef = useRef(false);

  const [emoji, setEmoji] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleZh, setTitleZh] = useState("");

  // Open / close the native dialog
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
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

  const canSave = titleEn.trim() !== "" && titleZh.trim() !== "";

  function handleSave() {
    if (!canSave) return;
    const finalEmoji = emoji.trim() === "" ? "🌱" : emoji.trim();
    explicitCloseRef.current = true;
    dialogRef.current?.close();
    onSave({ emoji: finalEmoji, title: { en: titleEn.trim(), zh: titleZh.trim() } });
    // Reset form
    setEmoji("");
    setTitleEn("");
    setTitleZh("");
  }

  function handleCancel() {
    explicitCloseRef.current = true;
    dialogRef.current?.close();
    onClose();
  }

  const modalTitle = lang === "zh" ? "新建习惯" : "New Habit";

  return (
    <>
      <div
        className="hb-dialog-scrim"
        aria-hidden="true"
        onClick={handleCancel}
      />
      <dialog ref={dialogRef} className="hb-dialog" aria-modal="true">
        <h2 className="hb-dialog-title">{modalTitle}</h2>

        {/* Emoji input */}
        <div className="hb-form-row">
          <label htmlFor="hb-emoji">
            {lang === "zh" ? "表情符号" : "Emoji"}
          </label>
          <input
            id="hb-emoji"
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🌱"
            maxLength={8}
            autoFocus
          />
        </div>

        {/* Title EN */}
        <div className="hb-form-row">
          <label htmlFor="hb-title-en">
            {lang === "zh" ? "标题 (英文)" : "Title (English)"}
          </label>
          <input
            id="hb-title-en"
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
          />
        </div>

        {/* Title ZH */}
        <div className="hb-form-row">
          <label htmlFor="hb-title-zh">
            {lang === "zh" ? "标题 (中文)" : "Title (Chinese)"}
          </label>
          <input
            id="hb-title-zh"
            type="text"
            value={titleZh}
            onChange={(e) => setTitleZh(e.target.value)}
          />
        </div>

        {/* Actions */}
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
