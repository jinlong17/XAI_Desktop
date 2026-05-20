export {
  BACKFILL_INCOMPLETE_ERROR,
  BACKFILL_WORD_COUNT,
  MIN_MASTER_PASSWORD_SCORE,
  SECRET_KEY_DIGIT_COUNT,
  assertStrongMasterPassword,
  completeOnboardingBackfill,
  createBackfillChallenge,
  createEmergencyKitDocument,
  createEmergencyKitPayload,
  renderEmergencyKitHtml,
  scoreMasterPassword,
  validateLocalRecoveryChecks,
  verifyBackfillChallenge,
} from './onboarding-backfill';
export type {
  BackfillAcknowledgementProof,
  BackfillAcknowledgementRequest,
  BackfillAcknowledgementTransport,
  BackfillAnswers,
  BackfillChallenge,
  BackfillLocalValidationInput,
  BackfillLocalValidationResult,
  BackfillLocalValidator,
  BackfillVerificationResult,
  CompleteBackfillInput,
  EmergencyKitDocument,
  EmergencyKitPayload,
} from './onboarding-backfill';
export { OnboardingBackfillFlow } from './components/OnboardingBackfillFlow';
export type { OnboardingBackfillFlowProps } from './components/OnboardingBackfillFlow';
export {
  AUDIT_MIRROR_SQL,
  SyncAuditMismatchError,
  createAuditMirror,
} from './audit-log';
export type {
  AuditMirror,
  AuditMirrorOptions,
  AuditSummary,
  ServerAuditSummary,
} from './audit-log';
export {
  AccountRateLimitError,
  StorageQuotaExceededError,
  assertWithinStorageQuota,
  createAccountRateLimiter,
  createSupportFeedback,
  exportEncryptedAccountData,
  planAccountDeletion,
} from './beta-ops';
export type {
  AccountDeletionPlan,
  EncryptedExportRecord,
  RateLimitConfig,
  StorageQuotaConfig,
  StorageUsage,
  SupportFeedback,
} from './beta-ops';
export {
  RefreshTokenManager,
  loginAccount,
  persistRefreshToken,
  readRefreshToken,
  refreshTokenKey,
  shouldRefresh,
  signupAccount,
} from './account';
export type {
  AccountAuthTransport,
  AccountCredentials,
  AccountCryptoClient,
  AccountDeps,
  AccountSession,
  AuthResponse,
  LoginCryptoResult,
  LoginRequest,
  RefreshResult,
  SignupCryptoBundle,
  SignupInput,
  SignupRequest,
} from './account';
export { registerAccountPlugin } from './register-plugin';
export { decodeDekMnemonic, encodeDekMnemonic } from './mnemonic';
export {
  KEY_QUARANTINED_ERROR,
  REKEY_PROOF_ERROR,
  assertCanPushWithKey,
  assertRekeyProofGate,
  beginRekey,
  completeRekeySwap,
  resumeRekeyAfterCrash,
  stageRekeyBlobs,
  validateCurrentMnemonic,
} from './rekey';
export type {
  BeginRekeyInput,
  RekeyAccountState,
  RekeyBlobInput,
  RekeyCrashPoint,
  RekeyDeviceGrant,
  RekeyKeyringEntry,
  RekeyProofGate,
  RekeySession,
  RekeyStagedBlob,
  RekeyTrigger,
  RetiredKeyCleanupPlan,
} from './rekey';
export {
  createSyncStatusEmitter,
  runObservedSync,
} from './sync-status';
export type {
  SyncEventEmitter,
  SyncOperationKind,
  SyncStatusEmitter,
  SyncStatusEmitterOptions,
} from './sync-status';
export { SupportFeedbackForm } from './components/SupportFeedbackForm';
export type { SupportFeedbackFormProps } from './components/SupportFeedbackForm';
export {
  TODO_SYNC_SQL,
  createTodoSyncStore,
  isTodoEntity,
  todoQueueMutation,
} from './todo-sync';
export type {
  TodoMutationOptions,
  TodoOutboxEntry,
  TodoRecord,
  TodoSyncStore,
  TodoSyncStoreOptions,
} from './todo-sync';
export {
  SyncPushRevisionMismatchError,
  SyncAccountRollbackError,
  SyncRevisionRollbackError,
  applyServerRecords,
  createSyncPullHttpTransport,
  createSyncNonceLeaseManager,
  createSyncPushHttpTransport,
  createSyncOutbox,
  createUuidV7,
  pullBatch,
  pushBatch,
} from './sync-engine';
export type {
  ApplyServerRecordsDeps,
  ApplyServerRecordsInput,
  ApplyServerRecordsResult,
  EntityState,
  EntityStateStore,
  EntityRevisionReader,
  OutboxEntry,
  PullApplyKind,
  PullBatchDeps,
  PullBatchInput,
  PullBatchRequest,
  PullBatchResponse,
  PullRecord,
  PullRecordApplier,
  PullRecordDecision,
  PushBatchDeps,
  PushBatchInput,
  PushBatchRequest,
  PushBatchResponse,
  PushRecordRequest,
  PushRecordResult,
  QueueMutationInput,
  SyncCryptoClient,
  SyncEncryptInput,
  SyncEntityRef,
  SyncNonceLease,
  SyncNonceLeaseManager,
  SyncNonceLeaseTransport,
  SyncOutbox,
  SyncPlaintext,
  SyncProgressCheckpoint,
  SyncPullFetch,
  SyncPullHttpTransportOptions,
  SyncPullTransport,
  SyncPushFetch,
  SyncPushHttpTransportOptions,
  SyncPushTransport,
} from './sync-engine';
export type { KeyHandle } from './types';
