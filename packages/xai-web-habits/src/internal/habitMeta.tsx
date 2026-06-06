/**
 * @internal — Habit presentation metadata.
 *
 * The icon renderer intentionally follows the Pomodoro module's 24px
 * stroke-based icon system so habit icons and time-tracking controls share a
 * visual language without importing another package's internals.
 */

import React from "react";
import type {
  Habit,
  HabitCategory,
  HabitColorName,
  HabitFrequencyName,
  HabitIconName,
} from "../types.js";
import type { Lang } from "@repo/plugin-web-tokens";

interface IconProps {
  name: HabitIconName;
  size?: number;
  className?: string;
}

export const HABIT_ICON_CHOICES: readonly {
  id: HabitIconName;
  label: { en: string; zh: string };
}[] = [
  { id: "run", label: { en: "Run", zh: "跑步" } },
  { id: "water", label: { en: "Water", zh: "喝水" } },
  { id: "book", label: { en: "Read", zh: "阅读" } },
  { id: "dumbbell", label: { en: "Gym", zh: "健身" } },
  { id: "code", label: { en: "Code", zh: "写代码" } },
  { id: "study", label: { en: "Study", zh: "学习" } },
  { id: "sleep", label: { en: "Sleep", zh: "睡眠" } },
  { id: "meditate", label: { en: "Meditate", zh: "冥想" } },
  { id: "coffee", label: { en: "Coffee", zh: "咖啡" } },
  { id: "bike", label: { en: "Bike", zh: "骑行" } },
  { id: "walk", label: { en: "Walk", zh: "散步" } },
  { id: "heart", label: { en: "Health", zh: "健康" } },
  { id: "moon", label: { en: "Night", zh: "夜间" } },
  { id: "sun", label: { en: "Morning", zh: "早晨" } },
  { id: "music", label: { en: "Music", zh: "音乐" } },
  { id: "journal", label: { en: "Journal", zh: "日记" } },
  { id: "language", label: { en: "Language", zh: "语言" } },
  { id: "laptop", label: { en: "Laptop", zh: "电脑" } },
  { id: "paper", label: { en: "Paper", zh: "论文" } },
  { id: "calendar", label: { en: "Schedule", zh: "日程" } },
  { id: "plant", label: { en: "Plant", zh: "成长" } },
  { id: "sparkle", label: { en: "Spark", zh: "灵感" } },
  { id: "target", label: { en: "Goal", zh: "目标" } },
  { id: "timer", label: { en: "Timer", zh: "计时" } },
];

export const HABIT_COLOR_CHOICES: readonly {
  id: HabitColorName;
  cssVar: string;
  label: { en: string; zh: string };
}[] = [
  { id: "accent", cssVar: "var(--accent)", label: { en: "Sage", zh: "青绿" } },
  { id: "blue", cssVar: "var(--blue)", label: { en: "Blue", zh: "蓝色" } },
  { id: "amber", cssVar: "var(--amber)", label: { en: "Amber", zh: "琥珀" } },
  { id: "red", cssVar: "var(--red)", label: { en: "Red", zh: "红色" } },
  { id: "pink", cssVar: "var(--pink)", label: { en: "Rose", zh: "玫瑰" } },
];

export const HABIT_CATEGORY_CHOICES: readonly {
  id: HabitCategory;
  label: { en: string; zh: string };
}[] = [
  { id: "health", label: { en: "Health", zh: "健康" } },
  { id: "fitness", label: { en: "Fitness", zh: "运动" } },
  { id: "learning", label: { en: "Learning", zh: "学习" } },
  { id: "work", label: { en: "Work", zh: "工作" } },
  { id: "mindfulness", label: { en: "Mindfulness", zh: "正念" } },
  { id: "personal", label: { en: "Personal", zh: "个人" } },
];

export const HABIT_FREQUENCY_CHOICES: readonly {
  id: HabitFrequencyName;
  label: { en: string; zh: string };
}[] = [
  { id: "daily", label: { en: "Every day", zh: "每天" } },
  { id: "weekdays", label: { en: "Weekdays", zh: "工作日" } },
  { id: "weekends", label: { en: "Weekends", zh: "周末" } },
  { id: "weekly", label: { en: "Weekly", zh: "每周" } },
];

const EMOJI_BY_ICON: Record<HabitIconName, string> = {
  run: "🏃",
  water: "💧",
  book: "📚",
  dumbbell: "🏋️",
  code: "💻",
  study: "🎓",
  sleep: "😴",
  meditate: "🧘",
  coffee: "☕",
  bike: "🚲",
  walk: "🚶",
  heart: "❤️",
  moon: "🌙",
  sun: "☀️",
  music: "🎵",
  journal: "📝",
  language: "🗣️",
  laptop: "💻",
  paper: "📄",
  calendar: "📅",
  plant: "🌱",
  sparkle: "✨",
  target: "🎯",
  timer: "⏱️",
};

function iconBase(size: number, className?: string) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
    focusable: false as const,
  };
}

export function HabitIcon({ name, size = 18, className }: IconProps) {
  switch (name) {
    case "run":
      return (
        <svg {...iconBase(size, className)}>
          <circle cx="13" cy="4" r="2" />
          <path d="M8 21l3-6-2-3-3 3" />
          <path d="M15 8l-3 2 3 3 4 1" />
          <path d="M11 15l5 6" />
        </svg>
      );
    case "water":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
          <path d="M9 15a3 3 0 0 0 4 2.8" />
        </svg>
      );
    case "book":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H7a3 3 0 0 0-3 3z" />
          <path d="M4 5.5V22" />
          <path d="M8 7h8" />
        </svg>
      );
    case "dumbbell":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12" />
        </svg>
      );
    case "code":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M8 9l-4 3 4 3" />
          <path d="M16 9l4 3-4 3" />
          <path d="M14 5l-4 14" />
        </svg>
      );
    case "study":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M3 8l9-4 9 4-9 4z" />
          <path d="M7 10v5c3 2 7 2 10 0v-5" />
          <path d="M21 8v5" />
        </svg>
      );
    case "sleep":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M5 11a7 7 0 0 0 9 9 8 8 0 1 1-9-9z" />
          <path d="M16 4h5l-5 6h5" />
        </svg>
      );
    case "meditate":
      return (
        <svg {...iconBase(size, className)}>
          <circle cx="12" cy="5" r="2" />
          <path d="M12 8v5" />
          <path d="M7 12l5 1 5-1" />
          <path d="M9 14l-5 5h6l2-3 2 3h6l-5-5" />
        </svg>
      );
    case "coffee":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
          <path d="M16 10h2a2 2 0 0 1 0 4h-2" />
          <path d="M7 21h9" />
          <path d="M8 3v2M12 3v2" />
        </svg>
      );
    case "bike":
      return (
        <svg {...iconBase(size, className)}>
          <circle cx="6" cy="17" r="3" />
          <circle cx="18" cy="17" r="3" />
          <path d="M8 17l4-8 3 8M12 9h4M10 6h3" />
        </svg>
      );
    case "walk":
      return (
        <svg {...iconBase(size, className)}>
          <circle cx="12" cy="4" r="2" />
          <path d="M11 7l-2 6-3 3" />
          <path d="M13 9l3 3 3 1" />
          <path d="M10 13l4 8" />
        </svg>
      );
    case "heart":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M20.8 8.6a5.5 5.5 0 0 0-9.8-3.4A5.5 5.5 0 0 0 1.2 8.6C1.2 14 12 21 12 21s10.8-7 10.8-12.4z" />
        </svg>
      );
    case "moon":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
        </svg>
      );
    case "sun":
      return (
        <svg {...iconBase(size, className)}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "music":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
      );
    case "journal":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M6 3h11a2 2 0 0 1 2 2v16H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" />
          <path d="M7 8h8M7 12h7" />
        </svg>
      );
    case "language":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M4 5h9M9 3v2" />
          <path d="M5 9c1 3 3 5 7 6" />
          <path d="M12 5c-.5 5-3 8-7 10" />
          <path d="M14 21l4-9 4 9" />
          <path d="M15.5 18h5" />
        </svg>
      );
    case "laptop":
      return (
        <svg {...iconBase(size, className)}>
          <rect x="4" y="5" width="16" height="11" rx="2" />
          <path d="M2 19h20" />
        </svg>
      );
    case "paper":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M7 3h7l5 5v13H7z" />
          <path d="M14 3v6h5" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...iconBase(size, className)}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      );
    case "plant":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M12 21V10" />
          <path d="M12 12C8 12 5 9 5 5c4 0 7 3 7 7z" />
          <path d="M12 14c4 0 7-3 7-7-4 0-7 3-7 7z" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...iconBase(size, className)}>
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
          <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
        </svg>
      );
    case "target":
      return (
        <svg {...iconBase(size, className)}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    case "timer":
      return (
        <svg {...iconBase(size, className)}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 13V8M12 13l4 2M9 2h6" />
        </svg>
      );
  }
}

export function habitColorCss(color: HabitColorName | undefined): string {
  return HABIT_COLOR_CHOICES.find((choice) => choice.id === color)?.cssVar ?? "var(--accent)";
}

export function habitIconName(habit: Habit): HabitIconName {
  return habit.icon ?? inferIconFromEmoji(habit.emoji);
}

export function habitEmojiForIcon(icon: HabitIconName): string {
  return EMOJI_BY_ICON[icon];
}

export function labelForCategory(category: HabitCategory | undefined, lang: Lang): string {
  const choice = HABIT_CATEGORY_CHOICES.find((item) => item.id === category);
  return choice?.label[lang] ?? (lang === "zh" ? "个人" : "Personal");
}

export function labelForFrequency(frequency: HabitFrequencyName | undefined, lang: Lang): string {
  const choice = HABIT_FREQUENCY_CHOICES.find((item) => item.id === frequency);
  return choice?.label[lang] ?? (lang === "zh" ? "每天" : "Every day");
}

function inferIconFromEmoji(emoji: string): HabitIconName {
  if (/🏃|🌅/.test(emoji)) return "run";
  if (/💧/.test(emoji)) return "water";
  if (/📚/.test(emoji)) return "book";
  if (/🏋|💪/.test(emoji)) return "dumbbell";
  if (/💻|⌨️/.test(emoji)) return "code";
  if (/😴|🛌/.test(emoji)) return "sleep";
  if (/🧘/.test(emoji)) return "meditate";
  if (/📄/.test(emoji)) return "paper";
  if (/🎯/.test(emoji)) return "target";
  return "plant";
}
