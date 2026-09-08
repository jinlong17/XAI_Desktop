import type { RepoRecord } from "@repo/core-data";

export interface DataAdapter<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export type TodoStatus = "open" | "in-progress" | "done" | "archived";
export type TodoPriority = "low" | "medium" | "high";
export type TodoQuadrant = "do" | "schedule" | "delegate" | "eliminate";

export interface Todo extends RepoRecord {
  id: string;
  entityType: "productivity.todo";
  schemaVersion: 1;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  quadrant: TodoQuadrant;
  dueDate?: string;
  labels: string[];
  pomodoroCount: number;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt?: string;
}

export interface TodoDraft {
  title: string;
  description?: string;
  dueDate?: string;
  labels?: string[];
  priority?: TodoPriority;
  quadrant?: TodoQuadrant;
}

export type PomodoroMode = "focus" | "short-break" | "long-break";
export type PomodoroStatus = "idle" | "running" | "paused" | "completed";

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
}

export interface PomodoroState {
  mode: PomodoroMode;
  status: PomodoroStatus;
  activeTodoId: string | null;
  remainingSeconds: number;
  cyclesCompleted: number;
  lastCompletedTodoId: string | null;
  lastCompletedAt: string | null;
  settings: PomodoroSettings;
}

export type HabitFrequency = "daily" | "weekdays" | "weekly";

export interface HabitHistoryEntry {
  date: string;
  count: number;
  completedAt: string;
}

export interface Habit extends RepoRecord {
  id: string;
  entityType: "productivity.habit";
  schemaVersion: 1;
  name: string;
  frequency: HabitFrequency;
  streak: number;
  history: HabitHistoryEntry[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt?: string;
}

export interface HabitDraft {
  name: string;
  frequency?: HabitFrequency;
  labels?: string[];
}
