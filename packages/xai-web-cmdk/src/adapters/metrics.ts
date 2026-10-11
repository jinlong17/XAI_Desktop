/**
 * metrics adapter — SearchAdapter for the Metric Tracker module.
 *
 * Searchable: module aliases only in V1. The module owns detailed record search.
 */

import type { WebModuleId } from "@repo/core/types";
import type { ModuleSearchAdapter, SearchHit } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "metrics";
const MODULE_LABEL = { en: "Metrics", zh: "指标追踪" };

const ALIASES = [
  "metrics",
  "metric",
  "tracker",
  "weight",
  "bmi",
  "body",
  "health",
  "指标",
  "指标追踪",
  "体重",
  "体重记录",
  "健康",
  "目标体重",
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

const metricsAdapter: ModuleSearchAdapter = (query): readonly SearchHit[] => {
  try {
    if (!query) return [makeModuleJump()];
    if (ALIASES.some((alias) => alias.includes(query))) return [makeModuleJump()];
    return [];
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, metricsAdapter);
export { metricsAdapter };
