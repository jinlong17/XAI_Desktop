import type { WebModuleRouteProps } from "@repo/core/types";
import { RepoAdapter } from "../data/RepoAdapter";
import type { Todo } from "../types";
import { TodoStoreProvider, useTodoStore } from "../hooks/useTodoStore";
import { createBrowserTodoRepo, createWebTodoId, isDeleted, isToday, type WebTodoRecord } from "./browserTodoRepo";
import { useMemo, useState } from "react";

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
    ...record,
    description: record.notes ?? "",
    status: record.done ? "done" : "open",
    priority: "medium",
    quadrant: "schedule",
    dueDate: record.dueAt?.slice(0, 10),
    labels: record.labelIds,
    pomodoroCount: 0,
    version: 1,
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

function WebTodoModuleInner({ childPath, capabilities }: WebModuleRouteProps) {
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
    const title = draftTitle.trim();
    if (!title) {
      return;
    }
    const now = new Date().toISOString();
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
    const created = visibleTodos.find((todo) => todo.title === title && todo.updatedAt >= now);
    if (created) {
      selectTodo(created.id);
    }
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
        <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, display: "grid", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Todos</h2>
          <div style={{ display: "grid", gap: 8 }}>
            <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Title" />
            <textarea value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} placeholder="Notes" rows={3} />
            <button onClick={() => void submit()} type="button">Create</button>
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
                <button onClick={() => void setStatus(todo.id, todo.status === "done" ? "open" : "done")} type="button">
                  {todo.status === "done" ? "Uncomplete" : "Complete"}
                </button>
                <button onClick={() => void deleteTodo(todo.id)} type="button">Delete</button>
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
              />
              <textarea
                value={selectedTodo.description}
                onChange={(event) => void updateTodo(selectedTodo.id, { description: event.target.value })}
                rows={6}
                aria-label="Selected todo notes"
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
  const adapter = useMemo(() => {
    const repo = createBrowserTodoRepo();
    const base = new RepoAdapter<WebTodoRecord>(repo, { entityType: "productivity.todo", orderBy: "createdAt" });
    return {
      getAll: async () => (await base.getAll()).filter((record) => !isDeleted(record)).map(toTodoModel),
      getById: async (id: string) => {
        const record = await base.getById(id);
        return record ? toTodoModel(record) : null;
      },
      save: async (todo: Todo) => {
        const next = fromTodoModel({ ...todo, id: todo.id || createWebTodoId() });
        await base.save(next);
      },
      delete: async (id: string) => {
        await base.delete(id);
      },
    };
  }, []);

  return (
    <TodoStoreProvider adapter={adapter}>
      <WebTodoModuleInner {...props} />
    </TodoStoreProvider>
  );
}
