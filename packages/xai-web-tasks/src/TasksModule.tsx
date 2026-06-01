/**
 * TasksModule — root component for the Tasks module.
 *
 * P1 (read-only render): seeds from SEED_TASK_COLS; DnD stubs present but not functional.
 * P2: Wires DnD, tasksReducer, dateForCol, and usePref persistence.
 *
 * Design: packages/xai-web-tasks/docs/design.md §4
 * API contract: packages/xai-web-tasks/docs/api.md §2.1
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import type { TasksModuleProps, TaskCol, BucketId, NewTaskDraft, SmartListId } from "./types.js";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import { SEED_TASK_COLS } from "./internal/seed/tasksMock.js";
import { isTaskColsArray } from "./internal/validate.js";
import { moveCard, toggleComplete, addCard } from "./internal/tasksReducer.js";
import { filterCardsByList } from "./internal/filterCardsByList.js";
import { STR_SMART_LIST_EMPTY } from "./internal/strings.js";
import { TasksSidebar } from "./TasksSidebar.js";
import { TaskColumn } from "./TaskColumn.js";
import { TaskComposer } from "./TaskComposer.js";

export type { TasksModuleProps };

export function TasksModule({ lang }: TasksModuleProps) {
  const { s } = useI18n(lang);

  // ---- Persistence via usePref (boundary cast pattern — api.md §4.2) ----
  const [rawCols, setRawCols] = usePref("xai_task_cols");

  const taskCols = useMemo<TaskCol[]>(() => {
    if (isTaskColsArray(rawCols)) return rawCols as TaskCol[];
    if (rawCols !== null && rawCols !== undefined && !(rawCols instanceof Object && Object.keys(rawCols as object).length === 0)) {
      // Non-empty, non-array value: warn once in DEV (Rec-1 message format)
      if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
        console.warn("[plugin-web-tasks] usePref('xai_task_cols') returned non-array shape — falling back to seed.");
      }
    }
    return SEED_TASK_COLS as TaskCol[];
  }, [rawCols]);

  useEffect(() => {
    if (isTaskColsArray(rawCols)) return;
    setRawCols(SEED_TASK_COLS as unknown as Parameters<typeof setRawCols>[0]);
  }, [rawCols, setRawCols]);

  // ---- Completion state — derived from persisted `done` field in taskCols (T-10 fix) ----
  // Minimal-diff shape: keep completedIds as ReadonlySet<string> so TaskColumn/TaskCard/
  // CompletedGroup signatures are unchanged. The set is rebuilt from taskCols on every render.
  const completedIds = useMemo<ReadonlySet<string>>(() => {
    const ids = new Set<string>();
    for (const col of taskCols) {
      for (const task of col.tasks) {
        if (task.done === true) ids.add(task.id);
      }
    }
    return ids;
  }, [taskCols]);

  const handleToggle = useCallback((taskId: string) => {
    const next = toggleComplete(taskCols, taskId);
    setRawCols(next as unknown as Parameters<typeof setRawCols>[0]);
  }, [taskCols, setRawCols]);

  // ---- Smart-list filter state (FP1 — lifted from TasksSidebar) ----
  // Session-only (Q3): resets to "all" on reload — no registry key (design §F.1 #6).
  const [activeList, setActiveList] = useState<SmartListId>("all");

  // Filtered view — PURE read-only projection for rendering only.
  // Mutation handlers (handleToggle, handleDrop, handleComposerSave) operate on the
  // UNFILTERED taskCols so drag/create/complete always see the full board (design §F.1 #2).
  const filteredCols = useMemo<TaskCol[]>(
    () => filterCardsByList(taskCols, activeList),
    [taskCols, activeList],
  );

  const filterActive = activeList !== "all" && activeList !== "summary";

  // Board-level empty state: total visible tasks (across filtered columns) = 0.
  // Only shown when a non-trivial filter is active (not all/summary).
  // The per-column "drop here" hint is suppressed via filterActive prop on TaskColumn.
  const filteredTotalTasks = filteredCols.reduce(
    (sum, col) => sum + col.tasks.length + (col.completed?.length ?? 0),
    0,
  );
  const showBoardEmpty = filterActive && filteredTotalTasks === 0;

  // ---- DnD transient state ----
  const [dragging, setDragging] = useState<{ taskId: string; fromColId: BucketId } | null>(null);
  const [overColId, setOverColId] = useState<BucketId | null>(null);

  function handleDragStart(
    e: React.DragEvent<HTMLDivElement>,
    taskId: string,
    fromColId: BucketId,
  ) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ taskId, fromColId }));
    setDragging({ taskId, fromColId });
  }

  function handleDragEnd() {
    setDragging(null);
    setOverColId(null);
  }

  function handleDragOver(e: React.DragEvent<HTMLElement>, colId: BucketId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overColId !== colId) setOverColId(colId);
  }

  function handleDragLeave(colId: BucketId) {
    setOverColId((o) => (o === colId ? null : o));
  }

  function handleDrop(e: React.DragEvent<HTMLElement>, toColId: BucketId) {
    e.preventDefault();
    let data: { taskId: string; fromColId: BucketId };
    try {
      data = JSON.parse(e.dataTransfer.getData("text/plain")) as { taskId: string; fromColId: BucketId };
    } catch {
      setOverColId(null);
      setDragging(null);
      return;
    }
    const { taskId, fromColId } = data;
    setOverColId(null);
    setDragging(null);
    if (!taskId || fromColId === toColId) return;

    const next = moveCard(taskCols, taskId, fromColId, toColId);
    setRawCols(next as unknown as Parameters<typeof setRawCols>[0]);
  }

  // ---- Composer state (api.md §E.5) ----
  const [composer, setComposer] = useState<{ open: boolean; bucket: BucketId }>({
    open: false, bucket: "next7",
  });

  function handleAddCard(bucketId: BucketId) {
    setComposer({ open: true, bucket: bucketId });
  }

  function handleComposerSave(draft: NewTaskDraft, targetBucket: BucketId) {
    const next = addCard(taskCols, draft, targetBucket);
    setRawCols(next as unknown as Parameters<typeof setRawCols>[0]); // SHIPPED boundary cast
    setComposer((c) => ({ ...c, open: false }));
  }

  function handleComposerClose() {
    setComposer((c) => ({ ...c, open: false }));
  }

  const isDragging = dragging !== null;

  return (
    <div className="module module-tasks">
      <TasksSidebar
        lang={lang}
        activeList={activeList}
        onSelectList={setActiveList}
      />
      <main className="tasks-main">
        <header className="module-head">
          <div className="row">
            {/* list icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <path d="M2 4h14v2H2V4zm0 4h14v2H2V8zm0 4h9v2H2v-2z"/>
            </svg>
            <h1 className="module-title">{s("tasks.all")}</h1>
            {isDragging && (
              <span className="drag-hint" style={{ marginLeft: 8 }}>
                {/* TODO(xai-web-tasks i18n): use tasks.drop_to_reschedule when tokens row adds it */}
                {lang === "zh"
                  ? "拖到任意时间列改截止"
                  : "Drop on any column to reschedule"}
              </span>
            )}
          </div>
          <div className="row" style={{ marginLeft: "auto" }}>
            <button className="icon-btn" aria-label={s("common.filters")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M2 4h12v1.5L10 9v4l-4-2V9L2 5.5V4z"/>
              </svg>
            </button>
            <button className="icon-btn" aria-label={s("common.more")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <circle cx="8" cy="4" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="12" r="1.5"/>
              </svg>
            </button>
          </div>
        </header>
        {/* Board-level honest empty state (D-QT + design §F.1 #8).
            Rendered when a filter is active and yields zero total cards.
            Wording is bucket-framed per the D-QT binding directive (no "due today/tomorrow"). */}
        {showBoardEmpty && (
          <div className="tasks-board-empty" role="status">
            {STR_SMART_LIST_EMPTY[activeList][lang]}
          </div>
        )}
        <div className="task-columns">
          {filteredCols.map((col) => (
            <TaskColumn
              key={col.id}
              col={col}
              lang={lang}
              draggingTaskId={dragging?.taskId ?? null}
              isDropTarget={overColId === col.id}
              completedIds={completedIds}
              filterActive={filterActive}
              onToggle={handleToggle}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onAddCard={handleAddCard}
            />
          ))}
        </div>
      </main>
      {/* TaskComposer — rendered once at module root (api.md §E.5) */}
      <TaskComposer
        open={composer.open}
        lang={lang}
        defaultBucket={composer.bucket}
        onSave={handleComposerSave}
        onClose={handleComposerClose}
      />
    </div>
  );
}
