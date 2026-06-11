/**
 * @repo/plugin-web-habits — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/ directly.
 *
 * Side-effect CSS: applied once globally when this package is first imported.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 * Design: packages/xai-web-habits/docs/design.md §1.1 frozen assumption 2
 */

// Side-effect CSS import
import "./styles.css";

// ---- Components -------------------------------------------------------------
export { HabitsModule, default } from "./HabitsModule.js";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) --------
export { habitsSlotRegistration } from "./registration.js";

// ---- Public types -----------------------------------------------------------
export type {
  Habit,
  HabitId,
  HabitsState,
  DateKey,
  MonthKey,
  WeekStart,
  HabitsModuleProps,
} from "./types.js";

// ---- Constants --------------------------------------------------------------
export { HABITS_STORAGE_KEY } from "./constants.js";

export {
  readDesktopHabitsCacheStatusFromRaw,
  readDesktopHabitsCacheStatusFromStorage,
} from "./desktopCache.js";
export type { DesktopHabitsCacheStatus } from "./desktopCache.js";
