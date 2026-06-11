import type {
  MigrationPlan,
  MigrationResult,
  Repo,
  RepoIndexKey,
  RepoListQuery,
  RepoMetadata,
  RepoRecord,
  RepoTransaction,
} from "@repo/core-data";

export interface IndexedDbRepoOptions {
  dbName: string;
  storeName: string;
  namespace: string;
  schemaVersion: number;
}

export function createIndexedDbRepo<T extends RepoRecord>({
  dbName,
  storeName,
  namespace,
  schemaVersion,
}: IndexedDbRepoOptions): Repo<T> {
  const operations: RepoTransaction<T> = createOperations<T>({
    dbName,
    storeName,
    namespace,
    schemaVersion,
  });

  return {
    ...operations,

    async transaction<R>(
      fn: (tx: RepoTransaction<T>) => Promise<R>,
    ): Promise<R> {
      const db = await openDb(dbName, storeName, schemaVersion);
      const idbTransaction = db.transaction(storeName, "readwrite");
      const store = idbTransaction.objectStore(storeName);
      // IndexedDB transactions auto-close when the request queue drains. Keep
      // repo transaction callbacks to awaited repo ops without unrelated async
      // work between them.
      const tx = createOperations<T>({
        dbName,
        storeName,
        namespace,
        schemaVersion,
        store,
      });

      try {
        const done = transactionDone(idbTransaction);
        const result = await fn(tx);
        await done;
        return result;
      } catch (error) {
        if (idbTransaction.error === null) {
          try {
            idbTransaction.abort();
          } catch {
            // The transaction may already be complete or aborted.
          }
        }
        throw error;
      } finally {
        db.close();
      }
    },

    async migrate(_plan: MigrationPlan<T>): Promise<MigrationResult> {
      void _plan;
      // Migration execution is intentionally deferred until Repository v0
      // migrations are finalized for the browser IndexedDB driver.
      if (process.env.NODE_ENV !== "production") {
        console.warn("E_NOT_IMPLEMENTED: indexedDbRepo.migrate");
      }
      throw new Error("E_NOT_IMPLEMENTED: indexedDbRepo.migrate");
    },
  };
}

interface OperationContext {
  dbName: string;
  storeName: string;
  namespace: string;
  schemaVersion: number;
  store?: IDBObjectStore;
}

function createOperations<T extends RepoRecord>({
  dbName,
  storeName,
  namespace,
  schemaVersion,
  store,
}: OperationContext): RepoTransaction<T> {
  async function withStore<R>(
    mode: IDBTransactionMode,
    fn: (activeStore: IDBObjectStore) => Promise<R>,
  ): Promise<R> {
    if (store) {
      return fn(store);
    }

    const db = await openDb(dbName, storeName, schemaVersion);
    const activeTransaction = db.transaction(storeName, mode);
    const done = transactionDone(activeTransaction);
    try {
      const result = await fn(activeTransaction.objectStore(storeName));
      await done;
      return result;
    } finally {
      db.close();
    }
  }

  return {
    async get(id: string): Promise<T | undefined> {
      return withStore("readonly", (activeStore) =>
        request<T | undefined>(activeStore.get(id)),
      );
    },

    async put(record: T): Promise<void> {
      assertRepoRecord(record);
      await withStore("readwrite", async (activeStore) => {
        await request<IDBValidKey>(activeStore.put(record));
      });
    },

    async delete(id: string): Promise<void> {
      await withStore("readwrite", async (activeStore) => {
        await request<undefined>(activeStore.delete(id));
      });
    },

    async list(query?: RepoListQuery<T>): Promise<T[]> {
      return withStore("readonly", async (activeStore) =>
        applyRepoListQuery(await request<T[]>(activeStore.getAll()), query),
      );
    },

    async listByIndex<K extends RepoIndexKey<T>>(
      field: K,
      value: T[K],
      query?: RepoListQuery<T>,
    ): Promise<T[]> {
      return withStore("readonly", async (activeStore) => {
        // Fast path: entityType and syncScope have IDB indexes (see onupgradeneeded). Other fields fall back to getAll + in-memory filter.
        if (isIndexedField(field)) {
          return applyRepoListQuery(
            await request<T[]>(
              activeStore
                .index(field)
                .getAll(IDBKeyRange.only(value as IDBValidKey)),
            ),
            query,
          );
        }

        return applyRepoIndexQuery(
          await request<T[]>(activeStore.getAll()),
          field,
          value,
          query,
        );
      });
    },

    async metadata(): Promise<RepoMetadata> {
      const recordCount = await withStore("readonly", (activeStore) =>
        request<number>(activeStore.count()),
      );
      return {
        driver: "web-indexed-db",
        namespace,
        schemaVersion,
        migrationVersion: 0,
        recordCount,
        migrations: [],
      };
    },
  };
}

function openDb(
  dbName: string,
  storeName: string,
  schemaVersion: number,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(dbName, schemaVersion);
    open.onupgradeneeded = () => {
      const db = open.result;
      const store = db.objectStoreNames.contains(storeName)
        ? open.transaction?.objectStore(storeName)
        : db.createObjectStore(storeName, { keyPath: "id" });

      if (!store) {
        return;
      }
      ensureIndex(store, "entityType");
      ensureIndex(store, "syncScope");
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
    open.onblocked = () =>
      reject(new Error("E_INDEXED_DB_BLOCKED: close other tabs and retry"));
  });
}

function ensureIndex(store: IDBObjectStore, key: string): void {
  if (!store.indexNames.contains(key)) {
    store.createIndex(key, key, { unique: false });
  }
}

function isIndexedField(
  field: PropertyKey,
): field is "entityType" | "syncScope" {
  return field === "entityType" || field === "syncScope";
}

function request<T>(operation: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result as T);
    operation.onerror = () => reject(operation.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function assertRepoRecord(record: RepoRecord): void {
  if (typeof record.id !== "string" || record.id.length === 0) {
    throw new Error("E3005: core-data record is missing id");
  }
  if (
    typeof record.entityType !== "string" ||
    !record.entityType.includes(".")
  ) {
    throw new Error("E3005: core-data record is missing entityType");
  }
  if (!Number.isInteger(record.schemaVersion) || record.schemaVersion < 1) {
    throw new Error("E3005: core-data record has invalid schemaVersion");
  }
  if (
    typeof record.createdAt !== "string" ||
    typeof record.updatedAt !== "string"
  ) {
    throw new Error("E3005: core-data record is missing timestamps");
  }
  if (
    record.syncScope !== "device-local" &&
    record.syncScope !== "account-sync"
  ) {
    throw new Error("E3005: core-data record has invalid syncScope");
  }
}

// Mirrored from @repo/core-data/repo-utils to keep this adapter dependency-light. Sync if upstream changes.
function applyRepoListQuery<T extends RepoRecord>(
  records: Iterable<T>,
  query: RepoListQuery<T> = {},
): T[] {
  let result = [...records];

  if (query.entityType) {
    result = result.filter((record) => record.entityType === query.entityType);
  }

  if (query.syncScope) {
    result = result.filter((record) => record.syncScope === query.syncScope);
  }

  if (query.orderBy) {
    const { field, direction = "asc" } = query.orderBy;
    result.sort((left, right) => {
      const order = compareRepoValues(left[field], right[field]);
      return direction === "asc" ? order : -order;
    });
  }

  if (query.limit !== undefined) {
    if (!Number.isInteger(query.limit) || query.limit < 0) {
      throw new Error("E3005: core-data list query has invalid limit");
    }
    result = result.slice(0, query.limit);
  }

  return result;
}

function applyRepoIndexQuery<T extends RepoRecord, K extends RepoIndexKey<T>>(
  records: Iterable<T>,
  field: K,
  value: T[K],
  query?: RepoListQuery<T>,
): T[] {
  return applyRepoListQuery(
    [...records].filter((record) => Object.is(record[field], value)),
    query,
  );
}

function compareRepoValues(left: unknown, right: unknown): number {
  if (left === right) {
    return 0;
  }
  if (typeof left === "number" && typeof right === "number") {
    return left < right ? -1 : 1;
  }
  return String(left).localeCompare(String(right));
}
