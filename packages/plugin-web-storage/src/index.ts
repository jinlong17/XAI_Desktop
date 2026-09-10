/**
 * @repo/plugin-web-storage — public surface
 *
 * Single import path for all consumers:
 *   import { usePref, setPref, isPrefKey, type WebPrefKey } from "@repo/plugin-web-storage"
 *
 * This file is the ONLY public surface. Never import from src/internal/*.
 *
 * Governing ADR: docs/adr/0007-xai-web-console-build-form.md §S4 + §S8
 * Row: xai-web-persistence-contract (#3)
 */

// ---- Registry types --------------------------------------------------------
export type {
  PrefCodec,
  PrefCategory,
  PrefEntry,
  WebPrefKey,
  WebPrefValue,
  // Per-key value types (consumers may need these for typing their state)
  RailPos,
  BgTone,
  RailItemId,
  PetId,
  ClockStyle,
  PetPos,
  TaskColsState,
  DashWidgetId,
  // Calendar view type (gap-closure row #4)
  CalendarViewId,
} from "./internal/registry.js";

// ---- Registry object -------------------------------------------------------
export { PREF_REGISTRY } from "./internal/registry.js";

// ---- Imperative helpers ----------------------------------------------------
export {
  getPref,
  setPref,
  setPrefAccount,
  removePref,
  removePrefAccount,
  isPrefKey,
  // Open-ended xai_pref_* family — typed read/write/remove (mirrors usePrefAutosave).
  getPrefAutosave,
  setPrefAutosave,
  setPrefAutosaveAccount,
  removePrefAutosave,
  removePrefAutosaveAccount,
} from "./internal/storage.js";
export type { AccountWriteOptions, AccountWriteResult, AccountWriteFailureReason } from "./internal/storage.js";
export { accountLifecycleLockName, browserAccountLock } from "./internal/accountCoordination.js";
export type { AccountCoordinationLock, AccountLockMode } from "./internal/accountCoordination.js";
export {
  CANONICAL_COMMAND_KEYS,
  isCanonicalCommandKey,
  readCanonicalCommandState,
  readCanonicalCommandSnapshot,
  findCanonicalCommandReceipt,
  commitCanonicalCommand,
  mutateCanonicalDataset,
  canonicalDatasetLockName,
  isCanonicalCommandActivationEnabled,
  setCanonicalCommandActivationForTests,
  canonicalCommandSignature,
  canonicalCommandReceiptId,
} from "./internal/canonicalCommandState.js";
export type {
  CanonicalCommandKey,
  CanonicalCommandEnvelope,
  CanonicalCommandReceipt,
  CanonicalCommandRead,
  CanonicalCommandInput,
  CanonicalCommandMutation,
  CanonicalCommitResult,
  CanonicalCommandFailureReason,
  CanonicalDatasetInput,
  CanonicalDatasetMutation,
  CanonicalDatasetResult,
  CanonicalDatasetFailureReason,
} from "./internal/canonicalCommandState.js";
export type {
  GetPrefAutosaveOptions,
  SetPrefAutosaveOptions,
} from "./internal/storage.js";

// ---- usePref hook ----------------------------------------------------------
export { usePref } from "./internal/usePref.js";
export type { PrefMeta } from "./internal/usePref.js";

// ---- usePrefAutosave hook --------------------------------------------------
export { usePrefAutosave } from "./internal/usePrefAutosave.js";
export type { UsePrefAutosaveOptions, PrefAutosaveResult } from "./internal/usePrefAutosave.js";

// ---- migrate stub (v1 — no registered migrations) -------------------------
export { migrate } from "./internal/migrate.js";

// Account-local isolation and explicit legacy migration (REL-03).
export { accountScope, createAccountScopeController, createScopedStorage, AccountScopeError, accountPrefix, generationKey, generationMarkerKey, hasCommittedGenerationMarker } from "./internal/accountScope.js";
export type { AccountScope, AccountScopeController, ScopedStorageWriteResult } from "./internal/accountScope.js";
export { LOCAL_KEY_OWNERSHIP, ACCOUNT_LOCAL_KEYS, ownershipForKey } from "./internal/accountOwnership.js";
export { inspectLegacy, migrateAccount, readGeneration, rollbackAccount, browserMigrationLock, listAccountMigrations } from "./internal/accountMigration.js";
export type { GenerationMarker, SecretMigrationParticipant, SecretMigrationContext, MigrationLock, MigrationJournalInfo } from "./internal/accountMigration.js";
export { readRawPref } from "./internal/storage.js";
export { accountDeletionReceiptKey, decodeAccountDeletionReceipt } from "./internal/accountDeletionReceipt.js";
export type { AccountDeletionReceipt, AccountDeletionPhase } from "./internal/accountDeletionReceipt.js";
export { deleteAccountLocalData, deleteAccountLocalDataAccount, resumeAccountLocalDataDeletion, completeAccountLocalDataDeletion } from "./internal/accountDataLifecycle.js";
export type { AccountDeletionResult, AccountDeletionResumeResult } from "./internal/accountDataLifecycle.js";

export { registerAccountMigrationValidator, accountMigrationIssue } from "./internal/accountMigrationValidation.js";

export { AccountDataGate, requestAccountDataManagement } from "./AccountDataGate.js";
export type { AccountDataGateProps } from "./AccountDataGate.js";

export { exportAccountLocalData } from "./internal/accountDataLifecycle.js";

// Declared local-data lifecycles and explicit recovery export (REL-04).
export { LOCAL_DATA_LIFECYCLE, LOCAL_DATA_FAMILIES, lifecycleForKey } from "./internal/lifecycleDeclaration.js";
export type { LocalDataLifecycle } from "./internal/lifecycleDeclaration.js";
export { exportDeviceRecoveryData } from "./internal/dataExport.js";
export type { DeviceRecoveryExportOptions, DeviceRecoveryExport, DataExportManifest, ExportOmission, ExportSection } from "./internal/dataExport.js";
