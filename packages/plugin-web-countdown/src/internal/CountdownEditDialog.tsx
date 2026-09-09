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
  onSave: (draft: Omit<CountdownCard, "id">) => boolean | void;
  onDelete: (id: string) => boolean | void;
  saveError?: string | null;
  exportFailed?: boolean;
  onExport?: (draft: Omit<CountdownCard, "id">) => void;
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
  saveError,
  exportFailed,
  onExport,
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
  const [attemptedSave, setAttemptedSave] = useState(false);

  const titleEmpty = titleEn.trim() === "" && titleZh.trim() === "";
  const dateMissing = targetDate.trim() === "";
  const timeMissing = targetTime.trim() === "";
  const dateValid = isValidDateString(targetDate);
  const startDateValid = startDate === "" || isValidDateString(startDate);
  const timeValid = isValidTime(targetTime);
  const validationMessages = [
    ...(titleEmpty ? [label("Add a title in at least one language.", "请至少填写一个标题。", lang)] : []),
    ...(dateMissing ? [label("Choose a target date.", "请选择目标日期。", lang)] : []),
    ...(!dateMissing && !dateValid ? [label("Use a valid target date.", "请输入有效的目标日期。", lang)] : []),
    ...(timeMissing ? [label("Choose a target time.", "请选择目标时间。", lang)] : []),
    ...(!timeMissing && !timeValid ? [label("Use a valid target time.", "请输入有效的目标时间。", lang)] : []),
    ...(startDate !== "" && !startDateValid ? [label("Use a valid progress start date.", "请输入有效的进度开始日期。", lang)] : []),
    ...(!showCountdown && !showProgress ? [label("Show countdown, progress, or both.", "请至少显示倒计时或进度条。", lang)] : []),
  ];
  const canSave = validationMessages.length === 0;

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

  function buildDraft(): Omit<CountdownCard, "id"> {
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
    return draft;
  }
  function handleSave() {
    setAttemptedSave(true);
    if (!canSave) return;
    if (onSave(buildDraft()) !== false) closeWith(() => {});
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

        {saveError && <div role="alert" className="cd-save-recovery">
          <p>{label('Changes were not saved. Your draft is still here.', '更改未保存，草稿仍保留。', lang)} {saveError}</p>
          <button type="button" className="cd-btn" onClick={() => onExport?.(buildDraft())}>{label('Export draft', '导出草稿', lang)}</button>
          {exportFailed && <p>{label('Export failed or the account changed.', '导出失败或账户已更改。', lang)}</p>}
        </div>}
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

        {attemptedSave && validationMessages.length > 0 && (
          <div className="cd-validation-panel" role="alert">
            <strong>{label("Check the required fields", "请检查必填信息", lang)}</strong>
            <ul>
              {validationMessages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          </div>
        )}

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
            <button type="button" className="cd-btn danger" onClick={() => { if (card && onDelete(card.id) !== false) closeWith(() => {}); }}>
              <IconGlyph name="trash" size={13} />{label("Delete", "删除", lang)}
            </button>
          )}
          <span className="grow" />
          <button type="button" className="cd-btn" onClick={() => closeWith(onCancel)}>{t.common.cancel}</button>
          <button type="button" className="cd-btn primary" onClick={handleSave} aria-disabled={!canSave}>{saveError ? label("Retry save", "重试保存", lang) : t.common.save}</button>
        </div>
      </dialog>
    </>
  );
}
