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

import React, { useState, useEffect, useRef } from "react";
import type {
  HabitsModuleProps,
  HabitId,
  DateKey,
  MonthKey,
  WeekStart,
  HabitViewMode,
} from "./types.js";
import { HabitList } from "./HabitList.js";
import { HabitDetail } from "./HabitDetail.js";
import { usePersistedHabits } from "./internal/usePersistedHabits.js";
import { toggleCheckIn } from "./internal/toggle.js";
import { emitCheckInRecorded } from "./internal/emit.js";
import { createId } from "./internal/createId.js";
import { AddHabitDialog, type HabitDraft } from "./internal/AddHabitDialog.js";
import { TooltipLayer } from "./internal/TooltipLayer.js";

export function HabitsModule({ lang, weekStart = "sun" }: HabitsModuleProps) {
  const { state, setState } = usePersistedHabits();
  const moduleRef = useRef<HTMLDivElement>(null);

  const [selectedId, setSelectedId] = useState<HabitId>(
    () => state.habits[0]?.id ?? "",
  );
  const [displayedMonth, setDisplayedMonth] = useState<{ year: number; month0: number }>(
    () => ({
      year: new Date().getFullYear(),
      month0: new Date().getMonth(),
    }),
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<HabitViewMode>("calendar");

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
    if (viewMode === "all") {
      setViewMode("calendar");
    }
    setDisplayedMonth({
      year: new Date().getFullYear(),
      month0: new Date().getMonth(),
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
  function handleAddHabit(draft: HabitDraft) {
    const newHabit = {
      id: createId(),
      emoji: draft.emoji,
      icon: draft.icon,
      color: draft.color,
      category: draft.category,
      startDate: draft.startDate,
      reminder: draft.reminder,
      frequency: draft.frequency,
      title: draft.title,
      createdAt: new Date().toISOString(),
    };
    const next = { ...state, habits: [newHabit, ...state.habits] };
    setState(next);
    setSelectedId(newHabit.id);
    setViewMode("calendar");
    setDisplayedMonth({
      year: new Date().getFullYear(),
      month0: new Date().getMonth(),
    });
    setAddDialogOpen(false);
  }

  return (
    <div ref={moduleRef} className="module module-habits">
      <HabitList
        habits={state.habits}
        checkIns={state.checkIns}
        selectedId={selectedId}
        viewMode={viewMode}
        lang={lang}
        weekStart={weekStart as WeekStart}
        onSelect={handleSelect}
        onToggle={handleToggle}
        onViewModeChange={setViewMode}
        onAddHabit={() => setAddDialogOpen(true)}
      />

      <HabitDetail
        habit={selectedHabit}
        habits={state.habits}
        checkIns={selectedCheckIns}
        allCheckIns={state.checkIns}
        diary={selectedDiary}
        lang={lang}
        weekStart={weekStart as WeekStart}
        viewMode={viewMode}
        displayedMonth={displayedMonth}
        onSelect={handleSelect}
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
      <TooltipLayer rootRef={moduleRef} />
    </div>
  );
}

export default HabitsModule;
