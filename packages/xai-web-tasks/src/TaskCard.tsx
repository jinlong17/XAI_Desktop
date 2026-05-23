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
import type { TaskCard as TaskCardType, BucketId } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";

export interface TaskCardProps {
  task: TaskCardType;
  lang: Lang;
  colId: BucketId;
  completed: boolean;
  dragging: boolean;
  onToggle: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

export function TaskCard({
  task,
  lang,
  completed,
  dragging,
  onToggle,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const { s } = useI18n(lang);
  const hasMeta = Boolean(task.tag || task.date || task.inbox);

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
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggle(); }}
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
          {task.tag && (
            <span className={"tag " + task.tag}>
              {s(`tag.${task.tag}`)}
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
