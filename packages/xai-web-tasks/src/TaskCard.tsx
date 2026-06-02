/**
 * TaskCard — renders a single task card.
 *
 * Handles: checkbox toggle, drag events, completed + dragging visual states.
 * Does NOT own state — parent (TasksModule) passes all callbacks.
 *
 * API contract: packages/xai-web-tasks/docs/api.md §2 + §6
 * Design: packages/xai-web-tasks/docs/design.md §1 (C1 DnD, D1 dateForCol)
 */

import React from "react";
import type { TaskCard as TaskCardType, BucketId, TaskListMeta, TaskTagMeta } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { taskListLabel, taskTagLabel } from "./internal/taskMeta.js";

export interface TaskCardProps {
  task: TaskCardType;
  lang: Lang;
  colId: BucketId;
  completed: boolean;
  dragging: boolean;
  selected?: boolean;
  taskList?: TaskListMeta;
  taskTags?: ReadonlyArray<TaskTagMeta>;
  onToggle: () => void;
  onOpen?: () => void;
  onSelect?: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

export function TaskCard({
  task,
  lang,
  completed,
  dragging,
  selected,
  taskList,
  taskTags = [],
  onToggle,
  onOpen,
  onSelect,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const { s } = useI18n(lang);
  const hasMeta = Boolean(taskTags.length || task.tag || task.date || task.inbox || taskList || task.priority);

  return (
    <div
      className={
        "task-card" +
        (completed ? " is-completed" : "") +
        (dragging ? " is-dragging" : "")
      }
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-pressed={selected ? "true" : undefined}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen?.(); }}
    >
      <div className="task-card-head">
        {/* grip handle */}
        <span className="task-grip" data-no-drag aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="4" cy="3" r="1"/><circle cx="8" cy="3" r="1"/>
            <circle cx="4" cy="6" r="1"/><circle cx="8" cy="6" r="1"/>
            <circle cx="4" cy="9" r="1"/><circle cx="8" cy="9" r="1"/>
          </svg>
        </span>
        {/* checkbox */}
        <span
          className={"cbx" + (completed ? " checked" : "")}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          role="checkbox"
          aria-checked={completed}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onToggle(); } }}
        />
        <input
          className="task-select"
          type="checkbox"
          aria-label={lang === "zh" ? "选择任务" : "Select task"}
          checked={Boolean(selected)}
          onChange={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          onClick={(e) => e.stopPropagation()}
        />
        {/* title + sub */}
        <div className="task-card-body">
          <div className="task-title">
            {lang === "zh" ? task.title.zh : task.title.en}
          </div>
          {task.sub && (
            <div className="task-sub">
              {lang === "zh" ? task.sub.zh : task.sub.en}
            </div>
          )}
        </div>
        {/* dateLabel pill */}
        {task.dateLabel && (
          <span className="task-pill">
            {lang === "zh" ? task.dateLabel.zh : task.dateLabel.en}
          </span>
        )}
      </div>
      {hasMeta && (
        <div className="task-meta">
          {taskTags.length > 0 ? (
            taskTags.map((tag) => (
              <span
                key={tag.id}
                className="tag"
                style={{ background: `${tag.color}1f`, color: tag.color }}
              >
                {taskTagLabel(tag, lang)}
              </span>
            ))
          ) : task.tag && (
            <span className={"tag " + task.tag}>
              {s(`tag.${task.tag}` as `tag.${string}`)}
            </span>
          )}
          {taskList && (
            <span className="task-list-pill" style={{ color: taskList.color }}>
              {taskList.icon} {taskListLabel(taskList, lang)}
            </span>
          )}
          {task.priority && task.priority !== "normal" && (
            <span className={"task-priority priority-" + task.priority}>
              {priorityLabel(task.priority, lang)}
            </span>
          )}
          <span className="grow" />
          {task.date && (
            <span className="task-date">
              {lang === "zh" && task.dateZh ? task.dateZh : task.date}
            </span>
          )}
          {task.inbox && (
            <span className="task-loc" aria-label="inbox">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v6.586l-1.293-1.293a1 1 0 00-1.414 1.414L14 12.414V14H2v-1.586l2.707-2.707a1 1 0 00-1.414-1.414L2 9.586V3z"/>
              </svg>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function priorityLabel(priority: NonNullable<TaskCardType["priority"]>, lang: Lang): string {
  const labels = {
    low: { en: "Low", zh: "低" },
    normal: { en: "Normal", zh: "普通" },
    high: { en: "High", zh: "高" },
    urgent: { en: "Urgent", zh: "紧急" },
  } as const;
  return labels[priority][lang];
}
