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
import { useConsoleRepoAdapter } from "../data/RepoProvider";
import type { ConsoleNotification, DataAdapter } from "../types";

const STORAGE_KEY = "xai.plugin-console.notifications";

const seedNotifications: ConsoleNotification[] = [
  {
    id: "notice-pomodoro-complete",
    entityType: "console.notification",
    schemaVersion: 1,
    syncScope: "device-local",
    type: "success",
    title: "Pomodoro complete",
    body: "Focus block finished for Review Track B roadmap.",
    read: false,
    createdAt: "2026-05-20T09:00:00.000Z",
    updatedAt: "2026-05-20T09:00:00.000Z",
    version: 1,
    sourcePlugin: "productivity",
  },
  {
    id: "notice-todo-due",
    entityType: "console.notification",
    schemaVersion: 1,
    syncScope: "device-local",
    type: "warning",
    title: "Todo due today",
    body: "Review Track B roadmap is due today.",
    read: false,
    createdAt: "2026-05-20T09:05:00.000Z",
    updatedAt: "2026-05-20T09:05:00.000Z",
    version: 1,
    sourcePlugin: "productivity",
  },
  {
    id: "notice-habit-reminder",
    entityType: "console.notification",
    schemaVersion: 1,
    syncScope: "device-local",
    type: "info",
    title: "Habit reminder",
    body: "Deep work block is still open.",
    read: true,
    createdAt: "2026-05-20T09:10:00.000Z",
    updatedAt: "2026-05-20T09:10:00.000Z",
    version: 1,
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
  adapter,
  children,
}: NotificationStoreProviderProps) {
  const repoAdapter = useConsoleRepoAdapter();
  const [defaultAdapter] = useState(
    () => new LocalStorageAdapter<ConsoleNotification>(STORAGE_KEY, seedNotifications),
  );
  const stableAdapter = adapter ?? repoAdapter ?? defaultAdapter;
  const [notifications, setNotifications] = useState<ConsoleNotification[]>([]);

  const refresh = useCallback(async () => {
    const next = await stableAdapter.getAll();
    setNotifications(next.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [stableAdapter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (notification: ConsoleNotification) => {
      await stableAdapter.save(notification);
      setNotifications((prev) => {
        const next = prev.some((current) => current.id === notification.id)
          ? prev.map((current) => (current.id === notification.id ? notification : current))
          : [notification, ...prev];
        return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
    },
    [stableAdapter],
  );

  const addNotification = useCallback(
    async (input: Omit<ConsoleNotification, "id" | "createdAt" | "read"> & { read?: boolean }) => {
      const notification: ConsoleNotification = {
        ...input,
        id: createId("notice"),
        entityType: "console.notification",
        schemaVersion: 1,
        syncScope: "device-local",
        read: input.read ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };
      await persist(notification);
      return notification;
    },
    [persist],
  );

  const markRead = useCallback(
    async (id: string) => {
      const current = await stableAdapter.getById(id);
      if (!current) return;
      await persist({ ...current, read: true, updatedAt: new Date().toISOString(), version: current.version + 1 });
    },
    [stableAdapter, persist],
  );

  const markAllRead = useCallback(async () => {
    await Promise.all(notifications.map((notification) => persist({ ...notification, read: true, updatedAt: new Date().toISOString(), version: notification.version + 1 })));
  }, [notifications, persist]);

  const deleteNotification = useCallback(
    async (id: string) => {
      await stableAdapter.delete(id);
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    },
    [stableAdapter],
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
