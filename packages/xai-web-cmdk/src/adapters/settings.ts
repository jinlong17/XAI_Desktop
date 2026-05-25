/**
 * settings adapter — SearchAdapter for the Settings module.
 *
 * Storage: paneRegistry from @repo/plugin-web-settings-shell (typed const array;
 *          no localStorage read — this is a module import, not a storage key).
 *
 * Searchable:
 *   - pane label i18n key → settings-pane hit (entityId = pane id)
 *   - Module name aliases
 *
 * Hit kind: settings-pane (entityId = pane id); module-jump for Settings root
 *
 * Note: The pane label text is derived from the i18nKey (e.g., "settings.account"
 * → "account"). In production the full i18n string is rendered, but for search
 * we match against the pane id + common labels.
 *
 * test.md SE1..SE6
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "settings";
const MODULE_LABEL = { en: "Settings", zh: "设置" };

const MODULE_ALIASES = ["settings", "设置", "preferences", "config", "options"];

// Bilingual pane label map (id → {en, zh}) for search matching
// Mirrors paneRegistry ids + common English/Chinese search terms
const PANE_LABELS: Record<string, { en: string; zh: string }> = {
  account: { en: "Account", zh: "账号" },
  premium: { en: "Premium", zh: "会员" },
  features: { en: "Features", zh: "功能开关" },
  smart_lists: { en: "Smart Lists", zh: "智能列表" },
  notifications: { en: "Notifications", zh: "通知" },
  date_time: { en: "Date & Time", zh: "日期与时间" },
  appearance: { en: "Appearance", zh: "外观" },
  ai: { en: "AI", zh: "AI" },
  more: { en: "More", zh: "更多" },
  integrations: { en: "Integrations", zh: "集成" },
  collaborate: { en: "Collaborate", zh: "协作" },
  sticky: { en: "Sticky Notes", zh: "便签" },
  hotkeys: { en: "Hotkeys", zh: "快捷键" },
  about: { en: "About", zh: "关于" },
};

function makeModuleJump(): SearchHit {
  return {
    id: `${MODULE_ID}:*`,
    moduleId: MODULE_ID,
    kind: "module-jump",
    label: MODULE_LABEL,
    score: 50,
  };
}

interface PaneEntry {
  id: string;
}

function isPaneEntry(v: unknown): v is PaneEntry {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as PaneEntry).id === "string"
  );
}

const settingsAdapter: ModuleSearchAdapter = (query, state): readonly SearchHit[] => {
  try {
    // Empty query: module-jump (settings root)
    if (!query) {
      return [makeModuleJump()];
    }

    // Module name alias match
    if (MODULE_ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    // state is the paneRegistry array
    let panes: PaneEntry[] = [];

    if (Array.isArray(state)) {
      panes = state.filter(isPaneEntry);
    } else {
      // Defensive: use PANE_LABELS keys as fallback
      panes = Object.keys(PANE_LABELS).map((id) => ({ id }));
    }

    const hits: SearchHit[] = [];

    for (const pane of panes) {
      const labels = PANE_LABELS[pane.id];
      if (!labels) continue;

      const labelEn = labels.en.toLowerCase();
      const labelZh = labels.zh.toLowerCase();

      if (labelEn.includes(query) || labelZh.includes(query)) {
        hits.push({
          id: `${MODULE_ID}:${pane.id}`,
          moduleId: MODULE_ID,
          kind: "settings-pane",
          entityId: pane.id,
          label: {
            en: `Settings › ${labels.en}`,
            zh: `设置 › ${labels.zh}`,
          },
          score: 85,
        });

        if (hits.length >= 20) break;
      }
    }

    return hits;
  } catch {
    return [];
  }
};

registerSearchAdapter(MODULE_ID, settingsAdapter);
export { settingsAdapter };
