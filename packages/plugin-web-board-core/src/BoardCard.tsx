/**
 * BoardCard — single draggable card with bilingual title, optional labels,
 * checklist count, due-date chip, attach count, member chips, and cover.
 *
 * Port of `web design/module-board.jsx` `BoardCard` (lines 478..526).
 *
 * MIME contract per `packages/xai-web-board-core/docs/api.md` §8:
 *   dataTransfer.setData("application/x-xai-board-card", JSON.stringify({ cardId, fromListId }))
 */

import { useMemo, useState } from "react";
import type { DragEvent, KeyboardEvent, MouseEvent } from "react";
import { getBoardCardDateMeta } from "./internal/dateModel.js";
import {
  DEFAULT_BOARD_LABELS,
  DEFAULT_BOARD_MEMBERS,
  getPriorityMeta,
  indexBoardLabels,
  indexBoardMembers,
  memberInitials,
} from "./internal/catalogs.js";
import type {
  BoardCard as BoardCardData,
  BoardLabel,
  BoardMemberOption,
} from "./types.js";

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
  cardMenuOpen?: boolean;
  openCardMenu?: () => void;
  closeCardMenu?: () => void;
  canMoveCardUp?: boolean;
  canMoveCardDown?: boolean;
  renameCard?: (title: string) => void;
  moveCardByOffset?: (offset: -1 | 1) => void;
  archiveCard?: () => void;
  /** Label directory for resolving `card.labels` ids → name + color chips. */
  labelCatalog?: readonly BoardLabel[];
  /** Member directory for resolving `card.members` ids → avatar chips. */
  memberCatalog?: readonly BoardMemberOption[];
}

export function BoardCard({
  card,
  lang,
  draggable = false,
  dragging = false,
  onClick,
  onDragStart,
  onDragEnd,
  cardMenuOpen = false,
  openCardMenu,
  closeCardMenu,
  canMoveCardUp = false,
  canMoveCardDown = false,
  renameCard,
  moveCardByOffset,
  archiveCard,
  labelCatalog = DEFAULT_BOARD_LABELS,
  memberCatalog = DEFAULT_BOARD_MEMBERS,
}: BoardCardProps) {
  const dateMeta = getBoardCardDateMeta(card);
  const dueText = dateMeta.dueLabel?.[lang];
  const labelIndex = useMemo(() => indexBoardLabels(labelCatalog), [labelCatalog]);
  const memberIndex = useMemo(() => indexBoardMembers(memberCatalog), [memberCatalog]);
  const priorityMeta = card.priority ? getPriorityMeta(card.priority) : null;
  const checklist = card.checklist;
  const checklistDone =
    checklist !== undefined && checklist.total > 0 && checklist.done === checklist.total;
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState(card.title[lang]);
  const actionsEnabled = Boolean(
    openCardMenu &&
    closeCardMenu &&
    renameCard &&
    moveCardByOffset &&
    archiveCard,
  );

  const closeActionsMenu = (): void => {
    setIsRenaming(false);
    closeCardMenu?.();
  };

  const startRename = (): void => {
    setRenameText(card.title[lang]);
    setIsRenaming(true);
  };

  const submitRename = (): void => {
    renameCard?.(renameText);
    closeActionsMenu();
  };

  const onRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitRename();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setIsRenaming(false);
    }
  };

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
            {card.labels.map((labelId) => {
              const def = labelIndex.get(labelId);
              const text = def ? def.name[lang] : labelId;
              return (
                <span
                  key={labelId}
                  className={"bc-label" + (def ? " is-resolved" : "")}
                  title={text}
                  data-label-id={labelId}
                  style={def ? { background: def.color } : undefined}
                >
                  <span className="bc-label-text">{text}</span>
                </span>
              );
            })}
          </div>
        ) : null}
        <div className="bc-title-row">
          <div className="bc-title">{card.title[lang]}</div>
          {actionsEnabled ? (
            <button
              type="button"
              className="bc-menu-btn"
              onClick={(event) => {
                event.stopPropagation();
                openCardMenu?.();
              }}
              data-testid="card-menu-open"
              aria-label={lang === "zh" ? "卡片操作" : "Card actions"}
            >
              ⋯
            </button>
          ) : null}
        </div>
        {cardMenuOpen && actionsEnabled ? (
          <>
            <div
              className="popover-scrim"
              onClick={(event) => {
                event.stopPropagation();
                closeActionsMenu();
              }}
              data-testid="card-popover-scrim"
            />
            <div
              className="popover card-actions-popover"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="popover-head">
                <span>{lang === "zh" ? "卡片操作" : "Card actions"}</span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={closeActionsMenu}
                  aria-label={lang === "zh" ? "关闭" : "Close"}
                >
                  ✕
                </button>
              </header>
              <div className="popover-list">
                <button
                  type="button"
                  className="popover-item"
                  onClick={startRename}
                  data-testid="card-rename-open"
                >
                  {lang === "zh" ? "重命名卡片" : "Rename card"}
                </button>
                {isRenaming ? (
                  <div className="card-rename-form">
                    <input
                      autoFocus
                      value={renameText}
                      onChange={(event) => setRenameText(event.target.value)}
                      onKeyDown={onRenameKeyDown}
                      data-testid="card-rename-input"
                      aria-label={lang === "zh" ? "卡片标题" : "Card title"}
                    />
                    <div className="composer-actions">
                      <button
                        type="button"
                        className="btn primary"
                        onClick={submitRename}
                        data-testid="card-rename-save"
                      >
                        {lang === "zh" ? "保存" : "Save"}
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setIsRenaming(false)}
                        aria-label={lang === "zh" ? "取消" : "Cancel"}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="popover-item"
                  onClick={() => {
                    moveCardByOffset?.(-1);
                    closeActionsMenu();
                  }}
                  disabled={!canMoveCardUp}
                  data-testid="card-move-up"
                >
                  {lang === "zh" ? "上移" : "Move up"}
                </button>
                <button
                  type="button"
                  className="popover-item"
                  onClick={() => {
                    moveCardByOffset?.(1);
                    closeActionsMenu();
                  }}
                  disabled={!canMoveCardDown}
                  data-testid="card-move-down"
                >
                  {lang === "zh" ? "下移" : "Move down"}
                </button>
                <button
                  type="button"
                  className="popover-item remove-color"
                  onClick={() => {
                    archiveCard?.();
                    closeActionsMenu();
                  }}
                  data-testid="card-archive"
                >
                  {lang === "zh" ? "归档卡片" : "Archive card"}
                </button>
              </div>
            </div>
          </>
        ) : null}
        <div className="bc-meta">
          {priorityMeta ? (
            <span
              className="bc-priority"
              data-testid="bc-priority"
              data-priority={priorityMeta.id}
              style={{ color: priorityMeta.color }}
              title={priorityMeta.name[lang]}
            >
              <span className="bc-priority-dot" style={{ background: priorityMeta.color }} />
              {priorityMeta.name[lang]}
            </span>
          ) : null}
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
          {(card.members ?? []).map((memberId) => {
            const def = memberIndex.get(memberId);
            const label = def ? def.name : memberId;
            return (
              <span
                key={memberId}
                className="bc-member"
                data-member-id={memberId}
                title={label}
                style={def ? { background: def.color, color: "#fff" } : undefined}
              >
                {def ? memberInitials(def.name) : memberId}
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
}
