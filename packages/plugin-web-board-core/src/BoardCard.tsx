/**
 * BoardCard — single draggable card with bilingual title, optional labels,
 * checklist count, due-date chip, attach count, member chips, and cover.
 *
 * Port of `web design/module-board.jsx` `BoardCard` (lines 478..526).
 *
 * MIME contract per `packages/xai-web-board-core/docs/api.md` §8:
 *   dataTransfer.setData("application/x-xai-board-card", JSON.stringify({ cardId, fromListId }))
 */

import type { DragEvent, MouseEvent } from "react";
import { getBoardCardDateMeta } from "./internal/dateModel.js";
import type { BoardCard as BoardCardData } from "./types.js";

/** Wire-format MIME for cross-list drag-and-drop. Namespaced to avoid foreign drops. */
export const BOARD_CARD_DND_MIME = "application/x-xai-board-card";

export interface BoardCardProps {
  card: BoardCardData;
  lang: "en" | "zh";
  draggable?: boolean;
  dragging?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  onDragEnd?: (event: DragEvent<HTMLElement>) => void;
}

export function BoardCard({
  card,
  lang,
  draggable = false,
  dragging = false,
  onClick,
  onDragStart,
  onDragEnd,
}: BoardCardProps) {
  const dateMeta = getBoardCardDateMeta(card);
  const dueText = dateMeta.dueLabel?.[lang];
  const checklist = card.checklist;
  const checklistDone =
    checklist !== undefined && checklist.total > 0 && checklist.done === checklist.total;

  return (
    <article
      className={"board-card" + (dragging ? " is-dragging" : "")}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      data-testid="board-card"
    >
      {card.cover ? (
        <div className="bc-cover" style={{ background: card.cover }} />
      ) : null}
      <div className="bc-body">
        {card.labels && card.labels.length > 0 ? (
          <div className="bc-labels">
            {card.labels.map((labelId) => (
              <span
                key={labelId}
                className="bc-label"
                title={labelId}
                data-label-id={labelId}
              >
                <span className="bc-label-text">{labelId}</span>
              </span>
            ))}
          </div>
        ) : null}
        <div className="bc-title">{card.title[lang]}</div>
        <div className="bc-meta">
          {dueText ? (
            <span
              className={
                "bc-due" +
                (dateMeta.isOverdue ? " late" : "") +
                (dateMeta.isDueToday ? " today" : "")
              }
              data-testid="bc-due"
            >
              {dueText}
            </span>
          ) : null}
          {checklist ? (
            <span
              className={"bc-checklist" + (checklistDone ? " done" : "")}
              data-testid="bc-checklist"
            >
              {checklist.done}/{checklist.total}
            </span>
          ) : null}
          {card.attach !== undefined ? (
            <span className="bc-attach" data-testid="bc-attach">
              {card.attach}
            </span>
          ) : null}
          <span className="grow" />
          {(card.members ?? []).map((memberId) => (
            <span
              key={memberId}
              className="bc-member"
              data-member-id={memberId}
            >
              {memberId}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
