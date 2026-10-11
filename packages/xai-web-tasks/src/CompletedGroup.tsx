/**
 * CompletedGroup — collapsible completed-task list inside a column.
 *
 * Used only by the `nodate` column in v1 (matches prototype lines 265-284).
 *
 * API contract: packages/xai-web-tasks/docs/api.md §2
 * Design: packages/xai-web-tasks/docs/design.md §4
 */

import React, { useState } from "react";
import type { TaskCard as TaskCardType, TaskListMeta, TaskTagMeta } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { TaskCard } from "./TaskCard.js";

export interface CompletedGroupProps {
  tasks: ReadonlyArray<TaskCardType>;
  lang: Lang;
  onToggle?: (id: string) => void;
  lists?: ReadonlyArray<TaskListMeta>;
  tags?: ReadonlyArray<TaskTagMeta>;
}

export function CompletedGroup({ tasks, lang, lists = [], tags = [], onToggle }: CompletedGroupProps) {
  const [open, setOpen] = useState(true);
  const { s } = useI18n(lang);

  return (
    <div className="completed-group">
      <button
        className="completed-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {/* chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}
          aria-hidden="true"
        >
          <path d="M3 6l5 5 5-5H3z" />
        </svg>
        {s("common.completed")}
        <span className="col-count">{tasks.length}</span>
      </button>
      {open && (
        <div className="completed-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              lang={lang}
              colId="nodate"
              completed
              dragging={false}
              taskList={lists.find((list) => list.id === task.listId)}
              taskTags={tags.filter((tag) => (task.tags ?? (task.tag ? [task.tag] : [])).includes(tag.id))}
              onToggle={() => onToggle?.(task.id)}
              onOpen={() => {}}
              onDragStart={(e) => { e.preventDefault(); }}
              onDragEnd={() => {}}
            />
          ))}
          <button className="view-more">{s("common.view_more")}</button>
        </div>
      )}
    </div>
  );
}
