/**
 * dashboard adapter — SearchAdapter for the Dashboard module.
 *
 * Storage: { dashOrder: xai_dash_order, clockStyle: xai_clock_style,
 *            clockTz: xai_clock_tz, zones: xai_zones }
 *
 * Searchable:
 *   - widget id + i18n label → module-jump (no entity; widget surfaces don't have own routes)
 *   - clock style → module-jump
 *   - Module name aliases: "dashboard", "仪表盘", "dash"
 *
 * Hit kind: module-jump for all (no entity routing for dashboard widgets in v1)
 *
 * test.md D1..D5
 */

import type { WebModuleId } from "@repo/core/types";
import type { SearchHit, ModuleSearchAdapter } from "../types.js";
import { registerSearchAdapter } from "../internal/registry.js";

const MODULE_ID: WebModuleId = "dashboard";
const MODULE_LABEL = { en: "Dashboard", zh: "仪表盘" };

// Known widget labels for matching
const WIDGET_LABELS: Array<{ id: string; en: string; zh: string }> = [
  { id: "clock", en: "Clock", zh: "时钟" },
  { id: "weather", en: "Weather", zh: "天气" },
  { id: "calendar", en: "Mini Calendar", zh: "迷你日历" },
  { id: "tasks", en: "Tasks", zh: "任务" },
  { id: "pomodoro", en: "Pomodoro", zh: "番茄钟" },
  { id: "habits", en: "Habits", zh: "习惯" },
  { id: "countdown", en: "Countdown", zh: "倒计时" },
  { id: "stats", en: "Statistics", zh: "统计" },
];

// Module name aliases
const MODULE_ALIASES = ["dashboard", "dash", "仪表盘", "仪表", "home", "主页"];

function makeModuleJump(): SearchHit {
  return {
    id: `${MODULE_ID}:*`,
    moduleId: MODULE_ID,
    kind: "module-jump",
    label: MODULE_LABEL,
    score: 50,
  };
}

interface DashState {
  dashOrder?: unknown;
  clockStyle?: unknown;
  clockTz?: unknown;
  zones?: unknown;
}

const dashboardAdapter: ModuleSearchAdapter = (query, state): readonly SearchHit[] => {
  try {
    // Empty query: module-jump
    if (!query) {
      return [makeModuleJump()];
    }

    // Module name alias match
    if (MODULE_ALIASES.some((alias) => alias.includes(query))) {
      return [makeModuleJump()];
    }

    const dashState = state as DashState;
    const hits: SearchHit[] = [];

    // Match active widgets against known widget labels
    const dashOrder = dashState?.dashOrder;
    if (Array.isArray(dashOrder)) {
      for (const widgetId of dashOrder) {
        if (typeof widgetId !== "string") continue;
        const wLabel = WIDGET_LABELS.find((w) => w.id === widgetId);
        const labelEn = (wLabel?.en ?? widgetId).toLowerCase();
        const labelZh = (wLabel?.zh ?? widgetId).toLowerCase();

        if (labelEn.includes(query) || labelZh.includes(query)) {
          hits.push({
            id: `${MODULE_ID}:widget:${widgetId}`,
            moduleId: MODULE_ID,
            kind: "module-jump",
            label: {
              en: wLabel?.en ?? widgetId,
              zh: wLabel?.zh ?? wLabel?.en ?? widgetId,
            },
            score: 70,
          });
          if (hits.length >= 20) return hits;
        }
      }
    }

    // Match clock style
    const clockStyle = String(dashState?.clockStyle ?? "").toLowerCase();
    if (clockStyle && clockStyle.includes(query)) {
      hits.push({
        id: `${MODULE_ID}:clock`,
        moduleId: MODULE_ID,
        kind: "module-jump",
        label: { en: "Clock", zh: "时钟" },
        score: 60,
      });
    }

    // Fallback: match widget labels from WIDGET_LABELS even if not in dashOrder
    if (hits.length === 0) {
      for (const w of WIDGET_LABELS) {
        if (
          w.en.toLowerCase().includes(query) ||
          w.zh.toLowerCase().includes(query)
        ) {
          hits.push({
            id: `${MODULE_ID}:widget:${w.id}`,
            moduleId: MODULE_ID,
            kind: "module-jump",
            label: { en: w.en, zh: w.zh },
            score: 60,
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

registerSearchAdapter(MODULE_ID, dashboardAdapter);
export { dashboardAdapter };
