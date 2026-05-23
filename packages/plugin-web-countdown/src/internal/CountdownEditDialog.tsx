/**
 * @internal — CountdownEditDialog.tsx
 *
 * Native <dialog>-based modal for creating and editing countdown cards.
 * Opened via dialogRef.current.showModal() from CountdownModule.
 *
 * Features:
 * - Create mode: empty form; no Delete button
 * - Edit mode: pre-filled form; Delete button visible
 * - Title (EN + ZH side-by-side)
 * - Target date <input type="date">
 * - Variant radios ("image" / "light")
 * - PresetPicker sub-component (visible only when variant="image")
 * - Validation: empty title (both langs blank) disables Save
 * - Invalid date string disables Save
 * - Escape key closes dialog (native <dialog> behavior)
 * - Backdrop click closes dialog (scrim div)
 *
 * Design: packages/xai-web-countdown/docs/design.md §8
 * API contract: packages/xai-web-countdown/docs/api.md §2.2
 */

import React, { useRef, useEffect, useState } from "react";
import type { CountdownCard, CountdownVariant, ImagePreset } from "../types.js";
import { IMAGE_PRESETS } from "./presets.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface CountdownEditDialogProps {
  /** null = create mode; non-null = edit mode */
  card: CountdownCard | null;
  lang: Lang;
  onSave: (draft: Omit<CountdownCard, "id">) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

// --------------------------------------------------------------------------
// PresetPicker sub-component
// --------------------------------------------------------------------------

interface PresetPickerProps {
  selected: string | null;
  lang: Lang;
  onChange: (presetId: string) => void;
}

function PresetPicker({ selected, lang, onChange }: PresetPickerProps) {
  return (
    <div className="cd-preset-grid">
      {IMAGE_PRESETS.map((preset: ImagePreset) => {
        const isSelected = selected === `preset:${preset.id}`;
        return (
          <button
            key={preset.id}
            type="button"
            className={`cd-preset-swatch${isSelected ? " selected" : ""}`}
            style={{ backgroundImage: preset.gradient }}
            onClick={() => onChange(`preset:${preset.id}`)}
            aria-label={lang === "zh" ? preset.label_zh : preset.label_en}
            aria-pressed={isSelected}
          >
            {lang === "zh" ? preset.label_zh : preset.label_en}
          </button>
        );
      })}
    </div>
  );
}

// --------------------------------------------------------------------------
// Date validation
// --------------------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const parts = s.split("-").map(Number);
  const y = parts[0] ?? 0;
  const mo = parts[1] ?? 0;
  const d = parts[2] ?? 0;
  const dt = new Date(y, mo - 1, d);
  return (
    dt.getFullYear() === y &&
    dt.getMonth() === mo - 1 &&
    dt.getDate() === d
  );
}

// --------------------------------------------------------------------------
// CountdownEditDialog
// --------------------------------------------------------------------------

export function CountdownEditDialog({
  card,
  lang,
  onSave,
  onDelete,
  onCancel,
}: CountdownEditDialogProps) {
  const { t } = useI18n(lang);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEdit = card !== null;

  // Form state
  const [titleEn, setTitleEn] = useState(card?.title.en ?? "");
  const [titleZh, setTitleZh] = useState(card?.title.zh ?? "");
  const [targetDate, setTargetDate] = useState(card?.target_date ?? "");
  const [variant, setVariant] = useState<CountdownVariant>(card?.variant ?? "image");
  const [coverUrl, setCoverUrl] = useState<string | null>(
    card?.cover_url ?? `preset:${IMAGE_PRESETS[0]?.id ?? "dusk"}`,
  );

  // Validation
  const titleEmpty = titleEn.trim() === "" && titleZh.trim() === "";
  const dateValid = isValidDate(targetDate);
  const canSave = !titleEmpty && dateValid;

  // Open dialog on mount
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, []);

  // Track whether close was triggered by our own explicit close() call (Save / Cancel / Delete).
  // If so, the "close" event handler should NOT call onCancel a second time.
  const explicitCloseRef = React.useRef(false);

  // Handle native close event (Escape key triggers this)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => {
      // Only fire onCancel if this is a native close (Escape), not our explicit programmatic close
      if (!explicitCloseRef.current) {
        onCancel();
      }
      explicitCloseRef.current = false;
    };
    el.addEventListener("close", handleClose);
    return () => {
      el.removeEventListener("close", handleClose);
    };
  }, [onCancel]);

  // When switching variant, update cover_url accordingly
  function handleVariantChange(v: CountdownVariant) {
    setVariant(v);
    if (v === "light") {
      setCoverUrl(null);
    } else if (v === "image" && !coverUrl) {
      setCoverUrl(`preset:${IMAGE_PRESETS[0]?.id ?? "dusk"}`);
    }
  }

  function handleSave() {
    if (!canSave) return;
    const draft: Omit<CountdownCard, "id"> = {
      title: { en: titleEn.trim(), zh: titleZh.trim() },
      target_date: targetDate,
      variant,
      cover_url: variant === "light" ? null : coverUrl,
    };
    // Mark as explicit close to suppress redundant onCancel from the "close" event
    explicitCloseRef.current = true;
    dialogRef.current?.close();
    onSave(draft);
  }

  function handleDelete() {
    if (!card) return;
    explicitCloseRef.current = true;
    dialogRef.current?.close();
    onDelete(card.id);
  }

  function handleCancel() {
    explicitCloseRef.current = true;
    dialogRef.current?.close();
    onCancel();
  }

  // Backdrop click
  function handleScrimClick() {
    handleCancel();
  }

  const modalTitle = isEdit
    ? lang === "zh" ? "编辑倒计时" : "Edit Countdown"
    : lang === "zh" ? "新建倒计时" : "New Countdown";

  return (
    <>
      {/* Scrim instead of ::backdrop for cross-vendor parity */}
      <div
        className="cd-dialog-scrim"
        aria-hidden="true"
        onClick={handleScrimClick}
      />
      <dialog ref={dialogRef} className="cd-dialog" aria-modal="true">
        <h2 className="cd-dialog-title">{modalTitle}</h2>

        {/* Title EN + ZH side-by-side */}
        <div className="cd-form-row-inline">
          <div className="cd-form-row">
            <label htmlFor="cd-title-en">
              {lang === "zh" ? "标题（英文）" : "Title (English)"}
            </label>
            <input
              id="cd-title-en"
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              autoFocus
            />
          </div>
          <div className="cd-form-row">
            <label htmlFor="cd-title-zh">
              {lang === "zh" ? "标题（中文）" : "Title (Chinese)"}
            </label>
            <input
              id="cd-title-zh"
              type="text"
              value={titleZh}
              onChange={(e) => setTitleZh(e.target.value)}
            />
          </div>
        </div>
        {titleEmpty && (
          <p className="cd-validation-error">
            {lang === "zh" ? "标题不能为空" : "Title cannot be empty"}
          </p>
        )}

        {/* Target date */}
        <div className="cd-form-row">
          <label htmlFor="cd-target-date">
            {lang === "zh" ? "目标日期" : "Target date"}
          </label>
          <input
            id="cd-target-date"
            type="date"
            value={targetDate}
            onChange={(e) => {
              const v = e.target.value;
              // R-ADV-2: Safari fallback — validate format ourselves
              setTargetDate(v);
            }}
          />
          {targetDate !== "" && !dateValid && (
            <p className="cd-validation-error">
              {lang === "zh" ? "日期格式无效" : "Invalid date format"}
            </p>
          )}
        </div>

        {/* Variant radios */}
        <div className="cd-form-row">
          <label>{lang === "zh" ? "样式" : "Style"}</label>
          <div className="cd-radio-group">
            <label>
              <input
                type="radio"
                name="cd-variant"
                value="image"
                checked={variant === "image"}
                onChange={() => handleVariantChange("image")}
              />
              {lang === "zh" ? "图片" : "Image"}
            </label>
            <label>
              <input
                type="radio"
                name="cd-variant"
                value="light"
                checked={variant === "light"}
                onChange={() => handleVariantChange("light")}
              />
              {lang === "zh" ? "浅色" : "Light"}
            </label>
          </div>
        </div>

        {/* Cover preset picker — only when variant=image */}
        {variant === "image" && (
          <div className="cd-form-row">
            <label>{lang === "zh" ? "封面" : "Cover"}</label>
            <PresetPicker
              selected={coverUrl}
              lang={lang}
              onChange={(id) => setCoverUrl(id)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="cd-dialog-actions">
          {isEdit && (
            <button
              type="button"
              className="cd-btn danger"
              onClick={handleDelete}
            >
              {lang === "zh" ? "删除" : "Delete"}
            </button>
          )}
          <button type="button" className="cd-btn" onClick={handleCancel}>
            {t.common.cancel}
          </button>
          <button
            type="button"
            className="cd-btn primary"
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
