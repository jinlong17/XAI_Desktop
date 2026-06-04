/**
 * @repo/plugin-web-board-core — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/*.
 *
 * Row anchor: xai-web-board-core (#7, Wave W2d)
 * ADR anchor: `docs/adr/0007-xai-web-console-build-form.md` §S4 / §S5 / §S6
 * Design: `packages/xai-web-board-core/docs/design.md`
 * API:    `packages/xai-web-board-core/docs/api.md`
 */

// ---- Side-effect CSS import ----------------------------------------------
import "./styles.css";

// ---- Schema types --------------------------------------------------------
//
// NOTE: `BoardCard` and `BoardList` exist BOTH as schema interfaces in
// `./types.ts` AND as React components in `./BoardCard.tsx` + `./BoardList.tsx`.
// To keep the component identifiers as the primary public surface (most
// consumers will import them), we re-export the schema interfaces under
// `BoardCardData` / `BoardListData` aliases.
export type {
  Board,
  BoardCard as BoardCardData,
  BoardCardActivityEntry,
  BoardCardAttachmentLink,
  BoardChecklistItem,
  BoardList as BoardListData,
  BoardListColorId,
  BoardListMutationContext,
  BoardMemberOption,
  BoardTemplate,
  BoardWorkspace,
  BilingualText,
  CardChecklist,
  CardLocation,
} from "./types.js";

// ---- Constants -----------------------------------------------------------
export {
  LIST_COLOR_IDS,
  LIST_COLOR_PALETTE,
} from "./internal/listColors.js";
export type { ListColorEntry } from "./internal/listColors.js";

// ---- Guards --------------------------------------------------------------
export {
  isBoard,
  isBoardArray,
  isBoardCard,
  isBoardList,
} from "./internal/isBoardArray.js";

// ---- Seed (typed; consumed at first run + by row #9 board-workspaces) ----
export {
  BOARD_TEMPLATES,
  BOARD_MEMBER_OPTIONS,
  DEFAULT_WORKSPACES,
  PM_LABELS,
  makeDefaultBoards,
} from "./internal/seed/board-data.js";
export type {
  BoardLabel,
  BoardTemplateOption,
} from "./internal/seed/board-data.js";

// ---- Pure helpers (re-exported for #8 / #9 reuse) ------------------------
export {
  addCardToListById,
  addCardToList,
  addNewList,
  archiveList,
  canManageBoardList,
  deleteList,
  getActiveBoardLists,
  getArchivedBoardLists,
  mergeBoardCardPatch,
  moveListByOffset,
  moveCardToList,
  normalizeBoardCardDetail,
  renameList,
  restoreList,
  setListColor,
  updateCardInList,
} from "./internal/boardOps.js";

export {
  compareIsoDateOnly,
  formatIsoDateOnly,
  getBoardCardDateCompatibilityPatch,
  getBoardCardDateMeta,
  isoDateFromOffset,
  isIsoDateOnly,
  normalizeBoardCardDates,
  parseIsoDateOnly,
} from "./internal/dateModel.js";
export type {
  BoardCardDateMeta,
  BoardDateLabel,
  BoardDateOptions,
  BoardDateSource,
  BoardIsoDate,
  DateOnlyParts,
} from "./internal/dateModel.js";

// ---- Persistence helpers -------------------------------------------------
export {
  loadBoardsOrDefault,
  pickActiveBoard,
} from "./internal/persistence.js";

// ---- React components ----------------------------------------------------
export { BoardCard, BOARD_CARD_DND_MIME } from "./BoardCard.js";
export type { BoardCardProps } from "./BoardCard.js";

export { BoardList } from "./BoardList.js";
export type { BoardListProps } from "./BoardList.js";

export { BoardView } from "./BoardView.js";
export type { BoardViewProps } from "./BoardView.js";

export { BoardModule } from "./BoardModule.js";
export type { BoardModuleProps } from "./BoardModule.js";

// ---- Shell slot registration ---------------------------------------------
export { boardCoreWebModuleRegistration } from "./registration.js";
