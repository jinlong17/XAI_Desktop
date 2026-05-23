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
  TaskCard,
  TaskCol,
  BucketId,
  TaskTagId,
  TaskTitleBundle,
} from "./types.js";
