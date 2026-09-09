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
  BoardLabel,
  BoardMemberOption,
} from "./types.js";

export interface BoardViewProps {
  lists: BoardListData[];
  lang: "en" | "zh";

  composerLocked?: boolean;
  // Composer states (lifted to caller)
  draftListId: string | null;
  setDraftListId: (next: string | null) => void;
  composerText: string;
  setComposerText: (text: string) => void;
  showListComposer: boolean;
  setShowListComposer: (next: boolean) => void;
  newListName: string;
  setNewListName: (next: string) => void;

  // Operations
  addCard: (listId: string) => void;
  addList: () => void;
  setListColor: (listId: string, color: BoardListColorId | null) => void;
  moveCardToList: (cardId: string, fromListId: string, toListId: string) => void;
  canManageList: (listId: string) => boolean;
  canMoveListByOffset: (listId: string, offset: -1 | 1) => boolean;
  renameList: (listId: string, name: string) => void;
  moveListByOffset: (listId: string, offset: -1 | 1) => void;
  archiveList: (listId: string) => void;
  deleteList: (listId: string) => void;
  canMoveCardWithinListByOffset: (
    listId: string,
    cardId: string,
    offset: -1 | 1,
  ) => boolean;
  renameCard: (listId: string, cardId: string, title: string) => void;
  moveCardWithinListByOffset: (
    listId: string,
    cardId: string,
    offset: -1 | 1,
  ) => void;
  archiveCard: (listId: string, cardId: string) => void;

  // Menu
  listMenu: string | null;
  setListMenu: (id: string | null) => void;
  cardMenu: string | null;
  setCardMenu: (id: string | null) => void;

  // Open card detail (deferred to row #9; row #7 passes a no-op)
  onOpenCard?: (cardId: string, listId: string) => void;

  // Catalogs for resolving card label/member chips
  labelCatalog?: readonly BoardLabel[];
  memberCatalog?: readonly BoardMemberOption[];
}

interface DragState {
  cardId: string;
  fromListId: string;
}

export function BoardView({
  lists,
  lang,
  composerLocked = false,
  draftListId,
  setDraftListId,
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
  canManageList,
  canMoveListByOffset,
  renameList,
  moveListByOffset,
  archiveList,
  deleteList,
  canMoveCardWithinListByOffset,
  renameCard,
  moveCardWithinListByOffset,
  archiveCard,
  listMenu,
  setListMenu,
  cardMenu,
  setCardMenu,
  onOpenCard,
  labelCatalog,
  memberCatalog,
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
      if (!composerLocked) setShowListComposer(false);
    }
  };

  return (
    <div className="board-lists" data-testid="board-lists">
      {lists.map((list) => (
        <BoardList
          key={list.id}
          list={list}
          lang={lang}
          isComposer={draftListId === list.id}
          openComposer={() => {
            if (composerLocked) return;
            setDraftListId(list.id);
            setComposerText("");
          }}
          closeComposer={() => { if (!composerLocked) setDraftListId(null); }}
          composerText={composerText}
          setComposerText={setComposerText}
          addCard={() => addCard(list.id)}
          listMenuOpen={listMenu === list.id}
          openListMenu={() => setListMenu(list.id)}
          closeListMenu={() => setListMenu(null)}
          setListColor={(color) => setListColor(list.id, color)}
          canManageList={canManageList(list.id)}
          canMoveListLeft={canMoveListByOffset(list.id, -1)}
          canMoveListRight={canMoveListByOffset(list.id, 1)}
          renameList={(name) => renameList(list.id, name)}
          moveListByOffset={(offset) => moveListByOffset(list.id, offset)}
          archiveList={() => archiveList(list.id)}
          deleteList={() => deleteList(list.id)}
          cardMenu={cardMenu}
          setCardMenu={setCardMenu}
          canMoveCardWithinListByOffset={(cardId, offset) =>
            canMoveCardWithinListByOffset(list.id, cardId, offset)
          }
          renameCard={(cardId, title) => renameCard(list.id, cardId, title)}
          moveCardWithinListByOffset={(cardId, offset) =>
            moveCardWithinListByOffset(list.id, cardId, offset)
          }
          archiveCard={(cardId) => archiveCard(list.id, cardId)}
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
          labelCatalog={labelCatalog}
          memberCatalog={memberCatalog}
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
              onClick={() => { if (!composerLocked) setShowListComposer(false); }}
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
          onClick={() => { if (!composerLocked) setShowListComposer(true); }}
          data-testid="add-list-btn"
        >
          {lang === "zh" ? "+ 添加列" : "+ Add a list"}
        </button>
      )}
    </div>
  );
}
