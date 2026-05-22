import type { WebModuleRouteProps } from "@repo/core/types";
import { useMemo, useState } from "react";
import { RepoAdapter } from "../data/RepoAdapter";
import { TodoStoreProvider, useTodoStore } from "../hooks/useTodoStore";
import type { Todo } from "../types";
import {
  createBrowserTodoRepo,
  createWebTodoId,
  isDeleted,
  isToday,
  isTodoWriteReady,
  type WebTodoRecord,
} from "./browserTodoRepo";

const LIST_IDS = ["smart:inbox", "smart:today", "smart:done"] as const;
type SmartListId = (typeof LIST_IDS)[number];

function parseTodoRoute(childPath: string): { listId: SmartListId; todoId?: string } {
  const segments = childPath.split("/").map((segment) => segment.trim()).filter(Boolean);
  const listIdCandidate = segments[0];
  const listId = LIST_IDS.includes(listIdCandidate as SmartListId)
    ? (listIdCandidate as SmartListId)
    : "smart:inbox";
  const todoId = segments[1];
  return { listId, todoId };
}

function toTodoModel(record: WebTodoRecord): Todo {
  return {
    id: record.id,
    entityType: "productivity.todo",
    schemaVersion: 1,
    syncScope: "account-sync",
    title: record.title,
    description: record.notes ?? "",
    status: record.done ? "done" : "open",
    priority: "medium",
    quadrant: "schedule",
    dueDate: record.dueAt?.slice(0, 10),
    labels: record.labelIds,
    pomodoroCount: 0,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    version: 1,
    deletedAt: record.deletedAt,
  };
}

function fromTodoModel(todo: Todo): WebTodoRecord {
  return {
    id: todo.id,
    entityType: "productivity.todo",
    schemaVersion: 1,
    syncScope: "account-sync",
    title: todo.title,
    done: todo.status === "done",
    labelIds: todo.labels,
    dueAt: todo.dueDate,
    notes: todo.description,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
    deletedAt: todo.deletedAt,
  };
}

function createCryptoLockedError(): Error {
  return new Error("todo_crypto_locked:unlock_required_for_writes");
}

function WebTodoModuleInner({ childPath, capabilities, writeReady }: WebModuleRouteProps & { writeReady: boolean }) {
  const route = parseTodoRoute(childPath);
  const { todos, isLoading, error, createTodo, updateTodo, deleteTodo, setStatus } = useTodoStore();
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNotes, setDraftNotes] = useState("");

  const visibleTodos = useMemo(() => {
    const active = todos.filter((todo) => !todo.deletedAt);
    if (route.listId === "smart:done") {
      return active.filter((todo) => todo.status === "done");
    }
    if (route.listId === "smart:today") {
      return active.filter((todo) => todo.status !== "done" && isToday(todo.dueDate));
    }
    return active.filter((todo) => todo.status !== "done");
  }, [route.listId, todos]);

  const selectedTodo = route.todoId ? visibleTodos.find((todo) => todo.id === route.todoId) ?? null : null;

  const selectList = (listId: SmartListId) => {
    capabilities.navigate({ moduleId: "todos", listId });
  };

  const selectTodo = (todoId: string) => {
    capabilities.navigate({ moduleId: "todos", listId: route.listId, detailId: todoId });
  };

  const submit = async () => {
    if (!writeReady) {
      return;
    }

    const title = draftTitle.trim();
    if (!title) {
      return;
    }

    await createTodo({
      title,
      description: draftNotes,
      dueDate: undefined,
      labels: [],
      priority: "medium",
      quadrant: "schedule",
    });

    setDraftTitle("");
    setDraftNotes("");
    await capabilities.persistState({ moduleId: "todos", listId: route.listId });
    await capabilities.requestReconcile("web-todo-create");
  };

  return (
    <section aria-label="todo-web-module" style={{ display: "grid", gap: 12 }}>
      <header style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {LIST_IDS.map((listId) => (
          <button
            key={listId}
            onClick={() => selectList(listId)}
            style={{
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: route.listId === listId ? "#111827" : "#f9fafb",
              color: route.listId === listId ? "#ffffff" : "#111827",
              padding: "6px 10px",
            }}
            type="button"
          >
            {listId}
          </button>
        ))}
      </header>

      {!writeReady ? <p>todo_crypto_locked:unlock_required_for_writes</p> : null}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
        <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, display: "grid", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Todos</h2>
          <div style={{ display: "grid", gap: 8 }}>
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Title"
              disabled={!writeReady}
            />
            <textarea
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
              placeholder="Notes"
              rows={3}
              disabled={!writeReady}
            />
            <button onClick={() => void submit()} type="button" disabled={!writeReady}>Create</button>
          </div>
          {isLoading ? <p>Loading...</p> : null}
          {error ? <p>Error: {error}</p> : null}
          {visibleTodos.map((todo) => (
            <article key={todo.id} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 8 }}>
              <button type="button" onClick={() => selectTodo(todo.id)} style={{ border: 0, background: "transparent", textAlign: "left", padding: 0 }}>
                <strong>{todo.title}</strong>
              </button>
              <p style={{ margin: "4px 0", color: "#6b7280" }}>{todo.description || "-"}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => void setStatus(todo.id, todo.status === "done" ? "open" : "done")}
                  type="button"
                  disabled={!writeReady}
                >
                  {todo.status === "done" ? "Uncomplete" : "Complete"}
                </button>
                <button onClick={() => void deleteTodo(todo.id)} type="button" disabled={!writeReady}>Delete</button>
              </div>
            </article>
          ))}
        </section>

        <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, display: "grid", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Detail</h2>
          {!selectedTodo ? <p>No todo selected.</p> : (
            <>
              <input
                value={selectedTodo.title}
                onChange={(event) => void updateTodo(selectedTodo.id, { title: event.target.value })}
                aria-label="Selected todo title"
                disabled={!writeReady}
              />
              <textarea
                value={selectedTodo.description}
                onChange={(event) => void updateTodo(selectedTodo.id, { description: event.target.value })}
                rows={6}
                aria-label="Selected todo notes"
                disabled={!writeReady}
              />
              <p style={{ margin: 0, color: "#6b7280" }}>todoId: {selectedTodo.id}</p>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

export function TodoWebModuleRoute(props: WebModuleRouteProps) {
  const repo = useMemo(() => createBrowserTodoRepo(), []);

  const adapter = useMemo(() => {
    const base = new RepoAdapter<WebTodoRecord>(repo, { entityType: "productivity.todo", orderBy: "createdAt" });

    return {
      getAll: async () => (await base.getAll()).filter((record) => !isDeleted(record)).map(toTodoModel),
      getById: async (id: string) => {
        const record = await base.getById(id);
        return record ? toTodoModel(record) : null;
      },
      save: async (todo: Todo) => {
        if (!isTodoWriteReady()) {
          throw createCryptoLockedError();
        }
        const next = fromTodoModel({ ...todo, id: todo.id || createWebTodoId() });
        await base.save(next);
      },
      delete: async (id: string) => {
        if (!isTodoWriteReady()) {
          throw createCryptoLockedError();
        }
        await base.delete(id);
      },
    };
  }, [repo]);

  return (
    <TodoStoreProvider adapter={adapter}>
      <WebTodoModuleInner {...props} writeReady={isTodoWriteReady()} />
    </TodoStoreProvider>
  );
}
