/**
 * @repo/plugin-web-tasks — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * API contract: packages/xai-web-tasks/docs/api.md §0
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 */

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Component ---------------------------------------------------------------
export { TasksModule } from "./TasksModule.js";
export type { TasksModuleProps } from "./TasksModule.js";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) ---------
export { tasksWebModuleRegistration } from "./registration.js";

// ---- Public types ------------------------------------------------------------
export type {
  BoardTaskLinkSource,
  TaskCard,
  TaskCol,
  BucketId,
  TaskTagId,
  TaskTitleBundle,
  NewTaskDraft,
} from "./types.js";

export {
  boardLinkedTaskId,
  bucketIdForBoardDueDate,
  findBoardLinkedTask,
  loadTaskColsOrSeed,
  taskCardFromBoardLink,
  upsertBoardLinkedTask,
} from "./taskLink.js";
export type {
  BoardLinkedTaskInput,
  BoardLinkedTaskLookup,
} from "./taskLink.js";

// ---- AI tool layer subscriber (additive — P4 xai-web-ai-tool-layer) ----------
export { useTaskCreateRequestSubscriber } from "./internal/aiCreateSubscriber.js";

// ---- AI tool layer mutate subscriber (additive — P2 xai-web-ai-tool-edit-delete) ----------
export { useTaskMutateRequestSubscriber } from "./internal/aiMutateSubscriber.js";

// ---- Desktop App compatibility seams ---------------------------------------
// Kept out of the Web rail UI, but retained so desktop native reminder/cache
// packages keep compiling while the Mac app mirrors the Web shell by default.
export {
  projectDesktopTaskReminderEntries,
} from "./projectDesktopTaskReminderEntries.js";
export type {
  DesktopTaskReminderEntry,
  DesktopTaskReminderUnsupportedReason,
  TaskDefaultReminderAll,
  TaskDefaultReminderDue,
} from "./projectDesktopTaskReminderEntries.js";
export {
  TASK_CACHE_STORAGE_KEY,
  isReadableTaskCachePayload,
  readDesktopTaskCacheStatusFromRaw,
  readDesktopTaskCacheStatusFromStorage,
} from "./desktopCache.js";
export type { DesktopTaskCacheStatus } from "./desktopCache.js";
