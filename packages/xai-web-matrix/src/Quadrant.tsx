/**
 * Quadrant — one of the four 2×2 cells in the Eisenhower Matrix.
 *
 * Renders a colored top-bar via the `--qc` CSS custom property (set inline),
 * a header with quadrant number + title + stub buttons, and the card body.
 *
 * Wires the HTML5 DnD drop zone (onDragOver + onDragLeave + onDrop).
 * Visual highlight uses data-dragover="true" (no inline style change; CSS handles it).
 *
 * Design: design.md §6.1
 */

import { useState } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";
import type { MatrixCard, Quadrant as QuadrantId } from "./types.js";
import { quadrantColorToken } from "./internal/quadrant-color.js";
import { Group } from "./Group.js";
import { PlusIcon, DotsIcon } from "./internal/icons.js";

const MATRIX_MIME = "application/x-xai-matrix-card";

export interface QuadrantProps {
  id: QuadrantId;
  number: 1 | 2 | 3 | 4;
  titleKey: string;
  cards: readonly MatrixCard[];
  lang: Lang;
  onCardDropped: (cardId: string, to: QuadrantId) => void;
}

export function Quadrant({
  id,
  number,
  titleKey,
  cards,
  lang,
  onCardDropped,
}: QuadrantProps) {
  const { s } = useI18n(lang);
  const [isDragOver, setIsDragOver] = useState(false);

  const colorToken = quadrantColorToken(id);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(MATRIX_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData(MATRIX_MIME);
    if (!cardId) return;
    onCardDropped(cardId, id);
  };

  // Group all cards into a single "Overdue" group for v1
  // (the seed has overdue + no-date conceptually; v1 renders as one group)
  const overdueLbl = lang === "zh" ? "过期" : "Overdue";

  return (
    <section
      className="matrix-q panel"
      data-quadrant={id}
      // Casting to allow setting a custom CSS property
      style={{ ["--qc" as never]: colorToken }}
    >
      <header className="q-head">
        <span className="q-number">{number}</span>
        <h2 id={`${id}-title`} className="q-title">
          {s(titleKey as Parameters<typeof s>[0])}
        </h2>
        <span className="grow" />
        <button type="button" className="icon-btn" aria-label={lang === "zh" ? "添加卡片" : "Add card"}>
          <PlusIcon size={14} />
        </button>
        <button type="button" className="icon-btn" aria-label={lang === "zh" ? "更多操作" : "More actions"}>
          <DotsIcon size={14} />
        </button>
      </header>
      <div
        className="q-body"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-dragover={isDragOver ? "true" : undefined}
        data-quadrant={id}
      >
        {cards.length === 0 ? (
          <div className="q-empty">{s("common.no_tasks")}</div>
        ) : (
          <Group
            label={overdueLbl}
            cards={cards}
            lang={lang}
            quadrant={id}
            onCardDropped={onCardDropped}
          />
        )}
      </div>
    </section>
  );
}
