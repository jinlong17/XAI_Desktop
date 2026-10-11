/**
 * DiaryCard — controlled diary textarea for per-habit per-month diary.
 *
 * F2: per-habit per-month diary text.
 * - Controlled `useState<string>` mirror during typing (no persist per keystroke).
 * - Persist to state.diaries on onBlur (equality guard skips no-op writes).
 *
 * Design: design.md §5.2, design.md §8 error semantics
 */

import React, { useState, useEffect, useRef } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { HabitId, MonthKey } from "./types.js";

interface DiaryCardProps {
  habitId: HabitId;
  monthKey: MonthKey;
  /** Current persisted value (or "" if absent). */
  value: string;
  /** Called on blur with the new value (only if it differs from `value`). */
  setValue: (habitId: HabitId, monthKey: MonthKey, text: string) => boolean | void;
  onDraftChange?: (habitId: HabitId, monthKey: MonthKey, text: string) => void;
  resetToken?: number;
  emptyHint: string;
  lang: Lang;
}

export function DiaryCard({ habitId, monthKey, value, setValue, emptyHint, lang, onDraftChange, resetToken }: DiaryCardProps) {
  const { s } = useI18n(lang);
  // Local mirror for keystrokes
  const [localValue, setLocalValue] = useState(value);

  const dirty = useRef(false);
  const identity = useRef({ habitId, monthKey, resetToken });
  // Sync local state when persisted value changes (cross-tab update or habit switch)
  useEffect(() => {
    const previous = identity.current;
    if (previous.habitId !== habitId || previous.monthKey !== monthKey || previous.resetToken !== resetToken || !dirty.current || value === localValue) {
      dirty.current = false; setLocalValue(value);
    }
    identity.current = { habitId, monthKey, resetToken };
  }, [value, habitId, monthKey, resetToken, localValue]);

  function handleBlur() {
    // Equality guard — skip no-op writes (AC-DIARY-4)
    if (localValue !== value) {
      if (setValue(habitId, monthKey, localValue) !== false) dirty.current = false;
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
        onChange={(e) => { dirty.current = true; setLocalValue(e.target.value); onDraftChange?.(habitId, monthKey, e.target.value); }}
        onBlur={handleBlur}
        placeholder={emptyHint}
        aria-label={lang === "zh" ? "习惯日记" : "Habit diary"}
        rows={4}
      />
    </div>
  );
}
