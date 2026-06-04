import React, { useEffect, useRef, useState } from "react";
import type {
  CountdownCard,
  CountdownCategory,
  CountdownColorId,
  CountdownDisplayStyle,
  CountdownIconId,
  CountdownLayout,
  CountdownVariant,
  ImagePreset,
} from "../types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { IMAGE_PRESETS } from "./presets.js";
import {
  COUNTDOWN_CATEGORIES,
  COUNTDOWN_COLORS,
  COUNTDOWN_ICONS,
  COUNTDOWN_STYLES,
} from "./options.js";
import { defaultDraft } from "./presetCards.js";
import { IconGlyph } from "./icons.js";
import { isValidDateString } from "./validate.js";
import { isValidTime } from "./countdownMath.js";

export interface CountdownEditDialogProps {
  card: CountdownCard | null;
  lang: Lang;
  onSave: (draft: Omit<CountdownCard, "id">) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

interface PresetPickerProps {
  selected: string | null;
  lang: Lang;
  onChange: (presetId: string) => void;
}

function label(en: string, zh: string, lang: Lang): string {
  return lang === "zh" ? zh : en;
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

export function CountdownEditDialog({
  card,
  lang,
  onSave,
  onDelete,
  onCancel,
}: CountdownEditDialogProps) {
  const { t } = useI18n(lang);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const explicitCloseRef = useRef(false);
  const base = card ?? defaultDraft();
  const isEdit = card !== null;

  const [titleEn, setTitleEn] = useState(base.title.en);
  const [titleZh, setTitleZh] = useState(base.title.zh);
  const [targetDate, setTargetDate] = useState(base.target_date);
  const [targetTime, setTargetTime] = useState(base.target_time ?? "");
  const [startDate, setStartDate] = useState(base.start_date ?? "");
  const [category, setCategory] = useState<CountdownCategory>(base.category ?? "custom");
  const [color, setColor] = useState<CountdownColorId>(base.color ?? "slate");
  const [icon, setIcon] = useState<CountdownIconId>(base.icon ?? "calendar");
  const [note, setNote] = useState(base.note ?? "");
  const [isPinned, setIsPinned] = useState(base.is_pinned ?? false);
  const [isHidden, setIsHidden] = useState(base.is_hidden ?? false);
  const [showCountdown, setShowCountdown] = useState(base.show_countdown ?? true);
  const [showProgress, setShowProgress] = useState(base.show_progress ?? true);
  const [displayStyle, setDisplayStyle] = useState<CountdownDisplayStyle>(base.display_style ?? "digital");
  const [layout, setLayout] = useState<CountdownLayout>(base.layout ?? "stacked");
  const [variant, setVariant] = useState<CountdownVariant>(base.variant ?? "light");
  const [coverUrl, setCoverUrl] = useState<string | null>(
    base.cover_url ?? `preset:${IMAGE_PRESETS[0]?.id ?? "dusk"}`,
  );

  const titleEmpty = titleEn.trim() === "" && titleZh.trim() === "";
  const dateValid = isValidDateString(targetDate);
  const startDateValid = startDate === "" || isValidDateString(startDate);
  const timeValid = targetTime === "" || isValidTime(targetTime);
  const canSave = !titleEmpty && dateValid && startDateValid && timeValid && (showCountdown || showProgress);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => {
      if (!explicitCloseRef.current) onCancel();
      explicitCloseRef.current = false;
    };
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onCancel]);

  function handleVariantChange(next: CountdownVariant) {
    setVariant(next);
    if (next === "light") {
      setCoverUrl(null);
    } else if (!coverUrl) {
      setCoverUrl(`preset:${IMAGE_PRESETS[0]?.id ?? "dusk"}`);
    }
  }

  function closeWith(action: () => void) {
    explicitCloseRef.current = true;
    dialogRef.current?.close();
    action();
  }

  function handleSave() {
    if (!canSave) return;
    const targetChanged = card !== null && (
      targetDate !== card.target_date ||
      (targetTime || null) !== (card.target_time ?? null)
    );
    const stamp = new Date().toISOString();
    const draft: Omit<CountdownCard, "id"> = {
      title: { en: titleEn.trim(), zh: titleZh.trim() },
      target_date: targetDate,
      target_time: targetTime === "" ? null : targetTime,
      start_date: startDate === "" ? null : startDate,
      variant,
      cover_url: variant === "light" ? null : coverUrl,
      category,
      color,
      icon,
      note: note.trim(),
      is_pinned: isPinned,
      is_hidden: isHidden,
      show_countdown: showCountdown,
      show_progress: showProgress,
      display_style: displayStyle,
      layout,
      status: "active",
      source: targetChanged ? "custom" : base.source ?? "custom",
      preset_id: targetChanged ? null : base.preset_id ?? null,
      created_at: base.created_at ?? stamp,
      updated_at: stamp,
      deleted_at: null,
    };
    closeWith(() => onSave(draft));
  }

  const modalTitle = isEdit ? label("Edit Countdown", "编辑倒计时", lang) : label("New Countdown", "新建倒计时", lang);

  return (
    <>
      <div className="cd-dialog-scrim" aria-hidden="true" onClick={() => closeWith(onCancel)} />
      <dialog ref={dialogRef} className="cd-dialog" aria-modal="true">
        <header className="cd-dialog-head">
          <div>
            <p>{label("Countdown settings", "倒计时设置", lang)}</p>
            <h2 className="cd-dialog-title">{modalTitle}</h2>
          </div>
          <button type="button" className="cd-dialog-close" onClick={() => closeWith(onCancel)} aria-label={t.common.cancel}>
            <IconGlyph name="eyeOff" size={14} />
          </button>
        </header>

        <div className="cd-form-grid">
          <div className="cd-form-row">
            <label htmlFor="cd-title-en">{label("Title (English)", "标题（英文）", lang)}</label>
            <input id="cd-title-en" type="text" value={titleEn} onChange={(event) => setTitleEn(event.target.value)} autoFocus />
          </div>
          <div className="cd-form-row">
            <label htmlFor="cd-title-zh">{label("Title (Chinese)", "标题（中文）", lang)}</label>
            <input id="cd-title-zh" type="text" value={titleZh} onChange={(event) => setTitleZh(event.target.value)} />
          </div>
          <div className="cd-form-row">
            <label htmlFor="cd-target-date">{label("Target date", "目标日期", lang)}</label>
            <input id="cd-target-date" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
          </div>
          <div className="cd-form-row">
            <label htmlFor="cd-target-time">{label("Target time", "目标时间", lang)}</label>
            <input id="cd-target-time" type="time" value={targetTime} onChange={(event) => setTargetTime(event.target.value)} />
          </div>
          <div className="cd-form-row">
            <label htmlFor="cd-start-date">{label("Start date", "进度开始日期", lang)}</label>
            <input id="cd-start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
          <div className="cd-form-row">
            <label htmlFor="cd-category">{label("Category", "分类", lang)}</label>
            <select id="cd-category" value={category} onChange={(event) => setCategory(event.target.value as CountdownCategory)}>
              {COUNTDOWN_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{lang === "zh" ? item.label_zh : item.label_en}</option>)}
            </select>
          </div>
        </div>

        {titleEmpty && <p className="cd-validation-error">{label("Title cannot be empty", "标题不能为空", lang)}</p>}
        {targetDate !== "" && !dateValid && <p className="cd-validation-error">{label("Invalid target date", "目标日期无效", lang)}</p>}
        {startDate !== "" && !startDateValid && <p className="cd-validation-error">{label("Invalid start date", "开始日期无效", lang)}</p>}
        {targetTime !== "" && !timeValid && <p className="cd-validation-error">{label("Invalid time", "时间无效", lang)}</p>}

        <div className="cd-form-row">
          <label>{label("Color", "颜色", lang)}</label>
          <div className="cd-color-grid">
            {COUNTDOWN_COLORS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === color ? "selected" : ""}
                style={{ "--cd-swatch": item.accent } as React.CSSProperties}
                onClick={() => setColor(item.id)}
                aria-label={lang === "zh" ? item.label_zh : item.label_en}
                aria-pressed={item.id === color}
              />
            ))}
          </div>
        </div>

        <div className="cd-form-row">
          <label>{label("Icon", "图标", lang)}</label>
          <div className="cd-icon-grid">
            {COUNTDOWN_ICONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === icon ? "selected" : ""}
                onClick={() => setIcon(item.id)}
                aria-label={lang === "zh" ? item.label_zh : item.label_en}
                aria-pressed={item.id === icon}
              >
                <IconGlyph name={item.id} size={16} />
              </button>
            ))}
          </div>
        </div>

        <div className="cd-form-grid">
          <div className="cd-form-row">
            <label htmlFor="cd-style">{label("Display style", "显示样式", lang)}</label>
            <select id="cd-style" value={displayStyle} onChange={(event) => setDisplayStyle(event.target.value as CountdownDisplayStyle)}>
              {COUNTDOWN_STYLES.map((item) => <option key={item.id} value={item.id}>{lang === "zh" ? item.label_zh : item.label_en}</option>)}
            </select>
          </div>
          <div className="cd-form-row">
            <label htmlFor="cd-layout">{label("Layout", "布局方式", lang)}</label>
            <select id="cd-layout" value={layout} onChange={(event) => setLayout(event.target.value as CountdownLayout)}>
              <option value="stacked">{label("Top / bottom", "上下布局", lang)}</option>
              <option value="split">{label("Left / right", "左右布局", lang)}</option>
            </select>
          </div>
        </div>

        <div className="cd-switch-grid">
          <label><input type="checkbox" checked={isPinned} onChange={(event) => setIsPinned(event.target.checked)} />{label("Pinned", "固定到顶部", lang)}</label>
          <label><input type="checkbox" checked={isHidden} onChange={(event) => setIsHidden(event.target.checked)} />{label("Hidden", "隐藏", lang)}</label>
          <label><input type="checkbox" checked={showCountdown} onChange={(event) => setShowCountdown(event.target.checked)} />{label("Show countdown", "显示倒计时", lang)}</label>
          <label><input type="checkbox" checked={showProgress} onChange={(event) => setShowProgress(event.target.checked)} />{label("Show progress", "显示进度条", lang)}</label>
        </div>
        {!showCountdown && !showProgress && <p className="cd-validation-error">{label("Show at least one module.", "至少显示一个模块。", lang)}</p>}

        <div className="cd-form-row">
          <label>{label("Surface", "卡片表面", lang)}</label>
          <div className="cd-radio-group">
            <label><input type="radio" name="cd-variant" value="light" checked={variant === "light"} onChange={() => handleVariantChange("light")} />{label("Light", "浅色", lang)}</label>
            <label><input type="radio" name="cd-variant" value="image" checked={variant === "image"} onChange={() => handleVariantChange("image")} />{label("Image", "图片", lang)}</label>
          </div>
        </div>

        {variant === "image" && (
          <div className="cd-form-row">
            <label>{label("Cover", "封面", lang)}</label>
            <PresetPicker selected={coverUrl} lang={lang} onChange={setCoverUrl} />
          </div>
        )}

        <div className="cd-form-row">
          <label htmlFor="cd-note">{label("Note", "备注", lang)}</label>
          <textarea id="cd-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
        </div>

        <div className="cd-dialog-actions">
          {isEdit && (
            <button type="button" className="cd-btn danger" onClick={() => card && closeWith(() => onDelete(card.id))}>
              <IconGlyph name="trash" size={13} />{label("Delete", "删除", lang)}
            </button>
          )}
          <span className="grow" />
          <button type="button" className="cd-btn" onClick={() => closeWith(onCancel)}>{t.common.cancel}</button>
          <button type="button" className="cd-btn primary" onClick={handleSave} disabled={!canSave}>{t.common.save}</button>
        </div>
      </dialog>
    </>
  );
}
