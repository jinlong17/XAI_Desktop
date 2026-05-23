/**
 * BoardList — Kanban column.
 *
 * Owns the in-row "add card" composer, the dots-menu (10-color picker +
 * remove-color), and per-card drag handlers. Port of `web design/module-board.jsx`
 * `BoardList` (lines 387..476).
 */

import type { DragEvent, KeyboardEvent } from "react";
import { LIST_COLOR_PALETTE } from "./internal/listColors.js";
import { BoardCard } from "./BoardCard.js";
import type { BoardList as BoardListData, BoardListColorId } from "./types.js";

export interface BoardListProps {
  list: BoardListData;
  lang: "en" | "zh";

  // Composer state
  isComposer: boolean;
  openComposer: () => void;
  closeComposer: () => void;
  composerText: string;
  setComposerText: (text: string) => void;
  addCard: () => void;

  // Menu state
  listMenuOpen: boolean;
  openListMenu: () => void;
  closeListMenu: () => void;
  setListColor: (color: BoardListColorId | null) => void;

  // Drag state
  isDropTarget: boolean;
  onListDragOver: (event: DragEvent<HTMLElement>) => void;
  onListDragLeave: () => void;
  onListDrop: (event: DragEvent<HTMLElement>) => void;
  onCardDragStart: (event: DragEvent<HTMLElement>, cardId: string) => void;
  onCardDragEnd: (event: DragEvent<HTMLElement>) => void;
  draggingCardId: string | null;

  // Card open
  onOpenCard?: (cardId: string) => void;
}

const LIST_KEY_LABEL: Record<string, { en: string; zh: string }> = {
  backlog: { en: "Backlog", zh: "待办池" },
  today: { en: "Today", zh: "今天" },
  week: { en: "Week", zh: "本周" },
  later: { en: "Later", zh: "以后" },
  done: { en: "Done", zh: "已完成" },
};

function resolveListName(list: BoardListData, lang: "en" | "zh"): string {
  if (list.key) {
    const dict = LIST_KEY_LABEL[list.key];
    if (dict) return dict[lang];
    return list.key;
  }
  return list.customName?.[lang] ?? (lang === "zh" ? "未命名" : "Untitled");
}

export function BoardList({
  list,
  lang,
  isComposer,
  openComposer,
  closeComposer,
  composerText,
  setComposerText,
  addCard,
  listMenuOpen,
  openListMenu,
  closeListMenu,
  setListColor,
  isDropTarget,
  onListDragOver,
  onListDragLeave,
  onListDrop,
  onCardDragStart,
  onCardDragEnd,
  draggingCardId,
  onOpenCard,
}: BoardListProps) {
  const name = resolveListName(list, lang);
  const colorEntry =
    list.color !== undefined && list.color !== null
      ? LIST_COLOR_PALETTE.find((c) => c.id === list.color)
      : undefined;

  const onComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      addCard();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeComposer();
    }
  };

  return (
    <section
      className={
        "board-list" +
        (colorEntry ? " has-color" : "") +
        (isDropTarget ? " drop-target" : "")
      }
      style={colorEntry ? { ["--list-color" as string]: colorEntry.cssVar } : undefined}
      onDragOver={onListDragOver}
      onDragLeave={onListDragLeave}
      onDrop={onListDrop}
      data-testid="board-list"
      data-list-id={list.id}
    >
      {colorEntry ? <div className="bl-stripe" /> : null}
      <header className="bl-head">
        <h2>{name}</h2>
        <span className="col-count" data-testid="col-count">
          {list.cards.length}
        </span>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          onClick={openListMenu}
          data-testid="bl-menu-open"
          aria-label={lang === "zh" ? "列操作" : "List actions"}
        >
          ⋯
        </button>
      </header>

      {listMenuOpen ? (
        <>
          <div
            className="popover-scrim"
            onClick={closeListMenu}
            data-testid="popover-scrim"
          />
          <div className="popover list-actions-popover">
            <header className="popover-head">
              <span>{lang === "zh" ? "列操作" : "List actions"}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={closeListMenu}
                aria-label={lang === "zh" ? "关闭" : "Close"}
              >
                ✕
              </button>
            </header>
            <div className="popover-list">
              <button
                type="button"
                className="popover-item"
                onClick={() => {
                  openComposer();
                  closeListMenu();
                }}
              >
                {lang === "zh" ? "添加卡片" : "Add card"}
              </button>
              <div className="popover-divider" />
              <div className="color-picker-h">
                {lang === "zh" ? "更改颜色" : "Change color"}
              </div>
              <div className="color-grid">
                {LIST_COLOR_PALETTE.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={
                      "color-sw" + (list.color === entry.id ? " active" : "")
                    }
                    style={{ background: entry.cssVar }}
                    onClick={() => {
                      setListColor(entry.id);
                      closeListMenu();
                    }}
                    aria-label={entry.id}
                    data-color-id={entry.id}
                  />
                ))}
              </div>
              <button
                type="button"
                className="popover-item remove-color"
                onClick={() => {
                  setListColor(null);
                  closeListMenu();
                }}
              >
                {lang === "zh" ? "去除颜色" : "Remove color"}
              </button>
            </div>
          </div>
        </>
      ) : null}

      <div className="bl-body">
        {list.cards.map((card) => (
          <BoardCard
            key={card.id}
            card={card}
            lang={lang}
            draggable
            dragging={draggingCardId === card.id}
            onClick={() => onOpenCard?.(card.id)}
            onDragStart={(event) => onCardDragStart(event, card.id)}
            onDragEnd={onCardDragEnd}
          />
        ))}

        {isComposer ? (
          <div className="card-composer">
            <textarea
              autoFocus
              value={composerText}
              onChange={(event) => setComposerText(event.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder={
                lang === "zh" ? "输入卡片标题…" : "Enter a title for this card…"
              }
              data-testid="card-composer-input"
            />
            <div className="composer-actions">
              <button
                type="button"
                className="btn primary"
                onClick={addCard}
                data-testid="card-composer-add"
              >
                {lang === "zh" ? "添加" : "Add"}
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={closeComposer}
                aria-label={lang === "zh" ? "取消" : "Cancel"}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="add-card-btn"
            onClick={openComposer}
            data-testid="add-card-btn"
          >
            {lang === "zh" ? "+ 添加卡片" : "+ Add a card"}
          </button>
        )}
      </div>
    </section>
  );
}
