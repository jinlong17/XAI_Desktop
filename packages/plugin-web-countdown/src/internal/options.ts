import type {
  CountdownCategoryOption,
  CountdownColorOption,
  CountdownDisplayStyleOption,
  CountdownIconOption,
} from "../types.js";

export const COUNTDOWN_COLORS: readonly CountdownColorOption[] = Object.freeze([
  { id: "red", label_en: "Poppy", label_zh: "朱红", accent: "#c24132", soft: "rgba(194, 65, 50, 0.14)", ink: "#fff7ed" },
  { id: "amber", label_en: "Amber", label_zh: "琥珀", accent: "#b7791f", soft: "rgba(183, 121, 31, 0.16)", ink: "#fffaf0" },
  { id: "green", label_en: "Sage", label_zh: "鼠尾草", accent: "#4f7d5a", soft: "rgba(79, 125, 90, 0.16)", ink: "#f3fbf5" },
  { id: "teal", label_en: "Teal", label_zh: "青绿", accent: "#2f7f7a", soft: "rgba(47, 127, 122, 0.15)", ink: "#f0fffd" },
  { id: "blue", label_en: "Steel", label_zh: "钢蓝", accent: "#3d6f9f", soft: "rgba(61, 111, 159, 0.15)", ink: "#f5fbff" },
  { id: "indigo", label_en: "Ink", label_zh: "靛青", accent: "#5a5f94", soft: "rgba(90, 95, 148, 0.15)", ink: "#f7f7ff" },
  { id: "slate", label_en: "Slate", label_zh: "石板", accent: "#5f6b76", soft: "rgba(95, 107, 118, 0.15)", ink: "#f8fafc" },
] as CountdownColorOption[]);

export const COUNTDOWN_ICONS: readonly CountdownIconOption[] = Object.freeze([
  { id: "calendar", label_en: "Calendar", label_zh: "日历" },
  { id: "gift", label_en: "Gift", label_zh: "礼物" },
  { id: "spark", label_en: "Spark", label_zh: "星芒" },
  { id: "flag", label_en: "Flag", label_zh: "旗帜" },
  { id: "moon", label_en: "Moon", label_zh: "月相" },
  { id: "ring", label_en: "Ring", label_zh: "圆环" },
  { id: "target", label_en: "Target", label_zh: "目标" },
  { id: "pin", label_en: "Pin", label_zh: "固定" },
] as CountdownIconOption[]);

export const COUNTDOWN_CATEGORIES: readonly CountdownCategoryOption[] = Object.freeze([
  { id: "holiday", label_en: "Holiday", label_zh: "节日" },
  { id: "month", label_en: "Monthly", label_zh: "月度" },
  { id: "quarter", label_en: "Quarter", label_zh: "季度" },
  { id: "year", label_en: "Year", label_zh: "年度" },
  { id: "custom", label_en: "Custom", label_zh: "自定义" },
] as CountdownCategoryOption[]);

export const COUNTDOWN_STYLES: readonly CountdownDisplayStyleOption[] = Object.freeze([
  { id: "digital", label_en: "Digital", label_zh: "数字" },
  { id: "date", label_en: "Date", label_zh: "日期" },
  { id: "progress", label_en: "Progress", label_zh: "进度条" },
  { id: "notion", label_en: "Segmented progress", label_zh: "分段进度" },
  { id: "ring", label_en: "Ring", label_zh: "圆环" },
  { id: "minimal", label_en: "Minimal", label_zh: "极简" },
  { id: "hero", label_en: "Big number", label_zh: "大数字" },
  { id: "festival", label_en: "Festival", label_zh: "节日卡片" },
  { id: "timeline", label_en: "Timeline", label_zh: "时间线" },
  { id: "compact", label_en: "Compact", label_zh: "紧凑" },
] as CountdownDisplayStyleOption[]);

export function hasOption<T extends { readonly id: string }>(options: readonly T[], id: string): boolean {
  return options.some((option) => option.id === id);
}

export function colorById(id: string | null | undefined): CountdownColorOption {
  return COUNTDOWN_COLORS.find((color) => color.id === id) ?? COUNTDOWN_COLORS[0]!;
}
