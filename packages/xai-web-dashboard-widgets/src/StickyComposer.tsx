/**
 * StickyComposer — native <dialog> for creating a new sticky note.
 *
 * Supports two entry paths:
 *   - freeform text input
 *   - picking an existing task card, which copies title/list/tag/date metadata
 *
 * Pattern mirrors TaskComposer.tsx (xai-web-tasks) and MatrixComposer.tsx:
 *   - showModal()/close() driven by `open` prop
 *   - native `cancel` event for ESC
 *   - backdrop click via e.target === dialogRef.current
 *   - setTimeout(0) autofocus on textarea
 *   - role="radiogroup" for color preset picker
 *
 * Design:  packages/xai-web-dashboard-widgets/docs/design.md §E
 * API:     packages/xai-web-dashboard-widgets/docs/api.md §E
 */

import type { MouseEvent, ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";

import type {
  NewStickyDraft,
  StickyColor,
  StickySourceMeta,
  UserSticky,
} from "./internal/stickiesStore/types.js";
import { STICKY_COLORS } from "./internal/stickiesStore/types.js";
import type { StickyComposerStrKey } from "./internal/strings.js";
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
  /** Existing sticky to edit. Null/undefined creates a new sticky. */
  initial?: UserSticky | null;
}

const COLOR_OPTIONS: readonly StickyColor[] = [
  "sun",
  "mint",
  "peach",
  "sky",
  "lilac",
  "rose",
  "coral",
  "lime",
  "teal",
  "slate",
] as const;

const COLOR_LABEL_KEYS: Readonly<Record<StickyColor, StickyComposerStrKey>> = {
  sun: "color_sun",
  mint: "color_mint",
  peach: "color_peach",
  sky: "color_sky",
  lilac: "color_lilac",
  rose: "color_rose",
  coral: "color_coral",
  lime: "color_lime",
  teal: "color_teal",
  slate: "color_slate",
} as const;

type TaskSourceFilter = "all" | "inbox" | "attention" | "completed";

interface ExistingTaskSource {
  id: string;
  bucketId: string;
  title: string;
  listLabel: string;
  tagLabel?: string;
  dateLabel?: string;
  completed: boolean;
  inbox: boolean;
  color: StickyColor;
}

const SOURCE_FILTERS: readonly TaskSourceFilter[] = ["all", "inbox", "attention", "completed"] as const;

const FILTER_LABEL_KEYS: Readonly<Record<TaskSourceFilter, StickyComposerStrKey>> = {
  all: "source_all",
  inbox: "source_inbox",
  attention: "source_attention",
  completed: "source_completed",
};

const BUCKET_LABELS: Readonly<Record<string, Record<Lang, string>>> = {
  overdue: { en: "Overdue", zh: "过期" },
  next7: { en: "Next 7 Days", zh: "最近 7 天" },
  later: { en: "Later", zh: "以后" },
  nodate: { en: "No date", zh: "无日期" },
};

const TAG_LABELS: Readonly<Record<string, Record<Lang, string>>> = {
  study: { en: "Study", zh: "学习" },
  work: { en: "Work", zh: "工作" },
  personal: { en: "Personal", zh: "个人" },
  todo: { en: "Todo", zh: "待办" },
  other: { en: "Other", zh: "其他" },
};

const TAG_COLORS: Readonly<Record<string, StickyColor>> = {
  study: "sky",
  work: "mint",
  personal: "lilac",
  todo: "sun",
  other: "slate",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickBundle(value: unknown, lang: Lang): string | undefined {
  if (!isRecord(value)) return undefined;
  const localized = value[lang];
  if (typeof localized === "string" && localized.trim()) return localized.trim();
  const fallback = value.en;
  if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
  return undefined;
}

function getBucketLabel(col: Record<string, unknown>, lang: Lang): string {
  const id = typeof col.id === "string" ? col.id : "";
  return BUCKET_LABELS[id]?.[lang] ?? (id || (lang === "zh" ? "任务" : "Tasks"));
}

function isNoDateLabel(value: string | undefined): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return [
    "nodate",
    "no date",
    "no due date",
    "none",
    "n/a",
    "--",
    "无日期",
    "未设置日期",
    "暂无日期",
  ].includes(normalized);
}

function getTagLabel(tag: unknown, lang: Lang): string | undefined {
  if (typeof tag !== "string" || !tag.trim()) return undefined;
  return TAG_LABELS[tag]?.[lang] ?? tag;
}

function getDateLabel(card: Record<string, unknown>, lang: Lang): string | undefined {
  const dateLabel = pickBundle(card.dateLabel, lang);
  if (dateLabel && !isNoDateLabel(dateLabel)) return dateLabel;
  if (lang === "zh" && typeof card.dateZh === "string" && card.dateZh.trim()) {
    const dateZh = card.dateZh.trim();
    return isNoDateLabel(dateZh) ? undefined : dateZh;
  }
  if (typeof card.date === "string" && card.date.trim()) {
    const date = card.date.trim();
    return isNoDateLabel(date) ? undefined : date;
  }
  return undefined;
}

function normalizeTaskCols(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw.filter(isRecord);
  if (isRecord(raw)) return Object.values(raw).filter(isRecord);
  return [];
}

function collectExistingTasks(raw: unknown, lang: Lang): ExistingTaskSource[] {
  const sources: ExistingTaskSource[] = [];
  for (const col of normalizeTaskCols(raw)) {
    const bucketId = typeof col.id === "string" ? col.id : "";
    const listLabel = bucketId === "nodate" ? "" : getBucketLabel(col, lang);
    const taskBuckets: Array<{ cards: unknown; completed: boolean }> = [
      { cards: col.tasks, completed: false },
      { cards: col.completed, completed: true },
    ];
    for (const bucket of taskBuckets) {
      if (!Array.isArray(bucket.cards)) continue;
      for (const cardRaw of bucket.cards) {
        if (!isRecord(cardRaw)) continue;
        const cardId = typeof cardRaw.id === "string" ? cardRaw.id : "";
        const title = pickBundle(cardRaw.title, lang);
        if (!cardId || !title) continue;
        const tag = typeof cardRaw.tag === "string" ? cardRaw.tag : "";
        const tagLabel = getTagLabel(tag, lang);
        const dateLabel = getDateLabel(cardRaw, lang);
        const completed = bucket.completed || cardRaw.done === true;
        sources.push({
          id: `${bucketId}:${cardId}`,
          bucketId,
          title,
          listLabel,
          ...(tagLabel ? { tagLabel } : {}),
          ...(dateLabel ? { dateLabel } : {}),
          completed,
          inbox: cardRaw.inbox === true,
          color: completed ? "mint" : TAG_COLORS[tag] ?? (bucketId === "overdue" ? "peach" : "sun"),
        });
      }
    }
  }
  return sources;
}

function filterSource(source: ExistingTaskSource, filter: TaskSourceFilter): boolean {
  if (filter === "all") return true;
  if (filter === "inbox") return source.inbox;
  if (filter === "attention") return source.bucketId === "overdue";
  return source.completed;
}

function sourceToMeta(source: ExistingTaskSource): StickySourceMeta {
  return {
    type: "task",
    id: source.id,
    title: source.title,
    ...(source.listLabel ? { listLabel: source.listLabel } : {}),
    ...(source.tagLabel ? { tagLabel: source.tagLabel } : {}),
    ...(source.dateLabel ? { dateLabel: source.dateLabel } : {}),
    ...(source.completed ? { completed: true } : {}),
  };
}

function sourceToText(source: ExistingTaskSource, lang: Lang): string {
  const meta = [
    source.listLabel ? `${str("meta_list", lang)}: ${source.listLabel}` : "",
    source.tagLabel ? `${str("meta_tag", lang)}: ${source.tagLabel}` : "",
    source.dateLabel ? `${str("meta_time", lang)}: ${source.dateLabel}` : "",
    source.completed ? str("meta_done", lang) : "",
  ].filter(Boolean);
  return meta.length > 0 ? `${source.title}\n${meta.join(" · ")}` : source.title;
}

export function StickyComposer(props: StickyComposerProps): ReactElement | null {
  const { open, lang, onSave, onClose, initial = null } = props;
  const [taskColsRaw] = usePref("xai_task_cols");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form state — reset whenever open changes.
  const [text, setTextState] = useState("");
  const [color, setColor] = useState<StickyColor>("sun");
  const [textErr, setTextErr] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<TaskSourceFilter>("all");
  const [selectedSource, setSelectedSource] = useState<StickySourceMeta | null>(null);

  const taskSources = useMemo(() => collectExistingTasks(taskColsRaw, lang), [taskColsRaw, lang]);
  const filteredTaskSources = useMemo(
    () => taskSources.filter((source) => filterSource(source, sourceFilter)),
    [sourceFilter, taskSources],
  );

  useEffect(() => {
    setTextState(initial?.text ?? "");
    setColor(initial?.color ?? "sun");
    setTextErr(false);
    setSourceFilter("all");
    setSelectedSource(initial?.source ?? null);
  }, [open, initial]);

  // Open/close imperatively (HTML semantics).
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open && typeof el.showModal === "function") {
        try {
          el.showModal();
        } catch {
          // Already-open or interrupted dialog state; React state remains source of truth.
        }
      } else if (!el.open) {
        el.setAttribute("open", "");
      }
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    } else {
      if (el.open && typeof el.close === "function") el.close();
      else if (el.open) el.removeAttribute("open");
    }
  }, [open]);

  // ESC fires native `cancel` event on <dialog>.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose]);

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
    onSave({ text: trimmed, color, ...(selectedSource ? { source: selectedSource } : {}) });
  }, [text, color, selectedSource, onSave]);

  const handlePickSource = useCallback(
    (source: ExistingTaskSource) => {
      setTextState(sourceToText(source, lang));
      setSelectedSource(sourceToMeta(source));
      setColor(source.color);
      setTextErr(false);
    },
    [lang],
  );

  return (
    <dialog
      ref={dialogRef}
      className="sticky-composer"
      data-no-drag
      aria-modal="true"
      aria-labelledby="sticky-composer-title"
      onClick={handleBackdropClick}
    >
      <div className="sticky-composer-panel">
        <div className="sticky-composer-head">
          <h2 id="sticky-composer-title" className="sticky-composer-title">
            {str(initial ? "title_edit" : "title", lang)}
          </h2>
          {selectedSource && (
            <span className="sticky-composer-source-badge">{str("source_selected", lang)}</span>
          )}
        </div>

        <div className="sticky-composer-layout">
          <div className="sticky-composer-main">
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
                rows={6}
                aria-required="true"
                aria-describedby={textErr ? "sticky-composer-err" : undefined}
              />
              {textErr && (
                <span id="sticky-composer-err" className="sticky-composer-error" role="alert">
                  {lang === "zh" ? "内容不能为空" : "Note cannot be empty"}
                </span>
              )}
            </div>

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
          </div>

          <aside className="sticky-composer-source" aria-label={str("source_panel", lang)}>
            <div className="sticky-composer-source-title">{str("source_panel", lang)}</div>
            <div className="sticky-composer-source-hint">{str("source_hint", lang)}</div>
            <div className="sticky-composer-source-filters" role="tablist" aria-label={str("source_panel", lang)}>
              {SOURCE_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  data-no-drag
                  role="tab"
                  aria-selected={sourceFilter === filter}
                  className="sticky-composer-filter"
                  onClick={() => setSourceFilter(filter)}
                >
                  {str(FILTER_LABEL_KEYS[filter], lang)}
                </button>
              ))}
            </div>
            <div className="sticky-composer-source-list">
              {filteredTaskSources.length > 0 ? (
                filteredTaskSources.map((source) => (
                  <button
                    key={source.id}
                    type="button"
                    data-no-drag
                    className="sticky-composer-source-card"
                    aria-pressed={selectedSource?.id === source.id}
                    onClick={() => handlePickSource(source)}
                  >
                    <span
                      aria-hidden="true"
                      className="sticky-composer-source-color"
                      style={{ background: STICKY_COLORS[source.color] }}
                    />
                    <span className="sticky-composer-source-copy">
                      <span className="sticky-composer-source-card-title">{source.title}</span>
                      <span className="sticky-composer-source-meta">
                        {source.listLabel && <span>{source.listLabel}</span>}
                        {source.tagLabel && <span>{source.tagLabel}</span>}
                        {source.dateLabel && <span>{source.dateLabel}</span>}
                        {source.completed && <span>{str("meta_done", lang)}</span>}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="sticky-composer-source-empty">{str("source_empty", lang)}</div>
              )}
            </div>
          </aside>
        </div>

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
