import "./internal/accountMigration.js";
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
  ArchivedBoardCardRecord,
  BoardAttachmentIntegrationSource,
  Board,
  BoardCard as BoardCardData,
  BoardCardActivityEntry,
  BoardCardActivityKind,
  BoardCardAttachmentLink,
  BoardCardPriority,
  BoardCardTaskLink,
  BoardChecklistItem,
  BoardList as BoardListData,
  BoardListColorId,
  BoardListMutationContext,
  BoardMemberOption,
  BoardTemplate,
  BoardVisibility,
  BoardWorkspace,
  BoardIntegrationProviderId,
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
  isBoardWorkspace,
  isBoardWorkspaceArray,
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

// ---- Catalogs (label/member directories + priority metadata) -------------
export {
  KANBAN_LABELS,
  DEFAULT_BOARD_LABELS,
  DEFAULT_BOARD_MEMBERS,
  BOARD_COVER_PRESETS,
  BOARD_LABEL_PALETTE,
  BOARD_MEMBER_PALETTE,
  BOARD_PRIORITIES,
  getPriorityMeta,
  resolveBoardLabels,
  resolveBoardMembers,
  indexBoardLabels,
  indexBoardMembers,
  memberInitials,
  stripLabelFromBoardLists,
  stripMemberFromBoardLists,
} from "./internal/catalogs.js";
export type { BoardPriorityMeta } from "./internal/catalogs.js";

// ---- Pure helpers (re-exported for #8 / #9 reuse) ------------------------
export {
  addCardToListById,
  addCardToList,
  addNewList,
  archiveCard,
  archiveList,
  canManageBoardList,
  deleteCard,
  deleteList,
  getActiveBoardCardLists,
  getActiveBoardCards,
  getActiveBoardLists,
  getArchivedBoardCards,
  getArchivedBoardLists,
  mergeBoardCardPatch,
  moveCardWithinListByOffset,
  moveListByOffset,
  moveCardToList,
  normalizeBoardCardDetail,
  renameCard,
  renameList,
  restoreCard,
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

export {
  BOARD_AUTOMATION_DUE_SOON_DAYS,
  BOARD_AUTOMATION_URGENT_LABEL_ID,
  applyBoardAutomationLite,
} from "./internal/automationLite.js";
export type {
  BoardAutomationLiteOptions,
  BoardAutomationLiteResult,
  BoardAutomationLiteStats,
} from "./internal/automationLite.js";

export {
  createBoardCardActivityNote,
  createBoardCardComment,
} from "./internal/activityEntries.js";
export type {
  BoardCardActivityInput,
  BoardCardActivityResult,
} from "./internal/activityEntries.js";

export {
  BOARD_VISIBILITY_VALUES,
  getBoardVisibility,
  isBoardVisibility,
  setBoardVisibility,
} from "./internal/boardVisibility.js";

export {
  BOARD_INTEGRATION_PROVIDER_IDS,
  BOARD_INTEGRATION_PROVIDERS,
  createBoardIntegrationAttachment,
  getBoardIntegrationProvider,
  isBoardIntegrationProviderId,
} from "./internal/integrationAdapters.js";
export type {
  BoardIntegrationAttachmentInput,
  BoardIntegrationAttachmentResult,
  BoardIntegrationProvider,
} from "./internal/integrationAdapters.js";

// ---- Persistence helpers -------------------------------------------------
export {
  loadBoardsOrDefault,
  loadWorkspacesOrDefault,
  pickActiveBoard,
} from "./internal/persistence.js";

export {
  BOARD_EXPORT_PAYLOAD_KIND,
  BOARD_EXPORT_PAYLOAD_SCHEMA_VERSION,
  boardImportStorageValueFromPayload,
  createBoardExportPayload,
  readBoardExportPayload,
} from "./internal/exportImport.js";
export type {
  BoardExportPayloadReadResult,
  BoardExportPayloadResult,
  BoardExportPayloadV1,
  BoardImportStorageValueResult,
} from "./internal/exportImport.js";

export {
  BOARD_STORAGE_ENVELOPE_KIND,
  BOARD_STORAGE_ENTITY_SCHEMA_VERSION,
  BOARD_STORAGE_KEY,
  BOARD_STORAGE_SCHEMA_VERSION,
  createBoardStorageEnvelope,
  isBoardStorageEnvelopeV1,
  migrateBoardStorageRawToEnvelope,
  preserveBoardStorageFormat,
  projectBoardStorageEntities,
  readBoardStorage,
} from "./internal/storageContract.js";
export type {
  BoardStorageBoardEntity,
  BoardStorageCardEntity,
  BoardStorageEntityType,
  BoardStorageEnvelopeV1,
  BoardStorageListEntity,
  BoardStorageLogicalEntities,
  BoardStorageLogicalEntity,
  BoardStorageMigrationResult,
  BoardStorageReadResult,
  BoardStorageRecordBase,
  BoardStorageSource,
  BoardStorageValue,
} from "./internal/storageContract.js";

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
