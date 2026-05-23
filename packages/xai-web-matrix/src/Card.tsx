/**
 * Card — a single draggable task row inside a matrix quadrant.
 *
 * Wires HTML5 DnD (draggable + onDragStart) and keyboard a11y fallback
 * (onKeyDown → Ctrl/Cmd+Arrow → onCardDropped). The drag handlers set
 * application/x-xai-matrix-card MIME type to avoid cross-module drag interference.
 *
 * aria-grabbed is deprecated in ARIA 1.2 but kept for legacy AT compat.
 * tabIndex={0} makes every card keyboard-reachable.
 *
 * Design: design.md §6.1 + §6.3
 */

import { useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { MatrixCard, Quadrant } from "./types.js";
import { handleKbdMove } from "./internal/kbd.js";

const MATRIX_MIME = "application/x-xai-matrix-card";

export interface CardProps {
  card: MatrixCard;
  lang: Lang;
  quadrant: Quadrant;
  onCardDropped: (cardId: string, to: Quadrant) => void;
}

export function Card({ card, lang, quadrant, onCardDropped }: CardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>) => {
    e.dataTransfer.setData(MATRIX_MIME, card.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    const target = handleKbdMove(e, quadrant);
    if (target === null) return;
    e.preventDefault();
    onCardDropped(card.id, target);
    // Attempt to move focus to the moved card (best-effort — DOM may reorder)
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-card-id="${card.id}"]`);
      el?.focus();
    }, 0);
  };

  const title = lang === "zh" ? card.title.zh : card.title.en;
  const date =
    lang === "zh" && card.dateZh ? card.dateZh : card.date;
  const meta = lang === "zh" ? "收件箱" : "Inbox";

  return (
    <li
      className="m-row"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-card-id={card.id}
      data-quadrant={quadrant}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-grabbed={isDragging}
      role="listitem"
    >
      <span className="cbx" aria-hidden="true" />
      <span className="m-title">{title}</span>
      <span className="grow" />
      {card.tag && (
        <span className={`tag ${card.tag}`}>
          {lang === "zh" ? translateTag(card.tag, "zh") : translateTag(card.tag, "en")}
        </span>
      )}
      <span className="m-meta">{meta}</span>
      {date && <span className="m-date mono">{date}</span>}
    </li>
  );
}

/** Simple tag label lookup (matches prototype's tag cls system). */
function translateTag(tag: string, lang: Lang): string {
  const tags: Record<string, { en: string; zh: string }> = {
    study:    { en: "Study",    zh: "学习" },
    work:     { en: "Work",     zh: "工作" },
    personal: { en: "Personal", zh: "个人" },
    todo:     { en: "TO-DO",    zh: "待办" },
    other:    { en: "Other",    zh: "其他" },
  };
  return tags[tag]?.[lang] ?? tag;
}
