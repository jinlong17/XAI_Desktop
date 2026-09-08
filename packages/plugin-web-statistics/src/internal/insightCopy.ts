/**
 * @internal — insight callout copy.
 *
 * Pure function: (lang, vars) → string. Template-interpolated, never
 * concatenated. Three range-aware bilingual templates + an empty-state
 * branch when peakHourLabel === null.
 *
 * api.md §5.10.
 */

import type { Lang } from "@repo/plugin-web-tokens";
import type { RangeId } from "../types.js";

export interface InsightVars {
  /** "09:00" formatted peak hour, or null when there is no focus data. */
  peakHourLabel: string | null;
  /** Trend display like "+8%", "-5%", "—". */
  focusTrendStr: string;
  range: RangeId;
}

export function insightCopy(lang: Lang, vars: InsightVars): string {
  if (vars.peakHourLabel === null) {
    return lang === "zh"
      ? "完成一次专注后，这里会显示本次洞察。"
      : "Once you log a focus session, an insight will appear here.";
  }

  const peak = vars.peakHourLabel;
  const trend = vars.focusTrendStr;

  if (vars.range === "week") {
    return lang === "zh"
      ? `你在 ${peak} 左右最高产，专注时长比上周 ${trend}。继续保持上午的节奏。`
      : `You're sharpest around ${peak}, and your focus time is ${trend} vs last week. Keep the morning rhythm.`;
  }
  if (vars.range === "month") {
    return lang === "zh"
      ? `你在 ${peak} 左右最高产，专注时长比上月 ${trend}。节奏稳定。`
      : `You're sharpest around ${peak}, and your focus time is ${trend} vs last month. Steady rhythm.`;
  }
  // range === "all"
  return lang === "zh"
    ? `你在 ${peak} 左右最高产，专注时长比上一周期 ${trend}。长期稳健。`
    : `You're sharpest around ${peak}, and your focus time is ${trend} vs the prior period. Long-game energy.`;
}
