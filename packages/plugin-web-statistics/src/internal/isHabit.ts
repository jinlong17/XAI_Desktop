/**
 * @internal — isHabit predicate.
 *
 * Narrows an `unknown` into a Habit-shaped record. The shape mirrors
 * `@repo/plugin-web-habits` Habit type (id, emoji, title.{en,zh}, createdAt)
 * but is intentionally minimal — statistics only needs id, emoji, title.
 *
 * `streak` is computed elsewhere (from checkIns) — it is NOT part of the
 * persisted Habit shape.
 *
 * api.md §2 boundary widening predicates.
 */

export interface HabitRecord {
  id: string;
  emoji: string;
  title: { en: string; zh: string };
  createdAt: string;
}

export function isHabit(v: unknown): v is HabitRecord {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  if (typeof obj.id !== "string" || obj.id.length === 0) return false;
  if (typeof obj.emoji !== "string") return false;
  if (typeof obj.createdAt !== "string") return false;
  const title = obj.title;
  if (typeof title !== "object" || title === null) return false;
  const titleObj = title as Record<string, unknown>;
  if (typeof titleObj.en !== "string" || typeof titleObj.zh !== "string") return false;
  return true;
}
