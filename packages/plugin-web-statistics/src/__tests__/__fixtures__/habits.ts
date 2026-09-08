/**
 * Test fixtures — habits state.
 */

export const HABITS_EMPTY = {
  schemaVersion: 1,
  habits: [],
  checkIns: {},
  diaries: {},
};

export function makeHabit(
  id: string,
  emoji: string,
  titleEn: string,
  titleZh: string,
  createdAt = "2025-01-01T00:00:00Z",
): unknown {
  return {
    id,
    emoji,
    title: { en: titleEn, zh: titleZh },
    createdAt,
  };
}
