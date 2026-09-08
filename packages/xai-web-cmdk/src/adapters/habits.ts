/**
 * habits adapter — SearchAdapter for the Habits module.
 *
 * Storage: xai_habits_state (HabitsStateBlob — opaque; defensive read)
 *
 * Searchable:
 *   - per-habit name.{en,zh} → entity (entityId = habit id)
 *   - Module name aliases
 *
 * Expected state shape (defensive):
 *   { habits?: Array<{ id: string; name?: { en?: string; zh?: string } }> }
 *
 * Hit kind: entity (entityId = habit id); module-jump for empty query
 *
 * test.md H1..H5
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "habits";
const MODULE_LABEL = { en: "Habits", zh: "习惯" };

const ALIASES = ["habits", "habit", "习惯", "routine", "daily", "每日", "streak"];

interface HabitEntry {
  id: string;
  name?: { en?: string; zh?: string };
}

function isHabitEntry(v: unknown): v is HabitEntry {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as HabitEntry).id === "string"
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

const habitsAdapter: ModuleSearchAdapter = (query, state): readonly SearchHit[] => {
  try {
    // Empty query: module-jump
    if (!query) {
      return [makeModuleJump()];
    }

    // Module name alias match
    if (ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    // Defensive read: state is opaque blob
    if (typeof state !== "object" || state === null) {
      return [];
    }

    const blob = state as Record<string, unknown>;
    const habitList = blob["habits"];

    if (!Array.isArray(habitList)) {
      return [];
    }

    const hits: SearchHit[] = [];

    for (const item of habitList) {
      if (!isHabitEntry(item)) continue;

      const nameEn = (item.name?.en ?? "").toLowerCase();
      const nameZh = (item.name?.zh ?? "").toLowerCase();

      if (nameEn.includes(query) || nameZh.includes(query)) {
        hits.push({
          id: `${MODULE_ID}:${item.id}`,
          moduleId: MODULE_ID,
          kind: "entity",
          entityId: item.id,
          label: {
            en: item.name?.en ?? item.id,
            zh: item.name?.zh ?? item.name?.en ?? item.id,
          },
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

registerSearchAdapter(MODULE_ID, habitsAdapter);
export { habitsAdapter };
