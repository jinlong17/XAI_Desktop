import { TaskSaveFailure } from "./TaskSaveFailure.js";
import { groupTasksByDueDate } from "./internal/groupTasksByDueDate.js";
import { useLocalDayClock } from "@repo/plugin-web-tokens";
/**
 * TasksModule — root component for the Tasks module.
 *
 * The task board remains backed by xai_task_cols. Editable list/tag metadata is
 * stored separately in xai_pref_task_lists and xai_pref_task_tags.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BucketId,
  NewTaskDraft,
  SmartListId,
  TaskCard,
  TaskCol,
  TaskListMeta,
  TaskPriority,
  TaskTagId,
  TaskTagMeta,
  TaskViewSelection,
  TasksModuleProps,
} from "./types.js";
import { useI18n } from "@repo/plugin-web-tokens";
import { accountScope, getPrefAutosave, mutateCanonicalDataset, setPrefAutosave, usePref } from "@repo/plugin-web-storage";
import { SEED_TASK_COLS } from "./internal/seed/tasksMock.js";
import { isTaskColsArray } from "./internal/validate.js";
import {
  addCard,
  deleteCard,
  deleteCards,
  moveCard,
  toggleComplete,
  updateCard,
  updateCards,
} from "./internal/tasksReducer.js";
import { filterCardsByList } from "./internal/filterCardsByList.js";
import { STR_SMART_LIST_EMPTY } from "./internal/strings.js";
import {
  DEFAULT_TASK_LISTS,
  DEFAULT_TASK_TAGS,
  defaultListForTask,
  defaultTagsForTask,
  taskListLabel,
  taskTagLabel,
} from "./internal/taskMeta.js";
import { TasksSidebar } from "./TasksSidebar.js";
import { TaskColumn } from "./TaskColumn.js";
import { TaskComposer } from "./TaskComposer.js";
import { TaskCard as TaskCardView } from "./TaskCard.js";

export type { TasksModuleProps };

type MetaEditorState =
  | { kind: "list"; mode: "create" | "edit"; item?: TaskListMeta }
  | { kind: "tag"; mode: "create" | "edit"; item?: TaskTagMeta };

interface LocatedTask {
  task: TaskCard;
  colId: BucketId;
}

const SMART_FILTERS: readonly SmartListId[] = ["all", "today", "tomorrow", "next7", "inbox", "summary"];
const PRIORITIES: readonly TaskPriority[] = ["low", "normal", "high", "urgent"];
type CollectionBoardMode = "grouped" | "time";

export function TasksModule({ lang }: TasksModuleProps) {
  const { s } = useI18n(lang);
  const owner = useRef(accountScope.capture()).current;
  const [failedSave, setFailedSave] = useState<{ kind: "tasks" | "lists" | "tags"; value: TaskCol[] | TaskListMeta[] | TaskTagMeta[]; baseline?: TaskCol[] } | null>(null);
  const { now } = useLocalDayClock();

  const [rawCols] = usePref("xai_task_cols");
  const [lists, setLists] = useState<TaskListMeta[]>(() =>
    readTaskMeta("task_lists", DEFAULT_TASK_LISTS, isTaskListArray),
  );
  const [tags, setTags] = useState<TaskTagMeta[]>(() =>
    readTaskMeta("task_tags", DEFAULT_TASK_TAGS, isTaskTagArray),
  );

  const baseCols = useMemo<TaskCol[]>(() => {
    if (isTaskColsArray(rawCols)) return rawCols as TaskCol[];
    if (rawCols !== null && rawCols !== undefined && !(rawCols instanceof Object && Object.keys(rawCols as object).length === 0)) {
      if (typeof import.meta !== "undefined" && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
        console.warn("[plugin-web-tasks] usePref('xai_task_cols') returned non-array shape — falling back to seed.");
      }
    }
    return SEED_TASK_COLS as TaskCol[];
  }, [rawCols]);

  const taskCols = useMemo<TaskCol[]>(() => groupTasksByDueDate(hydrateTaskCols(baseCols), now), [baseCols, now]);

  const persistLists = useCallback((next: TaskListMeta[]) => {
    const ok = accountScope.isReady(owner) && setPrefAutosave("task_lists", next, { scope: owner });
    if (ok) { setLists(next); setFailedSave(null); }
    else setFailedSave({ kind: "lists", value: next });
    return ok;
  }, [owner]);

  const persistTags = useCallback((next: TaskTagMeta[]) => {
    const ok = accountScope.isReady(owner) && setPrefAutosave("task_tags", next, { scope: owner });
    if (ok) { setTags(next); setFailedSave(null); }
    else setFailedSave({ kind: "tags", value: next });
    return ok;
  }, [owner]);

  const persistCols = useCallback(async (next: TaskCol[], baseline: TaskCol[] = taskCols) => {
    if (!accountScope.isReady(owner)) {
      setFailedSave({ kind: "tasks", value: next, baseline });
      return false;
    }
    const result = await mutateCanonicalDataset({
      key: "xai_task_cols", scope: owner, validate: isTaskColsArray,
      initialize: () => baseline,
      mutate: current => JSON.stringify(current) === JSON.stringify(baseline)
        ? ({ ok: true as const, data: next })
        : ({ ok: false as const, reason: "conflict" }),
    });
    if (result.ok) { setFailedSave(null); return true; }
    setFailedSave({ kind: "tasks", value: next, baseline });
    return false;
  }, [owner, taskCols]);

  useEffect(() => {
    if (isTaskColsArray(rawCols) && JSON.stringify(rawCols) === JSON.stringify(taskCols)) return;
    void persistCols(taskCols, isTaskColsArray(rawCols) ? rawCols as TaskCol[] : taskCols);
  }, [rawCols, taskCols, persistCols]);

  const completedIds = useMemo<ReadonlySet<string>>(() => {
    const ids = new Set<string>();
    for (const col of taskCols) {
      for (const task of col.tasks) {
        if (task.done === true) ids.add(task.id);
      }
    }
    return ids;
  }, [taskCols]);

  const [activeView, setActiveView] = useState<TaskViewSelection>({ kind: "smart", id: "all" });
  const [collectionBoardMode, setCollectionBoardMode] = useState<CollectionBoardMode>("grouped");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [metaEditor, setMetaEditor] = useState<MetaEditorState | null>(null);

  const activeTasks = useMemo(() => taskCols.flatMap((col) => col.tasks), [taskCols]);
  const smartCounts = useMemo(() => getSmartCounts(taskCols, now), [taskCols, now]);
  const listCounts = useMemo(() => countByList(activeTasks), [activeTasks]);
  const tagCounts = useMemo(() => countByTag(activeTasks), [activeTasks]);
  const taskOrigins = useMemo(() => getTaskOrigins(taskCols), [taskCols]);

  const filteredCols = useMemo<TaskCol[]>(
    () => filterColsByView(taskCols, activeView, now),
    [taskCols, activeView, now],
  );

  const overviewActive =
    (activeView.kind === "smart" && (activeView.id === "all" || activeView.id === "summary")) ||
    (activeView.kind === "list" && activeView.id === "all") ||
    (activeView.kind === "tag" && activeView.id === "all");
  const collectionAllView = activeView.kind !== "smart" && activeView.id === "all";
  const showCollectionGrouped = collectionAllView && collectionBoardMode === "grouped";

  const visibleCols = useMemo(() => {
    if (overviewActive) return filteredCols;
    return filteredCols.filter((col) => col.tasks.length + (col.completed?.length ?? 0) > 0);
  }, [filteredCols, overviewActive]);

  const filteredTotalTasks = filteredCols.reduce(
    (sum, col) => sum + col.tasks.length + (col.completed?.length ?? 0),
    0,
  );
  const showBoardEmpty = !overviewActive && filteredTotalTasks === 0;
  const [dragging, setDragging] = useState<{ taskId: string; fromColId: BucketId } | null>(null);
  const [overColId, setOverColId] = useState<BucketId | null>(null);

  const editingTask = editingTaskId ? findTask(taskCols, editingTaskId) : null;

  function selectSmartView(id: SmartListId) {
    setActiveView({ kind: "smart", id });
  }

  function selectListView(id: "all" | string) {
    setActiveView({ kind: "list", id });
    if (id === "all") setCollectionBoardMode("grouped");
  }

  function selectTagView(id: "all" | string) {
    setActiveView({ kind: "tag", id });
    if (id === "all") setCollectionBoardMode("grouped");
  }

  const handleToggle = useCallback(async (taskId: string) => {
    await persistCols(toggleComplete(taskCols, taskId));
  }, [taskCols, persistCols]);

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  function handleDragStart(
    e: React.DragEvent<HTMLDivElement>,
    taskId: string,
    fromColId: BucketId,
  ) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/x-xai-task-id", taskId);
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

  async function handleDrop(e: React.DragEvent<HTMLElement>, toColId: BucketId) {
    e.preventDefault();
    const data = readTaskPayload(e);
    setOverColId(null);
    setDragging(null);
    if (!data || data.fromColId === toColId) return;
    await persistCols(moveCard(taskCols, data.taskId, data.fromColId, toColId));
  }

  const [composer, setComposer] = useState<{ open: boolean; bucket: BucketId }>({
    open: false,
    bucket: "next7",
  });

  function handleAddCard(bucketId: BucketId) {
    setComposer({ open: true, bucket: bucketId });
  }

  async function handleComposerSave(draft: NewTaskDraft, targetBucket: BucketId) {
    const operation = composer;
    const ok = await persistCols(addCard(taskCols, draft, targetBucket));
    if (ok) setComposer(current => current === operation ? { ...current, open: false } : current);
    return ok;
  }

  function handleComposerClose() {
    setComposer((c) => ({ ...c, open: false }));
  }

  async function handleTaskDropToList(taskId: string, listId: string) {
    const ids = selectedIds.has(taskId) ? selectedIds : new Set([taskId]);
    await persistCols(updateCards(taskCols, ids, { listId }));
  }

  async function handleTaskDropToTag(taskId: string, tagId: string) {
    const ids = selectedIds.has(taskId) ? selectedIds : new Set([taskId]);
    await persistCols(addTagToTasks(taskCols, ids, tagId));
  }

  function handleReorderList(fromId: string, toId: string) {
    persistLists(reorderById(lists, fromId, toId));
  }

  function handleReorderTag(fromId: string, toId: string) {
    persistTags(reorderById(tags, fromId, toId));
  }

  function handleCreateList() {
    setMetaEditor({ kind: "list", mode: "create" });
  }

  function handleCreateTag() {
    setMetaEditor({ kind: "tag", mode: "create" });
  }

  function handleSaveMeta(next: TaskListMeta | TaskTagMeta) {
    if (!metaEditor) return false;
    if (metaEditor.kind === "list") {
      const list = next as TaskListMeta;
      const updated = metaEditor.mode === "edit"
        ? lists.map((item) => item.id === list.id ? list : item)
        : [...lists, list];
      if (!persistLists(updated)) return false;
      selectListView(list.id);
    } else {
      const tag = next as TaskTagMeta;
      const updated = metaEditor.mode === "edit"
        ? tags.map((item) => item.id === tag.id ? tag : item)
        : [...tags, tag];
      if (!persistTags(updated)) return false;
      selectTagView(tag.id);
    }
    setMetaEditor(null);
    return true;
  }

  async function handleDeleteList(listId: string) {
    if (lists.length <= 1) return;
    const fallback = lists.find((list) => list.id !== listId)?.id ?? "inbox";
    if (!await persistCols(updateCards(taskCols, new Set(activeTasks.filter((task) => task.listId === listId).map((task) => task.id)), { listId: fallback }))) return;
    if (!persistLists(lists.filter((list) => list.id !== listId))) return;
    if (activeView.kind === "list" && activeView.id === listId) selectListView("all");
  }

  async function handleDeleteTag(tagId: string) {
    if (!await persistCols(removeTagFromTasks(taskCols, tagId))) return;
    if (!persistTags(tags.filter((tag) => tag.id !== tagId))) return;
    if (activeView.kind === "tag" && activeView.id === tagId) selectTagView("all");
  }

  async function handleBulkComplete() {
    await persistCols(updateCards(taskCols, selectedIds, { done: true }));
  }

  async function handleBulkDelete() {
    if (!await persistCols(deleteCards(taskCols, selectedIds))) return;
    setSelectedIds(new Set());
    if (editingTaskId && selectedIds.has(editingTaskId)) setEditingTaskId(null);
  }

  async function handleBulkList(listId: string) {
    if (!listId) return;
    await persistCols(updateCards(taskCols, selectedIds, { listId }));
  }

  async function handleBulkTag(tagId: string) {
    if (!tagId) return;
    await persistCols(updateCards(taskCols, selectedIds, { tags: [tagId], tag: tagId as TaskTagId }));
  }

  async function handleBulkBucket(bucketId: BucketId | "") {
    if (!bucketId) return;
    await persistCols(moveManyToBucket(taskCols, selectedIds, bucketId));
  }

  async function handleBulkPriority(priority: TaskPriority | "") {
    if (!priority) return;
    await persistCols(updateCards(taskCols, selectedIds, { priority }));
  }

  async function handleDetailSave(id: string, patch: {
    title: string;
    bucket: BucketId;
    listId: string;
    tags: string[];
    priority: TaskPriority;
    notes: string;
    dueDate?: string | null;
    done: boolean;
  }) {
    const located = findTask(taskCols, id);
    if (!located) return false;
    let next = taskCols;
    if (located.colId !== patch.bucket) {
      next = moveCard(next, id, located.colId, patch.bucket);
    }
    next = updateCard(next, id, {
      title: patch.title,
      listId: patch.listId,
      tags: patch.tags,
      tag: patch.tags[0] ? (patch.tags[0] as TaskTagId) : null,
      priority: patch.priority,
      notes: patch.notes,
      ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate } : {}),
      done: patch.done,
    });
    return persistCols(next);
  }

  async function handleDetailDelete(id: string) {
    if (!await persistCols(deleteCard(taskCols, id))) return false;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    return true;
  }

  const mainTitle = titleForView(activeView, lists, tags, lang, s("tasks.all"));

  return (
    <div className="module module-tasks">
      {failedSave && !composer.open && !editingTaskId && !metaEditor && <div>
        <TaskSaveFailure lang={lang} owner={owner} draft={failedSave} />
        <button onClick={() => {
          if (failedSave.kind === "tasks") void persistCols(failedSave.value as TaskCol[], failedSave.baseline ?? taskCols);
          else if (failedSave.kind === "lists") persistLists(failedSave.value as TaskListMeta[]);
          else persistTags(failedSave.value as TaskTagMeta[]);
        }}>{lang === "zh" ? "重试保存" : "Retry save"}</button>
      </div>}
      <TasksSidebar
        lang={lang}
        activeView={activeView}
        lists={lists}
        tags={tags}
        smartCounts={smartCounts}
        listCounts={listCounts}
        tagCounts={tagCounts}
        onSelectSmart={selectSmartView}
        onSelectList={selectListView}
        onSelectTag={selectTagView}
        onCreateList={handleCreateList}
        onCreateTag={handleCreateTag}
        onEditList={(id) => setMetaEditor({ kind: "list", mode: "edit", item: lists.find((list) => list.id === id) })}
        onEditTag={(id) => setMetaEditor({ kind: "tag", mode: "edit", item: tags.find((tag) => tag.id === id) })}
        onDeleteList={handleDeleteList}
        onDeleteTag={handleDeleteTag}
        onReorderList={handleReorderList}
        onReorderTag={handleReorderTag}
        onTaskDropToList={handleTaskDropToList}
        onTaskDropToTag={handleTaskDropToTag}
      />
      <main className="tasks-main">
        <header className="module-head tasks-head">
          <div className="row">
            <ListIcon />
            <h1 className="module-title">{mainTitle}</h1>
            {dragging && (
              <span className="drag-hint" style={{ marginLeft: 8 }}>
                {lang === "zh" ? "时间列设为今天、明天、8 天后或无日期；清单和标签不改日期" : "Time columns set today, tomorrow, +8 days, or no date; lists and tags keep the date"}
              </span>
            )}
          </div>
          <button className="task-primary-action" onClick={() => handleAddCard(activeDefaultBucket(activeView))}>
            <PlusIcon /> {lang === "zh" ? "新建任务" : "New task"}
          </button>
        </header>

        <SmartFilterBar
          lang={lang}
          activeView={activeView}
          counts={smartCounts}
          onSelect={selectSmartView}
        />

        {collectionAllView && (
          <CollectionViewSwitch
            lang={lang}
            kind={activeView.kind === "tag" ? "tag" : "list"}
            mode={collectionBoardMode}
            onModeChange={setCollectionBoardMode}
          />
        )}

        {collectionAllView && collectionBoardMode === "time" && (
          <CollectionStrip
            lang={lang}
            activeView={activeView}
            lists={lists}
            tags={tags}
            listCounts={listCounts}
            tagCounts={tagCounts}
            onSelectList={selectListView}
            onSelectTag={selectTagView}
            onReorderList={handleReorderList}
            onReorderTag={handleReorderTag}
            onTaskDropToList={handleTaskDropToList}
            onTaskDropToTag={handleTaskDropToTag}
          />
        )}

        {selectedIds.size > 0 && (
          <BulkToolbar
            lang={lang}
            selectedCount={selectedIds.size}
            lists={lists}
            tags={tags}
            onClear={() => setSelectedIds(new Set())}
            onComplete={handleBulkComplete}
            onDelete={handleBulkDelete}
            onList={handleBulkList}
            onTag={handleBulkTag}
            onBucket={handleBulkBucket}
            onPriority={handleBulkPriority}
          />
        )}

        {!showCollectionGrouped && showBoardEmpty && (
          <div className="tasks-board-empty" role="status">
            {emptyTextForView(activeView, lang)}
          </div>
        )}

        {showCollectionGrouped ? (
          <GroupedCollectionBoard
            lang={lang}
            kind={activeView.kind === "tag" ? "tag" : "list"}
            lists={lists}
            tags={tags}
            tasks={activeTasks}
            taskOrigins={taskOrigins}
            draggingTaskId={dragging?.taskId ?? null}
            completedIds={completedIds}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onOpenTask={setEditingTaskId}
            onSelectTask={handleSelectTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTaskDropToList={handleTaskDropToList}
            onTaskDropToTag={handleTaskDropToTag}
            onReorderList={handleReorderList}
            onReorderTag={handleReorderTag}
          />
        ) : (
          <div className={"task-columns" + (visibleCols.length < 4 ? " task-columns--filtered" : "")}>
            {visibleCols.map((col) => (
              <TaskColumn
                key={col.id}
                col={col}
                lang={lang}
                draggingTaskId={dragging?.taskId ?? null}
                isDropTarget={overColId === col.id}
                completedIds={completedIds}
                selectedIds={selectedIds}
                lists={lists}
                tags={tags}
                filterActive={!overviewActive}
                onToggle={handleToggle}
                onOpenTask={setEditingTaskId}
                onSelectTask={handleSelectTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onAddCard={handleAddCard}
              />
            ))}
          </div>
        )}
      </main>

      <TaskComposer
        open={composer.open}
        lang={lang}
        defaultBucket={composer.bucket}
        lists={lists}
        tags={tags}
        defaultListId={activeView.kind === "list" && activeView.id !== "all" ? activeView.id : lists[0]?.id}
        onSave={handleComposerSave}
        onClose={handleComposerClose}
      />

      <TaskDetailPanel
        lang={lang}
        located={editingTask}
        lists={lists}
        tags={tags}
        onSave={handleDetailSave}
        onDelete={handleDetailDelete}
        onClose={() => setEditingTaskId(null)}
      />

      <MetaEditorDialog
        lang={lang}
        editor={metaEditor}
        onCancel={() => setMetaEditor(null)}
        onSave={handleSaveMeta}
      />
    </div>
  );
}

function hydrateTaskCols(cols: TaskCol[]): TaskCol[] {
  return cols.map((col) => {
    const tasks = [...col.tasks.map(hydrateTask), ...(col.completed ?? []).filter(task => task.done === false).map(hydrateTask)];
    const completed = col.completed?.filter(task => task.done !== false).map((task) => ({ ...hydrateTask(task), done: true }));
    return {
      ...col,
      tasks,
      count: tasks.length,
      ...(completed ? { completed } : {}),
    };
  });
}

function hydrateTask(task: TaskCard): TaskCard {
  return {
    ...task,
    listId: defaultListForTask(task),
    tags: [...defaultTagsForTask(task)],
    priority: task.priority ?? "normal",
  };
}

function readTaskMeta<T>(
  suffix: string,
  fallback: readonly T[],
  guard: (value: unknown) => value is T[],
): T[] {
  const raw = getPrefAutosave<T[]>(suffix, { defaultValue: [...fallback] });
  return guard(raw) && raw.length > 0 ? raw : [...fallback];
}

function isTaskListArray(value: unknown): value is TaskListMeta[] {
  return Array.isArray(value) && value.every((item) =>
    item &&
    typeof item === "object" &&
    typeof (item as TaskListMeta).id === "string" &&
    typeof (item as TaskListMeta).color === "string" &&
    typeof (item as TaskListMeta).icon === "string",
  );
}

function isTaskTagArray(value: unknown): value is TaskTagMeta[] {
  return Array.isArray(value) && value.every((item) =>
    item &&
    typeof item === "object" &&
    typeof (item as TaskTagMeta).id === "string" &&
    typeof (item as TaskTagMeta).color === "string",
  );
}

function filterColsByView(cols: TaskCol[], view: TaskViewSelection, now: Date): TaskCol[] {
  if (view.kind === "smart") return filterCardsByList(cols, view.id, now);
  if (view.kind === "list" && view.id === "all") return cols;
  return cols.map((col) => {
    const tasks = col.tasks.filter((task) => {
      if (view.kind === "list") return task.listId === view.id;
      const ids = task.tags ?? (task.tag ? [task.tag] : []);
      return view.id === "all" ? ids.length > 0 : ids.includes(view.id);
    });
    const completed = col.completed?.filter((task) => {
      if (view.kind === "list") return task.listId === view.id;
      const ids = task.tags ?? (task.tag ? [task.tag] : []);
      return view.id === "all" ? ids.length > 0 : ids.includes(view.id);
    });
    return {
      ...col,
      tasks,
      count: tasks.length,
      ...(completed ? { completed } : {}),
    };
  });
}

function getSmartCounts(cols: TaskCol[], now: Date): Record<SmartListId, number> {
  const count = (id: SmartListId) => filterCardsByList(cols, id, now).reduce((n, col) => n + col.tasks.length, 0);
  const total = cols.reduce((sum, col) => sum + col.tasks.length, 0);
  const inbox = cols.reduce((sum, col) => sum + col.tasks.filter((task) => task.inbox === true || task.listId === "inbox").length, 0);
  return {
    all: total,
    summary: total,
    today: count("today"),
    tomorrow: count("tomorrow"),
    next7: count("next7"),
    inbox,
  };
}

function countByList(tasks: readonly TaskCard[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const task of tasks) {
    const id = task.listId ?? "inbox";
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

function countByTag(tasks: readonly TaskCard[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const task of tasks) {
    for (const tagId of task.tags ?? (task.tag ? [task.tag] : [])) {
      counts[tagId] = (counts[tagId] ?? 0) + 1;
    }
  }
  return counts;
}

function getTaskOrigins(cols: readonly TaskCol[]): ReadonlyMap<string, BucketId> {
  const origins = new Map<string, BucketId>();
  for (const col of cols) {
    for (const task of col.tasks) {
      origins.set(task.id, col.id);
    }
  }
  return origins;
}

function findTask(cols: readonly TaskCol[], id: string): LocatedTask | null {
  for (const col of cols) {
    const task = col.tasks.find((item) => item.id === id);
    if (task) return { task, colId: col.id };
  }
  return null;
}

function readTaskPayload(e: React.DragEvent): { taskId: string; fromColId: BucketId } | null {
  try {
    const payload = JSON.parse(e.dataTransfer.getData("text/plain")) as { taskId?: string; fromColId?: BucketId };
    if (payload.taskId && payload.fromColId) return { taskId: payload.taskId, fromColId: payload.fromColId };
  } catch {
    return null;
  }
  return null;
}

function reorderById<T extends { id: string }>(items: readonly T[], fromId: string, toId: string): T[] {
  if (fromId === toId) return [...items];
  const from = items.findIndex((item) => item.id === fromId);
  const to = items.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0) return [...items];
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (!item) return next;
  next.splice(to, 0, item);
  return next;
}

function addTagToTasks(cols: TaskCol[], ids: ReadonlySet<string>, tagId: string): TaskCol[] {
  return cols.map((col) => {
    let changed = false;
    const tasks = col.tasks.map((task) => {
      if (!ids.has(task.id)) return task;
      const nextTags = Array.from(new Set([...(task.tags ?? (task.tag ? [task.tag] : [])), tagId]));
      changed = true;
      return { ...task, tags: nextTags, tag: (task.tag ?? tagId) as TaskTagId };
    });
    return changed ? { ...col, tasks } : col;
  });
}

function removeTagFromTasks(cols: TaskCol[], tagId: string): TaskCol[] {
  return cols.map((col) => {
    let changed = false;
    const tasks = col.tasks.map((task) => {
      const current = task.tags ?? (task.tag ? [task.tag] : []);
      if (!current.includes(tagId) && task.tag !== tagId) return task;
      const nextTags = current.filter((id) => id !== tagId);
      changed = true;
      return {
        ...task,
        tags: nextTags,
        ...(nextTags[0] ? { tag: nextTags[0] as TaskTagId } : { tag: undefined }),
      };
    });
    return changed ? { ...col, tasks } : col;
  });
}

function moveManyToBucket(cols: TaskCol[], ids: ReadonlySet<string>, bucketId: BucketId): TaskCol[] {
  let next = cols;
  for (const id of ids) {
    const located = findTask(next, id);
    if (located && located.colId !== bucketId) {
      next = moveCard(next, id, located.colId, bucketId);
    }
  }
  return next;
}

function titleForView(
  view: TaskViewSelection,
  lists: readonly TaskListMeta[],
  tags: readonly TaskTagMeta[],
  lang: "en" | "zh",
  fallback: string,
): string {
  if (view.kind === "smart") {
    const map: Record<SmartListId, { en: string; zh: string }> = {
      all: { en: "All tasks", zh: "全部任务" },
      summary: { en: "Overview", zh: "总览" },
      today: { en: "Today", zh: "今天" },
      tomorrow: { en: "Tomorrow", zh: "明天" },
      next7: { en: "Next few days", zh: "最近几天" },
      inbox: { en: "Inbox", zh: "收件箱" },
    };
    return map[view.id][lang];
  }
  if (view.kind === "list") {
    if (view.id === "all") return lang === "zh" ? "全部清单" : "All lists";
    const list = lists.find((item) => item.id === view.id);
    return list ? taskListLabel(list, lang) : fallback;
  }
  if (view.id === "all") return lang === "zh" ? "全部标签" : "All tags";
  const tag = tags.find((item) => item.id === view.id);
  return tag ? taskTagLabel(tag, lang) : fallback;
}

function emptyTextForView(view: TaskViewSelection, lang: "en" | "zh"): string {
  if (view.kind === "smart") return STR_SMART_LIST_EMPTY[view.id][lang];
  if (view.kind === "list") return lang === "zh" ? "这个清单没有任务" : "No tasks in this list";
  return lang === "zh" ? "这个标签没有任务" : "No tasks with this tag";
}

function activeDefaultBucket(view: TaskViewSelection): BucketId {
  if (view.kind !== "smart") return "next7";
  if (view.id === "today") return "overdue";
  if (view.id === "tomorrow" || view.id === "next7") return "next7";
  return "next7";
}

function SmartFilterBar({
  lang,
  activeView,
  counts,
  onSelect,
}: {
  lang: "en" | "zh";
  activeView: TaskViewSelection;
  counts: Readonly<Record<SmartListId, number>>;
  onSelect: (id: SmartListId) => void;
}) {
  const labels: Record<SmartListId, { en: string; zh: string }> = {
    all: { en: "All", zh: "全部" },
    summary: { en: "Overview", zh: "总览" },
    today: { en: "Today", zh: "今天" },
    tomorrow: { en: "Tomorrow", zh: "明天" },
    next7: { en: "Next few days", zh: "最近几天" },
    inbox: { en: "Inbox", zh: "收件箱" },
  };
  return (
    <div className="task-smart-bar" aria-label={lang === "zh" ? "任务筛选" : "Task filters"}>
      {SMART_FILTERS.map((id) => (
        <button
          key={id}
          className="task-smart-chip"
          data-active={activeView.kind === "smart" && activeView.id === id}
          onClick={() => onSelect(id)}
        >
          <span>{labels[id][lang]}</span>
          <span className="count">{counts[id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

function CollectionViewSwitch({
  lang,
  kind,
  mode,
  onModeChange,
}: {
  lang: "en" | "zh";
  kind: "list" | "tag";
  mode: CollectionBoardMode;
  onModeChange: (mode: CollectionBoardMode) => void;
}) {
  const groupedLabel = kind === "list"
    ? (lang === "zh" ? "按清单" : "By list")
    : (lang === "zh" ? "按标签" : "By tag");
  return (
    <div className="task-view-switch" aria-label={lang === "zh" ? "显示视图" : "Display view"}>
      <button
        type="button"
        data-active={mode === "grouped"}
        onClick={() => onModeChange("grouped")}
      >
        {groupedLabel}
      </button>
      <button
        type="button"
        data-active={mode === "time"}
        onClick={() => onModeChange("time")}
      >
        {lang === "zh" ? "按时间" : "By time"}
      </button>
    </div>
  );
}

function CollectionStrip({
  lang,
  activeView,
  lists,
  tags,
  listCounts,
  tagCounts,
  onSelectList,
  onSelectTag,
  onReorderList,
  onReorderTag,
  onTaskDropToList,
  onTaskDropToTag,
}: {
  lang: "en" | "zh";
  activeView: TaskViewSelection;
  lists: ReadonlyArray<TaskListMeta>;
  tags: ReadonlyArray<TaskTagMeta>;
  listCounts: Readonly<Record<string, number>>;
  tagCounts: Readonly<Record<string, number>>;
  onSelectList: (id: string) => void;
  onSelectTag: (id: string) => void;
  onReorderList: (fromId: string, toId: string) => void;
  onReorderTag: (fromId: string, toId: string) => void;
  onTaskDropToList: (taskId: string, listId: string) => void;
  onTaskDropToTag: (taskId: string, tagId: string) => void;
}) {
  if (activeView.kind === "list" && activeView.id === "all") {
    return (
      <div className="task-collection-strip" aria-label={lang === "zh" ? "清单卡片" : "List cards"}>
        {lists.map((list) => (
          <button
            key={list.id}
            className="collection-card"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("application/x-xai-list-id", list.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const dragged = e.dataTransfer.getData("application/x-xai-list-id");
              if (dragged) onReorderList(dragged, list.id);
              else {
                const taskId = e.dataTransfer.getData("application/x-xai-task-id");
                if (taskId) onTaskDropToList(taskId, list.id);
              }
            }}
            onClick={() => onSelectList(list.id)}
            style={{ borderColor: list.color }}
          >
            <span className="collection-color" style={{ background: list.color }} />
            <span className="collection-title">{taskListLabel(list, lang)}</span>
            <span className="count">{listCounts[list.id] ?? 0}</span>
          </button>
        ))}
      </div>
    );
  }
  if (activeView.kind === "tag" && activeView.id === "all") {
    return (
      <div className="task-collection-strip" aria-label={lang === "zh" ? "标签卡片" : "Tag cards"}>
        {tags.map((tag) => (
          <button
            key={tag.id}
            className="collection-card"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("application/x-xai-tag-id", tag.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const dragged = e.dataTransfer.getData("application/x-xai-tag-id");
              if (dragged) onReorderTag(dragged, tag.id);
              else {
                const taskId = e.dataTransfer.getData("application/x-xai-task-id");
                if (taskId) onTaskDropToTag(taskId, tag.id);
              }
            }}
            onClick={() => onSelectTag(tag.id)}
            style={{ borderColor: tag.color }}
          >
            <span className="collection-color" style={{ background: tag.color }} />
            <span className="collection-title">{taskTagLabel(tag, lang)}</span>
            <span className="count">{tagCounts[tag.id] ?? 0}</span>
          </button>
        ))}
      </div>
    );
  }
  return null;
}

function GroupedCollectionBoard({
  lang,
  kind,
  lists,
  tags,
  tasks,
  taskOrigins,
  draggingTaskId,
  completedIds,
  selectedIds,
  onToggle,
  onOpenTask,
  onSelectTask,
  onDragStart,
  onDragEnd,
  onTaskDropToList,
  onTaskDropToTag,
  onReorderList,
  onReorderTag,
}: {
  lang: "en" | "zh";
  kind: "list" | "tag";
  lists: ReadonlyArray<TaskListMeta>;
  tags: ReadonlyArray<TaskTagMeta>;
  tasks: ReadonlyArray<TaskCard>;
  taskOrigins: ReadonlyMap<string, BucketId>;
  draggingTaskId: string | null;
  completedIds: ReadonlySet<string>;
  selectedIds: ReadonlySet<string>;
  onToggle: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, fromColId: BucketId) => void;
  onDragEnd: () => void;
  onTaskDropToList: (taskId: string, listId: string) => void;
  onTaskDropToTag: (taskId: string, tagId: string) => void;
  onReorderList: (fromId: string, toId: string) => void;
  onReorderTag: (fromId: string, toId: string) => void;
}) {
  const groups = kind === "list"
    ? lists.map((list) => ({
      id: list.id,
      title: taskListLabel(list, lang),
      color: list.color,
      icon: list.icon,
      tasks: tasks.filter((task) => task.listId === list.id),
    }))
    : tags.map((tag) => ({
      id: tag.id,
      title: taskTagLabel(tag, lang),
      color: tag.color,
      icon: "#",
      tasks: tasks.filter((task) => (task.tags ?? (task.tag ? [task.tag] : [])).includes(tag.id)),
    }));

  return (
    <div className="task-group-board" aria-label={kind === "list" ? (lang === "zh" ? "清单看板" : "List board") : (lang === "zh" ? "标签看板" : "Tag board")}>
      {groups.map((group) => (
        <TaskGroupColumn
          key={group.id}
          lang={lang}
          kind={kind}
          group={group}
          lists={lists}
          tags={tags}
          taskOrigins={taskOrigins}
          draggingTaskId={draggingTaskId}
          completedIds={completedIds}
          selectedIds={selectedIds}
          onToggle={onToggle}
          onOpenTask={onOpenTask}
          onSelectTask={onSelectTask}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onTaskDropToList={onTaskDropToList}
          onTaskDropToTag={onTaskDropToTag}
          onReorderList={onReorderList}
          onReorderTag={onReorderTag}
        />
      ))}
    </div>
  );
}

function TaskGroupColumn({
  lang,
  kind,
  group,
  lists,
  tags,
  taskOrigins,
  draggingTaskId,
  completedIds,
  selectedIds,
  onToggle,
  onOpenTask,
  onSelectTask,
  onDragStart,
  onDragEnd,
  onTaskDropToList,
  onTaskDropToTag,
  onReorderList,
  onReorderTag,
}: {
  lang: "en" | "zh";
  kind: "list" | "tag";
  group: { id: string; title: string; color: string; icon: string; tasks: TaskCard[] };
  lists: ReadonlyArray<TaskListMeta>;
  tags: ReadonlyArray<TaskTagMeta>;
  taskOrigins: ReadonlyMap<string, BucketId>;
  draggingTaskId: string | null;
  completedIds: ReadonlySet<string>;
  selectedIds: ReadonlySet<string>;
  onToggle: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string, fromColId: BucketId) => void;
  onDragEnd: () => void;
  onTaskDropToList: (taskId: string, listId: string) => void;
  onTaskDropToTag: (taskId: string, tagId: string) => void;
  onReorderList: (fromId: string, toId: string) => void;
  onReorderTag: (fromId: string, toId: string) => void;
}) {
  const [dropActive, setDropActive] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    setDropActive(false);
    const reorderId = e.dataTransfer.getData(kind === "list" ? "application/x-xai-list-id" : "application/x-xai-tag-id");
    if (reorderId) {
      if (kind === "list") onReorderList(reorderId, group.id);
      else onReorderTag(reorderId, group.id);
      return;
    }
    const taskId = readTaskPayload(e)?.taskId ?? e.dataTransfer.getData("application/x-xai-task-id");
    if (!taskId) return;
    if (kind === "list") onTaskDropToList(taskId, group.id);
    else onTaskDropToTag(taskId, group.id);
  }

  return (
    <section
      className={"task-group-col" + (dropActive ? " drop-target" : "")}
      style={{ "--group-color": group.color } as React.CSSProperties}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDropActive(true);
      }}
      onDragLeave={() => setDropActive(false)}
      onDrop={handleDrop}
    >
      <header
        className="task-group-head"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData(kind === "list" ? "application/x-xai-list-id" : "application/x-xai-tag-id", group.id);
        }}
      >
        <span className="group-swatch" aria-hidden="true" />
        <span className="task-group-icon">{group.icon}</span>
        <h2 className="task-group-title">{group.title}</h2>
        <span className="col-count">{group.tasks.length}</span>
      </header>
      <div className="task-group-body">
        {group.tasks.map((task) => {
          const originColId = taskOrigins.get(task.id) ?? "next7";
          return (
            <TaskCardView
              key={task.id}
              task={task}
              lang={lang}
              colId={originColId}
              completed={completedIds.has(task.id)}
              dragging={draggingTaskId === task.id}
              selected={selectedIds.has(task.id)}
              taskList={lists.find((list) => list.id === task.listId)}
              taskTags={tags.filter((tag) => (task.tags ?? (task.tag ? [task.tag] : [])).includes(tag.id))}
              onToggle={() => onToggle(task.id)}
              onOpen={() => onOpenTask(task.id)}
              onSelect={() => onSelectTask(task.id)}
              onDragStart={(e) => onDragStart(e, task.id, originColId)}
              onDragEnd={onDragEnd}
            />
          );
        })}
        {group.tasks.length === 0 && (
          <div className="task-col-empty">
            {lang === "zh" ? "拖任务到这里" : "Drop tasks here"}
          </div>
        )}
      </div>
    </section>
  );
}

function BulkToolbar({
  lang,
  selectedCount,
  lists,
  tags,
  onClear,
  onComplete,
  onDelete,
  onList,
  onTag,
  onBucket,
  onPriority,
}: {
  lang: "en" | "zh";
  selectedCount: number;
  lists: ReadonlyArray<TaskListMeta>;
  tags: ReadonlyArray<TaskTagMeta>;
  onClear: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onList: (id: string) => void;
  onTag: (id: string) => void;
  onBucket: (id: BucketId | "") => void;
  onPriority: (priority: TaskPriority | "") => void;
}) {
  return (
    <div className="bulk-toolbar" role="region" aria-label={lang === "zh" ? "批量处理" : "Bulk actions"}>
      <strong>{lang === "zh" ? `已选择 ${selectedCount} 个任务` : `${selectedCount} selected`}</strong>
      <button onClick={onComplete}>{lang === "zh" ? "批量完成" : "Complete"}</button>
      <button onClick={onDelete}>{lang === "zh" ? "批量删除" : "Delete"}</button>
      <select aria-label={lang === "zh" ? "批量修改清单" : "Change list"} defaultValue="" onChange={(e) => onList(e.target.value)}>
        <option value="">{lang === "zh" ? "修改清单" : "Move to list"}</option>
        {lists.map((list) => <option key={list.id} value={list.id}>{taskListLabel(list, lang)}</option>)}
      </select>
      <select aria-label={lang === "zh" ? "批量修改标签" : "Change tag"} defaultValue="" onChange={(e) => onTag(e.target.value)}>
        <option value="">{lang === "zh" ? "修改标签" : "Set tag"}</option>
        {tags.map((tag) => <option key={tag.id} value={tag.id}>{taskTagLabel(tag, lang)}</option>)}
      </select>
      <select aria-label={lang === "zh" ? "批量修改日期" : "Change date"} defaultValue="" onChange={(e) => onBucket(e.target.value as BucketId | "")}>
        <option value="">{lang === "zh" ? "修改日期" : "Set date"}</option>
        <option value="overdue">{lang === "zh" ? "今天/过期" : "Today/overdue"}</option>
        <option value="next7">{lang === "zh" ? "明天/最近几天" : "Tomorrow/next days"}</option>
        <option value="later">{lang === "zh" ? "以后（8 天后）" : "Later (+8 days)"}</option>
        <option value="nodate">{lang === "zh" ? "无日期" : "No date"}</option>
      </select>
      <select aria-label={lang === "zh" ? "批量调整优先级" : "Change priority"} defaultValue="" onChange={(e) => onPriority(e.target.value as TaskPriority | "")}>
        <option value="">{lang === "zh" ? "优先级" : "Priority"}</option>
        {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priorityLabel(priority, lang)}</option>)}
      </select>
      <button onClick={onClear}>{lang === "zh" ? "清除选择" : "Clear"}</button>
    </div>
  );
}

function TaskDetailPanel({
  lang,
  located,
  lists,
  tags,
  onSave,
  onDelete,
  onClose,
}: {
  lang: "en" | "zh";
  located: LocatedTask | null;
  lists: ReadonlyArray<TaskListMeta>;
  tags: ReadonlyArray<TaskTagMeta>;
  onSave: (id: string, patch: {
    title: string;
    bucket: BucketId;
    listId: string;
    tags: string[];
    priority: TaskPriority;
    notes: string;
    dueDate?: string | null;
    done: boolean;
  }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const owner = useRef(accountScope.capture()).current;
  const [saveFailed, setSaveFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const sessionRef = useRef(0);
  const task = located?.task;
  const [title, setTitle] = useState("");
  const [bucket, setBucket] = useState<BucketId>("next7");
  const [listId, setListId] = useState("inbox");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dateEdited, setDateEdited] = useState(false);
  const openedTask = useRef<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!located) {
      openedTask.current = null;
      sessionRef.current += 1;
      pendingRef.current = false;
      setPending(false);
      return;
    }
    const identity = located.task.id;
    if (openedTask.current === identity) return;
    openedTask.current = identity;
    sessionRef.current += 1;
    pendingRef.current = false;
    setPending(false);
    setSaveFailed(false);
    setTitle(lang === "zh" ? located.task.title.zh : located.task.title.en);
    setBucket(located.colId);
    setListId(located.task.listId ?? lists[0]?.id ?? "inbox");
    setTagIds([...(located.task.tags ?? (located.task.tag ? [located.task.tag] : []))]);
    setPriority(located.task.priority ?? "normal");
    setNotes(located.task.notes ?? "");
    setDueDate(located.task.dueDate ?? "");
    setDateEdited(false);
    setDone(located.task.done === true);
  }, [located, lang, lists]);

  if (!task || !located) return null;

  const save = async (nextDone: boolean) => {
    if (pendingRef.current) return;
    const session = sessionRef.current;
    pendingRef.current = true;
    setPending(true);
    let ok = false;
    try {
      ok = await onSave(task.id, {
        title: title.trim() || (lang === "zh" ? task.title.zh : task.title.en),
        bucket,
        listId,
        tags: tagIds,
        priority,
        notes,
        ...(dateEdited ? { dueDate: dueDate || null } : {}),
        done: nextDone,
      });
    } catch {
      ok = false;
    }
    if (session !== sessionRef.current) return;
    pendingRef.current = false;
    setPending(false);
    setSaveFailed(!ok);
  };

  const remove = async () => {
    if (pendingRef.current) return;
    const session = sessionRef.current;
    pendingRef.current = true;
    setPending(true);
    let ok = false;
    try {
      ok = await onDelete(task.id);
    } catch {
      ok = false;
    }
    if (session !== sessionRef.current) return;
    pendingRef.current = false;
    setPending(false);
    setSaveFailed(!ok);
    if (ok) onClose();
  };

  return (
    <aside className="task-detail-panel" aria-label={lang === "zh" ? "任务详情" : "Task details"}>
      <header>
        <h2>{lang === "zh" ? "任务详情" : "Task details"}</h2>
        <button className="icon-btn" aria-label={lang === "zh" ? "关闭" : "Close"} onClick={onClose}>x</button>
      </header>
      <label>
        <span>{lang === "zh" ? "标题" : "Title"}</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="task-detail-check">
        <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} />
        <span>{lang === "zh" ? "标记完成" : "Mark complete"}</span>
      </label>
      <label>
        <span>{lang === "zh" ? "时间分组（移动会设置日期）" : "Time group (moving schedules a date)"}</span>
        <select value={bucket} onChange={(e) => setBucket(e.target.value as BucketId)}>
          <option value="overdue">{lang === "zh" ? "今天/过期" : "Today/overdue"}</option>
          <option value="next7">{lang === "zh" ? "明天/最近几天" : "Tomorrow/next days"}</option>
          <option value="later">{lang === "zh" ? "以后（8 天后）" : "Later (+8 days)"}</option>
          <option value="nodate">{lang === "zh" ? "无日期" : "No date"}</option>
        </select>
      </label>
      <label>
        <span>{lang === "zh" ? "截止日期" : "Due date"}</span>
        <input type="date" value={dueDate} onChange={e => { setDueDate(e.target.value); setDateEdited(true); }} />
      </label>
      <label>
        <span>{lang === "zh" ? "清单" : "List"}</span>
        <select value={listId} onChange={(e) => setListId(e.target.value)}>
          {lists.map((list) => <option key={list.id} value={list.id}>{taskListLabel(list, lang)}</option>)}
        </select>
      </label>
      <div className="task-detail-field">
        <span>{lang === "zh" ? "标签" : "Tags"}</span>
        <div className="task-tag-toggle-grid">
          {tags.map((tag) => (
            <label key={tag.id}>
              <input
                type="checkbox"
                checked={tagIds.includes(tag.id)}
                onChange={(e) => {
                  setTagIds((prev) => e.target.checked
                    ? Array.from(new Set([...prev, tag.id]))
                    : prev.filter((id) => id !== tag.id));
                }}
              />
              <span style={{ color: tag.color }}>{taskTagLabel(tag, lang)}</span>
            </label>
          ))}
        </div>
      </div>
      <label>
        <span>{lang === "zh" ? "优先级" : "Priority"}</span>
        <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          {PRIORITIES.map((item) => <option key={item} value={item}>{priorityLabel(item, lang)}</option>)}
        </select>
      </label>
      <label>
        <span>{lang === "zh" ? "备注" : "Notes"}</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
      </label>
      {saveFailed && <TaskSaveFailure lang={lang} owner={owner} draft={{ id: task.id, title, bucket, listId, tags: tagIds, priority, notes, dueDate, dateEdited, done }} />}
      <footer>
        <button
          className="task-composer__btn task-composer__btn--primary"
          disabled={pending || !title.trim()}
          onClick={() => { void save(done); }}
        >
          {lang === "zh" ? "保存" : "Save"}
        </button>
        <button className="task-composer__btn" disabled={pending} onClick={() => { void save(true); }}>
          {lang === "zh" ? "完成" : "Complete"}
        </button>
        <button className="task-composer__btn task-danger-btn" disabled={pending} onClick={() => { void remove(); }}>
          {lang === "zh" ? "删除" : "Delete"}
        </button>
      </footer>
    </aside>
  );
}

function MetaEditorDialog({
  lang,
  editor,
  onSave,
  onCancel,
}: {
  lang: "en" | "zh";
  editor: MetaEditorState | null;
  onSave: (item: TaskListMeta | TaskTagMeta) => boolean;
  onCancel: () => void;
}) {
  const owner = useRef(accountScope.capture()).current;
  const [saveFailed, setSaveFailed] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [icon, setIcon] = useState("list");

  useEffect(() => {
    if (!editor) return;
    setSaveFailed(false);
    setNameEn(editor.item?.name.en ?? (editor.kind === "list" ? "New list" : "New tag"));
    setNameZh(editor.item?.name.zh ?? (editor.kind === "list" ? "新清单" : "新标签"));
    setColor(editor.item?.color ?? "#3b82f6");
    setIcon(editor.kind === "list" ? (editor.item as TaskListMeta | undefined)?.icon ?? "list" : "tag");
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="task-modal-backdrop" role="presentation" onClick={onCancel}>
      <section className="task-meta-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{editor.kind === "list" ? (lang === "zh" ? "编辑清单" : "Edit list") : (lang === "zh" ? "编辑标签" : "Edit tag")}</h2>
        <label>
          <span>{lang === "zh" ? "英文名称" : "English label"}</span>
          <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </label>
        <label>
          <span>{lang === "zh" ? "中文名称" : "Chinese label"}</span>
          <input value={nameZh} onChange={(e) => setNameZh(e.target.value)} />
        </label>
        <label>
          <span>{lang === "zh" ? "颜色" : "Color"}</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        {editor.kind === "list" && (
          <label>
            <span>{lang === "zh" ? "图标/Label" : "Icon label"}</span>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} />
          </label>
        )}
        {saveFailed && <TaskSaveFailure lang={lang} owner={owner} draft={{ kind: editor.kind, id: editor.item?.id, name: { en: nameEn, zh: nameZh }, color, icon }} />}
        <footer>
          <button className="task-composer__btn" onClick={onCancel}>{lang === "zh" ? "取消" : "Cancel"}</button>
          <button
            className="task-composer__btn task-composer__btn--primary"
            onClick={() => {
              const id = editor.item?.id ?? `${editor.kind}-${Date.now().toString(36)}`;
              if (editor.kind === "list") {
                setSaveFailed(!onSave({ id, name: { en: nameEn.trim() || "New list", zh: nameZh.trim() || "新清单" }, color, icon: icon.trim() || "list" }));
              } else {
                setSaveFailed(!onSave({ id, name: { en: nameEn.trim() || "New tag", zh: nameZh.trim() || "新标签" }, color }));
              }
            }}
          >
            {lang === "zh" ? "保存" : "Save"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function priorityLabel(priority: TaskPriority, lang: "en" | "zh"): string {
  const labels = {
    low: { en: "Low", zh: "低" },
    normal: { en: "Normal", zh: "普通" },
    high: { en: "High", zh: "高" },
    urgent: { en: "Urgent", zh: "紧急" },
  } as const;
  return labels[priority][lang];
}

function ListIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true"><path d="M2 4h14v2H2V4zm0 4h14v2H2V8zm0 4h9v2H2v-2z"/></svg>;
}

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 3a1 1 0 011 1v3h3a1 1 0 110 2H9v3a1 1 0 11-2 0V9H4a1 1 0 110-2h3V4a1 1 0 011-1z"/></svg>;
}
