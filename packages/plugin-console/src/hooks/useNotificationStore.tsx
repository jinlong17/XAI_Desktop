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
import type { ConsoleNotification, DataAdapter } from "../types";

const STORAGE_KEY = "xai.plugin-console.notifications";

const seedNotifications: ConsoleNotification[] = [
  {
    id: "notice-pomodoro-complete",
    type: "success",
    title: "Pomodoro complete",
    body: "Focus block finished for Review Track B roadmap.",
    read: false,
    createdAt: "2026-05-20T09:00:00.000Z",
    sourcePlugin: "productivity",
  },
  {
    id: "notice-todo-due",
    type: "warning",
    title: "Todo due today",
    body: "Review Track B roadmap is due today.",
    read: false,
    createdAt: "2026-05-20T09:05:00.000Z",
    sourcePlugin: "productivity",
  },
  {
    id: "notice-habit-reminder",
    type: "info",
    title: "Habit reminder",
    body: "Deep work block is still open.",
    read: true,
    createdAt: "2026-05-20T09:10:00.000Z",
    sourcePlugin: "productivity",
  },
];

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface NotificationStore {
  notifications: ConsoleNotification[];
  unreadCount: number;
  refresh(): Promise<void>;
  addNotification(input: Omit<ConsoleNotification, "id" | "createdAt" | "read"> & { read?: boolean }): Promise<ConsoleNotification>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  deleteNotification(id: string): Promise<void>;
}

const NotificationStoreContext = createContext<NotificationStore | undefined>(undefined);

export interface NotificationStoreProviderProps {
  adapter?: DataAdapter<ConsoleNotification>;
  children: ReactNode;
}

export function NotificationStoreProvider({
  adapter = new LocalStorageAdapter<ConsoleNotification>(STORAGE_KEY, seedNotifications),
  children,
}: NotificationStoreProviderProps) {
  const [notifications, setNotifications] = useState<ConsoleNotification[]>([]);

  const refresh = useCallback(async () => {
    const next = await adapter.getAll();
    setNotifications(next.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [adapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (notification: ConsoleNotification) => {
      await adapter.save(notification);
      setNotifications((prev) => {
        const next = prev.some((current) => current.id === notification.id)
          ? prev.map((current) => (current.id === notification.id ? notification : current))
          : [notification, ...prev];
        return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
    },
    [adapter],
  );

  const addNotification = useCallback(
    async (input: Omit<ConsoleNotification, "id" | "createdAt" | "read"> & { read?: boolean }) => {
      const notification: ConsoleNotification = {
        ...input,
        id: createId("notice"),
        read: input.read ?? false,
        createdAt: new Date().toISOString(),
      };
      await persist(notification);
      return notification;
    },
    [persist],
  );

  const markRead = useCallback(
    async (id: string) => {
      const current = await adapter.getById(id);
      if (!current) return;
      await persist({ ...current, read: true });
    },
    [adapter, persist],
  );

  const markAllRead = useCallback(async () => {
    await Promise.all(notifications.map((notification) => persist({ ...notification, read: true })));
  }, [notifications, persist]);

  const deleteNotification = useCallback(
    async (id: string) => {
      await adapter.delete(id);
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    },
    [adapter],
  );

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const value = useMemo<NotificationStore>(
    () => ({ notifications, unreadCount, refresh, addNotification, markRead, markAllRead, deleteNotification }),
    [notifications, unreadCount, refresh, addNotification, markRead, markAllRead, deleteNotification],
  );

  return <NotificationStoreContext.Provider value={value}>{children}</NotificationStoreContext.Provider>;
}

export function useNotificationStore(): NotificationStore {
  const store = useContext(NotificationStoreContext);
  if (!store) throw new Error("useNotificationStore must be used within NotificationStoreProvider");
  return store;
}
