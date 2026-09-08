/**
 * pomodoro adapter — SearchAdapter for the Pomodoro module.
 *
 * Storage: xai_pomodoro_sessions (PomodoroSession[])
 *
 * Searchable:
 *   - per-session id substring → entity (entityId = session id) — AS2 coverage
 *   - per-session mode ("focus", "short-break", "long-break") → entity
 *   - "tomato" alias → matches → entity hits per session (AS2 acceptance scenario)
 *   - Module name aliases
 *
 * Hit kind: entity (entityId = session id); module-jump for empty query
 *
 * Expected state shape (PomodoroSession[]):
 *   Array<{ id: string; mode?: string; durationMs?: number; completedAt?: string }>
 *
 * test.md PM1..PM6 + AS2
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "pomodoro";
const MODULE_LABEL = { en: "Pomodoro", zh: "番茄钟" };

// Aliases — "tomato" included for AS2 coverage
const ALIASES = [
  "pomodoro", "pomo", "tomato", "番茄钟", "番茄", "focus", "timer",
  "short-break", "long-break", "break",
];

interface PomodoroSession {
  id: string;
  mode?: string;
  durationMs?: number;
  completedAt?: string;
}

function isPomodoroSession(v: unknown): v is PomodoroSession {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as PomodoroSession).id === "string"
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

function makeSessionHit(session: PomodoroSession): SearchHit {
  const mode = session.mode ?? "focus";
  const duration = session.durationMs
    ? `${Math.round(session.durationMs / 60000)} min`
    : "—";
  const date = session.completedAt
    ? session.completedAt.slice(0, 10)
    : "";

  return {
    id: `${MODULE_ID}:${session.id}`,
    moduleId: MODULE_ID,
    kind: "entity",
    entityId: session.id,
    label: {
      en: `Pomodoro · ${mode}`,
      zh: `番茄钟 · ${mode}`,
    },
    sub: {
      en: `${duration}${date ? ` · ${date}` : ""}`,
      zh: `${duration}${date ? ` · ${date}` : ""}`,
    },
    score: 80,
  };
}

const pomodoroAdapter: ModuleSearchAdapter = (query, state): readonly SearchHit[] => {
  try {
    // Empty query: module-jump
    if (!query) {
      return [makeModuleJump()];
    }

    // Non-empty query with non-array state: return []
    // (null/malformed state means no sessions — nothing to search)
    if (!Array.isArray(state)) {
      return [];
    }

    // Module name / "tomato" alias match → include matching sessions
    const isAlias = ALIASES.some((alias) => alias.includes(query));
    const sessions = state as unknown[];
    const hits: SearchHit[] = [];

    for (const item of sessions) {
      if (!isPomodoroSession(item)) continue;

      const idMatch = item.id.toLowerCase().includes(query);
      const modeMatch = (item.mode ?? "").toLowerCase().includes(query);
      const aliasMatch = isAlias;

      if (idMatch || modeMatch || aliasMatch) {
        hits.push(makeSessionHit(item));
        if (hits.length >= 20) break;
      }
    }

    // If alias matches but no sessions found, return module-jump
    if (hits.length === 0 && isAlias) {
      return [makeModuleJump()];
    }

    return hits;
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, pomodoroAdapter);
export { pomodoroAdapter };
