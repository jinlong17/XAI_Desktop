/**
 * BoardView — Kanban canvas. Owns local DnD state (dragging + overListId) and
 * delegates list/card rendering to <BoardList>.
 *
 * Port of `web design/module-board.jsx` `BoardView` (lines 314..385).
 *
 * DnD MIME wire format per `packages/xai-web-board-core/docs/api.md` §8.
 */

import { useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import { BoardList } from "./BoardList.js";
import { BOARD_CARD_DND_MIME } from "./BoardCard.js";
import type {
  BoardList as BoardListData,
  BoardListColorId,
} from "./types.js";

export interface BoardViewProps {
  lists: BoardListData[];
  lang: "en" | "zh";

  // Composer states (lifted to caller)
  draftListIdx: number | null;
  setDraftListIdx: (next: number | null) => void;
  composerText: string;
  setComposerText: (text: string) => void;
  showListComposer: boolean;
  setShowListComposer: (next: boolean) => void;
  newListName: string;
  setNewListName: (next: string) => void;

  // Operations
  addCard: (listIdx: number) => void;
  addList: () => void;
  setListColor: (listId: string, color: BoardListColorId | null) => void;
  moveCardToList: (cardId: string, fromListId: string, toListId: string) => void;

  // Menu
  listMenu: string | null;
  setListMenu: (id: string | null) => void;

  // Open card detail (deferred to row #9; row #7 passes a no-op)
  onOpenCard?: (cardId: string, listId: string) => void;
}

interface DragState {
  cardId: string;
  fromListId: string;
}

export function BoardView({
  lists,
  lang,
  draftListIdx,
  setDraftListIdx,
  composerText,
  setComposerText,
  showListComposer,
  setShowListComposer,
  newListName,
  setNewListName,
  addCard,
  addList,
  setListColor,
  moveCardToList,
  listMenu,
  setListMenu,
  onOpenCard,
}: BoardViewProps) {
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [overListId, setOverListId] = useState<string | null>(null);

  const onCardDragStart = (
    event: DragEvent<HTMLElement>,
    cardId: string,
    fromListId: string,
  ): void => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      BOARD_CARD_DND_MIME,
      JSON.stringify({ cardId, fromListId }),
    );
    setDragging({ cardId, fromListId });
  };

  const onCardDragEnd = (): void => {
    setDragging(null);
    setOverListId(null);
  };

  const onListDragOver = (
    event: DragEvent<HTMLElement>,
    listId: string,
  ): void => {
    // Only accept our own MIME so foreign drags (Finder, plain text) don't
    // trigger the drop-target highlight.
    if (!Array.from(event.dataTransfer.types).includes(BOARD_CARD_DND_MIME)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overListId !== listId) {
      setOverListId(listId);
    }
  };

  const onListDrop = (
    event: DragEvent<HTMLElement>,
    toListId: string,
  ): void => {
    event.preventDefault();
    setOverListId(null);
    setDragging(null);
    const raw = event.dataTransfer.getData(BOARD_CARD_DND_MIME);
    if (!raw) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as { cardId?: unknown }).cardId !== "string" ||
      typeof (parsed as { fromListId?: unknown }).fromListId !== "string"
    ) {
      return;
    }
    const { cardId, fromListId } = parsed as {
      cardId: string;
      fromListId: string;
    };
    if (fromListId === toListId) return;
    moveCardToList(cardId, fromListId, toListId);
  };

  const onListNameKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      addList();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setShowListComposer(false);
    }
  };

  return (
    <div className="board-lists" data-testid="board-lists">
      {lists.map((list, idx) => (
        <BoardList
          key={list.id}
          list={list}
          lang={lang}
          isComposer={draftListIdx === idx}
          openComposer={() => {
            setDraftListIdx(idx);
            setComposerText("");
          }}
          closeComposer={() => setDraftListIdx(null)}
          composerText={composerText}
          setComposerText={setComposerText}
          addCard={() => addCard(idx)}
          listMenuOpen={listMenu === list.id}
          openListMenu={() => setListMenu(list.id)}
          closeListMenu={() => setListMenu(null)}
          setListColor={(color) => setListColor(list.id, color)}
          isDropTarget={
            overListId === list.id &&
            dragging !== null &&
            dragging.fromListId !== list.id
          }
          onListDragOver={(event) => onListDragOver(event, list.id)}
          onListDragLeave={() => {
            if (overListId === list.id) setOverListId(null);
          }}
          onListDrop={(event) => onListDrop(event, list.id)}
          onCardDragStart={(event, cardId) =>
            onCardDragStart(event, cardId, list.id)
          }
          onCardDragEnd={onCardDragEnd}
          draggingCardId={dragging?.cardId ?? null}
          onOpenCard={(cardId) => onOpenCard?.(cardId, list.id)}
        />
      ))}

      {showListComposer ? (
        <div className="list-composer" data-testid="list-composer">
          <input
            autoFocus
            className="list-name-input"
            value={newListName}
            onChange={(event) => setNewListName(event.target.value)}
            onKeyDown={onListNameKeyDown}
            placeholder={
              lang === "zh" ? "输入列名…" : "Enter list name…"
            }
            data-testid="list-name-input"
          />
          <div className="composer-actions">
            <button
              type="button"
              className="btn primary"
              onClick={addList}
              data-testid="list-composer-add"
            >
              {lang === "zh" ? "添加" : "Add"}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowListComposer(false)}
              aria-label={lang === "zh" ? "取消" : "Cancel"}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="add-list-btn"
          onClick={() => setShowListComposer(true)}
          data-testid="add-list-btn"
        >
          {lang === "zh" ? "+ 添加列" : "+ Add a list"}
        </button>
      )}
    </div>
  );
}
