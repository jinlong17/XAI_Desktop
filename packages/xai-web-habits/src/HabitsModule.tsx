/**
 * HabitsModule — top-level composition component.
 *
 * Left pane: HabitList (habit rows with 7-cell weekly check strip).
 * Right pane: HabitDetail (4 stat cards + 6/365 progress + month calendar + diary).
 * Modal: AddHabitDialog (triggered by the "+" header button).
 *
 * State:
 * - state / setState  from usePersistedHabits
 * - selectedId        currently selected habit
 * - displayedMonth    { year, month0 } for the month calendar in detail pane
 * - addDialogOpen     controls AddHabitDialog visibility
 *
 * Design: design.md §3 + §3.1 + §8
 */

import "./styles.css";

import React, { useState, useEffect } from "react";
import type { HabitsModuleProps, HabitId, DateKey, MonthKey, WeekStart } from "./types.js";
import { HabitList } from "./HabitList.js";
import { HabitDetail } from "./HabitDetail.js";
import { usePersistedHabits } from "./internal/usePersistedHabits.js";
import { toggleCheckIn } from "./internal/toggle.js";
import { emitCheckInRecorded } from "./internal/emit.js";
import { createId } from "./internal/createId.js";
import { AddHabitDialog } from "./internal/AddHabitDialog.js";

export function HabitsModule({ lang, weekStart = "sun" }: HabitsModuleProps) {
  const { state, setState } = usePersistedHabits();

  const [selectedId, setSelectedId] = useState<HabitId>(
    () => state.habits[0]?.id ?? "",
  );
  const [displayedMonth, setDisplayedMonth] = useState<{ year: number; month0: number }>(
    () => ({
      year: new Date().getUTCFullYear(),
      month0: new Date().getUTCMonth(),
    }),
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // When seed hydration fires (habits go from [] to seeded), select the first habit.
  useEffect(() => {
    if (!selectedId && state.habits.length > 0) {
      setSelectedId(state.habits[0]!.id);
    }
  }, [state.habits, selectedId]);

  const selectedHabit = state.habits.find((h) => h.id === selectedId);
  const selectedCheckIns = selectedId ? (state.checkIns[selectedId] ?? {}) : {};
  const selectedDiary = selectedId ? (state.diaries[selectedId] ?? {}) : {};

  // Select a habit — reset displayed month to current
  function handleSelect(id: HabitId) {
    setSelectedId(id);
    setDisplayedMonth({
      year: new Date().getUTCFullYear(),
      month0: new Date().getUTCMonth(),
    });
  }

  // Toggle check-in from either the habit row's week strip or the calendar
  function handleToggle(habitId: HabitId, dateKey: DateKey) {
    // Verify habit still exists (handles concurrent delete via another tab)
    if (!state.habits.find((h) => h.id === habitId)) return;

    const { next, postStreak } = toggleCheckIn(state, habitId, dateKey);
    setState(next);
    emitCheckInRecorded({ habitId, date: dateKey, streak: postStreak });
  }

  // Month navigation
  function handlePrevMonth() {
    setDisplayedMonth((m) => {
      if (m.month0 === 0) return { year: m.year - 1, month0: 11 };
      return { year: m.year, month0: m.month0 - 1 };
    });
  }
  function handleNextMonth() {
    setDisplayedMonth((m) => {
      if (m.month0 === 11) return { year: m.year + 1, month0: 0 };
      return { year: m.year, month0: m.month0 + 1 };
    });
  }

  // Diary update
  function handleSetDiary(habitId: HabitId, mk: MonthKey, text: string) {
    const habitDiaries = state.diaries[habitId] ?? {};
    // Equality guard (AC-DIARY-4)
    if (habitDiaries[mk] === text) return;
    const next = {
      ...state,
      diaries: {
        ...state.diaries,
        [habitId]: { ...habitDiaries, [mk]: text },
      },
    };
    setState(next);
  }

  // Add habit
  function handleAddHabit(draft: { emoji: string; title: { en: string; zh: string } }) {
    const newHabit = {
      id: createId(),
      emoji: draft.emoji,
      title: draft.title,
      createdAt: new Date().toISOString(),
    };
    const next = { ...state, habits: [newHabit, ...state.habits] };
    setState(next);
    setSelectedId(newHabit.id);
    setDisplayedMonth({
      year: new Date().getUTCFullYear(),
      month0: new Date().getUTCMonth(),
    });
    setAddDialogOpen(false);
  }

  return (
    <div className="module module-habits">
      <HabitList
        habits={state.habits}
        checkIns={state.checkIns}
        selectedId={selectedId}
        lang={lang}
        weekStart={weekStart as WeekStart}
        onSelect={handleSelect}
        onToggle={handleToggle}
        onAddHabit={() => setAddDialogOpen(true)}
      />

      <HabitDetail
        habit={selectedHabit}
        checkIns={selectedCheckIns}
        diary={selectedDiary}
        lang={lang}
        weekStart={weekStart as WeekStart}
        displayedMonth={displayedMonth}
        onToggle={handleToggle}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        setDiary={handleSetDiary}
      />

      {addDialogOpen && (
        <AddHabitDialog
          open={addDialogOpen}
          lang={lang}
          onClose={() => setAddDialogOpen(false)}
          onSave={handleAddHabit}
        />
      )}
    </div>
  );
}

export default HabitsModule;
