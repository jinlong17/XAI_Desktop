import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { emitEvent } from "@repo/core/events";
import { LocalStorageAdapter } from "../data/LocalStorageAdapter";
import { useProductivityRepoAdapters } from "../data/RepoProvider";
import { useOrganizerGridTaskListener } from "../events/organizerGridTasks";
import type { DataAdapter, Todo, TodoDraft, TodoPriority, TodoQuadrant, TodoStatus } from "../types";

const STORAGE_KEY = "xai.plugin-productivity.todos";

const seedTodos: Todo[] = [
  {
    id: "todo-review-roadmap",
    entityType: "productivity.todo",
    schemaVersion: 1,
    syncScope: "account-sync",
    title: "Review Track B roadmap",
    description: "Keep package boundaries aligned with parallel tracks.",
    status: "in-progress",
    priority: "high",
    quadrant: "do",
    dueDate: "2026-05-20",
    labels: ["label-focus"],
    pomodoroCount: 1,
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
    version: 1,
  },
  {
    id: "todo-clean-inbox",
    entityType: "productivity.todo",
    schemaVersion: 1,
    syncScope: "account-sync",
    title: "Triage low priority captures",
    description: "Move stale captures into clipboard or archive.",
    status: "open",
    priority: "low",
    quadrant: "eliminate",
    labels: [],
    pomodoroCount: 0,
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
    version: 1,
  },
];

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isTodayOrPast(dateText?: string): boolean {
  if (!dateText) return false;
  const due = new Date(`${dateText}T23:59:59`);
  const today = new Date();
  return Number.isFinite(due.getTime()) && due.getTime() <= today.getTime();
}

/** Returns the ISO string of the local end-of-day boundary for a YYYY-MM-DD date. */
function dueBoundaryIso(dateText: string): string {
  return new Date(`${dateText}T23:59:59`).toISOString();
}

/** Returns ms until the local end-of-day boundary for a YYYY-MM-DD date; negative if already past. */
function msUntilBoundary(dateText: string): number {
  return new Date(`${dateText}T23:59:59`).getTime() - Date.now();
}

/** Max setTimeout delay is int32 max (~24.8 days). Cap at 24 hours. */
const MAX_TIMEOUT_MS = 24 * 60 * 60 * 1000;

export function autoAssignQuadrant(title: string, dueDate?: string): TodoQuadrant {
  const lower = title.toLowerCase();
  const urgent = isTodayOrPast(dueDate) || /\b(urgent|asap|today|now|blocker|紧急|马上|今天)\b/.test(lower);
  const important = /\b(important|strategy|review|ship|deadline|关键|重要|上线)\b/.test(lower);
  if (urgent && important) return "do";
  if (important) return "schedule";
  if (urgent) return "delegate";
  return "eliminate";
}

function priorityForQuadrant(quadrant: TodoQuadrant): TodoPriority {
  if (quadrant === "do") return "high";
  if (quadrant === "schedule" || quadrant === "delegate") return "medium";
  return "low";
}

export interface TodoStore {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  refresh(): Promise<void>;
  createTodo(input: TodoDraft): Promise<Todo>;
  updateTodo(id: string, patch: Partial<Omit<Todo, "id" | "createdAt" | "updatedAt">>): Promise<void>;
  deleteTodo(id: string): Promise<void>;
  setStatus(id: string, status: TodoStatus): Promise<void>;
  moveToQuadrant(id: string, quadrant: TodoQuadrant): Promise<void>;
  incrementPomodoro(id: string): Promise<void>;
  getTodoById(id: string): Todo | null;
}

const TodoStoreContext = createContext<TodoStore | undefined>(undefined);

export interface TodoStoreProviderProps {
  adapter?: DataAdapter<Todo>;
  children: ReactNode;
}

export function TodoStoreProvider({ adapter, children }: TodoStoreProviderProps) {
  const repoAdapters = useProductivityRepoAdapters();
  const [defaultAdapter] = useState(() => new LocalStorageAdapter<Todo>(STORAGE_KEY, seedTodos));
  const stableAdapter = adapter ?? repoAdapters?.todoAdapter ?? defaultAdapter;
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Dedup: tracks (todoId:dueDate) pairs that have already been emitted.
  const dueEmittedRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await stableAdapter.getAll();
      setTodos(next.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load todos");
    } finally {
      setIsLoading(false);
    }
  }, [stableAdapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (todo: Todo, options: { touchUpdatedAt?: boolean } = {}) => {
      const nextTodo = options.touchUpdatedAt === false ? todo : { ...todo, updatedAt: new Date().toISOString(), version: todo.version + 1 };
      await stableAdapter.save(nextTodo);
      setTodos((prev) => {
        const next = prev.some((current) => current.id === nextTodo.id)
          ? prev.map((current) => (current.id === nextTodo.id ? nextTodo : current))
          : [nextTodo, ...prev];
        return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
      return nextTodo;
    },
    [stableAdapter],
  );

  const createTodo = useCallback(
    async (input: TodoDraft) => {
      const title = input.title.trim();
      if (!title) throw new Error("Todo title is required");
      const quadrant = input.quadrant ?? autoAssignQuadrant(title, input.dueDate);
      const createdAt = new Date().toISOString();
      const todo: Todo = {
        id: createId("todo"),
        entityType: "productivity.todo",
        schemaVersion: 1,
        syncScope: "account-sync",
        title,
        description: input.description?.trim() ?? "",
        status: "open",
        priority: input.priority ?? priorityForQuadrant(quadrant),
        quadrant,
        dueDate: input.dueDate,
        labels: input.labels ?? [],
        pomodoroCount: 0,
        createdAt,
        updatedAt: createdAt,
        version: 1,
      };
      return persist(todo, { touchUpdatedAt: false });
    },
    [persist],
  );

  useOrganizerGridTaskListener(createTodo);

  // Emit productivity:todo-due for todos whose dueDate boundary has crossed.
  // Dedup per (todoId:dueDate); schedule setTimeout for future boundaries.
  useEffect(() => {
    const emitted = dueEmittedRef.current;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const todo of todos) {
      if (!todo.dueDate) continue;
      if (todo.status === "done" || todo.status === "archived") {
        // Purge stale dedup entry so a re-open can re-emit under a new flow.
        emitted.delete(`${todo.id}:${todo.dueDate}`);
        continue;
      }
      const dedupKey = `${todo.id}:${todo.dueDate}`;
      const delay = msUntilBoundary(todo.dueDate);

      if (delay <= 0) {
        // Already past the boundary — emit immediately if not yet emitted.
        if (!emitted.has(dedupKey)) {
          emitted.add(dedupKey);
          void emitEvent("productivity:todo-due", {
            todoId: todo.id,
            title: todo.title,
            dueDate: todo.dueDate,
            quadrant: todo.quadrant,
            dueBoundaryAt: dueBoundaryIso(todo.dueDate),
          }).catch(() => undefined);
        }
      } else {
        // Schedule a future emit; cap at MAX_TIMEOUT_MS to avoid int32 overflow.
        const safeDelay = Math.min(delay, MAX_TIMEOUT_MS);
        const captured = { ...todo };
        timers.push(
          setTimeout(() => {
            if (emitted.has(dedupKey)) return;
            emitted.add(dedupKey);
            void emitEvent("productivity:todo-due", {
              todoId: captured.id,
              title: captured.title,
              dueDate: captured.dueDate!,
              quadrant: captured.quadrant,
              dueBoundaryAt: dueBoundaryIso(captured.dueDate!),
            }).catch(() => undefined);
          }, safeDelay),
        );
      }
    }

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [todos]);

  const updateTodo = useCallback(
    async (id: string, patch: Partial<Omit<Todo, "id" | "createdAt" | "updatedAt">>) => {
      const current = await stableAdapter.getById(id);
      if (!current) return;
      await persist({ ...current, ...patch });
    },
    [stableAdapter, persist],
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      await stableAdapter.delete(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    },
    [stableAdapter],
  );

  const setStatus = useCallback(
    async (id: string, status: TodoStatus) => updateTodo(id, { status }),
    [updateTodo],
  );

  const moveToQuadrant = useCallback(
    async (id: string, quadrant: TodoQuadrant) => updateTodo(id, { quadrant, priority: priorityForQuadrant(quadrant) }),
    [updateTodo],
  );

  const incrementPomodoro = useCallback(
    async (id: string) => {
      const current = await stableAdapter.getById(id);
      if (!current) return;
      await persist({ ...current, pomodoroCount: current.pomodoroCount + 1 });
    },
    [stableAdapter, persist],
  );

  const getTodoById = useCallback(
    (id: string) => todos.find((todo) => todo.id === id) ?? null,
    [todos],
  );

  const value = useMemo<TodoStore>(
    () => ({
      todos,
      isLoading,
      error,
      refresh,
      createTodo,
      updateTodo,
      deleteTodo,
      setStatus,
      moveToQuadrant,
      incrementPomodoro,
      getTodoById,
    }),
    [todos, isLoading, error, refresh, createTodo, updateTodo, deleteTodo, setStatus, moveToQuadrant, incrementPomodoro, getTodoById],
  );

  return <TodoStoreContext.Provider value={value}>{children}</TodoStoreContext.Provider>;
}

export function useTodoStore(): TodoStore {
  const store = useContext(TodoStoreContext);
  if (!store) throw new Error("useTodoStore must be used within TodoStoreProvider");
  return store;
}
