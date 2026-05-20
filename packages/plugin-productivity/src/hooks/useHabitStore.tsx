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
import type { DataAdapter, Habit, HabitDraft, HabitHistoryEntry } from "../types";

const STORAGE_KEY = "xai.plugin-productivity.habits";

const seedHabits: Habit[] = [
  {
    id: "habit-deep-work",
    name: "Deep work block",
    frequency: "daily",
    streak: 3,
    history: [
      { date: "2026-05-18", count: 1, completedAt: "2026-05-18T09:00:00.000Z" },
      { date: "2026-05-19", count: 1, completedAt: "2026-05-19T09:00:00.000Z" },
      { date: "2026-05-20", count: 1, completedAt: "2026-05-20T09:00:00.000Z" },
    ],
    labels: ["label-focus"],
  },
];

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function calculateStreak(history: HabitHistoryEntry[]): number {
  const completed = new Set(history.filter((entry) => entry.count > 0).map((entry) => entry.date));
  let streak = 0;
  const cursor = new Date(`${todayKey()}T00:00:00`);
  while (completed.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface HabitStore {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  refresh(): Promise<void>;
  createHabit(input: HabitDraft): Promise<Habit>;
  updateHabit(id: string, patch: Partial<Omit<Habit, "id">>): Promise<void>;
  deleteHabit(id: string): Promise<void>;
  checkIn(id: string, date?: string): Promise<void>;
  getHabitById(id: string): Habit | null;
}

const HabitStoreContext = createContext<HabitStore | undefined>(undefined);

export interface HabitStoreProviderProps {
  adapter?: DataAdapter<Habit>;
  children: ReactNode;
}

export function HabitStoreProvider({
  adapter = new LocalStorageAdapter<Habit>(STORAGE_KEY, seedHabits),
  children,
}: HabitStoreProviderProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setHabits(await adapter.getAll());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load habits");
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (habit: Habit) => {
      await adapter.save(habit);
      setHabits((prev) =>
        prev.some((current) => current.id === habit.id)
          ? prev.map((current) => (current.id === habit.id ? habit : current))
          : [habit, ...prev],
      );
    },
    [adapter],
  );

  const createHabit = useCallback(
    async (input: HabitDraft) => {
      const name = input.name.trim();
      if (!name) throw new Error("Habit name is required");
      const habit: Habit = {
        id: createId("habit"),
        name,
        frequency: input.frequency ?? "daily",
        streak: 0,
        history: [],
        labels: input.labels ?? [],
      };
      await persist(habit);
      return habit;
    },
    [persist],
  );

  const updateHabit = useCallback(
    async (id: string, patch: Partial<Omit<Habit, "id">>) => {
      const current = await adapter.getById(id);
      if (!current) return;
      const history = patch.history ?? current.history;
      await persist({ ...current, ...patch, streak: calculateStreak(history) });
    },
    [adapter, persist],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      await adapter.delete(id);
      setHabits((prev) => prev.filter((habit) => habit.id !== id));
    },
    [adapter],
  );

  const checkIn = useCallback(
    async (id: string, date = todayKey()) => {
      const current = await adapter.getById(id);
      if (!current) return;
      const existing = current.history.find((entry) => entry.date === date);
      const history = existing
        ? current.history.map((entry) =>
            entry.date === date ? { ...entry, count: entry.count + 1, completedAt: new Date().toISOString() } : entry,
          )
        : [...current.history, { date, count: 1, completedAt: new Date().toISOString() }];
      await persist({ ...current, history, streak: calculateStreak(history) });
    },
    [adapter, persist],
  );

  const getHabitById = useCallback(
    (id: string) => habits.find((habit) => habit.id === id) ?? null,
    [habits],
  );

  const value = useMemo<HabitStore>(
    () => ({ habits, isLoading, error, refresh, createHabit, updateHabit, deleteHabit, checkIn, getHabitById }),
    [habits, isLoading, error, refresh, createHabit, updateHabit, deleteHabit, checkIn, getHabitById],
  );

  return <HabitStoreContext.Provider value={value}>{children}</HabitStoreContext.Provider>;
}

export function useHabitStore(): HabitStore {
  const store = useContext(HabitStoreContext);
  if (!store) throw new Error("useHabitStore must be used within HabitStoreProvider");
  return store;
}
