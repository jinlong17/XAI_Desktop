/**
 * @internal — seed.ts
 * Typed initial habits for first-launch seeding.
 *
 * These correspond to the prototype's window.MOCK.habits, made bilingual
 * and strongly typed. The seed is applied once on first mount when
 * localStorage has no stored state.
 *
 * Design: design.md §5.3
 */

import type { Habit, HabitsState } from "../types.js";

export const INITIAL_HABITS: readonly Habit[] = [
  {
    id: "h_seed_01",
    emoji: "🌅",
    icon: "run",
    color: "accent",
    category: "fitness",
    startDate: "2026-01-01",
    reminder: { enabled: true, time: "07:30" },
    frequency: { type: "daily" },
    title: { en: "Morning Run", zh: "晨跑" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "h_seed_02",
    emoji: "📚",
    icon: "book",
    color: "blue",
    category: "learning",
    startDate: "2026-01-01",
    reminder: { enabled: false, time: "20:30" },
    frequency: { type: "daily" },
    title: { en: "Read 30 Minutes", zh: "阅读 30 分钟" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "h_seed_03",
    emoji: "💧",
    icon: "water",
    color: "amber",
    category: "health",
    startDate: "2026-01-01",
    reminder: { enabled: true, time: "10:00" },
    frequency: { type: "daily" },
    title: { en: "Drink 8 Glasses of Water", zh: "喝 8 杯水" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "h_seed_04",
    emoji: "🧘",
    icon: "meditate",
    color: "pink",
    category: "mindfulness",
    startDate: "2026-01-01",
    reminder: { enabled: false, time: "21:00" },
    frequency: { type: "weekdays" },
    title: { en: "Meditate", zh: "冥想" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "h_seed_05",
    emoji: "😴",
    icon: "sleep",
    color: "red",
    category: "health",
    startDate: "2026-01-01",
    reminder: { enabled: true, time: "22:30" },
    frequency: { type: "daily" },
    title: { en: "Sleep by 11 PM", zh: "11 点前睡觉" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

/** Builds the initial seeded HabitsState (no check-ins, no diaries). */
export function buildSeedState(): HabitsState {
  return {
    schemaVersion: 1,
    habits: INITIAL_HABITS,
    checkIns: {},
    diaries: {},
  };
}
