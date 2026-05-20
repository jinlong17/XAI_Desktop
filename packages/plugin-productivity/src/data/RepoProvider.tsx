import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTauriRepo, type Repo } from "@repo/core-data";
import { useTauriInvoke } from "@repo/core/hooks";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { RepoAdapter } from "./RepoAdapter";
import type { DataAdapter, Habit, Todo } from "../types";

const TODO_STORAGE_KEY = "xai.plugin-productivity.todos";
const HABIT_STORAGE_KEY = "xai.plugin-productivity.habits";

export interface ProductivityRepoAdapters {
  todoAdapter: DataAdapter<Todo>;
  habitAdapter: DataAdapter<Habit>;
}

const ProductivityRepoContext = createContext<ProductivityRepoAdapters | undefined>(undefined);

export interface ProductivityRepoProviderProps {
  todoAdapter?: DataAdapter<Todo>;
  habitAdapter?: DataAdapter<Habit>;
  todoRepo?: Repo<Todo>;
  habitRepo?: Repo<Habit>;
  seedTodos?: Todo[];
  seedHabits?: Habit[];
  children: ReactNode;
}

function canUseTauriRepo(): boolean {
  return typeof window !== "undefined" && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function ProductivityRepoProvider({
  todoAdapter,
  habitAdapter,
  todoRepo,
  habitRepo,
  seedTodos = [],
  seedHabits = [],
  children,
}: ProductivityRepoProviderProps) {
  const { invoke } = useTauriInvoke();
  const value = useMemo<ProductivityRepoAdapters>(() => {
    const resolvedTodoRepo = todoRepo ?? (canUseTauriRepo() ? createTauriRepo<Todo>(invoke, { namespace: "plugin-productivity-todos", schemaVersion: 1 }) : undefined);
    const resolvedHabitRepo = habitRepo ?? (canUseTauriRepo() ? createTauriRepo<Habit>(invoke, { namespace: "plugin-productivity-habits", schemaVersion: 1 }) : undefined);
    return {
      todoAdapter:
        todoAdapter ??
        (resolvedTodoRepo
          ? new RepoAdapter<Todo>(resolvedTodoRepo, { entityType: "productivity.todo", seed: seedTodos, orderBy: "createdAt" })
          : new LocalStorageAdapter<Todo>(TODO_STORAGE_KEY, seedTodos)),
      habitAdapter:
        habitAdapter ??
        (resolvedHabitRepo
          ? new RepoAdapter<Habit>(resolvedHabitRepo, { entityType: "productivity.habit", seed: seedHabits, orderBy: "createdAt" })
          : new LocalStorageAdapter<Habit>(HABIT_STORAGE_KEY, seedHabits)),
    };
  }, [habitAdapter, habitRepo, invoke, seedHabits, seedTodos, todoAdapter, todoRepo]);

  return <ProductivityRepoContext.Provider value={value}>{children}</ProductivityRepoContext.Provider>;
}

export function useProductivityRepoAdapters(): ProductivityRepoAdapters | undefined {
  return useContext(ProductivityRepoContext);
}
