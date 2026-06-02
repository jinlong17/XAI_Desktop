import "./styles.css";

export { TimeTrackerModule } from "./TimeTrackerModule.js";
export { timeTrackerWebModuleRegistration } from "./registration.js";
export {
  TIME_TRACKER_CATEGORIES_KEY,
  TIME_TRACKER_ENTRIES_KEY,
  TIME_TRACKER_MODE_KEY,
  TIME_TRACKER_STORAGE_EVENT,
  createTimeTrackerEntry,
  getTimeTrackerSnapshot,
  readTimeTrackerCategories,
  readTimeTrackerEntries,
  writeTimeTrackerEntries,
} from "./internal/storage.js";
export {
  dayKey,
  entryDuration,
  entryStart,
  formatDuration,
  formatTimer,
  isActiveEntry,
  isRunningEntry,
  startOfDay,
  startOfWeek,
} from "./internal/time.js";
export type {
  LocalizedText,
  TimeTrackerCategory,
  TimeTrackerEntry,
  TimeTrackerMode,
  TimeTrackerSegment,
  TimeTrackerSnapshot,
  TimeTrackerSubcategory,
} from "./types.js";
