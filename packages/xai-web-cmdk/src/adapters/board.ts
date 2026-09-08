/**
 * board adapter — SearchAdapter for the Board (Kanban) module.
 *
 * Storage: { boards: xai_boards_v2, active: xai_active_board,
 *            panels: xai_board_panels, inbox: xai_board_inbox }
 * Read order: [boards, active, panels, inbox] — deterministic (O4)
 *
 * Searchable:
 *   - board name {en,zh} → module-jump
 *   - per-card title {en,zh} → entity (entityId = card id)
 *   - per-card labels → entity
 *
 * test.md B1..B6
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "board";
const MODULE_LABEL = { en: "Boards", zh: "看板" };

function makeModuleJump(): SearchHit {
  return {
    id: `${MODULE_ID}:*`,
    moduleId: MODULE_ID,
    kind: "module-jump",
    label: MODULE_LABEL,
    score: 50,
  };
}

interface BoardState {
  boards?: unknown;
  active?: unknown;
  panels?: unknown;
  inbox?: unknown;
}

interface Board {
  id?: string;
  name?: { en?: string; zh?: string };
  lists?: BoardList[];
}

interface BoardList {
  id?: string;
  cards?: BoardCard[];
}

interface BoardCard {
  id: string;
  title?: { en?: string; zh?: string };
  labels?: string[];
}

function isBoardCard(v: unknown): v is BoardCard {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as BoardCard).id === "string"
  );
}

const boardAdapter: ModuleSearchAdapter = (query, state): readonly SearchHit[] => {
  try {
    // Empty query: module-jump only
    if (!query) {
      return [makeModuleJump()];
    }

    const boardState = state as BoardState;
    if (typeof boardState !== "object" || boardState === null) {
      return [];
    }

    const boards = boardState.boards;
    if (!Array.isArray(boards)) {
      return [];
    }

    const hits: SearchHit[] = [];

    for (const board of boards) {
      const b = board as Board;
      if (typeof b !== "object" || b === null) continue;

      // Match board name
      const nameEn = (b.name?.en ?? "").toLowerCase();
      const nameZh = (b.name?.zh ?? "").toLowerCase();
      if (nameEn.includes(query) || nameZh.includes(query)) {
        hits.push({
          id: `${MODULE_ID}:board:${b.id ?? "*"}`,
          moduleId: MODULE_ID,
          kind: "module-jump",
          label: {
            en: b.name?.en ?? "Board",
            zh: b.name?.zh ?? b.name?.en ?? "Board",
          },
          score: 70,
        });
        if (hits.length >= 20) return hits;
      }

      // Match card titles and labels
      if (!Array.isArray(b.lists)) continue;
      for (const list of b.lists) {
        if (typeof list !== "object" || list === null) continue;
        const l = list as BoardList;
        if (!Array.isArray(l.cards)) continue;

        for (const card of l.cards) {
          if (!isBoardCard(card)) continue;

          const titleEn = (card.title?.en ?? "").toLowerCase();
          const titleZh = (card.title?.zh ?? "").toLowerCase();
          const labels = (card.labels ?? []).map((lbl) => lbl.toLowerCase());

          if (
            titleEn.includes(query) ||
            titleZh.includes(query) ||
            labels.some((lbl) => lbl.includes(query))
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
              score: 80,
            });
            if (hits.length >= 20) return hits;
          }
        }
      }
    }

    return hits;
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, boardAdapter);
export { boardAdapter };
