import "./internal/accountMigration.js";
/**
 * @repo/plugin-web-pomodoro — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/.
 *
 * API contract: packages/xai-web-pomodoro/docs/api.md §0
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 *
 * NOTE: pomodoroWebModuleRegistration is added to this surface in P3
 * (shell slot registration + host wire-up phase).
 */

// Side-effect CSS — applied once globally when this package is first imported.
import "./styles.css";

// ---- Components ------------------------------------------------------------
export { PomodoroModule } from "./PomodoroModule.js";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) -------
export { pomodoroWebModuleRegistration } from "./registration.js";

// ---- Public types ----------------------------------------------------------
export type {
  PomodoroSession,
  PomodoroMode,
} from "./types.js";

// ---- Constants -------------------------------------------------------------
export { DEFAULT_DURATIONS_MS } from "./internal/durations.js";
