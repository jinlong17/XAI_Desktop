/**
 * BoardModule — top-level orchestrator for the 6-view Board module.
 *
 * Reads:
 *   - xai_boards_v2     → loadBoardsOrDefault (board-core barrel)
 *   - xai_active_board  → pickActiveBoard (board-core barrel)
 *   - xai_board_view_by_id → loadViewByBoardIdOrEmpty (this row's internal)
 *
 * Computes: activeView = viewByBoardId[activeBoard.id] ?? "board"
 *
 * Renders: header (h1 + ViewPicker) + one of 6 view components.
 *
 * Card mutations (Calendar drop, Timeline 3-handle DnD, Table inline edits)
 * call updateCard(listId, cardId, patch) which delegates to board-core's
 * updateCardInList pure helper and writes back via setBoards — the same
 * atomic pattern as row #7.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §1
 *
 * REC-1 note (design.md §1 / R11): this module reproduces board-core's
 * BoardModule local-state plumbing (~50 LOC: draftListIdx, composerText,
 * showListComposer, newListName, listMenu). This is the intentional v1
 * trade-off; the exit strategy is board-core re-export OR row #9 wrap.
 * Local state is reproduced here because the view picker needs to live in
 * OUR header, which is incompatible with simply rendering board-core's
 * BoardModule. The duplication is minimal and matches board-core's current
 * shape, so a future re-export refactor is a clean swap.
 */

import { useCallback, useEffect, useState } from "react";
import { usePref } from "@repo/plugin-web-storage";
import {
  BoardView,
  loadBoardsOrDefault,
  makeDefaultBoards,
  pickActiveBoard,
  addCardToList,
  addNewList,
  moveCardToList as moveCardOp,
  setListColor as setListColorOp,
  updateCardInList,
} from "@repo/plugin-web-board-core";
import type {
  Board,
  BoardListData,
  BoardCardData,
  BoardListColorId,
} from "@repo/plugin-web-board-core";

import { ViewPicker } from "./ViewPicker.js";
import { TableView } from "./TableView.js";
import { BoardCalendarView } from "./BoardCalendarView.js";
import { BoardDashboardView } from "./BoardDashboardView.js";
import { TimelineView } from "./TimelineView.js";
import { MapView } from "./MapView.js";
import type { BoardViewId } from "./types.js";
import type { Lang } from "./internal/i18n.js";
import { loadViewByBoardIdOrEmpty } from "./internal/persistence.js";

export interface BoardModuleProps {
  /** Bilingual language toggle.
   *
   * REC-2 note (design.md §13): this row uses the `lang` prop pattern
   * (matching board-core's pattern) rather than `useI18n` as the brief
   * mentioned. The deviation is justified by sibling-row precedent and
   * documented in design.md §13 + dev_log Review Notes REC-2. */
  lang: Lang;
}

export function BoardModule({ lang }: BoardModuleProps) {
  // ---- Persisted state ---------------------------------------------------
  const [rawBoards, setRawBoards] = usePref("xai_boards_v2");
  const [activeBoardId, setActiveBoardId] = usePref("xai_active_board");
  const [rawViewByBoardId, setRawViewByBoardId] = usePref("xai_board_view_by_id");

  const boards: Board[] = loadBoardsOrDefault(rawBoards);
  const activeBoard: Board = pickActiveBoard(boards, activeBoardId);
  const lists: BoardListData[] = activeBoard.lists;

  const viewByBoardId = loadViewByBoardIdOrEmpty(rawViewByBoardId);
  const activeView: BoardViewId = viewByBoardId[activeBoard.id] ?? "board";

  // ---- One-time defensive seed -------------------------------------------
  useEffect(() => {
    if (rawBoards === null) {
      setRawBoards(makeDefaultBoards() as unknown as typeof rawBoards);
    }
    // Only fire once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Sync active id if drifted -----------------------------------------
  if (activeBoardId && activeBoardId !== activeBoard.id) {
    queueMicrotask(() => setActiveBoardId(activeBoard.id));
  }

  // ---- Boards writer (single atomic updater) -----------------------------
  const writeLists = useCallback(
    (updater: (prev: BoardListData[]) => BoardListData[]) => {
      const nextBoards = boards.map((board) =>
        board.id === activeBoard.id
          ? { ...board, lists: updater(board.lists) }
          : board,
      );
      setRawBoards(nextBoards as unknown);
    },
    [boards, activeBoard.id, setRawBoards],
  );

  // ---- Card mutation closure (all 5 view components call this) -----------
  const updateCard = useCallback(
    (listId: string, cardId: string, patch: Partial<BoardCardData>) => {
      writeLists((prev) => updateCardInList(prev, listId, cardId, patch));
    },
    [writeLists],
  );

  // ---- View picker setter ------------------------------------------------
  const setView = useCallback(
    (next: BoardViewId) => {
      const existing: Record<string, string> =
        typeof rawViewByBoardId === "object" && rawViewByBoardId !== null
          ? (rawViewByBoardId as Record<string, string>)
          : {};
      setRawViewByBoardId({ ...existing, [activeBoard.id]: next });
    },
    [rawViewByBoardId, setRawViewByBoardId, activeBoard.id],
  );

  // ---- Kanban-view local state (REC-1 intentional reproduction) ----------
  // These are only used when activeView === "board".
  const [draftListIdx, setDraftListIdx] = useState<number | null>(null);
  const [composerText, setComposerText] = useState<string>("");
  const [showListComposer, setShowListComposer] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const [listMenu, setListMenu] = useState<string | null>(null);

  // ---- Kanban operations -------------------------------------------------
  const addCard = useCallback(
    (listIdx: number) => {
      const text = composerText.trim();
      if (!text) { setDraftListIdx(null); return; }
      writeLists((prev) => addCardToList(prev, listIdx, text));
      setComposerText("");
      setDraftListIdx(null);
    },
    [composerText, writeLists],
  );

  const addList = useCallback(() => {
    const text = newListName.trim();
    if (!text) { setShowListComposer(false); return; }
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
    <div className="board-module board-views-host" data-testid="board-views-module">
      <header className="bvm-header">
        <h1 className="module-title" data-testid="bvm-title">
          {activeBoard.name[lang]}
        </h1>
        <ViewPicker
          activeView={activeView}
          onChange={setView}
          lang={lang}
          data-testid="bvm-view-picker"
        />
      </header>

      <div className="bvm-body" data-testid="bvm-body">
        {activeView === "board" && (
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
        )}
        {activeView === "table" && (
          <TableView
            lists={lists}
            lang={lang}
            updateCard={updateCard}
          />
        )}
        {activeView === "calendar" && (
          <BoardCalendarView
            lists={lists}
            lang={lang}
            updateCard={updateCard}
          />
        )}
        {activeView === "dashboard" && (
          <BoardDashboardView
            lists={lists}
            lang={lang}
          />
        )}
        {activeView === "timeline" && (
          <TimelineView
            lists={lists}
            lang={lang}
            updateCard={updateCard}
          />
        )}
        {activeView === "map" && (
          <MapView lang={lang} />
        )}
      </div>
    </div>
  );
}
