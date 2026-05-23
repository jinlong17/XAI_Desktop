/**
 * DiaryCard — controlled diary textarea for per-habit per-month diary.
 *
 * F2: per-habit per-month diary text.
 * - Controlled `useState<string>` mirror during typing (no persist per keystroke).
 * - Persist to state.diaries on onBlur (equality guard skips no-op writes).
 *
 * Design: design.md §5.2, design.md §8 error semantics
 */

import React, { useState, useEffect } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { HabitId, MonthKey } from "./types.js";

interface DiaryCardProps {
  habitId: HabitId;
  monthKey: MonthKey;
  /** Current persisted value (or "" if absent). */
  value: string;
  /** Called on blur with the new value (only if it differs from `value`). */
  setValue: (habitId: HabitId, monthKey: MonthKey, text: string) => void;
  emptyHint: string;
  lang: Lang;
}

export function DiaryCard({ habitId, monthKey, value, setValue, emptyHint, lang }: DiaryCardProps) {
  const { s } = useI18n(lang);
  // Local mirror for keystrokes
  const [localValue, setLocalValue] = useState(value);

  // Sync local state when persisted value changes (cross-tab update or habit switch)
  useEffect(() => {
    setLocalValue(value);
  }, [value, habitId, monthKey]);

  function handleBlur() {
    // Equality guard — skip no-op writes (AC-DIARY-4)
    if (localValue !== value) {
      setValue(habitId, monthKey, localValue);
    }
  }

  return (
    <div className="log-card panel">
      <h3 className="log-title">{s("habits.habit_log")}</h3>
      {localValue === "" && (
        <p className="log-empty">{emptyHint}</p>
      )}
      <textarea
        className="log-textarea"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={emptyHint}
        aria-label={lang === "zh" ? "习惯日记" : "Habit diary"}
        rows={4}
      />
    </div>
  );
}
