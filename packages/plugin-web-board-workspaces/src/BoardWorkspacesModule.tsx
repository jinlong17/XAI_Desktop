/**
 * BoardWorkspacesModule — top-level orchestrator that wraps board-core's
 * BoardView with the workspace + multi-board + multi-panel layer, AND
 * composes the 6-view picker from row #8 (@repo/plugin-web-board-views)
 * inside the central panel.
 *
 * Persistence: 5 registry slots:
 *   - xai_boards_v2          (Board[])     — narrowed via loadBoardsOrDefault
 *   - xai_active_board       (string)      — resolved via pickActiveBoard
 *   - xai_board_panels       (unknown[])   — narrowed via loadPanelsOrDefault;
 *                                            written as length-1 array
 *   - xai_board_inbox        (unknown[])   — narrowed via loadInboxOrDefault
 *   - xai_board_view_by_id   (Record<id, BoardViewId>) — narrowed via
 *                                            loadViewByBoardIdOrEmpty
 *                                            (declared by row #8)
 *
 * View composition (row #8 hand-off — cross-vendor verify BLOCKER fix):
 * The disabled header view-picker placeholder was replaced with the real
 * `<ViewPicker>` from `@repo/plugin-web-board-views`. The central panel
 * now renders one of 6 views (Board / Table / Calendar / Dashboard /
 * Timeline / Map) based on the per-board active view id. The workspace
 * chip, switcher modal, creator modal, status-overview banner, side
 * panels (Inbox / Planner), and 4-button bottom switcher are preserved
 * when `activeView === "board"`. When `activeView !== "board"`, the
 * side-panel layout is bypassed so the alt view occupies the central
 * canvas full-width — the bottom switcher remains available so the user
 * can toggle Inbox / Planner / Switch-boards regardless of view.
 */

import { Suspense, useCallback, useEffect, useState } from "react";
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
  updateCardInList,
} from "@repo/plugin-web-board-core";
import type {
  Board,
  BoardListData,
  BoardCardData,
  BoardListColorId,
  BoardTemplate,
} from "@repo/plugin-web-board-core";
import {
  ViewPicker,
  TableView,
  BoardCalendarView,
  BoardDashboardView,
  TimelineView,
  MapView,
  applyFilter,
} from "@repo/plugin-web-board-views";
import type { BoardViewId, FilterState } from "@repo/plugin-web-board-views";
import { EMPTY_FILTER } from "@repo/plugin-web-board-views";

import { BoardSwitcher } from "./BoardSwitcher.js";
import { BoardCreator } from "./BoardCreator.js";
import { BoardCardDetailModal } from "./BoardCardDetailModal.js";
import { StatusOverviewBanner } from "./StatusOverviewBanner.js";
import { InboxPanel } from "./InboxPanel.js";
import { PlannerPanel } from "./PlannerPanel.js";
import { FilterPopover } from "./FilterPopover.js";
import { ShareModal } from "./ShareModal.js";
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

interface ActiveCardRef {
  boardId: string;
  listId: string;
  cardId: string;
}

/**
 * Local narrowing for the xai_board_view_by_id registry key, mirroring the
 * board-views package's internal helper. board-views does NOT export this
 * helper through its index.ts (internal/persistence.ts is package-private),
 * so we re-implement it here. Shape is `Record<boardId, BoardViewId>`.
 */
const VALID_VIEW_IDS = new Set<BoardViewId>([
  "board",
  "table",
  "calendar",
  "dashboard",
  "timeline",
  "map",
]);

const LIST_KEY_LABEL: Record<string, { en: string; zh: string }> = {
  backlog: { en: "Backlog", zh: "待办池" },
  today: { en: "Today", zh: "今天" },
  week: { en: "Week", zh: "本周" },
  later: { en: "Later", zh: "以后" },
  done: { en: "Done", zh: "已完成" },
};

function resolveListName(list: BoardListData, lang: Lang): string {
  if (list.key) {
    return LIST_KEY_LABEL[list.key]?.[lang] ?? list.key;
  }
  return list.customName?.[lang] ?? (lang === "zh" ? "未命名" : "Untitled");
}

function loadViewByBoardIdOrEmpty(raw: unknown): Record<string, BoardViewId> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, BoardViewId> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string" && VALID_VIEW_IDS.has(v as BoardViewId)) {
      result[k] = v as BoardViewId;
    }
  }
  return result;
}

export function BoardWorkspacesModule({ lang }: BoardWorkspacesModuleProps) {
  // ---- Persisted state ---------------------------------------------------
  const [rawBoards, setRawBoards] = usePref("xai_boards_v2");
  const [activeBoardId, setActiveBoardId] = usePref("xai_active_board");
  const [rawPanels, setRawPanels] = usePref("xai_board_panels");
  const [rawInbox, setRawInbox] = usePref("xai_board_inbox");
  const [rawViewByBoardId, setRawViewByBoardId] = usePref(
    "xai_board_view_by_id",
  );

  const boards: Board[] = loadBoardsOrDefault(rawBoards);
  const activeBoard: Board = pickActiveBoard(boards, activeBoardId);
  const lists: BoardListData[] = activeBoard.lists;
  const panels: BoardPanelStateShape = loadPanelsOrDefault(rawPanels);
  const inboxCards: InboxCardShape[] = loadInboxOrDefault(rawInbox);

  const viewByBoardId = loadViewByBoardIdOrEmpty(rawViewByBoardId);
  const activeView: BoardViewId = viewByBoardId[activeBoard.id] ?? "board";

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

  // ---- Filter state (HC1: render-only; reset on board switch) -----------
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  useEffect(() => {
    setFilter(EMPTY_FILTER);
  }, [activeBoard.id]);

  const filteredLists = applyFilter(lists, filter);

  // ---- Switcher / creator / overview state -------------------------------
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeCardRef, setActiveCardRef] = useState<ActiveCardRef | null>(null);

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

  // ---- Card mutation closure (shared by Table / Calendar / Timeline) -----
  // All board-views card mutations route through this single closure, which
  // delegates to board-core's updateCardInList pure helper. This preserves
  // the row #7 atomic persistence pattern: one writeLists call = one
  // setRawBoards = one storage write.
  const updateCard = useCallback(
    (listId: string, cardId: string, patch: Partial<BoardCardData>) => {
      writeLists((prev) => updateCardInList(prev, listId, cardId, patch));
    },
    [writeLists],
  );

  const openCard = useCallback(
    (cardId: string, listId: string) => {
      setActiveCardRef({ boardId: activeBoard.id, listId, cardId });
    },
    [activeBoard.id],
  );

  const activeCardContext =
    activeCardRef && activeCardRef.boardId === activeBoard.id
      ? (() => {
          const list = lists.find((entry) => entry.id === activeCardRef.listId);
          const card = list?.cards.find((entry) => entry.id === activeCardRef.cardId);
          if (!list || !card) return null;
          return { list, card };
        })()
      : null;

  const patchActiveCard = useCallback(
    (patch: Partial<BoardCardData>) => {
      if (!activeCardRef || activeCardRef.boardId !== activeBoard.id) return;
      updateCard(activeCardRef.listId, activeCardRef.cardId, patch);
    },
    [activeBoard.id, activeCardRef, updateCard],
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
          <ViewPicker
            activeView={activeView}
            onChange={setView}
            lang={lang}
          />
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
        <div className="filter-btn-wrap" style={{ position: "relative" }}>
          <button
            type="button"
            className={"board-icon-btn" + (filterOpen ? " active" : "")}
            data-testid="filter-btn"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((o) => !o)}
          >
            {STR_HEADER.filter[lang]}
          </button>
          {filterOpen && (
            <FilterPopover
              lists={lists}
              filter={filter}
              onChange={setFilter}
              onClose={() => setFilterOpen(false)}
              lang={lang}
            />
          )}
        </div>
        <button
          type="button"
          className="board-icon-btn primary"
          data-testid="share-btn"
          onClick={() => setShareOpen(true)}
        >
          {STR_HEADER.share[lang]}
        </button>
      </header>

      <div className="board-canvas">
        {activeView === "board" ? (
          <>
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
              {panels.planner && (
                <PlannerPanel lists={filteredLists} lang={lang} onOpenCard={openCard} />
              )}
              {panels.board && (
                <div className="board-main-panel">
                  <BoardView
                    lists={filteredLists}
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
                    onOpenCard={openCard}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          // Alternate views (Table / Calendar / Dashboard / Timeline / Map)
          // get the full central canvas. Side panels (Inbox / Planner) are
          // suspended in alt-view mode because their layout assumes the
          // Kanban column grid. The bottom switcher still lets the user
          // toggle Inbox / Planner — those will appear after switching back
          // to the Board view.
          <div
            className="board-views-alt-canvas"
            data-testid="board-views-alt-canvas"
            data-active-view={activeView}
          >
            {activeView === "table" && (
              <TableView lists={filteredLists} lang={lang} updateCard={updateCard} />
            )}
            {activeView === "calendar" && (
              <BoardCalendarView
                lists={filteredLists}
                lang={lang}
                updateCard={updateCard}
              />
            )}
            {activeView === "dashboard" && (
              <BoardDashboardView lists={filteredLists} lang={lang} />
            )}
            {activeView === "timeline" && (
              <TimelineView lists={filteredLists} lang={lang} updateCard={updateCard} />
            )}
            {activeView === "map" && (
              <Suspense fallback={<div data-testid="map-suspense-fallback" aria-busy="true" />}>
                <MapView lists={filteredLists} lang={lang} />
              </Suspense>
            )}
          </div>
        )}
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

      {shareOpen && (
        <ShareModal
          board={activeBoard}
          lang={lang}
          onClose={() => setShareOpen(false)}
        />
      )}

      {activeCardContext && (
        <BoardCardDetailModal
          card={activeCardContext.card}
          listName={resolveListName(activeCardContext.list, lang)}
          lang={lang}
          onPatchCard={patchActiveCard}
          onClose={() => setActiveCardRef(null)}
        />
      )}
    </div>
  );
}
