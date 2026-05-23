/**
 * TasksModule — root component for the Tasks module.
 *
 * P1 (read-only render): seeds from SEED_TASK_COLS; DnD stubs present but not functional.
 * P2: Wires DnD, tasksReducer, dateForCol, and usePref persistence.
 *
 * Design: packages/xai-web-tasks/docs/design.md §4
 * API contract: packages/xai-web-tasks/docs/api.md §2.1
 */

import React, { useMemo, useState } from "react";
import type { TasksModuleProps, TaskCol, BucketId } from "./types.js";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import { SEED_TASK_COLS } from "./internal/seed/tasksMock.js";
import { isTaskColsArray } from "./internal/validate.js";
import { moveCard, toggleComplete } from "./internal/tasksReducer.js";
import { TasksSidebar } from "./TasksSidebar.js";
import { TaskColumn } from "./TaskColumn.js";

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

  // ---- In-memory completion state (not persisted in v1) ----
  const [completedIds, setCompletedIds] = useState<ReadonlySet<string>>(new Set());

  function handleToggle(taskId: string) {
    setCompletedIds((prev) => toggleComplete(prev, taskId));
  }

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

  const isDragging = dragging !== null;

  return (
    <div className="module module-tasks">
      <TasksSidebar lang={lang} />
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
        <div className="task-columns">
          {taskCols.map((col) => (
            <TaskColumn
              key={col.id}
              col={col}
              lang={lang}
              draggingTaskId={dragging?.taskId ?? null}
              isDropTarget={overColId === col.id}
              completedIds={completedIds}
              onToggle={handleToggle}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
