// Deprecated: use createIndexedDbRepo from ./indexedDbRepo instead. Kept temporarily for the legacy OfflineFirstStrategy demo until consumers migrate.

export interface DataAdapter<T extends { id: string }> {
  get(id: string): Promise<T | undefined>;
  put(record: T): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<T[]>;
}

export class IndexedDBAdapter<T extends { id: string }> implements DataAdapter<T> {
  constructor(
    private readonly dbName: string,
    private readonly storeName: string,
  ) {}

  async get(id: string): Promise<T | undefined> {
    return this.withStore("readonly", (store) => request<T | undefined>(store.get(id)));
  }

  async put(record: T): Promise<void> {
    await this.withStore("readwrite", (store) => request<IDBValidKey>(store.put(record)));
  }

  async delete(id: string): Promise<void> {
    await this.withStore("readwrite", (store) => request<undefined>(store.delete(id)));
  }

  async list(): Promise<T[]> {
    return this.withStore("readonly", (store) => request<T[]>(store.getAll()));
  }

  private async withStore<R>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<R>): Promise<R> {
    const db = await openDb(this.dbName, this.storeName);
    try {
      return await fn(db.transaction(this.storeName, mode).objectStore(this.storeName));
    } finally {
      db.close();
    }
  }
}

function openDb(dbName: string, storeName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(dbName, 1);
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}

function request<T>(operation: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result as T);
    operation.onerror = () => reject(operation.error);
  });
}
