/**
 * matrix adapter — SearchAdapter for the Eisenhower Matrix module.
 *
 * Storage: xai_matrix_state (MatrixStateBlob — opaque; defensive read)
 *
 * Searchable:
 *   - per-quadrant item titles (defensive predicate)
 *   - Module name aliases
 *
 * Hit kind: entity (entityId = card id within quadrant); module-jump for empty query
 *
 * Expected state shape (defensive):
 *   { q1?: MatrixItem[], q2?: MatrixItem[], q3?: MatrixItem[], q4?: MatrixItem[] }
 * where MatrixItem: { id: string; title?: { en?: string; zh?: string } }
 *
 * test.md MX1..MX5
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "matrix";
const MODULE_LABEL = { en: "Matrix", zh: "四象限" };

const ALIASES = ["matrix", "eisenhower", "quadrant", "四象限", "优先级", "priority"];

interface MatrixItem {
  id: string;
  title?: { en?: string; zh?: string };
}

function isMatrixItem(v: unknown): v is MatrixItem {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as MatrixItem).id === "string"
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

const matrixAdapter: ModuleSearchAdapter = (query, state): readonly SearchHit[] => {
  try {
    // Empty query: module-jump
    if (!query) {
      return [makeModuleJump()];
    }

    // Module name alias match
    if (ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    // State: opaque blob — defensive read
    if (typeof state !== "object" || state === null) {
      return [];
    }

    const blob = state as Record<string, unknown>;
    const hits: SearchHit[] = [];
    const quadrants = ["q1", "q2", "q3", "q4"];

    for (const quad of quadrants) {
      const items = blob[quad];
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        if (!isMatrixItem(item)) continue;

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
            sub: { en: quad.toUpperCase(), zh: quad.toUpperCase() },
            score: 80,
          });

          if (hits.length >= 20) return hits;
        }
      }
    }

    return hits;
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, matrixAdapter);
export { matrixAdapter };
