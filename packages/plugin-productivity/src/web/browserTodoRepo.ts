import type { MigrationPlan, MigrationResult, Repo, RepoListQuery, RepoMetadata, RepoRecord, RepoTransaction } from "@repo/core-data";
import type { TodoEntity } from "@repo/core-data";

export type WebTodoRecord = TodoEntity & {
  deletedAt?: string;
};

const STORAGE_KEY = "xai.web.todos.repo.v1";

interface BrowserTodoRepoOptions {
  nowIso?: () => string;
}

function normalizeRecords(input: unknown): WebTodoRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .filter((item): item is WebTodoRecord => Boolean(item) && typeof item === "object" && typeof (item as { id?: unknown }).id === "string")
    .map((record) => ({
      ...record,
      entityType: "productivity.todo",
      schemaVersion: 1,
      syncScope: "account-sync",
    }));
}

function safeParseRecords(raw: string | null): WebTodoRecord[] {
  if (!raw) {
    return [];
  }
  try {
    return normalizeRecords(JSON.parse(raw));
  } catch {
    return [];
  }
}

function sortRecords(records: WebTodoRecord[], query?: RepoListQuery<WebTodoRecord>): WebTodoRecord[] {
  const filtered = records.filter((record) => {
    if (query?.entityType && record.entityType !== query.entityType) {
      return false;
    }
    if (query?.syncScope && record.syncScope !== query.syncScope) {
      return false;
    }
    return true;
  });

  if (query?.orderBy) {
    const direction = query.orderBy.direction === "asc" ? 1 : -1;
    const field = query.orderBy.field;
    filtered.sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction;
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction;
      }
      return 0;
    });
  }

  if (typeof query?.limit === "number") {
    return filtered.slice(0, Math.max(query.limit, 0));
  }
  return filtered;
}

export function createBrowserTodoRepo(options: BrowserTodoRepoOptions = {}): Repo<WebTodoRecord> {
  const nowIso = options.nowIso ?? (() => new Date().toISOString());
  let records = safeParseRecords(typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY));

  const save = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  };

  const metadata = async (): Promise<RepoMetadata> => ({
    driver: "browser-localstorage-repo",
    namespace: "plugin-productivity-web-todos",
    schemaVersion: 1,
    migrationVersion: 0,
    recordCount: records.length,
    migrations: [],
  });

  const list = async (query?: RepoListQuery<WebTodoRecord>): Promise<WebTodoRecord[]> => sortRecords([...records], query);

  const get = async (id: string): Promise<WebTodoRecord | undefined> => records.find((record) => record.id === id);

  const put = async (record: WebTodoRecord): Promise<void> => {
    const index = records.findIndex((item) => item.id === record.id);
    const now = nowIso();
    const next = {
      ...record,
      entityType: "productivity.todo" as const,
      schemaVersion: 1,
      syncScope: "account-sync" as const,
      createdAt: record.createdAt || now,
      updatedAt: record.updatedAt || now,
    };
    if (index >= 0) {
      records[index] = next;
    } else {
      records.push(next);
    }
    save();
  };

  const remove = async (id: string): Promise<void> => {
    records = records.filter((item) => item.id !== id);
    save();
  };

  const transaction = async <R>(fn: (tx: RepoTransaction<WebTodoRecord>) => Promise<R>): Promise<R> => {
    const snapshot = [...records];
    const tx: RepoTransaction<WebTodoRecord> = {
      get,
      put,
      delete: remove,
      list,
      async listByIndex<K extends Extract<keyof WebTodoRecord, string>>(
        field: K,
        value: WebTodoRecord[K],
        query?: RepoListQuery<WebTodoRecord>,
      ): Promise<WebTodoRecord[]> {
        const all = await list(query);
        return all.filter((item) => item[field] === value);
      },
      metadata,
    };

    try {
      return await fn(tx);
    } catch (error) {
      records = snapshot;
      save();
      throw error;
    }
  };

  return {
    get,
    put,
    delete: remove,
    list,
    async listByIndex<K extends Extract<keyof WebTodoRecord, string>>(
      field: K,
      value: WebTodoRecord[K],
      query?: RepoListQuery<WebTodoRecord>,
    ): Promise<WebTodoRecord[]> {
      const all = await list(query);
      return all.filter((item) => item[field] === value);
    },
    metadata,
    transaction,
    async migrate(_plan: MigrationPlan<WebTodoRecord>): Promise<MigrationResult> {
      const now = nowIso();
      return {
        id: "browser-localstorage-noop",
        fromVersion: 0,
        toVersion: 0,
        startedAt: now,
        completedAt: now,
        applied: false,
      };
    },
  };
}

export function createWebTodoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `todo-${crypto.randomUUID()}`;
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function toIsoDate(day: Date): string {
  return day.toISOString().slice(0, 10);
}

export function isToday(dueAt?: string): boolean {
  if (!dueAt) {
    return false;
  }
  return dueAt.slice(0, 10) === toIsoDate(new Date());
}

export function isDeleted(record: WebTodoRecord): boolean {
  return typeof record.deletedAt === "string" && record.deletedAt.length > 0;
}
