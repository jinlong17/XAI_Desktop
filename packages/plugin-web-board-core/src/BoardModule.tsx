/**
 * BoardModule — top-level orchestrator for the Board (Kanban) view.
 *
 * Row #7 scope:
 *   - Read `xai_boards_v2` via `usePref`, narrow `unknown` → `Board[]` via
 *     `loadBoardsOrDefault` (falls back to `makeDefaultBoards()` on null /
 *     malformed / empty).
 *   - Read `xai_active_board` via `usePref`, resolve via `pickActiveBoard`.
 *   - Render a minimal header (active board name) + `<BoardView>` for the
 *     active board's lists.
 *   - Wire add-card / add-list / set-list-color / move-card-to-list through
 *     pure helpers from `boardOps`, persisting in a single `setBoards`
 *     updater so the DnD + autosave race documented in design.md R2 stays
 *     atomic.
 *
 * Rows #8 (board-views) and #9 (board-workspaces) will replace / extend the
 * header + add a view picker + multi-panel chrome. Row #7 ships only the
 * Kanban canvas.
 */

import { useCallback, useMemo, useState } from "react";
import { usePref } from "@repo/plugin-web-storage";
import { BoardView } from "./BoardView.js";
import {
  addCardToListById,
  addNewList,
  archiveList as archiveListOp,
  canManageBoardList,
  deleteList as deleteListOp,
  getActiveBoardLists,
  moveCardToList as moveCardOp,
  moveListByOffset as moveListByOffsetOp,
  renameList as renameListOp,
  setListColor as setListColorOp,
} from "./internal/boardOps.js";
import {
  loadBoardsOrDefault,
  pickActiveBoard,
} from "./internal/persistence.js";
import { makeDefaultBoards } from "./internal/seed/board-data.js";
import type { Board, BoardList, BoardListColorId } from "./types.js";

export interface BoardModuleProps {
  lang: "en" | "zh";
}

export function BoardModule({ lang }: BoardModuleProps) {
  // ---- Persisted state ---------------------------------------------------
  const [rawBoards, setRawBoards] = usePref("xai_boards_v2");
  const [activeBoardId, setActiveBoardId] = usePref("xai_active_board");

  // Narrow unknown → Board[] with default fallback.
  const boards: Board[] = loadBoardsOrDefault(rawBoards);
  const activeBoard = pickActiveBoard(boards, activeBoardId);
  const rawLists: BoardList[] = activeBoard.lists;
  const lists: BoardList[] = getActiveBoardLists(rawLists);
  const mutationCtx = useMemo(
    () => ({ template: activeBoard.template }),
    [activeBoard.template],
  );

  // Persist boards via a unified updater so a DnD + add-card race writes once.
  const writeLists = useCallback(
    (updater: (prev: BoardList[]) => BoardList[]) => {
      const nextBoards = boards.map((board) =>
        board.id === activeBoard.id
          ? { ...board, lists: updater(board.lists) }
          : board,
      );
      // setRawBoards is typed `unknown` → `unknown` at the registry boundary
      // (BoardsState = unknown). A valid `Board[]` is acceptable; widen via
      // an explicit unknown cast.
      setRawBoards(nextBoards as unknown);
    },
    [boards, activeBoard.id, setRawBoards],
  );

  // Defensive: if the persisted active id doesn't match any board, sync it.
  if (activeBoardId && activeBoardId !== activeBoard.id) {
    // useEffect not required — `usePref` setter is stable; an in-render call
    // would loop, so we defer via a microtask.
    queueMicrotask(() => setActiveBoardId(activeBoard.id));
  }

  // Defensive: if the registry returned null/malformed, also persist the seed
  // so the next read is fast-path. Skip when the registry already has a value.
  if (rawBoards === null) {
    queueMicrotask(() => setRawBoards(makeDefaultBoards() as unknown as typeof rawBoards));
  }

  // ---- In-memory composer / menu state -----------------------------------
  const [draftListId, setDraftListId] = useState<string | null>(null);
  const [composerText, setComposerText] = useState<string>("");
  const [showListComposer, setShowListComposer] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const [listMenu, setListMenu] = useState<string | null>(null);

  // ---- Operations --------------------------------------------------------
  const addCard = useCallback(
    (listId: string) => {
      const text = composerText.trim();
      if (!text) {
        setDraftListId(null);
        return;
      }
      writeLists((prev) => addCardToListById(prev, listId, text));
      setComposerText("");
      setDraftListId(null);
    },
    [composerText, writeLists],
  );

  const addList = useCallback(() => {
    const text = newListName.trim();
    if (!text) {
      setShowListComposer(false);
      return;
    }
    writeLists((prev) => addNewList(prev, text));
    setNewListName("");
    setShowListComposer(false);
  }, [newListName, writeLists]);

  const setListColor = useCallback(
    (listId: string, color: BoardListColorId | null) => {
      writeLists((prev) => setListColorOp(prev, listId, color));
    },
    [writeLists],
  );

  const moveCardToList = useCallback(
    (cardId: string, fromListId: string, toListId: string) => {
      writeLists((prev) => moveCardOp(prev, cardId, fromListId, toListId));
    },
    [writeLists],
  );

  const canManageList = useCallback(
    (listId: string) => {
      const list = rawLists.find((entry) => entry.id === listId);
      return list ? canManageBoardList(list, mutationCtx) : false;
    },
    [mutationCtx, rawLists],
  );

  const canMoveListByOffset = useCallback(
    (listId: string, offset: -1 | 1) =>
      moveListByOffsetOp(rawLists, listId, offset, mutationCtx) !== rawLists,
    [mutationCtx, rawLists],
  );

  const renameList = useCallback(
    (listId: string, name: string) => {
      writeLists((prev) => renameListOp(prev, listId, name, mutationCtx));
    },
    [mutationCtx, writeLists],
  );

  const moveListByOffset = useCallback(
    (listId: string, offset: -1 | 1) => {
      writeLists((prev) => moveListByOffsetOp(prev, listId, offset, mutationCtx));
    },
    [mutationCtx, writeLists],
  );

  const archiveList = useCallback(
    (listId: string) => {
      writeLists((prev) => archiveListOp(prev, listId, mutationCtx));
    },
    [mutationCtx, writeLists],
  );

  const deleteList = useCallback(
    (listId: string) => {
      writeLists((prev) => deleteListOp(prev, listId, mutationCtx));
    },
    [mutationCtx, writeLists],
  );

  // ---- Render ------------------------------------------------------------
  return (
    <div className="board-module" data-testid="board-module">
      <header className="board-module-head">
        <h1 className="module-title" data-testid="board-title">
          {activeBoard.name[lang]}
        </h1>
      </header>
      <div className="board-module-body">
        <BoardView
          lists={lists}
          lang={lang}
          draftListId={draftListId}
          setDraftListId={setDraftListId}
          composerText={composerText}
          setComposerText={setComposerText}
          showListComposer={showListComposer}
          setShowListComposer={setShowListComposer}
          newListName={newListName}
          setNewListName={setNewListName}
          addCard={addCard}
          addList={addList}
          setListColor={setListColor}
          moveCardToList={moveCardToList}
          canManageList={canManageList}
          canMoveListByOffset={canMoveListByOffset}
          renameList={renameList}
          moveListByOffset={moveListByOffset}
          archiveList={archiveList}
          deleteList={deleteList}
          listMenu={listMenu}
          setListMenu={setListMenu}
        />
      </div>
    </div>
  );
}
