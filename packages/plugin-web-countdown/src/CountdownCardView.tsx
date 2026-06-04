import React from "react";
import type { CountdownCard, CountdownDisplayStyle } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { IMAGE_PRESETS } from "./internal/presets.js";
import { computeCountdownMetrics } from "./internal/countdownMath.js";
import { COUNTDOWN_CATEGORIES, colorById } from "./internal/options.js";
import { IconGlyph } from "./internal/icons.js";

interface CountdownCardViewProps {
  card: CountdownCard;
  lang: Lang;
  now?: Date;
  density?: "card" | "list" | "timeline";
  onEdit?: (card: CountdownCard) => void;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onHide?: (id: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
  onDuplicate?: (id: string) => void;
}

function isDev(): boolean {
  return (
    typeof import.meta !== "undefined" &&
    (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true
  );
}

const FALLBACK_GRADIENT = IMAGE_PRESETS[0]?.gradient ?? "linear-gradient(160deg, #6c5b4b, #2c241e)";

function resolveGradient(cover_url: string | null): string {
  if (!cover_url) return FALLBACK_GRADIENT;
  if (cover_url.startsWith("preset:")) {
    const id = cover_url.slice("preset:".length);
    const found = IMAGE_PRESETS.find((p) => p.id === id);
    if (!found) {
      if (isDev()) {
        console.warn("[plugin-web-countdown] CountdownCardView: unknown preset id", id);
      }
      return FALLBACK_GRADIENT;
    }
    return found.gradient;
  }
  return `url(${cover_url})`;
}

function categoryLabel(card: CountdownCard, lang: Lang): string {
  const category = COUNTDOWN_CATEGORIES.find((item) => item.id === card.category);
  if (!category) return lang === "zh" ? "自定义" : "Custom";
  return lang === "zh" ? category.label_zh : category.label_en;
}

function labelForStyle(style: CountdownDisplayStyle | undefined, lang: Lang): string {
  if (style === "notion") return lang === "zh" ? "Notion 进度" : "Notion progress";
  if (style === "ring") return lang === "zh" ? "圆环" : "Ring";
  if (style === "minimal") return lang === "zh" ? "极简" : "Minimal";
  if (style === "hero") return lang === "zh" ? "大数字" : "Big number";
  if (style === "festival") return lang === "zh" ? "节日" : "Festival";
  if (style === "timeline") return lang === "zh" ? "时间线" : "Timeline";
  if (style === "compact") return lang === "zh" ? "紧凑" : "Compact";
  if (style === "date") return lang === "zh" ? "日期" : "Date";
  if (style === "progress") return lang === "zh" ? "进度条" : "Progress";
  return lang === "zh" ? "数字" : "Digital";
}

function progressStyle(progress: number): React.CSSProperties {
  return { "--cd-progress": `${Math.round(progress * 100)}%` } as React.CSSProperties;
}

function RingProgress({ progress, label }: { readonly progress: number; readonly label: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.max(0, Math.min(1, progress));
  return (
    <div className="cd-ring" aria-label={label}>
      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
        <circle className="cd-ring__track" cx="36" cy="36" r={radius} />
        <circle
          className="cd-ring__fill"
          cx="36"
          cy="36"
          r={radius}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}

function NotionProgress({ progress }: { readonly progress: number }) {
  const filled = Math.round(Math.max(0, Math.min(1, progress)) * 12);
  return (
    <div className="cd-notion-bar" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <i key={index} className={index < filled ? "filled" : ""} />
      ))}
    </div>
  );
}

export function CountdownCardView({
  card,
  lang,
  now = new Date(),
  density = "card",
  onEdit,
  onClick,
  onDelete,
  onHide,
  onPin,
  onDuplicate,
}: CountdownCardViewProps) {
  const { t } = useI18n(lang);
  const color = colorById(card.color);
  const metrics = computeCountdownMetrics(card, now, lang);
  const title = lang === "zh" ? card.title.zh || card.title.en : card.title.en || card.title.zh;
  const style = card.display_style ?? "digital";
  const isGradient = card.variant === "image";
  const showCountdown = card.show_countdown !== false;
  const showProgress = card.show_progress !== false;
  const layout = card.layout ?? "stacked";
  const daysDisplay = Number.isNaN(metrics.dayDelta) ? "—" : String(metrics.absDays);
  const directionLabel = metrics.isPast ? t.countdown.days_since : t.countdown.days_until;
  const daysUnit = lang === "zh" ? "天" : metrics.absDays === 1 ? "day" : "days";

  const styleVars: React.CSSProperties = {
    "--cd-accent": color.accent,
    "--cd-soft": color.soft,
    "--cd-ink": color.ink,
    ...(isGradient ? { backgroundImage: resolveGradient(card.cover_url) } : {}),
  } as React.CSSProperties;

  function stop(event: React.MouseEvent, action: () => void) {
    event.stopPropagation();
    action();
  }

  const progressModule = (
    <div className={`cd-progress-module cd-progress-module--${style}`} style={progressStyle(metrics.progress)}>
      {style === "ring" ? (
        <RingProgress progress={metrics.progress} label={metrics.progressLabel} />
      ) : (
        <>
          <div className="cd-progress-row">
            <span>{style === "notion" ? labelForStyle("notion", lang) : lang === "zh" ? "进度" : "Progress"}</span>
            <b>{metrics.progressLabel}</b>
          </div>
          {style === "notion" ? <NotionProgress progress={metrics.progress} /> : <div className="cd-progress-track"><i /></div>}
        </>
      )}
    </div>
  );

  const countdownModule = (
    <div className={`cd-count-module cd-count-module--${style}`}>
      {style === "date" ? (
        <>
          <span className="cd-date-label">{directionLabel}</span>
          <strong>{metrics.fullTargetLabel}</strong>
        </>
      ) : (
        <>
          <span className="cd-num mono">{daysDisplay}</span>
          <span className="cd-count-copy">
            {daysUnit}
            {card.target_time && !Number.isNaN(metrics.dayDelta) ? ` ${metrics.hours}h ${metrics.minutes}m` : ""}
          </span>
        </>
      )}
    </div>
  );

  return (
    <article
      className={[
        "cd-card",
        `cd-card--${style}`,
        `cd-card--${density}`,
        layout === "split" ? "cd-card--split" : "",
        isGradient ? "cd-card--image light" : "",
        card.is_pinned ? "is-pinned" : "",
      ].filter(Boolean).join(" ")}
      style={styleVars}
      onClick={() => {
        onClick?.();
        onEdit?.(card);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClick?.();
          onEdit?.(card);
        }
      }}
    >
      {isGradient && <div className="cd-overlay" />}
      <div className="cd-card__chrome">
        <span className="cd-icon-badge"><IconGlyph name={card.icon ?? "calendar"} size={15} /></span>
        <span className="cd-meta-pill">{categoryLabel(card, lang)}</span>
        <span className="cd-meta-pill cd-meta-pill--style">{labelForStyle(style, lang)}</span>
        <span className="grow" />
        <button
          type="button"
          className="cd-mini-action"
          aria-label={card.is_pinned ? (lang === "zh" ? "取消固定" : "Unpin") : (lang === "zh" ? "固定" : "Pin")}
          onClick={(event) => stop(event, () => onPin?.(card.id, !card.is_pinned))}
        >
          <IconGlyph name="pin" size={13} />
        </button>
        <button
          type="button"
          className="cd-mini-action"
          aria-label={lang === "zh" ? "编辑" : "Edit"}
          onClick={(event) => stop(event, () => onEdit?.(card))}
        >
          <IconGlyph name="edit" size={13} />
        </button>
      </div>

      <div className="cd-card__body">
        <div className="cd-title-wrap">
          <h2 className="cd-title">{title}</h2>
          <p className="cd-foot">{directionLabel} {metrics.fullTargetLabel}</p>
        </div>
        <div className={`cd-module-stack cd-module-stack--${layout}`}>
          {showCountdown && countdownModule}
          {showProgress && progressModule}
        </div>
        {card.note ? <p className="cd-note">{card.note}</p> : null}
      </div>

      <div className="cd-card__actions" aria-label={lang === "zh" ? "倒计时操作" : "Countdown actions"}>
        <button type="button" onClick={(event) => stop(event, () => onHide?.(card.id))}>
          <IconGlyph name="eyeOff" size={13} />{lang === "zh" ? "隐藏" : "Hide"}
        </button>
        <button type="button" onClick={(event) => stop(event, () => onDuplicate?.(card.id))}>
          <IconGlyph name="copy" size={13} />{lang === "zh" ? "复制" : "Copy"}
        </button>
        <button type="button" className="danger" onClick={(event) => stop(event, () => onDelete?.(card.id))}>
          <IconGlyph name="trash" size={13} />{lang === "zh" ? "删除" : "Delete"}
        </button>
      </div>
    </article>
  );
}
