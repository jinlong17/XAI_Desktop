export type {
  MigrationPlan,
  MigrationResult,
  MigrationStep,
  Repo,
  RepoIndexKey,
  RepoListQuery,
  RepoMetadata,
  RepoOperations,
  RepoOrderBy,
  RepoRecord,
  RepoSortDirection,
  RepoTransaction,
  SyncScope,
} from "./types";
export { assertRepoRecord } from "./repo-utils";
export { SQLITE_STATEMENTS, createSqliteRepo } from "./sqlite";
export type {
  MutationHook,
  MutationKind,
  RepoMutation,
  SqlParams,
  SqlValue,
  SqliteDriver,
  SqliteRepo,
  SqliteRepoOptions,
} from "./sqlite";
export { migrateLocalStorageToRepo } from "./local-storage";
export type {
  LocalStorageMigrationOptions,
  LocalStorageMigrationResult,
  StorageLike,
} from "./local-storage";
export { createInMemoryRepo, createInMemorySqliteDriver } from "./testing";
export {
  KEYCHAIN_ERROR_CODES,
  KeychainError,
  parseKeychainError,
  createKeychainClient,
  secretSet,
  secretGet,
  secretDel,
} from "./keychain";
export type { KeychainErrorCode, KeychainClient } from "./keychain";
export type {
  BoardWorkspaceStorageKey,
  CardEntity,
  ClipboardEntryEntity,
  GridEntity,
  GridItemEntity,
  HabitEntity,
  HabitsStateEntity,
  LabelEntity,
  PetStateEntity,
  PetStorageKey,
  PomodoroSessionsEntity,
  ProjectEntity,
  ProjectWorkspaceStateEntity,
  RepoEntity,
  RepoEntityType,
  RepoEntityTypeMap,
  SettingsPrefEntity,
  TasksStateEntity,
  TodoEntity,
} from "./entities";
export {
  LEGACY_PROJECT_ENTITY_TYPE,
  normalizeProjectEntityType,
  PROJECT_ENTITY_TYPE,
} from "./entities";
export type {
  DesktopBridgeError,
  DesktopBridgeErrorKind,
  DesktopBridgeReadResult,
  DesktopBridgeReadSource,
  DesktopBridgeSurface,
  DesktopBridgeWriteResult,
  DesktopBridgeWriteStatus,
} from "./desktop-bridge";
export { NOTES_UNSUPPORTED_ERROR } from "./desktop-bridge";
export { createTauriRepo, dbInit } from "./tauri-sqlite";
export type { CreateTauriRepoOptions, DbInitOutput } from "./tauri-sqlite";
export {
  createMockCommitSeqAuthority,
  enqueueOutboxEntry,
  isOutboxId,
  nextOutboxBatch,
  OUTBOX_ID_PREFIX,
  outboxIdFor,
} from "./sync-outbox";
export type {
  EnqueueOutboxInput,
  OutboxBatchOptions,
  OutboxEntry,
  OutboxQueueStatus,
  OutboxRollbackSafety,
} from "./sync-outbox";
export {
  OFFLINE_QUEUEABLE_ENTITY_TYPES,
  buildOfflineMutationId,
  isDeviceLocalRepoEntityType,
  isOfflineQueueableEntity,
  isQueuedOfflineResult,
  outboxIdForQueuedResult,
  stageHabitOfflineEdit,
  stageOfflineEditMutation,
  stageProjectBoardOfflineEdit,
  stageProjectCardOfflineEdit,
  stageTodoOfflineEdit,
} from "./offline-edit-queue";
export type {
  OfflineEditOperation,
  OfflineEditQueueRequest,
  OfflineEditQueueResult,
  OfflineEditQueueStatus,
  OfflineQueueableEntityType,
} from "./offline-edit-queue";
export {
  SYNC_BLOB_ACCEPT_VERSION,
  SYNC_PROTOCOL_HEADER,
  SyncBlobError,
  createSyncBlobRepo,
} from "./sync-blob";
export {
  WEB_CACHE_DB_PREFIX,
  WEB_CACHE_DB_VERSION,
  type CacheHealthState,
  type CacheQuotaSnapshot,
  type CacheWipeReport,
  type CreateIndexedDbSyncBlobRepoOptions,
  type DeadLetterMutationRow,
  type EncryptedBlobRow,
  type EntityIndexRow,
  type EntitySortKeyRow,
  type IndexedDbSyncBlobRepo,
  type PendingMutationRow,
  type SearchTextExtractor,
  type SortPayloadCrypto,
  type SortPayloadCryptoContext,
  type SortPayloadExtractor,
  type WebCacheErrorCode,
  type WebCacheLockReason,
  type WebCacheRuntimeOptions,
  type WebCacheRuntimeTransition,
  type WebCacheRuntimeTransitionSource,
  type WebCacheSearchWorker,
  type WebCacheSearchWorkerStatus,
  type WebCacheStoreName,
} from "./indexeddb-sync-blob";
export {
  WebCacheError,
  createIndexedDbSyncBlobRepo,
} from "./indexeddb-sync-blob";
export type {
  CreateSyncBlobRepoOptions,
  PullOptions,
  RetryPolicy,
  SyncBlobCryptoAdapter,
  SyncBlobCryptoDecryptInput,
  SyncBlobCryptoEncryptInput,
  SyncBlobDriverState,
  SyncBlobErrorCode,
  SyncBlobFetch,
  SyncBlobRepo,
  SyncBlobRepoOptions,
} from "./sync-blob";
export {
  LEGACY_LAYOUT_STORAGE_KEY,
  migrateOrganizerLayoutToRepos,
} from "./organizer-layout-migration";
export type {
  LegacyDesktopItem,
  LegacyGridBox,
  LegacyOrganizerLayout,
  OrganizerLayoutMigrationOptions,
  OrganizerLayoutMigrationResult,
} from "./organizer-layout-migration";
export {
  DESKTOP_WEB_IMPORT_SURFACES,
  buildDesktopWebImportLedgerId,
  buildDesktopWebImportRunRecordId,
  createDesktopWebImportFingerprint,
  normalizeImportBoundaryKey,
} from "./desktop-web-import";
export type {
  DesktopWebImportLedgerRecord,
  DesktopWebImportRunRecord,
  DesktopWebImportSkippedReason,
  DesktopWebImportSurface,
  DesktopWebImportSurfaceResult,
  DesktopWebImportSurfaceStatus,
  DesktopWebImportTrigger,
} from "./desktop-web-import";
