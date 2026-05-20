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
import { useProductivityRepoAdapters } from "../data/RepoProvider";
import type { DataAdapter, Habit, HabitDraft, HabitHistoryEntry } from "../types";

const STORAGE_KEY = "xai.plugin-productivity.habits";

const seedHabits: Habit[] = [
  {
    id: "habit-deep-work",
    entityType: "productivity.habit",
    schemaVersion: 1,
    syncScope: "account-sync",
    name: "Deep work block",
    frequency: "daily",
    streak: 3,
    history: [
      { date: "2026-05-18", count: 1, completedAt: "2026-05-18T09:00:00.000Z" },
      { date: "2026-05-19", count: 1, completedAt: "2026-05-19T09:00:00.000Z" },
      { date: "2026-05-20", count: 1, completedAt: "2026-05-20T09:00:00.000Z" },
    ],
    labels: ["label-focus"],
    createdAt: "2026-05-18T09:00:00.000Z",
    updatedAt: "2026-05-18T09:00:00.000Z",
    version: 1,
  },
];

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayUtcKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function calculateStreak(history: HabitHistoryEntry[]): number {
  const completed = new Set(history.filter((entry) => entry.count > 0).map((entry) => entry.date));
  let streak = 0;
  // Streaks use UTC day boundaries so timezone and DST shifts do not change the count.
  const cursor = new Date(`${todayUtcKey()}T00:00:00Z`);
  while (completed.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export interface HabitStore {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  refresh(): Promise<void>;
  createHabit(input: HabitDraft): Promise<Habit>;
  updateHabit(id: string, patch: Partial<Omit<Habit, "id" | "createdAt" | "updatedAt">>): Promise<void>;
  deleteHabit(id: string): Promise<void>;
  checkIn(id: string, date?: string): Promise<void>;
  getHabitById(id: string): Habit | null;
}

const HabitStoreContext = createContext<HabitStore | undefined>(undefined);

export interface HabitStoreProviderProps {
  adapter?: DataAdapter<Habit>;
  children: ReactNode;
}

export function HabitStoreProvider({ adapter, children }: HabitStoreProviderProps) {
  const repoAdapters = useProductivityRepoAdapters();
  const [defaultAdapter] = useState(() => new LocalStorageAdapter<Habit>(STORAGE_KEY, seedHabits));
  const stableAdapter = adapter ?? repoAdapters?.habitAdapter ?? defaultAdapter;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setHabits(await stableAdapter.getAll());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load habits");
    } finally {
      setIsLoading(false);
    }
  }, [stableAdapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (habit: Habit, options: { touchUpdatedAt?: boolean } = {}) => {
      const nextHabit = options.touchUpdatedAt === false ? habit : { ...habit, updatedAt: new Date().toISOString(), version: habit.version + 1 };
      await stableAdapter.save(nextHabit);
      setHabits((prev) =>
        prev.some((current) => current.id === nextHabit.id)
          ? prev.map((current) => (current.id === nextHabit.id ? nextHabit : current))
          : [nextHabit, ...prev],
      );
      return nextHabit;
    },
    [stableAdapter],
  );

  const createHabit = useCallback(
    async (input: HabitDraft) => {
      const name = input.name.trim();
      if (!name) throw new Error("Habit name is required");
      const now = new Date().toISOString();
      const habit: Habit = {
        id: createId("habit"),
        entityType: "productivity.habit",
        schemaVersion: 1,
        syncScope: "account-sync",
        name,
        frequency: input.frequency ?? "daily",
        streak: 0,
        history: [],
        labels: input.labels ?? [],
        createdAt: now,
        updatedAt: now,
        version: 1,
      };
      return persist(habit, { touchUpdatedAt: false });
    },
    [persist],
  );

  const updateHabit = useCallback(
    async (id: string, patch: Partial<Omit<Habit, "id" | "createdAt" | "updatedAt">>) => {
      const current = await stableAdapter.getById(id);
      if (!current) return;
      const history = patch.history ?? current.history;
      await persist({ ...current, ...patch, streak: calculateStreak(history) });
    },
    [stableAdapter, persist],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      await stableAdapter.delete(id);
      setHabits((prev) => prev.filter((habit) => habit.id !== id));
    },
    [stableAdapter],
  );

  const checkIn = useCallback(
    async (id: string, date = todayUtcKey()) => {
      const current = await stableAdapter.getById(id);
      if (!current) return;
      const existing = current.history.find((entry) => entry.date === date);
      const history = existing
        ? current.history.map((entry) =>
            entry.date === date ? { ...entry, count: entry.count + 1, completedAt: new Date().toISOString() } : entry,
          )
        : [...current.history, { date, count: 1, completedAt: new Date().toISOString() }];
      await persist({ ...current, history, streak: calculateStreak(history) });
    },
    [stableAdapter, persist],
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
