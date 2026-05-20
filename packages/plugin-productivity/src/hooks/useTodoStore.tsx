import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LocalStorageAdapter } from "../data/LocalStorageAdapter";
import type { DataAdapter, Todo, TodoDraft, TodoPriority, TodoQuadrant, TodoStatus } from "../types";

const STORAGE_KEY = "xai.plugin-productivity.todos";

const seedTodos: Todo[] = [
  {
    id: "todo-review-roadmap",
    title: "Review Track B roadmap",
    description: "Keep package boundaries aligned with parallel tracks.",
    status: "in-progress",
    priority: "high",
    quadrant: "do",
    dueDate: "2026-05-20",
    labels: ["label-focus"],
    pomodoroCount: 1,
    createdAt: "2026-05-20T00:00:00.000Z",
  },
  {
    id: "todo-clean-inbox",
    title: "Triage low priority captures",
    description: "Move stale captures into clipboard or archive.",
    status: "open",
    priority: "low",
    quadrant: "eliminate",
    labels: [],
    pomodoroCount: 0,
    createdAt: "2026-05-20T00:00:00.000Z",
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
  updateTodo(id: string, patch: Partial<Omit<Todo, "id" | "createdAt">>): Promise<void>;
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

export function TodoStoreProvider({
  adapter = new LocalStorageAdapter<Todo>(STORAGE_KEY, seedTodos),
  children,
}: TodoStoreProviderProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await adapter.getAll();
      setTodos(next.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load todos");
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (todo: Todo) => {
      await adapter.save(todo);
      setTodos((prev) => {
        const next = prev.some((current) => current.id === todo.id)
          ? prev.map((current) => (current.id === todo.id ? todo : current))
          : [todo, ...prev];
        return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
    },
    [adapter],
  );

  const createTodo = useCallback(
    async (input: TodoDraft) => {
      const title = input.title.trim();
      if (!title) throw new Error("Todo title is required");
      const quadrant = input.quadrant ?? autoAssignQuadrant(title, input.dueDate);
      const todo: Todo = {
        id: createId("todo"),
        title,
        description: input.description?.trim() ?? "",
        status: "open",
        priority: input.priority ?? priorityForQuadrant(quadrant),
        quadrant,
        dueDate: input.dueDate,
        labels: input.labels ?? [],
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
      };
      await persist(todo);
      return todo;
    },
    [persist],
  );

  const updateTodo = useCallback(
    async (id: string, patch: Partial<Omit<Todo, "id" | "createdAt">>) => {
      const current = await adapter.getById(id);
      if (!current) return;
      await persist({ ...current, ...patch });
    },
    [adapter, persist],
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      await adapter.delete(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    },
    [adapter],
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
      const current = await adapter.getById(id);
      if (!current) return;
      await persist({ ...current, pomodoroCount: current.pomodoroCount + 1 });
    },
    [adapter, persist],
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
