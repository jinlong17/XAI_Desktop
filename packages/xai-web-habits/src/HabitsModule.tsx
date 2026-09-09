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
  const { state, setState, recovery } = usePersistedHabits();
  const diaryDraft = useRef<{ habitId: HabitId; monthKey: MonthKey; text: string; baseline: string | null } | null>(null);
  const [diaryResetToken, setDiaryResetToken] = useState(0);
  const [exportFailed, setExportFailed] = useState(false);
  const saveError = recovery.failure ? (lang === 'zh'
    ? (recovery.failure === 'conflict' ? '已有较新的数据，未覆盖。请导出草稿后放弃此次更改。' : recovery.failure === 'account' ? '账户已更改。当前账户不能保存或导出此草稿。' : '尚未保存。请重试或导出草稿。')
    : (recovery.failure === 'conflict' ? 'Newer stored data was preserved. Export the draft and discard this change.' : recovery.failure === 'account' ? 'Account changed. This draft cannot be saved or exported in the current account.' : 'Not saved. Retry or export the draft.')) : null;
  function captureDiary(habitId: HabitId, monthKey: MonthKey, text: string) {
    if (diaryDraft.current?.habitId === habitId && diaryDraft.current.monthKey === monthKey) diaryDraft.current.text = text;
    else { let baseline: string | null; try { baseline = recovery.captureBaseline(); } catch { baseline = null; } diaryDraft.current = { habitId, monthKey, text, baseline }; }
  }
  function flushDiary() {
    if (recovery.isPending()) return false;
    const draft = diaryDraft.current;
    return draft ? handleSetDiary(draft.habitId, draft.monthKey, draft.text) : true;
  }
  function exportDraft(habitDraft?: HabitDraft) {
    try {
      const data = { recovery: recovery.snapshot(), latestHabitDraft: habitDraft, latestDiaryDraft: diaryDraft.current };
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'habits-unsaved-change.json'; document.body.append(link);
      try { link.click(); } finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); } setExportFailed(false);
    } catch { setExportFailed(true); }
  }
  function discard() { recovery.discard(); diaryDraft.current = null; setDiaryResetToken(value => value + 1); setExportFailed(false); }
  function retry() {
    const draft = diaryDraft.current;
    if (recovery.kind === 'diary' && draft) handleSetDiary(draft.habitId, draft.monthKey, draft.text);
    else recovery.retry();
  }
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
    if (!flushDiary()) return;
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
    if (!flushDiary()) return;
    // Verify habit still exists (handles concurrent delete via another tab)
    if (!state.habits.find((h) => h.id === habitId)) return;

    const { next, postStreak } = toggleCheckIn(state, habitId, dateKey);
    setState(next, { id: `checkin:${habitId}:${dateKey}`, kind: 'checkin', after: () => emitCheckInRecorded({ habitId, date: dateKey, streak: postStreak }) });
  }

  // Month navigation
  function handlePrevMonth() {
    if (!flushDiary()) return;
    setDisplayedMonth((m) => {
      if (m.month0 === 0) return { year: m.year - 1, month0: 11 };
      return { year: m.year, month0: m.month0 - 1 };
    });
  }
  function handleNextMonth() {
    if (!flushDiary()) return;
    setDisplayedMonth((m) => {
      if (m.month0 === 11) return { year: m.year + 1, month0: 0 };
      return { year: m.year, month0: m.month0 + 1 };
    });
  }

  // Diary update
  function handleSetDiary(habitId: HabitId, mk: MonthKey, text: string) {
    const habitDiaries = state.diaries[habitId] ?? {};
    // Equality guard (AC-DIARY-4)
    if (habitDiaries[mk] === text && !recovery.isPending()) { diaryDraft.current = null; return true; }
    const next = {
      ...state,
      diaries: {
        ...state.diaries,
        [habitId]: { ...habitDiaries, [mk]: text },
      },
    };
    const draft = diaryDraft.current;
    const saved = setState(next, { id: `diary:${habitId}:${mk}`, kind: 'diary', ...(draft?.habitId === habitId && draft.monthKey === mk ? { baseline: draft.baseline } : {}) });
    if (saved) diaryDraft.current = null;
    return saved;
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
    if (!setState(next, { id: 'create', kind: 'create' })) return false;
    setSelectedId(newHabit.id);
    setViewMode("calendar");
    setDisplayedMonth({
      year: new Date().getFullYear(),
      month0: new Date().getMonth(),
    });
    setAddDialogOpen(false);
    return true;
  }

  return (
    <div ref={moduleRef} className={"module module-habits" + (saveError && !addDialogOpen ? " has-save-error" : "")}>
      {saveError && !addDialogOpen && <div className="habits-save-recovery" role="alert">
        <p>{saveError}</p><button type="button" onClick={retry}>{lang === 'zh' ? '重试保存' : 'Retry save'}</button>
        <button type="button" onClick={() => exportDraft()}>{lang === 'zh' ? '导出草稿' : 'Export draft'}</button>
        <button type="button" onClick={discard}>{lang === 'zh' ? '放弃此次更改' : 'Discard change'}</button>
        {exportFailed && <p>{lang === 'zh' ? '导出失败，请检查账户和存储权限。' : 'Export failed. Check account and storage access.'}</p>}
      </div>}
      <HabitList
        habits={state.habits}
        checkIns={state.checkIns}
        selectedId={selectedId}
        viewMode={viewMode}
        lang={lang}
        weekStart={weekStart as WeekStart}
        onSelect={handleSelect}
        onToggle={handleToggle}
        onViewModeChange={(mode) => { if (flushDiary()) setViewMode(mode); }}
        onAddHabit={() => { if (flushDiary()) setAddDialogOpen(true); }}
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
        onDiaryDraft={captureDiary}
        diaryResetToken={diaryResetToken}
      />

      {addDialogOpen && (
        <AddHabitDialog
          open={addDialogOpen}
          lang={lang}
          saveError={saveError} exportFailed={exportFailed} onExportDraft={exportDraft}
          onDiscard={() => { discard(); setAddDialogOpen(false); }}
          onClose={() => { if (!recovery.isPending()) setAddDialogOpen(false); }}
          onSave={handleAddHabit}
        />
      )}
      <TooltipLayer rootRef={moduleRef} />
    </div>
  );
}

export default HabitsModule;
