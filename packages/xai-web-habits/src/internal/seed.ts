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
    title: { en: "Morning Run", zh: "晨跑" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "h_seed_02",
    emoji: "📚",
    title: { en: "Read 30 Minutes", zh: "阅读 30 分钟" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "h_seed_03",
    emoji: "💧",
    title: { en: "Drink 8 Glasses of Water", zh: "喝 8 杯水" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "h_seed_04",
    emoji: "🧘",
    title: { en: "Meditate", zh: "冥想" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "h_seed_05",
    emoji: "😴",
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
