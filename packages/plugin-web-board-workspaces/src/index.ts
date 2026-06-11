/**
 * @repo/plugin-web-board-workspaces — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/*.
 *
 * Row anchor: xai-web-board-workspaces (#9, Wave W2e)
 * ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 / §S5 / §S6 / §S7 / §S8
 * Design: `packages/xai-web-board-workspaces/docs/design.md`
 * API:    `packages/xai-web-board-workspaces/docs/api.md`
 *
 * NOTE: P1 lands the narrowing types + guards + pure helpers only.
 * P2 lands the 5 leaf React components + CSS side-effect.
 * P3 lands the orchestrator + registration.
 */

// ---- Side-effect CSS (must precede any other import for vite ordering) ----
import "./styles.css";

// ---- Re-exports from row #7 board-core (consumed via index.ts only) -----
export type {
  Board,
  BoardCardData,
  BoardListData,
  BoardListColorId,
  BoardTemplate,
  BoardWorkspace,
  BilingualText,
  CardChecklist,
  BoardLabel,
  BoardTemplateOption,
  ListColorEntry,
} from "@repo/plugin-web-board-core";

export {
  LIST_COLOR_IDS,
  LIST_COLOR_PALETTE,
  BOARD_TEMPLATES,
  DEFAULT_WORKSPACES,
  PM_LABELS,
  makeDefaultBoards,
  isBoard,
  isBoardArray,
  isBoardCard,
  isBoardList,
  loadBoardsOrDefault,
  pickActiveBoard,
} from "@repo/plugin-web-board-core";

// ---- This row's net-new types -------------------------------------------
export type { BoardPanelStateShape, InboxCardShape, RingSegment } from "./internal/types.js";

// ---- Boundary narrowing guards ------------------------------------------
export { isBoardPanelState, isInboxCardArray } from "./internal/guards.js";

// ---- Pure helpers (panel ops + ring math) -------------------------------
export {
  DEFAULT_PANEL_STATE,
  INBOX_SEED,
  loadPanelsOrDefault,
  loadInboxOrDefault,
  togglePanelInvariant,
  isSinglePanelOpen,
} from "./internal/panelOps.js";

export { computeRingSegments, computeDonePct } from "./internal/ringMath.js";

// ---- React leaf components -----------------------------------------------
export { BoardSwitcher } from "./BoardSwitcher.js";
export type { BoardSwitcherProps } from "./BoardSwitcher.js";

export { BoardCreator } from "./BoardCreator.js";
export type { BoardCreatorProps } from "./BoardCreator.js";

export { StatusOverviewBanner } from "./StatusOverviewBanner.js";
export type { StatusOverviewBannerProps } from "./StatusOverviewBanner.js";

export { ArchivedListsManager } from "./ArchivedListsManager.js";
export type { ArchivedListsManagerProps } from "./ArchivedListsManager.js";

export { ArchivedCardsManager } from "./ArchivedCardsManager.js";
export type { ArchivedCardsManagerProps } from "./ArchivedCardsManager.js";

export { InboxPanel } from "./InboxPanel.js";
export type { InboxPanelProps } from "./InboxPanel.js";

export { PlannerPanel, computePlannerSlots } from "./PlannerPanel.js";
export type { PlannerPanelProps } from "./PlannerPanel.js";

export {
  BoardCardDetailModal,
  BoardCardDetailSurface,
} from "./BoardCardDetailModal.js";
export type {
  BoardCardDetailModalProps,
  BoardCardDetailSurfaceProps,
} from "./BoardCardDetailModal.js";

// ---- gap-closure row #6 additions ----------------------------------------
export { FilterPopover } from "./FilterPopover.js";
export type { FilterPopoverProps } from "./FilterPopover.js";

export { ShareModal } from "./ShareModal.js";
export type { ShareModalProps } from "./ShareModal.js";

export type { FilterState } from "@repo/plugin-web-board-views";

// ---- Top-level orchestrator ----------------------------------------------
export { BoardWorkspacesModule } from "./BoardWorkspacesModule.js";
export type { BoardWorkspacesModuleProps } from "./BoardWorkspacesModule.js";

// ---- Shell slot registration --------------------------------------------
export { boardWorkspacesWebModuleRegistration } from "./registration.js";

// ---- Desktop App compatibility seam --------------------------------------
// Browser-safe cache status reader retained for the desktop runtime badge.
export {
  readDesktopBoardCacheStatusFromRaw,
  readDesktopBoardCacheStatusFromStorage,
} from "./desktopCache.js";
export type { DesktopBoardCacheStatus } from "./desktopCache.js";
