/**
 * TaskColumn — renders a single time-bucket column (head + body + empty hint).
 *
 * In P1 (read-only render): no DnD handlers wired.
 * In P2: DnD callbacks are wired from TasksModule.
 *
 * API contract: packages/xai-web-tasks/docs/api.md §2 + §6
 * Design: packages/xai-web-tasks/docs/design.md §4
 */

import React from "react";
import type { TaskCol as TaskColType, BucketId } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { TaskCard } from "./TaskCard.js";
import { CompletedGroup } from "./CompletedGroup.js";

export interface TaskColumnProps {
  col: TaskColType;
  lang: Lang;
  draggingTaskId: string | null;
  isDropTarget: boolean;
  completedIds: ReadonlySet<string>;
  onToggle: (taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, fromColId: BucketId) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLElement>, colId: BucketId) => void;
  onDragLeave: (colId: BucketId) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, colId: BucketId) => void;
}

export function TaskColumn({
  col,
  lang,
  draggingTaskId,
  isDropTarget,
  completedIds,
  onToggle,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: TaskColumnProps) {
  const { s } = useI18n(lang);
  const isEmpty = col.tasks.length === 0;

  return (
    <section
      className={"task-col" + (isDropTarget ? " drop-target" : "")}
      onDragOver={(e) => onDragOver(e, col.id)}
      onDragLeave={() => onDragLeave(col.id)}
      onDrop={(e) => onDrop(e, col.id)}
    >
      <header className="task-col-head">
        <h2>{s(`common.${col.key}`)}</h2>
        <span className="col-count">{col.tasks.length}</span>
        <span className="grow" />
        {col.action === "postpone" && (
          <button className="col-action">
            {s("common.postpone")}
            {/* + icon */}
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 3a1 1 0 011 1v3h3a1 1 0 110 2H9v3a1 1 0 11-2 0V9H4a1 1 0 110-2h3V4a1 1 0 011-1z"/>
            </svg>
          </button>
        )}
        {col.action === "add" && (
          <button className="icon-btn" aria-label={s("common.add")}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 3a1 1 0 011 1v3h3a1 1 0 110 2H9v3a1 1 0 11-2 0V9H4a1 1 0 110-2h3V4a1 1 0 011-1z"/>
            </svg>
          </button>
        )}
      </header>
      <div className="task-col-body">
        {col.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            lang={lang}
            colId={col.id}
            completed={completedIds.has(task.id)}
            dragging={draggingTaskId === task.id}
            onToggle={() => onToggle(task.id)}
            onDragStart={(e) => onDragStart(e, task.id, col.id)}
            onDragEnd={onDragEnd}
          />
        ))}
        {isEmpty && (
          <div className="task-col-empty">
            {/* TODO(xai-web-tasks i18n): use tasks.drop_zone_empty when tokens row adds it */}
            {lang === "zh" ? "拖任务到这里" : "Drop tasks here"}
          </div>
        )}
        {col.completed && (
          <CompletedGroup tasks={col.completed} lang={lang} />
        )}
      </div>
    </section>
  );
}
