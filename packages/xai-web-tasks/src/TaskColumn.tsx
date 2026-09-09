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
import type { TaskCol as TaskColType, BucketId, TaskListMeta, TaskTagMeta } from "./types.js";
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
  selectedIds?: ReadonlySet<string>;
  lists?: ReadonlyArray<TaskListMeta>;
  tags?: ReadonlyArray<TaskTagMeta>;
  onToggle: (taskId: string) => void;
  onOpenTask?: (taskId: string) => void;
  onSelectTask?: (taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, fromColId: BucketId) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLElement>, colId: BucketId) => void;
  onDragLeave: (colId: BucketId) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, colId: BucketId) => void;
  /** NEW (api.md §E.5): called when the + button is clicked; opens the composer for this bucket. */
  onAddCard?: (bucketId: BucketId) => void;
  /**
   * FP1 (smartlist-filter, api.md §F.5): When true, suppresses the per-column
   * "Drop tasks here" hint (which is misleading when the user is viewing a
   * read-only filtered list — you can't drop FROM a filter view into a subset).
   */
  filterActive?: boolean;
}

export function TaskColumn({
  col,
  lang,
  draggingTaskId,
  isDropTarget,
  completedIds,
  selectedIds,
  lists = [],
  tags = [],
  filterActive,
  onToggle,
  onOpenTask,
  onSelectTask,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onAddCard,
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
        <h2>{col.id === "overdue" ? (lang === "zh" ? "今天 / 过期" : "Today / Overdue") : s(`common.${col.key}`)}</h2>
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
          <button
            className="icon-btn"
            aria-label={s("common.add")}
            onClick={() => onAddCard?.(col.id)}
          >
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
            selected={selectedIds?.has(task.id)}
            taskList={lists.find((list) => list.id === task.listId)}
            taskTags={tags.filter((tag) => (task.tags ?? (task.tag ? [task.tag] : [])).includes(tag.id))}
            onToggle={() => onToggle(task.id)}
            onOpen={() => onOpenTask?.(task.id)}
            onSelect={() => onSelectTask?.(task.id)}
            onDragStart={(e) => onDragStart(e, task.id, col.id)}
            onDragEnd={onDragEnd}
          />
        ))}
        {isEmpty && !filterActive && (
          <div className="task-col-empty">
            {/* TODO(xai-web-tasks i18n): use tasks.drop_zone_empty when tokens row adds it */}
            {lang === "zh" ? "拖任务到这里" : "Drop tasks here"}
          </div>
        )}
        {col.completed && (
          <CompletedGroup tasks={col.completed} lang={lang} onToggle={onToggle} lists={lists} tags={tags} />
        )}
      </div>
    </section>
  );
}
