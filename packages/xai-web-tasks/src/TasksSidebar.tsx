/**
 * TasksSidebar — smart filters plus editable custom lists and tags.
 *
 * List/tag metadata is owned by TasksModule and persisted through the
 * open-ended xai_pref_* storage family. This component stays controlled.
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { SmartListId, TaskListMeta, TaskTagMeta, TaskViewSelection } from "./types.js";
import { taskListLabel, taskTagLabel } from "./internal/taskMeta.js";

const SMART_LISTS: Array<{ id: SmartListId; key: string; icon: string }> = [
  { id: "all", key: "tasks.all", icon: "all" },
  { id: "today", key: "common.today", icon: "today" },
  { id: "tomorrow", key: "common.tomorrow", icon: "tomorrow" },
  { id: "next7", key: "common.next_7_days", icon: "next7" },
  { id: "inbox", key: "common.inbox", icon: "inbox" },
  { id: "summary", key: "common.summary", icon: "summary" },
];

export interface TasksSidebarProps {
  lang: Lang;
  activeView: TaskViewSelection;
  lists: ReadonlyArray<TaskListMeta>;
  tags: ReadonlyArray<TaskTagMeta>;
  smartCounts: Readonly<Record<SmartListId, number>>;
  listCounts: Readonly<Record<string, number>>;
  tagCounts: Readonly<Record<string, number>>;
  onSelectSmart: (id: SmartListId) => void;
  onSelectList: (id: "all" | string) => void;
  onSelectTag: (id: "all" | string) => void;
  onCreateList: () => void;
  onCreateTag: () => void;
  onEditList: (id: string) => void;
  onEditTag: (id: string) => void;
  onDeleteList: (id: string) => void;
  onDeleteTag: (id: string) => void;
  onReorderList: (fromId: string, toId: string) => void;
  onReorderTag: (fromId: string, toId: string) => void;
  onTaskDropToList: (taskId: string, listId: string) => void;
  onTaskDropToTag: (taskId: string, tagId: string) => void;
}

export function TasksSidebar({
  lang,
  activeView,
  lists,
  tags,
  smartCounts,
  listCounts,
  tagCounts,
  onSelectSmart,
  onSelectList,
  onSelectTag,
  onCreateList,
  onCreateTag,
  onEditList,
  onEditTag,
  onDeleteList,
  onDeleteTag,
  onReorderList,
  onReorderTag,
  onTaskDropToList,
  onTaskDropToTag,
}: TasksSidebarProps) {
  const { s } = useI18n(lang);

  return (
    <nav className="module-sidebar" aria-label={s("tasks.all")}>
      <div className="sidebar-section">
        {SMART_LISTS.map((item) => (
          <div
            key={item.id}
            className="list-row"
            data-active={activeView.kind === "smart" && activeView.id === item.id}
            onClick={() => onSelectSmart(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onSelectSmart(item.id); }}
          >
            <SmartListIcon id={item.id} />
            <span className="grow">{s(item.key)}</span>
            <span className="count">{smartCounts[item.id] ?? 0}</span>
          </div>
        ))}
      </div>

      <SectionLabel
        label={s("common.lists")}
        addLabel={lang === "zh" ? "新增清单" : "New list"}
        onAdd={onCreateList}
      />
      <div className="sidebar-section">
        <SidebarRow
          active={activeView.kind === "list" && activeView.id === "all"}
          label={lang === "zh" ? "全部清单" : "All lists"}
          count={Object.values(listCounts).reduce((sum, count) => sum + count, 0)}
          onClick={() => onSelectList("all")}
        >
          <SmartListIcon id="all" />
        </SidebarRow>
        {lists.map((list) => (
          <SidebarRow
            key={list.id}
            active={activeView.kind === "list" && activeView.id === list.id}
            label={taskListLabel(list, lang)}
            count={listCounts[list.id] ?? 0}
            accentColor={list.color}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("application/x-xai-list-id", list.id)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const draggedListId = e.dataTransfer.getData("application/x-xai-list-id");
              if (draggedListId) {
                onReorderList(draggedListId, list.id);
                return;
              }
              const taskId = readTaskIdFromDrag(e);
              if (taskId) onTaskDropToList(taskId, list.id);
            }}
            onClick={() => onSelectList(list.id)}
            actions={
              <>
                <IconButton label={lang === "zh" ? "编辑清单" : "Edit list"} onClick={() => onEditList(list.id)} icon="edit" />
                <IconButton label={lang === "zh" ? "删除清单" : "Delete list"} onClick={() => onDeleteList(list.id)} icon="trash" />
              </>
            }
          >
            <span className="sidebar-color-bar" style={{ background: list.color }} aria-hidden="true" />
            <span className="list-icon-token">{list.icon}</span>
          </SidebarRow>
        ))}
      </div>

      <SectionLabel
        label={s("common.tags")}
        addLabel={lang === "zh" ? "新增标签" : "New tag"}
        onAdd={onCreateTag}
      />
      <div className="sidebar-section">
        <SidebarRow
          active={activeView.kind === "tag" && activeView.id === "all"}
          label={lang === "zh" ? "全部标签" : "All tags"}
          count={Object.values(tagCounts).reduce((sum, count) => sum + count, 0)}
          onClick={() => onSelectTag("all")}
        >
          <SmartListIcon id="summary" />
        </SidebarRow>
        {tags.map((tag) => (
          <SidebarRow
            key={tag.id}
            active={activeView.kind === "tag" && activeView.id === tag.id}
            label={taskTagLabel(tag, lang)}
            count={tagCounts[tag.id] ?? 0}
            accentColor={tag.color}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("application/x-xai-tag-id", tag.id)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const draggedTagId = e.dataTransfer.getData("application/x-xai-tag-id");
              if (draggedTagId) {
                onReorderTag(draggedTagId, tag.id);
                return;
              }
              const taskId = readTaskIdFromDrag(e);
              if (taskId) onTaskDropToTag(taskId, tag.id);
            }}
            onClick={() => onSelectTag(tag.id)}
            actions={
              <>
                <IconButton label={lang === "zh" ? "编辑标签" : "Edit tag"} onClick={() => onEditTag(tag.id)} icon="edit" />
                <IconButton label={lang === "zh" ? "删除标签" : "Delete tag"} onClick={() => onDeleteTag(tag.id)} icon="trash" />
              </>
            }
          >
            <span className="sidebar-color-bar" style={{ background: tag.color }} aria-hidden="true" />
          </SidebarRow>
        ))}
      </div>

      <div className="sec-label">{s("common.calendar_sub")}</div>
      <div className="sidebar-section">
        <div className="list-row">
          <SmartListIcon id="today" />
          <span className="grow">{lang === "zh" ? "本地日历" : "Local Calendars"}</span>
          <span className="count">8</span>
        </div>
      </div>

      <div className="sidebar-section sidebar-footer">
        <div className="list-row" role="button" tabIndex={0}>
          <CheckIcon />
          <span className="grow">{s("common.completed")}</span>
        </div>
        <div className="list-row" role="button" tabIndex={0}>
          <span className="dot" style={{ color: "var(--text-3)" }} />
          <span className="grow">{s("common.wont_do")}</span>
        </div>
        <div className="list-row" role="button" tabIndex={0}>
          <TrashIcon />
          <span className="grow">{s("common.trash")}</span>
        </div>
      </div>
    </nav>
  );
}

function SectionLabel({
  label,
  addLabel,
  onAdd,
}: {
  label: string;
  addLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="sec-label sec-label-row">
      <span>{label}</span>
      <button className="sidebar-mini-btn" aria-label={addLabel} onClick={onAdd}>
        <PlusIcon />
      </button>
    </div>
  );
}

function SidebarRow({
  active,
  label,
  count,
  children,
  actions,
  accentColor,
  draggable,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  active: boolean;
  label: string;
  count: number;
  children: React.ReactNode;
  actions?: React.ReactNode;
  accentColor?: string;
  draggable?: boolean;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={"list-row manageable-row" + (accentColor ? " has-row-accent" : "")}
      data-active={active}
      style={accentColor ? ({ "--row-accent": accentColor } as React.CSSProperties) : undefined}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
    >
      {children}
      <span className="grow">{label}</span>
      <span className="count">{count}</span>
      {actions && (
        <span className="row-actions" onClick={(e) => e.stopPropagation()}>
          {actions}
        </span>
      )}
    </div>
  );
}

function readTaskIdFromDrag(e: React.DragEvent): string | null {
  const direct = e.dataTransfer.getData("application/x-xai-task-id");
  if (direct) return direct;
  try {
    const payload = JSON.parse(e.dataTransfer.getData("text/plain")) as { taskId?: string };
    return typeof payload.taskId === "string" ? payload.taskId : null;
  } catch {
    return null;
  }
}

function IconButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: "edit" | "trash";
  onClick: () => void;
}) {
  return (
    <button className="sidebar-mini-btn" aria-label={label} onClick={onClick}>
      {icon === "edit" ? <EditIcon /> : <TrashIcon />}
    </button>
  );
}

function SmartListIcon({ id }: { id: SmartListId }) {
  switch (id) {
    case "all":
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h7v2H2v-2z"/></svg>;
    case "today":
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 1a1 1 0 011 1v1h4V2a1 1 0 112 0v1h1a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h1V2a1 1 0 011-1zm7 4H4v7h8V5z"/></svg>;
    case "tomorrow":
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm1 4a1 1 0 10-2 0v3.586L5.707 10.293a1 1 0 001.414 1.414l2-2A1 1 0 009 9V5z"/></svg>;
    case "next7":
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3 3a1 1 0 000 2h9.586L11.293 6.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 1.414L12.586 3H3z"/></svg>;
    case "inbox":
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v6.586l-1.293-1.293a1 1 0 00-1.414 1.414L14 12.414V14H2v-1.586l2.707-2.707a1 1 0 00-1.414-1.414L2 9.586V3z"/></svg>;
    case "summary":
      return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 11h12v2H2v-2zm0-4h8v2H2V7zm0-4h12v2H2V3z"/></svg>;
    default:
      return null;
  }
}

function PlusIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 3a1 1 0 011 1v3h3a1 1 0 110 2H9v3a1 1 0 11-2 0V9H4a1 1 0 110-2h3V4a1 1 0 011-1z"/></svg>;
}

function EditIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11.7 1.9a1 1 0 011.4 0l1 1a1 1 0 010 1.4l-7.8 7.8-3.3.9.9-3.3 7.8-7.8zM3 14h10a1 1 0 100-2H7.5l-1.8 1.8L3 14z"/></svg>;
}

function TrashIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h10a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm1 6a1 1 0 00-1 1v3a1 1 0 102 0V9a1 1 0 00-1-1zm3 0a1 1 0 00-1 1v3a1 1 0 102 0V9a1 1 0 00-1-1z"/></svg>;
}

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.78 4.22a.75.75 0 00-1.06 0L6.5 10.44 3.28 7.22a.75.75 0 00-1.06 1.06l3.75 3.75a.75.75 0 001.06 0l6.75-6.75a.75.75 0 000-1.06z"/></svg>;
}
