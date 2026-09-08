/**
 * meditation adapter — SearchAdapter for the Meditation module.
 *
 * Storage: xai_meditation_prefs (MeditationPrefsBlob — opaque; defensive read)
 *
 * Searchable:
 *   - scene name aliases → module-jump (single-screen module; no entity routing)
 *   - sound name aliases → module-jump
 *   - Module name aliases
 *
 * Hit kind: module-jump (single-screen module — no entity routing)
 *
 * Expected state shape (defensive):
 *   { scene?: string; sound?: string; duration?: number; durationMode?: string }
 *
 * test.md ME1..ME4
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "meditation";
const MODULE_LABEL = { en: "Meditation", zh: "冥想" };

const MODULE_ALIASES = ["meditation", "meditate", "冥想", "mindfulness", "calm", "relax"];

const SCENE_ALIASES = [
  "forest", "ocean", "rain", "mountain", "city", "night",
  "森林", "海洋", "雨", "山", "城市", "夜晚",
];

const SOUND_ALIASES = [
  "white noise", "rain sounds", "birds", "waves", "silence", "tibetan",
  "flowing water", "water", "ocean waves", "thunder", "distant thunder", "forest birds",
  "白噪音", "雨声", "鸟鸣", "浪声", "静音", "藏钵",
  "流水", "海浪", "雷鸣", "森林",
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

const meditationAdapter: ModuleSearchAdapter = (query, state): readonly SearchHit[] => {
  try {
    // Empty query: module-jump
    if (!query) {
      return [makeModuleJump()];
    }

    // Module name alias match
    if (MODULE_ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    // Scene alias match — check state.scene too
    if (SCENE_ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    // Opaque state: try to read scene/sound for matching
    if (typeof state === "object" && state !== null) {
      const blob = state as Record<string, unknown>;
      const scene = String(blob["scene"] ?? "").toLowerCase();
      const sound = String(blob["sound"] ?? "").toLowerCase();

      if (
        (scene && scene.includes(query)) ||
        (sound && sound.includes(query))
      ) {
        return [makeModuleJump()];
      }
    }

    // Sound alias match
    if (SOUND_ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    return [];
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, meditationAdapter);
export { meditationAdapter };
