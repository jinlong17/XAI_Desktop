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

import { useCallback, useState } from "react";
import { usePref } from "@repo/plugin-web-storage";
import { BoardView } from "./BoardView.js";
import {
  addCardToList,
  addNewList,
  moveCardToList as moveCardOp,
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
  const lists: BoardList[] = activeBoard.lists;

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
  const [draftListIdx, setDraftListIdx] = useState<number | null>(null);
  const [composerText, setComposerText] = useState<string>("");
  const [showListComposer, setShowListComposer] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const [listMenu, setListMenu] = useState<string | null>(null);

  // ---- Operations --------------------------------------------------------
  const addCard = useCallback(
    (listIdx: number) => {
      const text = composerText.trim();
      if (!text) {
        setDraftListIdx(null);
        return;
      }
      writeLists((prev) => addCardToList(prev, listIdx, text));
      setComposerText("");
      setDraftListIdx(null);
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
          draftListIdx={draftListIdx}
          setDraftListIdx={setDraftListIdx}
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
          listMenu={listMenu}
          setListMenu={setListMenu}
        />
      </div>
    </div>
  );
}
