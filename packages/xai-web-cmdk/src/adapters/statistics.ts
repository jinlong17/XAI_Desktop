/**
 * statistics adapter — SearchAdapter for the Statistics module.
 *
 * Storage: (none — Statistics is a read-only aggregator; no own data)
 * Searchable: module name aliases only
 * Hit kind: module-jump only
 *
 * test.md ST1..ST3
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "statistics";
const MODULE_LABEL = { en: "Statistics", zh: "统计" };

const ALIASES = [
  "statistics", "stats", "统计", "graph", "chart", "data",
  "analysis", "analytics", "分析", "图表",
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
const statisticsAdapter: ModuleSearchAdapter = (query, _stateUnused): readonly SearchHit[] => {
  try {
    // Empty query: module-jump
    if (!query) {
      return [makeModuleJump()];
    }

    // Alias match
    if (ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    return [];
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, statisticsAdapter);
export { statisticsAdapter };
