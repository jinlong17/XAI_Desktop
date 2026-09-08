/**
 * calendar adapter — SearchAdapter for the Calendar module.
 *
 * Storage: (none — Calendar has no own searchable data in v1)
 * Searchable: module name aliases only
 * Hit kind: module-jump only
 *
 * test.md C1..C4
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "calendar";
const MODULE_LABEL = { en: "Calendar", zh: "日历" };

// Module name aliases (bilingual, all lowercase)
const ALIASES = [
  "calendar", "cal", "日历", "月历", "month", "week", "day",
  "schedule", "日程", "agenda",
];

function makeModuleJump(): SearchHit {
  return {
    id: `${MODULE_ID}:*`,
    moduleId: MODULE_ID,
    kind: "module-jump",
    label: MODULE_LABEL,
    score: 50,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calendarAdapter: ModuleSearchAdapter = (query, _stateUnused): readonly SearchHit[] => {
  try {
    // Empty query: module-jump
    if (!query) {
      return [makeModuleJump()];
    }

    // Match against aliases
    if (ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    return [];
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, calendarAdapter);
export { calendarAdapter };
