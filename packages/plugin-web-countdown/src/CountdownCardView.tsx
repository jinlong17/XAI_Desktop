/**
 * CountdownCardView — visual card for a single countdown entry.
 *
 * Uses the internal `useDaysUntil` hook for live remaining-days computation.
 * For variant="image", resolves cover_url via IMAGE_PRESETS; unknown preset
 * ids fall back to IMAGE_PRESETS[0] with a DEV warn.
 *
 * Design: packages/xai-web-countdown/docs/design.md §6
 * API contract: packages/xai-web-countdown/docs/api.md §2.2
 */

import React from "react";
import type { CountdownCard } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { useDaysUntil } from "./internal/useDaysUntil.js";
import { IMAGE_PRESETS } from "./internal/presets.js";
import { formatTargetLabel } from "./internal/formatTargetLabel.js";

interface CountdownCardViewProps {
  card: CountdownCard;
  lang: Lang;
  onClick?: () => void;
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
        console.warn(
          "[plugin-web-countdown] CountdownCardView: unknown preset id",
          id,
          "— falling back to IMAGE_PRESETS[0]",
        );
      }
      return FALLBACK_GRADIENT;
    }
    return found.gradient;
  }
  // Future: real URL
  return `url(${cover_url})`;
}

export function CountdownCardView({ card, lang, onClick }: CountdownCardViewProps) {
  const { t } = useI18n(lang);
  const days = useDaysUntil(card.target_date);
  const isLight = card.variant === "image";
  const isNaN_ = Number.isNaN(days);

  const cardClass = `cd-card${isLight ? " light" : ""}`;

  const cardStyle: React.CSSProperties = isLight
    ? { backgroundImage: resolveGradient(card.cover_url) }
    : {};

  const daysDisplay = isNaN_ ? "—" : String(Math.abs(days));
  const label = formatTargetLabel(card.target_date, lang);

  const footText = isNaN_
    ? ""
    : days >= 0
      ? `${t.countdown.days_until} ${label}`
      : `${t.countdown.days_since} ${label}`;

  return (
    <div
      className={cardClass}
      style={cardStyle}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
    >
      {isLight && <div className="cd-overlay" />}
      <div className="cd-head">
        <span className="cd-title">{lang === "zh" ? card.title.zh : card.title.en}</span>
      </div>
      <div className="cd-num mono">{daysDisplay}</div>
      <div className="cd-foot">{footText}</div>
    </div>
  );
}
