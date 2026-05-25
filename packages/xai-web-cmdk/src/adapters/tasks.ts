/**
 * tasks adapter — SearchAdapter for the Tasks module.
 *
 * Storage: xai_task_cols (Record<BucketId, TaskCard[]>)
 * Searchable: per-card title.{en,zh}, sub.{en,zh}, tag
 * Hit kind: entity (entityId = card id) for matches; module-jump for empty query
 *
 * test.md T1..T6
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "tasks";
const MODULE_LABEL = { en: "Tasks", zh: "任务" };

function makeModuleJump(): SearchHit {
  return {
    id: `${MODULE_ID}:*`,
    moduleId: MODULE_ID,
    kind: "module-jump",
    label: MODULE_LABEL,
    score: 50,
  };
}

// Minimal shape predicate for a TaskCard
interface TaskCard {
  id: string;
  title?: { en?: string; zh?: string };
  sub?: { en?: string; zh?: string };
  tag?: string;
}

function isTaskCard(v: unknown): v is TaskCard {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as TaskCard).id === "string"
  );
}

const tasksAdapter: ModuleSearchAdapter = (query, state): readonly SearchHit[] => {
  try {
    // Empty query: return module-jump only
    if (!query) {
      return [makeModuleJump()];
    }

    // State: Record<BucketId, TaskCard[]>
    if (typeof state !== "object" || state === null) {
      return [];
    }

    const cols = state as Record<string, unknown[]>;
    const hits: SearchHit[] = [];

    for (const cards of Object.values(cols)) {
      if (!Array.isArray(cards)) continue;
      for (const card of cards) {
        if (!isTaskCard(card)) continue;

        const titleEn = (card.title?.en ?? "").toLowerCase();
        const titleZh = (card.title?.zh ?? "").toLowerCase();
        const subEn = (card.sub?.en ?? "").toLowerCase();
        const subZh = (card.sub?.zh ?? "").toLowerCase();
        const tag = (card.tag ?? "").toLowerCase();

        if (
          titleEn.includes(query) ||
          titleZh.includes(query) ||
          subEn.includes(query) ||
          subZh.includes(query) ||
          tag.includes(query)
        ) {
          hits.push({
            id: `${MODULE_ID}:${card.id}`,
            moduleId: MODULE_ID,
            kind: "entity",
            entityId: card.id,
            label: {
              en: card.title?.en ?? card.id,
              zh: card.title?.zh ?? card.title?.en ?? card.id,
            },
            sub: card.sub
              ? { en: card.sub.en ?? "", zh: card.sub.zh ?? "" }
              : undefined,
            score: 80,
          });

          // Adapter-level cap: 20 hits
          if (hits.length >= 20) break;
        }
      }
      if (hits.length >= 20) break;
    }

    return hits;
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, tasksAdapter);
export { tasksAdapter };
