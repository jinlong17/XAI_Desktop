/**
 * BoardWorkspacesModule — top-level orchestrator that wraps board-core's
 * BoardView with the workspace + multi-board + multi-panel layer.
 *
 * Persistence: 4 registry slots:
 *   - xai_boards_v2       (Board[])     — narrowed via loadBoardsOrDefault
 *   - xai_active_board    (string)      — resolved via pickActiveBoard
 *   - xai_board_panels    (unknown[])   — narrowed via loadPanelsOrDefault;
 *                                         written as length-1 array
 *   - xai_board_inbox     (unknown[])   — narrowed via loadInboxOrDefault
 *
 * All other behavior (workspace chip, switcher modal, creator modal,
 * status-overview banner, 4-button bottom switcher, multi-panel layout
 * with at-least-one-open invariant) is layered on top of board-core's
 * BoardView for the central panel.
 */

import { useCallback, useEffect, useState } from "react";
import { usePref } from "@repo/plugin-web-storage";
import {
  BoardView,
  BOARD_TEMPLATES,
  DEFAULT_WORKSPACES,
  loadBoardsOrDefault,
  makeDefaultBoards,
  pickActiveBoard,
  addCardToList,
  addNewList,
  moveCardToList as moveCardOp,
  setListColor as setListColorOp,
} from "@repo/plugin-web-board-core";
import type {
  Board,
  BoardListData,
  BoardListColorId,
  BoardTemplate,
} from "@repo/plugin-web-board-core";

import { BoardSwitcher } from "./BoardSwitcher.js";
import { BoardCreator } from "./BoardCreator.js";
import { StatusOverviewBanner } from "./StatusOverviewBanner.js";
import { InboxPanel } from "./InboxPanel.js";
import { PlannerPanel } from "./PlannerPanel.js";
import {
  loadPanelsOrDefault,
  loadInboxOrDefault,
  togglePanelInvariant,
  isSinglePanelOpen,
} from "./internal/panelOps.js";
import type {
  BoardPanelStateShape,
  InboxCardShape,
} from "./internal/types.js";
import { STR_BOTTOM_SWITCHER, STR_HEADER, type Lang } from "./internal/strings.js";

export interface BoardWorkspacesModuleProps {
  lang: Lang;
}

export function BoardWorkspacesModule({ lang }: BoardWorkspacesModuleProps) {
  // ---- Persisted state ---------------------------------------------------
  const [rawBoards, setRawBoards] = usePref("xai_boards_v2");
  const [activeBoardId, setActiveBoardId] = usePref("xai_active_board");
  const [rawPanels, setRawPanels] = usePref("xai_board_panels");
  const [rawInbox, setRawInbox] = usePref("xai_board_inbox");

  const boards: Board[] = loadBoardsOrDefault(rawBoards);
  const activeBoard: Board = pickActiveBoard(boards, activeBoardId);
  const lists: BoardListData[] = activeBoard.lists;
  const panels: BoardPanelStateShape = loadPanelsOrDefault(rawPanels);
  const inboxCards: InboxCardShape[] = loadInboxOrDefault(rawInbox);

  const workspaces = DEFAULT_WORKSPACES;
  const activeWorkspace =
    workspaces.find((w) => w.id === activeBoard.workspaceId) ?? workspaces[0]!;
  const totalCards = lists.reduce((n, l) => n + l.cards.length, 0);
  const isPM = activeBoard.template === "pm";

  // ---- One-time defensive seed (Rec2 from feature-review) ----------------
  useEffect(() => {
    if (rawBoards === null) {
      setRawBoards(makeDefaultBoards() as unknown as typeof rawBoards);
    }
    // Only fire once on initial mount with null prefs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Sync active id if it has drifted ----------------------------------
  if (activeBoardId && activeBoardId !== activeBoard.id) {
    queueMicrotask(() => setActiveBoardId(activeBoard.id));
  }

  // ---- Boards writer (single updater for atomic moves) -------------------
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

  // ---- Switcher / creator / overview state -------------------------------
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);

  // ---- Kanban-view composer state ---------------------------------------
  const [draftListIdx, setDraftListIdx] = useState<number | null>(null);
  const [composerText, setComposerText] = useState<string>("");
  const [showListComposer, setShowListComposer] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const [listMenu, setListMenu] = useState<string | null>(null);

  // ---- Panel + inbox setters --------------------------------------------
  const setPanels = useCallback(
    (next: BoardPanelStateShape) => {
      setRawPanels([next] as unknown[]);
    },
    [setRawPanels],
  );

  const setInbox = useCallback(
    (updater: (prev: InboxCardShape[]) => InboxCardShape[]) => {
      setRawInbox(updater(inboxCards) as unknown[]);
    },
    [inboxCards, setRawInbox],
  );

  const togglePanel = useCallback(
    (key: keyof BoardPanelStateShape) => {
      setPanels(togglePanelInvariant(panels, key));
    },
    [panels, setPanels],
  );

  // ---- Switcher actions --------------------------------------------------
  const createBoard = useCallback(
    (templateId: BoardTemplate, name: string, workspaceId: string) => {
      const tpl = BOARD_TEMPLATES.find((t) => t.id === templateId);
      if (!tpl) return;
      const newId = "b-" + Date.now().toString(36);
      const newBoard: Board = {
        id: newId,
        workspaceId,
        name: { en: name, zh: name },
        cover: tpl.cover,
        template: templateId,
        lists: tpl.lists() as BoardListData[],
      };
      setRawBoards([...boards, newBoard] as unknown);
      setActiveBoardId(newId);
      setCreateOpen(false);
      setSwitcherOpen(false);
    },
    [boards, setRawBoards, setActiveBoardId],
  );

  const deleteBoard = useCallback(
    (id: string) => {
      const remaining = boards.filter((b) => b.id !== id);
      if (id === activeBoard.id && remaining[0]) {
        setActiveBoardId(remaining[0].id);
      }
      const next = remaining.length ? remaining : makeDefaultBoards();
      setRawBoards(next as unknown);
    },
    [boards, activeBoard.id, setRawBoards, setActiveBoardId],
  );

  // ---- Kanban-view ops ---------------------------------------------------
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

  // ---- Layout class ------------------------------------------------------
  const panelsClass =
    "board-panels board-panels-" + (isSinglePanelOpen(panels) ? "single" : "multi");

  const wsLabel = activeWorkspace.name[lang];
  const wsInitials = wsLabel.slice(0, 2);

  return (
    <div className="board-module board-workspaces-module" data-testid="board-workspaces-module">
      <header className="board-toolbar">
        <span
          className="ws-chip"
          style={{ background: activeWorkspace.color }}
          data-testid="ws-chip"
        >
          {wsInitials}
        </span>
        <button
          type="button"
          className="board-title-wrap"
          onClick={() => setSwitcherOpen(true)}
          data-testid="board-title-btn"
        >
          <h1 className="module-title">{activeBoard.name[lang]}</h1>
          <span aria-hidden="true">▾</span>
        </button>

        <div className="view-picker-wrap">
          <button type="button" className="view-picker-btn" disabled data-testid="view-picker-btn">
            <span>{STR_HEADER.viewBoard[lang]}</span>
          </button>
        </div>

        <span className="board-count">
          {totalCards} {STR_HEADER.totalSuffix[lang]}
        </span>

        <span className="grow"></span>

        <div className="board-members" data-testid="board-members"></div>

        <button
          type="button"
          className={"board-icon-btn" + (overviewOpen ? " active" : "")}
          onClick={() => setOverviewOpen((o) => !o)}
          disabled={!isPM}
          data-testid="overview-toggle"
        >
          {STR_HEADER.overview[lang]}
        </button>
        <button type="button" className="board-icon-btn" disabled>
          {STR_HEADER.filter[lang]}
        </button>
        <button type="button" className="board-icon-btn primary" disabled>
          {STR_HEADER.share[lang]}
        </button>
      </header>

      <div className="board-canvas">
        {isPM && overviewOpen && panels.board && (
          <StatusOverviewBanner
            lists={lists}
            lang={lang}
            onClose={() => setOverviewOpen(false)}
          />
        )}

        <div className={panelsClass} data-testid="board-panels">
          {panels.inbox && (
            <InboxPanel cards={inboxCards} setCards={setInbox} lang={lang} />
          )}
          {panels.planner && <PlannerPanel lists={lists} lang={lang} />}
          {panels.board && (
            <div className="board-main-panel">
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
          )}
        </div>
      </div>

      <div className="board-view-switcher" data-testid="bottom-switcher">
        <button
          type="button"
          className={"bv-btn" + (panels.inbox ? " active" : "")}
          onClick={() => togglePanel("inbox")}
          data-testid="bv-inbox"
        >
          <span>{STR_BOTTOM_SWITCHER.viewInbox[lang]}</span>
        </button>
        <button
          type="button"
          className={"bv-btn" + (panels.planner ? " active" : "")}
          onClick={() => togglePanel("planner")}
          data-testid="bv-planner"
        >
          <span>{STR_BOTTOM_SWITCHER.viewPlanner[lang]}</span>
        </button>
        <button
          type="button"
          className={"bv-btn" + (panels.board ? " active" : "")}
          onClick={() => togglePanel("board")}
          data-testid="bv-board"
        >
          <span>{STR_BOTTOM_SWITCHER.viewBoard[lang]}</span>
        </button>
        <span className="bv-divider"></span>
        <button
          type="button"
          className="bv-btn"
          onClick={() => setSwitcherOpen(true)}
          data-testid="bv-switch"
        >
          <span>{STR_BOTTOM_SWITCHER.switchBoards[lang]}</span>
        </button>
      </div>

      {switcherOpen && (
        <BoardSwitcher
          lang={lang}
          workspaces={workspaces}
          boards={boards}
          activeBoardId={activeBoard.id}
          onPick={(id) => {
            setActiveBoardId(id);
            setSwitcherOpen(false);
          }}
          onCreate={() => {
            setCreateOpen(true);
            setSwitcherOpen(false);
          }}
          onDelete={deleteBoard}
          onClose={() => setSwitcherOpen(false)}
        />
      )}

      {createOpen && (
        <BoardCreator
          lang={lang}
          workspaces={workspaces}
          onCancel={() => setCreateOpen(false)}
          onCreate={createBoard}
        />
      )}
    </div>
  );
}
