/**
 * countdown adapter — SearchAdapter for the Countdown module.
 *
 * Storage: xai_countdowns (Countdown[])
 *
 * Searchable:
 *   - per-countdown title.{en,zh} → entity (entityId = countdown id)
 *   - Module name aliases
 *
 * Expected state shape (Countdown[]):
 *   Array<{ id: string; title?: { en?: string; zh?: string }; targetDate?: string }>
 *
 * Hit kind: entity (entityId = countdown id); module-jump for empty query
 *
 * test.md CD1..CD5
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "countdown";
const MODULE_LABEL = { en: "Countdown", zh: "倒计时" };

const ALIASES = ["countdown", "count", "倒计时", "timer", "event", "deadline"];

interface CountdownItem {
  id: string;
  title?: { en?: string; zh?: string };
  targetDate?: string;
}

function isCountdownItem(v: unknown): v is CountdownItem {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as CountdownItem).id === "string"
  );
}

function makeModuleJump(): SearchHit {
  return {
    id: `${MODULE_ID}:*`,
    moduleId: MODULE_ID,
    kind: "module-jump",
    label: MODULE_LABEL,
    score: 50,
  };
}

const countdownAdapter: ModuleSearchAdapter = (query, state): readonly SearchHit[] => {
  try {
    // Empty query: module-jump
    if (!query) {
      return [makeModuleJump()];
    }

    // Module name alias match
    if (ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    if (!Array.isArray(state)) {
      return [];
    }

    const hits: SearchHit[] = [];

    for (const item of state) {
      if (!isCountdownItem(item)) continue;

      const titleEn = (item.title?.en ?? "").toLowerCase();
      const titleZh = (item.title?.zh ?? "").toLowerCase();

      if (titleEn.includes(query) || titleZh.includes(query)) {
        hits.push({
          id: `${MODULE_ID}:${item.id}`,
          moduleId: MODULE_ID,
          kind: "entity",
          entityId: item.id,
          label: {
            en: item.title?.en ?? item.id,
            zh: item.title?.zh ?? item.title?.en ?? item.id,
          },
          sub: item.targetDate
            ? { en: item.targetDate, zh: item.targetDate }
            : undefined,
          score: 80,
        });

        if (hits.length >= 20) break;
      }
    }

    return hits;
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, countdownAdapter);
export { countdownAdapter };
