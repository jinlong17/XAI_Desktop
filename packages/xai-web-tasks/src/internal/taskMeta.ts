/**
 * Default editable list/tag metadata for the Tasks module.
 *
 * Stored at runtime in xai_pref_task_lists / xai_pref_task_tags so users can
 * reorder, rename, recolor, add, and delete without changing the task-column
 * persistence contract.
 */

import type { TaskListMeta, TaskTagMeta, TaskCard } from "../types.js";

export const DEFAULT_TASK_LISTS: readonly TaskListMeta[] = [
  { id: "inbox", name: { en: "Inbox", zh: "收件箱" }, color: "#64748b", icon: "inbox" },
  { id: "research", name: { en: "Research Papers", zh: "科研论文" }, color: "#3b82f6", icon: "book" },
  { id: "personal", name: { en: "Personal Life", zh: "个人生活" }, color: "#f97316", icon: "home" },
  { id: "career", name: { en: "Career Planning", zh: "职业规划" }, color: "#14b8a6", icon: "briefcase" },
  { id: "reminders", name: { en: "Reminders", zh: "提醒" }, color: "#8b5cf6", icon: "bell" },
] as const;

export const DEFAULT_TASK_TAGS: readonly TaskTagMeta[] = [
  { id: "study", name: { en: "Study", zh: "学习" }, color: "#3b82f6" },
  { id: "work", name: { en: "Work", zh: "工作" }, color: "#14b8a6" },
  { id: "personal", name: { en: "Personal", zh: "个人" }, color: "#f97316" },
  { id: "todo", name: { en: "TO-DO", zh: "待办" }, color: "#8b5cf6" },
  { id: "other", name: { en: "Other", zh: "其他" }, color: "#64748b" },
] as const;

const LEGACY_TAG_TO_LIST: Record<string, string> = {
  study: "research",
  work: "career",
  personal: "personal",
  todo: "reminders",
  other: "inbox",
};

export function defaultListForTask(task: TaskCard): string {
  if (task.listId) return task.listId;
  if (task.inbox) return "inbox";
  if (task.tag && LEGACY_TAG_TO_LIST[task.tag]) return LEGACY_TAG_TO_LIST[task.tag]!;
  return "reminders";
}

export function defaultTagsForTask(task: TaskCard): readonly string[] {
  if (Array.isArray(task.tags)) return task.tags;
  return task.tag ? [task.tag] : [];
}

export function taskListLabel(list: TaskListMeta, lang: "en" | "zh"): string {
  return lang === "zh" ? list.name.zh : list.name.en;
}

export function taskTagLabel(tag: TaskTagMeta, lang: "en" | "zh"): string {
  return lang === "zh" ? tag.name.zh : tag.name.en;
}
