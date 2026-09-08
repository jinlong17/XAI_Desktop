/**
 * Pure helpers for the dashboard greeting band + bilingual date string.
 *
 * Greeting bands use the local hour (matches the prototype at
 * web design/module-dashboard.jsx:132-138).
 */
import type { Lang } from "@repo/plugin-web-tokens";

export type GreetingKey =
  | "dashboard.good_morning"
  | "dashboard.good_afternoon"
  | "dashboard.good_evening";

/** Pick the i18n key for the greeting band given a local-time Date. */
export function pickGreetingKey(now: Date): GreetingKey {
  const h = now.getHours();
  if (h < 12) return "dashboard.good_morning";
  if (h < 18) return "dashboard.good_afternoon";
  return "dashboard.good_evening";
}

const ZH_WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] as const;

/** Format the dashboard date subline. ZH form matches prototype line 140; EN uses toLocaleDateString. */
export function formatDashboardDate(now: Date, lang: Lang): string {
  if (lang === "zh") {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const wd = ZH_WEEKDAYS[now.getDay()]!;
    return `${y} 年 ${m} 月 ${d} 日 · ${wd}`;
  }
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
