/**
 * BoardWorkspacesModule — top-level orchestrator that wraps board-core's
 * BoardView with the workspace + multi-board + multi-panel layer, AND
 * composes the 6-view picker from row #8 (@repo/plugin-web-board-views)
 * inside the central panel.
 *
 * Persistence: 6 registry slots:
 *   - xai_boards_v2          (Board[])     — narrowed via loadBoardsOrDefault
 *   - xai_active_board       (string)      — resolved via pickActiveBoard
 *   - xai_board_panels       (unknown[])   — narrowed via loadPanelsOrDefault;
 *                                            written as length-1 array
 *   - xai_board_inbox        (unknown[])   — narrowed via loadInboxOrDefault
 *   - xai_board_view_by_id   (Record<id, BoardViewId>) — narrowed via
 *                                            loadViewByBoardIdOrEmpty
 *                                            (declared by row #8)
 *   - xai_board_filter_by_id (Record<id, SavedBoardFilter>) — narrowed via
 *                                            savedFilters helpers
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

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { accountScope, usePref } from "@repo/plugin-web-storage";
import { useBoardCreateRecovery, type BoardCreateDraft } from "./internal/useBoardCreateRecovery.js";
import { useBoardComposerRecovery } from "./internal/useBoardComposerRecovery.js";
import { useWorkspaceSaveRecovery } from "./internal/useWorkspaceSaveRecovery.js";
import { ensureBoardTaskLink } from "./internal/taskLinkCommand.js";
import {
  findBoardLinkedTask,
  loadTaskColsOrSeed,
} from "@repo/plugin-web-tasks";
import {
  BoardView,
  applyBoardAutomationLite,
  loadBoardsOrDefault,
  loadWorkspacesOrDefault,
  makeDefaultBoards,
  pickActiveBoard,
  readBoardStorage,
  archiveCard as archiveCardOp,
  archiveList as archiveListOp,
  canManageBoardList,
  deleteCard as deleteCardOp,
  deleteList as deleteListOp,
  getActiveBoardCardLists,
  getActiveBoardLists,
  getArchivedBoardCards,
  getArchivedBoardLists,
  isoDateFromOffset,
  getBoardVisibility,
  moveCardWithinListByOffset as moveCardWithinListByOffsetOp,
  moveCardToList as moveCardOp,
  moveListByOffset as moveListByOffsetOp,
  preserveBoardStorageFormat,
  renameCard as renameCardOp,
  renameList as renameListOp,
  restoreCard as restoreCardOp,
  restoreList as restoreListOp,
  setBoardVisibility,
  setListColor as setListColorOp,
  updateCardInList,
  resolveBoardLabels,
  resolveBoardMembers,
  stripLabelFromBoardLists,
  stripMemberFromBoardLists,
  BOARD_MEMBER_PALETTE,
} from "@repo/plugin-web-board-core";
import type {
  Board,
  BoardLabel,
  BoardListData,
  BoardCardData,
  BoardListColorId,
  BoardMemberOption,
  BoardTemplate,
  BoardVisibility,
  BoardWorkspace,
} from "@repo/plugin-web-board-core";
import type { BoardTaskLinkSource, BucketId } from "@repo/plugin-web-tasks";
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

import { BoardSwitcher } from "./BoardSwitcher.js";
import { BoardCreator } from "./BoardCreator.js";
import { BoardSettingsModal } from "./BoardSettingsModal.js";
import type { BoardMetaPatch } from "./BoardSettingsModal.js";
import { BoardDeleteConfirmDialog } from "./BoardDeleteConfirmDialog.js";
import { BoardCardDetailModal } from "./BoardCardDetailModal.js";
import { ArchivedListsManager } from "./ArchivedListsManager.js";
import { ArchivedCardsManager } from "./ArchivedCardsManager.js";
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
import {
  filterStateForBoard,
  loadSavedBoardFilters,
  setSavedFilterForBoard,
} from "./internal/savedFilters.js";
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

const TASK_STATUS_LABEL: Record<BucketId | "completed" | "missing", { en: string; zh: string }> = {
  overdue: { en: "Overdue", zh: "已逾期" },
  next7: { en: "Next 7 Days", zh: "未来 7 天" },
  later: { en: "Later", zh: "以后" },
  nodate: { en: "No Date", zh: "无日期" },
  completed: { en: "Completed", zh: "已完成" },
  missing: { en: "Missing task", zh: "任务缺失" },
};

function resolveTaskStatusLabel(
  key: BucketId | "completed" | "missing",
  lang: Lang,
): string {
  const entry = TASK_STATUS_LABEL[key] ?? TASK_STATUS_LABEL.missing;
  return lang === "zh" ? entry.zh : entry.en;
}

function resolveListName(list: BoardListData, lang: Lang): string {
  const customName = list.customName?.[lang];
  if (customName) return customName;
  if (list.key) {
    return LIST_KEY_LABEL[list.key]?.[lang] ?? list.key;
  }
  return lang === "zh" ? "未命名" : "Untitled";
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

type BoardStorageBaseline = Readonly<{
  owner: ReturnType<typeof accountScope.capture>;
  physicalKey: string | null;
  raw: string | null;
}>;

type QueuedActiveBoardCorrection = Readonly<{
  owner: ReturnType<typeof accountScope.capture>;
  boardKey: string;
  boardRaw: string;
  activeKey: string;
  activeRaw: string;
  renderedBoards: unknown;
  target: string;
}>;

function captureBoardStorageBaseline(): BoardStorageBaseline {
  const owner = accountScope.capture();
  try {
    const physicalKey = accountScope.physicalKey("xai_boards_v2", owner);
    return { owner, physicalKey, raw: localStorage.getItem(physicalKey) };
  } catch {
    return { owner, physicalKey: null, raw: null };
  }
}

function isStableAbsentBoardStorage(
  baseline: BoardStorageBaseline,
  rendered: unknown,
): boolean {
  try {
    accountScope.assertCurrent(baseline.owner);
    return (
      baseline.physicalKey !== null &&
      baseline.raw === null &&
      rendered === null &&
      accountScope.physicalKey("xai_boards_v2", baseline.owner) ===
        baseline.physicalKey &&
      localStorage.getItem(baseline.physicalKey) === null
    );
  } catch {
    return false;
  }
}

function boardAutomationSourceError(
  baseline: BoardStorageBaseline,
  rendered: unknown,
): string | null {
  try {
    accountScope.assertCurrent(baseline.owner);
    if (
      baseline.physicalKey === null ||
      accountScope.physicalKey("xai_boards_v2", baseline.owner) !==
        baseline.physicalKey
    ) {
      return "Board storage ownership changed. Reopen before running automation.";
    }
    const raw = localStorage.getItem(baseline.physicalKey);
    if (raw === null) {
      return "Board storage is missing. Reopen before running automation.";
    }
    let stored: unknown;
    try {
      stored = JSON.parse(raw);
    } catch {
      return "Saved board data is unusable. Existing data was kept; recover it before running automation.";
    }
    if (readBoardStorage(stored).status !== "valid") {
      return "Saved board data is unusable. Existing data was kept; recover it before running automation.";
    }
    if (JSON.stringify(stored) !== JSON.stringify(rendered)) {
      return "Board storage changed. Reopen before running automation.";
    }
    return null;
  } catch {
    return "Board storage ownership changed. Reopen before running automation.";
  }
}

function captureQueuedActiveBoardCorrection(
  baseline: BoardStorageBaseline,
  renderedBoards: unknown,
  activeBoardId: string,
  target: string,
): QueuedActiveBoardCorrection | null {
  if (boardAutomationSourceError(baseline, renderedBoards) !== null) {
    return null;
  }
  try {
    const boardKey = accountScope.physicalKey("xai_boards_v2", baseline.owner);
    const activeKey = accountScope.physicalKey("xai_active_board", baseline.owner);
    const boardRaw = localStorage.getItem(boardKey);
    const activeRaw = localStorage.getItem(activeKey);
    if (boardRaw === null || activeRaw !== activeBoardId) return null;
    return {
      owner: baseline.owner,
      boardKey,
      boardRaw,
      activeKey,
      activeRaw,
      renderedBoards,
      target,
    };
  } catch {
    return null;
  }
}

function canRunQueuedActiveBoardCorrection(
  correction: QueuedActiveBoardCorrection,
  baseline: BoardStorageBaseline,
): boolean {
  try {
    accountScope.assertCurrent(correction.owner);
    if (
      accountScope.physicalKey("xai_boards_v2", correction.owner) !==
        correction.boardKey ||
      accountScope.physicalKey("xai_active_board", correction.owner) !==
        correction.activeKey ||
      localStorage.getItem(correction.boardKey) !== correction.boardRaw ||
      localStorage.getItem(correction.activeKey) !== correction.activeRaw
    ) {
      return false;
    }
    return (
      boardAutomationSourceError(baseline, correction.renderedBoards) === null
    );
  } catch {
    return false;
  }
}

export function BoardWorkspacesModule({ lang }: BoardWorkspacesModuleProps) {
  // ---- Persisted state ---------------------------------------------------
  const [rawBoards, setRawBoards] = usePref("xai_boards_v2");
  const [activeBoardId, setActiveBoardId] = usePref("xai_active_board");
  const [rawWorkspaces, setRawWorkspaces] = usePref("xai_board_workspaces");
  const [rawPanels, setRawPanels] = usePref("xai_board_panels");
  const [rawInbox, setRawInbox] = usePref("xai_board_inbox");
  const [rawTaskCols] = usePref("xai_task_cols");
  const [boardStorageBaseline] = useState(captureBoardStorageBaseline);
  const [automationError, setAutomationError] = useState<string | null>(null);
  const linkOwner = useRef(accountScope.capture()).current;
  const [taskLinkError, setTaskLinkError] = useState<string | null>(null);
  const [rawViewByBoardId, setRawViewByBoardId] = usePref(
    "xai_board_view_by_id",
  );
  const [rawSavedFilters, setRawSavedFilters] = usePref(
    "xai_board_filter_by_id",
  );

  const boards: Board[] = loadBoardsOrDefault(rawBoards);
  const taskCols = useMemo(() => loadTaskColsOrSeed(rawTaskCols), [rawTaskCols]);
  const activeBoard: Board = pickActiveBoard(boards, activeBoardId);
  const rawLists: BoardListData[] = activeBoard.lists;
  const activeLists: BoardListData[] = getActiveBoardLists(rawLists);
  const activeCardLists: BoardListData[] = getActiveBoardCardLists(activeLists);
  const archivedLists: BoardListData[] = getArchivedBoardLists(rawLists);
  const archivedCards = getArchivedBoardCards(activeLists);
  const mutationCtx = useMemo(
    () => ({ template: activeBoard.template }),
    [activeBoard.template],
  );
  const panels: BoardPanelStateShape = loadPanelsOrDefault(rawPanels);
  const inboxCards: InboxCardShape[] = loadInboxOrDefault(rawInbox);

  const viewByBoardId = loadViewByBoardIdOrEmpty(rawViewByBoardId);
  const activeView: BoardViewId = viewByBoardId[activeBoard.id] ?? "board";
  const savedFiltersById = useMemo(
    () => loadSavedBoardFilters(rawSavedFilters),
    [rawSavedFilters],
  );

  const workspaces: BoardWorkspace[] = loadWorkspacesOrDefault(rawWorkspaces);
  const activeWorkspace =
    workspaces.find((w) => w.id === activeBoard.workspaceId) ?? workspaces[0]!;
  const totalCards = activeCardLists.reduce((n, l) => n + l.cards.length, 0);
  const isPM = activeBoard.template === "pm";
  const boardVisibility = getBoardVisibility(activeBoard);
  const labelCatalog = resolveBoardLabels(activeBoard);
  const memberCatalog = resolveBoardMembers(activeBoard);

  // ---- One-time defensive seed (Rec2 from feature-review) ----------------
  useEffect(() => {
    if (isStableAbsentBoardStorage(boardStorageBaseline, rawBoards)) {
      if (!setRawBoards(makeDefaultBoards() as unknown as typeof rawBoards)) {
        setAutomationError(
          "Initial board setup was not saved. Existing storage was kept; retry after storage is available.",
        );
      }
    }
    // Only fire once when the physical key was genuinely absent at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Sync active id if it has drifted ----------------------------------
  if (activeBoardId && activeBoardId !== activeBoard.id) {
    const correction = captureQueuedActiveBoardCorrection(
      boardStorageBaseline,
      rawBoards,
      activeBoardId,
      activeBoard.id,
    );
    if (correction) {
      queueMicrotask(() => {
        if (canRunQueuedActiveBoardCorrection(correction, boardStorageBaseline)) {
          setActiveBoardId(correction.target);
        }
      });
    }
  }

  // ---- Boards writer (single updater for atomic moves) -------------------
  const writeActiveBoard = useCallback(
    (updater: (prev: Board) => Board) => {
      const nextBoards = boards.map((board) =>
        board.id === activeBoard.id ? updater(board) : board,
      );
      setRawBoards(preserveBoardStorageFormat(rawBoards, nextBoards) as unknown);
    },
    [boards, activeBoard.id, rawBoards, setRawBoards],
  );

  const writeLists = useCallback(
    (updater: (prev: BoardListData[]) => BoardListData[]) => {
      const nextBoards = boards.map((board) =>
        board.id === activeBoard.id
          ? { ...board, lists: updater(board.lists) }
          : board,
      );
      return setRawBoards(preserveBoardStorageFormat(rawBoards, nextBoards) as unknown);
    },
    [boards, activeBoard.id, rawBoards, setRawBoards],
  );

  // ---- Label catalog CRUD (board-scoped; materializes defaults on first edit)
  const createLabel = useCallback(
    (name: string, color: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      writeActiveBoard((board) => {
        const id = `lbl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const next: BoardLabel = { id, name: { en: trimmed, zh: trimmed }, color };
        return { ...board, labels: [...resolveBoardLabels(board), next] };
      });
    },
    [writeActiveBoard],
  );

  const updateLabel = useCallback(
    (id: string, patch: { name?: string; color?: string }) => {
      writeActiveBoard((board) => ({
        ...board,
        labels: resolveBoardLabels(board).map((label) =>
          label.id === id
            ? {
                ...label,
                ...(patch.name !== undefined
                  ? { name: { en: patch.name, zh: patch.name } }
                  : {}),
                ...(patch.color !== undefined ? { color: patch.color } : {}),
              }
            : label,
        ),
      }));
    },
    [writeActiveBoard],
  );

  const deleteLabel = useCallback(
    (id: string) => {
      writeActiveBoard((board) => ({
        ...board,
        labels: resolveBoardLabels(board).filter((label) => label.id !== id),
        lists: stripLabelFromBoardLists(board.lists, id),
      }));
    },
    [writeActiveBoard],
  );

  // ---- Member directory CRUD (board-scoped) ------------------------------
  const createMember = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      writeActiveBoard((board) => {
        const current = resolveBoardMembers(board);
        const color =
          BOARD_MEMBER_PALETTE[current.length % BOARD_MEMBER_PALETTE.length]!;
        const id = `mbr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const next: BoardMemberOption = { id, name: trimmed, color };
        return { ...board, members: [...current, next] };
      });
    },
    [writeActiveBoard],
  );

  const updateMember = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      writeActiveBoard((board) => ({
        ...board,
        members: resolveBoardMembers(board).map((member) =>
          member.id === id ? { ...member, name: trimmed } : member,
        ),
      }));
    },
    [writeActiveBoard],
  );

  const deleteMember = useCallback(
    (id: string) => {
      writeActiveBoard((board) => ({
        ...board,
        members: resolveBoardMembers(board).filter((member) => member.id !== id),
        lists: stripMemberFromBoardLists(board.lists, id),
      }));
    },
    [writeActiveBoard],
  );

  // ---- Workspace CRUD (W3) ------------------------------------------------
  const workspaceRecovery = useWorkspaceSaveRecovery(rawWorkspaces, rawBoards, activeBoardId, setRawWorkspaces, setActiveBoardId);
  const [workspaceExportFailed, setWorkspaceExportFailed] = useState(false);
  const createWorkspace = (name: string) => workspaceRecovery.run('create', undefined, name);
  const renameWorkspace = (id: string, name: string) => workspaceRecovery.run('rename', id, name);
  const recolorWorkspace = (id: string) => workspaceRecovery.run('recolor', id);
  const deleteWorkspace = (id: string) => workspaceRecovery.run('delete', id);

  // ---- Board metadata editing (W2: name / icon / description / cover) ----
  const updateBoardMeta = useCallback(
    (patch: BoardMetaPatch) => {
      writeActiveBoard((board) => ({
        ...board,
        ...(patch.name !== undefined
          ? { name: { en: patch.name, zh: patch.name } }
          : {}),
        ...("icon" in patch ? { icon: patch.icon } : {}),
        ...("description" in patch ? { description: patch.description } : {}),
        ...(patch.cover !== undefined ? { cover: patch.cover } : {}),
      }));
    },
    [writeActiveBoard],
  );

  // ---- Filter state (row #10: persisted per board) ----------------------
  const [filter, setFilterState] = useState<FilterState>(() =>
    filterStateForBoard(savedFiltersById, activeBoard.id),
  );
  useEffect(() => {
    setFilterState(filterStateForBoard(savedFiltersById, activeBoard.id));
  }, [activeBoard.id, savedFiltersById]);

  const setFilter = useCallback(
    (next: FilterState) => {
      setFilterState(next);
      setRawSavedFilters((prev) =>
        setSavedFilterForBoard(
          loadSavedBoardFilters(prev),
          activeBoard.id,
          next,
        ),
      );
    },
    [activeBoard.id, setRawSavedFilters],
  );

  const filteredLists = applyFilter(activeCardLists, filter);

  // ---- Switcher / creator / overview state -------------------------------
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveCardsOpen, setArchiveCardsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeCardRef, setActiveCardRef] = useState<ActiveCardRef | null>(null);
  const [automationAppliedKey, setAutomationAppliedKey] = useState<string | null>(null);

  // ---- Kanban-view composer state ---------------------------------------
  const [draftListId, setDraftListId] = useState<string | null>(null);
  const [composerText, setComposerText] = useState<string>("");
  const [showListComposer, setShowListComposer] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const composerRecovery = useBoardComposerRecovery(rawBoards, activeBoard.id, setRawBoards);
  const [composerExportFailed, setComposerExportFailed] = useState(false);
  const [listMenu, setListMenu] = useState<string | null>(null);
  const [cardMenu, setCardMenu] = useState<string | null>(null);

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

  const applyAutomationToActiveBoard = useCallback(
    (options: Parameters<typeof applyBoardAutomationLite>[1] = {}) => {
      const sourceError = boardAutomationSourceError(
        boardStorageBaseline,
        rawBoards,
      );
      if (sourceError) {
        setAutomationError(sourceError);
        return false;
      }
      const result = applyBoardAutomationLite(activeBoard.lists, options);
      if (!result.changed) {
        setAutomationError(null);
        return true;
      }

      const nextBoards = boards.map((board) =>
        board.id === activeBoard.id ? { ...board, lists: result.lists } : board,
      );
      if (!setRawBoards(preserveBoardStorageFormat(rawBoards, nextBoards) as unknown)) {
        setAutomationError(
          "Automation was not saved. Existing data was kept; retry after storage is available.",
        );
        return false;
      }
      setAutomationError(null);
      return true;
    },
    [activeBoard.id, activeBoard.lists, boardStorageBaseline, boards, rawBoards, setRawBoards],
  );

  useEffect(() => {
    if (rawBoards === null && boardStorageBaseline.raw === null) return;
    const todayKey = `${activeBoard.id}:${isoDateFromOffset(0)}`;
    if (automationAppliedKey === todayKey) return;
    if (applyAutomationToActiveBoard({ now: new Date() })) {
      setAutomationAppliedKey(todayKey);
    }
  }, [
    activeBoard.id,
    applyAutomationToActiveBoard,
    automationAppliedKey,
    boardStorageBaseline.raw,
    rawBoards,
  ]);

  const runAutomationPresets = useCallback(() => {
    if (applyAutomationToActiveBoard({ now: new Date() })) {
      setAutomationAppliedKey(`${activeBoard.id}:${isoDateFromOffset(0)}`);
    }
  }, [activeBoard.id, applyAutomationToActiveBoard]);

  const toggleBoardVisibility = useCallback(() => {
    const nextVisibility: BoardVisibility =
      boardVisibility === "private" ? "shared" : "private";
    writeActiveBoard((board) => setBoardVisibility(board, nextVisibility));
  }, [boardVisibility, writeActiveBoard]);

  // ---- Switcher actions --------------------------------------------------
  const boardCreation = useBoardCreateRecovery(rawBoards, workspaces, setRawBoards, setActiveBoardId);
  const [boardCreateExportFailed, setBoardCreateExportFailed] = useState(false);
  const createBoard = (templateId: BoardTemplate, name: string, workspaceId: string) => {
    if (boardCreation.create({ templateId, name, workspaceId })) {
      setCreateOpen(false); setSwitcherOpen(false); setBoardCreateExportFailed(false);
    }
  };
  const exportBoardCreate = (draft: BoardCreateDraft) => {
    try {
      const blob = new Blob([JSON.stringify(boardCreation.snapshot(draft), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'board-create-recovery.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000); setBoardCreateExportFailed(false);
    } catch { setBoardCreateExportFailed(true); }
  };

  const deleteBoard = useCallback(
    (id: string) => {
      const remaining = boards.filter((b) => b.id !== id);
      if (id === activeBoard.id && remaining[0]) {
        setActiveBoardId(remaining[0].id);
      }
      const next = remaining.length ? remaining : makeDefaultBoards();
      setRawBoards(preserveBoardStorageFormat(rawBoards, next) as unknown);
    },
    [boards, activeBoard.id, rawBoards, setRawBoards, setActiveBoardId],
  );

  const [pendingDelete, setPendingDelete] = useState<{
    type: "board" | "card";
    id: string;
    label: string;
  } | null>(null);

  const requestInboxCardDelete = useCallback(
    (id: string) => {
      const card = inboxCards.find((entry) => entry.id === id);
      setPendingDelete({
        type: "card",
        id,
        label: card?.text[lang] || card?.text.en || id,
      });
    },
    [inboxCards, lang],
  );

  const requestBoardDelete = useCallback(
    (id: string) => {
      const board = boards.find((entry) => entry.id === id);
      setPendingDelete({
        type: "board",
        id,
        label: board?.name[lang] || board?.name.en || id,
      });
    },
    [boards, lang],
  );

  const confirmPendingDelete = useCallback(() => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "board") {
      deleteBoard(pendingDelete.id);
    } else {
      setInbox((prev) => prev.filter((card) => card.id !== pendingDelete.id));
    }
    setPendingDelete(null);
  }, [deleteBoard, pendingDelete, setInbox]);

  // ---- Kanban-view ops ---------------------------------------------------
  const addCard = (listId: string) => {
    if (!composerText.trim() && !composerRecovery.error) { setDraftListId(null); return; }
    if (composerRecovery.submit('card', composerText, listId)) {
      setComposerText(""); setDraftListId(null); setComposerExportFailed(false);
    }
  };
  const addList = () => {
    if (!newListName.trim() && !composerRecovery.error) { setShowListComposer(false); return; }
    if (composerRecovery.submit('list', newListName)) {
      setNewListName(""); setShowListComposer(false); setComposerExportFailed(false);
    }
  };

  const setListColor = useCallback(
    (listId: string, color: BoardListColorId | null) => {
      writeLists((prev) => setListColorOp(prev, listId, color));
    },
    [writeLists],
  );

  const moveCardToList = useCallback(
    (cardId: string, fromListId: string, toListId: string) => {
      writeLists((prev) => {
        const moved = moveCardOp(prev, cardId, fromListId, toListId);
        if (moved === prev) return prev;
        return applyBoardAutomationLite(moved, {
          now: new Date(),
          sortDueDates: false,
        }).lists;
      });
    },
    [writeLists],
  );

  const canMoveCardWithinListByOffset = useCallback(
    (listId: string, cardId: string, offset: -1 | 1) =>
      moveCardWithinListByOffsetOp(rawLists, listId, cardId, offset) !== rawLists,
    [rawLists],
  );

  const renameCard = useCallback(
    (listId: string, cardId: string, title: string) => {
      writeLists((prev) => renameCardOp(prev, listId, cardId, title));
    },
    [writeLists],
  );

  const moveCardWithinListByOffset = useCallback(
    (listId: string, cardId: string, offset: -1 | 1) => {
      writeLists((prev) => moveCardWithinListByOffsetOp(prev, listId, cardId, offset));
    },
    [writeLists],
  );

  const archiveCard = useCallback(
    (listId: string, cardId: string) => {
      writeLists((prev) => archiveCardOp(prev, listId, cardId));
      setCardMenu(null);
      if (
        activeCardRef?.boardId === activeBoard.id &&
        activeCardRef.listId === listId &&
        activeCardRef.cardId === cardId
      ) {
        setActiveCardRef(null);
      }
    },
    [activeBoard.id, activeCardRef, writeLists],
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
      if (activeCardRef?.listId === listId && activeCardRef.boardId === activeBoard.id) {
        setActiveCardRef(null);
      }
    },
    [activeBoard.id, activeCardRef, mutationCtx, writeLists],
  );

  const restoreArchivedList = useCallback(
    (listId: string) => {
      writeLists((prev) => restoreListOp(prev, listId, mutationCtx));
    },
    [mutationCtx, writeLists],
  );

  const permanentlyDeleteArchivedList = useCallback(
    (listId: string) => {
      writeLists((prev) => deleteListOp(prev, listId, mutationCtx));
      if (activeCardRef?.listId === listId && activeCardRef.boardId === activeBoard.id) {
        setActiveCardRef(null);
      }
    },
    [activeBoard.id, activeCardRef, mutationCtx, writeLists],
  );

  const restoreArchivedCard = useCallback(
    (listId: string, cardId: string) => {
      writeLists((prev) => restoreCardOp(prev, listId, cardId));
    },
    [writeLists],
  );

  const permanentlyDeleteArchivedCard = useCallback(
    (listId: string, cardId: string) => {
      writeLists((prev) => deleteCardOp(prev, listId, cardId));
      if (
        activeCardRef?.boardId === activeBoard.id &&
        activeCardRef.listId === listId &&
        activeCardRef.cardId === cardId
      ) {
        setActiveCardRef(null);
      }
    },
    [activeBoard.id, activeCardRef, writeLists],
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
          const list = rawLists.find((entry) => entry.id === activeCardRef.listId);
          const card = list?.cards.find((entry) => entry.id === activeCardRef.cardId);
          if (!list || list.archived === true || !card || card.archived === true) {
            return null;
          }
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

  const createLinkedTask = useCallback(() => {
    if (!activeCardRef || activeCardRef.boardId !== activeBoard.id) return;
    const result = ensureBoardTaskLink(activeBoard.id, activeCardRef.cardId, linkOwner);
    setTaskLinkError(result.ok ? null : result.message);
  }, [activeBoard.id, activeCardRef, linkOwner]);

  const unlinkActiveCardTask = useCallback(() => {
    patchActiveCard({ taskLink: undefined });
  }, [patchActiveCard]);

  const activeTaskLinkStatus = useMemo(() => {
    if (!activeCardRef || !activeCardContext?.card.taskLink) return undefined;
    const source: BoardTaskLinkSource = {
      type: "board-card",
      boardId: activeBoard.id,
      listId: activeCardRef.listId,
      cardId: activeCardRef.cardId,
    };
    const lookup = findBoardLinkedTask(taskCols, source);
    if (!lookup || lookup.task.id !== activeCardContext.card.taskLink.taskId) {
      return {
        taskId: activeCardContext.card.taskLink.taskId,
        label: resolveTaskStatusLabel("missing", lang),
        missing: true,
      };
    }
    const labelKey = lookup.completed ? "completed" : lookup.bucketId;
    return {
      taskId: lookup.task.id,
      label: resolveTaskStatusLabel(labelKey, lang),
      missing: false,
    };
  }, [activeBoard.id, activeCardContext, activeCardRef, lang, taskCols]);

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
          {activeBoard.icon ? (
            <span className="board-title-icon" data-testid="board-title-icon" aria-hidden="true">
              {activeBoard.icon}
            </span>
          ) : null}
          <h1 className="module-title">{activeBoard.name[lang]}</h1>
          <span aria-hidden="true">▾</span>
        </button>
        <button
          type="button"
          className="board-icon-btn"
          onClick={() => setSettingsOpen(true)}
          aria-label={lang === "zh" ? "看板设置" : "Board settings"}
          title={lang === "zh" ? "看板设置" : "Board settings"}
          data-testid="board-settings-btn"
        >
          ✎
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
              lists={activeCardLists}
              filter={filter}
              onChange={setFilter}
              onClose={() => setFilterOpen(false)}
              lang={lang}
              labelCatalog={labelCatalog}
              memberCatalog={memberCatalog}
            />
          )}
        </div>
        <ArchivedListsManager
          lists={archivedLists}
          lang={lang}
          open={archiveOpen}
          onToggle={() => setArchiveOpen((open) => !open)}
          onClose={() => setArchiveOpen(false)}
          onRestore={restoreArchivedList}
          onDeletePermanent={permanentlyDeleteArchivedList}
        />
        <ArchivedCardsManager
          records={archivedCards}
          lang={lang}
          open={archiveCardsOpen}
          onToggle={() => setArchiveCardsOpen((open) => !open)}
          onClose={() => setArchiveCardsOpen(false)}
          resolveListName={resolveListName}
          onRestore={restoreArchivedCard}
          onDeletePermanent={permanentlyDeleteArchivedCard}
        />
        <button
          type="button"
          className="board-icon-btn"
          data-testid="automation-run-btn"
          onClick={runAutomationPresets}
        >
          {STR_HEADER.automation[lang]}
        </button>
        <button
          type="button"
          className={
            "board-icon-btn" + (boardVisibility === "shared" ? " active" : "")
          }
          data-testid="board-visibility-toggle"
          onClick={toggleBoardVisibility}
        >
          {boardVisibility === "shared"
            ? STR_HEADER.shared[lang]
            : STR_HEADER.private[lang]}
        </button>
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
        {automationError && (
          <section role="alert" className="board-composer-recovery">
            <p>{automationError}</p>
          </section>
        )}
        {isPM && activeView === "board" && overviewOpen && panels.board && (
          <StatusOverviewBanner
            lists={activeCardLists}
            lang={lang}
            onClose={() => setOverviewOpen(false)}
          />
        )}

        {composerRecovery.error && <section role="alert" className="board-composer-recovery">
          <p>{lang === 'zh' ? '更改未保存，草稿仍在本页面。离开前请重试或导出。' : 'Changes were not saved. Your draft stays on this page; retry or export before leaving.'} {composerRecovery.error}</p>
          <button type="button" className="btn" onClick={() => {
            if (composerRecovery.pending?.kind === 'card') addCard(composerRecovery.pending.listId!); else addList();
          }}>{lang === 'zh' ? '重试保存' : 'Retry save'}</button>
          <button type="button" className="btn" onClick={() => {
            try {
              const draft = composerRecovery.pending?.kind === 'card' ? composerText : newListName;
              const blob = new Blob([JSON.stringify(composerRecovery.snapshot(draft), null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob), anchor = document.createElement('a');
              anchor.href = url; anchor.download = 'board-composer-draft.json'; document.body.appendChild(anchor); anchor.click(); anchor.remove();
              setTimeout(() => URL.revokeObjectURL(url), 1000); setComposerExportFailed(false);
            } catch { setComposerExportFailed(true); }
          }}>{lang === 'zh' ? '导出草稿' : 'Export draft'}</button>
          <button type="button" className="btn" onClick={() => { composerRecovery.discard(); setDraftListId(null); setShowListComposer(false); setComposerText(''); setNewListName(''); setComposerExportFailed(false); }}>{lang === 'zh' ? '放弃草稿' : 'Discard draft'}</button>
          {composerExportFailed && <p>{lang === 'zh' ? '导出失败或账户已更改。' : 'Export failed or the account changed.'}</p>}
        </section>}
        <div className={panelsClass} data-testid="board-panels">
          {panels.inbox && (
            <InboxPanel
              cards={inboxCards}
              setCards={setInbox}
              lang={lang}
              onRequestRemove={requestInboxCardDelete}
            />
          )}
          {panels.planner && (
            <PlannerPanel lists={filteredLists} lang={lang} onOpenCard={openCard} />
          )}
          {panels.board && (
            <div className="board-main-panel">
              {activeView === "board" && (
                  <BoardView
                    lists={filteredLists}
                    lang={lang}
                    composerLocked={!!composerRecovery.error}
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
                    canMoveCardWithinListByOffset={canMoveCardWithinListByOffset}
                    renameCard={renameCard}
                    moveCardWithinListByOffset={moveCardWithinListByOffset}
                    archiveCard={archiveCard}
                    listMenu={listMenu}
                    setListMenu={setListMenu}
                    cardMenu={cardMenu}
                    setCardMenu={setCardMenu}
                    onOpenCard={openCard}
                    labelCatalog={labelCatalog}
                    memberCatalog={memberCatalog}
                  />
              )}
              {activeView === "table" && (
                <TableView
                  lists={filteredLists}
                  lang={lang}
                  updateCard={updateCard}
                  onOpenCard={(card, listId) => openCard(card.id, listId)}
                  labelCatalog={labelCatalog}
                  memberCatalog={memberCatalog}
                />
              )}
              {activeView === "calendar" && (
                <BoardCalendarView
                  lists={filteredLists}
                  lang={lang}
                  updateCard={updateCard}
                  onOpenCard={(card, listId) => openCard(card.id, listId)}
                />
              )}
              {activeView === "dashboard" && (
                <BoardDashboardView
                  lists={filteredLists}
                  lang={lang}
                  labelCatalog={labelCatalog}
                />
              )}
              {activeView === "timeline" && (
                <TimelineView
                  lists={filteredLists}
                  lang={lang}
                  updateCard={updateCard}
                  onOpenCard={(card, listId) => openCard(card.id, listId)}
                />
              )}
              {activeView === "map" && (
                <Suspense fallback={<div data-testid="map-suspense-fallback" aria-busy="true" />}>
                  <MapView
                    lists={filteredLists}
                    lang={lang}
                    onSelectCard={openCard}
                  />
                </Suspense>
              )}
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
            if (workspaceRecovery.run('pick', id)) setSwitcherOpen(false);
          }}
          onCreate={() => {
            setCreateOpen(true);
            setSwitcherOpen(false);
          }}
          onRequestDelete={requestBoardDelete}
          onClose={() => { if (!workspaceRecovery.error) setSwitcherOpen(false); }}
          saveError={workspaceRecovery.error}
          pendingAction={workspaceRecovery.pending?.kind}
          onRetrySave={(name) => {
            const pending = workspaceRecovery.pending;
            if (!pending) return false;
            const success = workspaceRecovery.run(pending.kind, pending.id, name ?? pending.name);
            if (success && pending.kind === 'pick') setSwitcherOpen(false);
            return success;
          }}
          onDiscardSave={() => { workspaceRecovery.discard(); setWorkspaceExportFailed(false); }}
          exportFailed={workspaceExportFailed}
          onExportSave={(name) => {
            try {
              const blob = new Blob([JSON.stringify(workspaceRecovery.snapshot(name), null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = 'workspace-change-draft.json'; document.body.appendChild(anchor); anchor.click(); anchor.remove();
              setTimeout(() => URL.revokeObjectURL(url), 1000); setWorkspaceExportFailed(false);
            } catch { setWorkspaceExportFailed(true); }
          }}
          onCreateWorkspace={createWorkspace}
          onRenameWorkspace={renameWorkspace}
          onRecolorWorkspace={recolorWorkspace}
          onDeleteWorkspace={deleteWorkspace}
        />
      )}

      {createOpen && (
        <BoardCreator
          lang={lang}
          workspaces={workspaces}
          error={boardCreation.error}
          created={boardCreation.created}
          exportFailed={boardCreateExportFailed}
          onExport={exportBoardCreate}
          onCancel={() => { boardCreation.reset(); setBoardCreateExportFailed(false); setCreateOpen(false); }}
          onCreate={createBoard}
        />
      )}

      {settingsOpen && (
        <BoardSettingsModal
          board={activeBoard}
          lang={lang}
          onPatchBoard={updateBoardMeta}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {shareOpen && (
        <ShareModal
          board={activeBoard}
          visibility={boardVisibility}
          lang={lang}
          onClose={() => setShareOpen(false)}
        />
      )}

      {activeCardContext && (
        <BoardCardDetailModal
          card={activeCardContext.card}
          listName={resolveListName(activeCardContext.list, lang)}
          lang={lang}
          taskLinkStatus={activeTaskLinkStatus}
          taskLinkError={taskLinkError}
          labelCatalog={labelCatalog}
          memberCatalog={memberCatalog}
          onCreateLabel={createLabel}
          onUpdateLabel={updateLabel}
          onDeleteLabel={deleteLabel}
          onCreateMember={createMember}
          onUpdateMember={updateMember}
          onDeleteMember={deleteMember}
          onCreateLinkedTask={createLinkedTask}
          onUnlinkTask={unlinkActiveCardTask}
          onPatchCard={patchActiveCard}
          onClose={() => setActiveCardRef(null)}
        />
      )}

      {pendingDelete && (
        <BoardDeleteConfirmDialog
          open={true}
          mode={pendingDelete.type}
          targetLabel={pendingDelete.label}
          lang={lang}
          onConfirm={confirmPendingDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
