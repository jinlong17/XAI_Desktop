import type { DataAdapter } from "./indexedDbAdapter";

export class RemoteEncryptedBlobAdapter<T extends { id: string }> implements DataAdapter<T> {
  private readonly remote = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    return this.remote.get(id);
  }

  async put(record: T): Promise<void> {
    this.remote.set(record.id, record);
  }

  async delete(id: string): Promise<void> {
    this.remote.delete(id);
  }

  async list(): Promise<T[]> {
    return [...this.remote.values()];
  }
}

export class OfflineFirstStrategy<T extends { id: string }> implements DataAdapter<T> {
  private readonly pending = new Set<string>();

  constructor(
    private readonly local: DataAdapter<T>,
    private readonly remote: DataAdapter<T>,
    private readonly isOnline: () => boolean = () => typeof navigator !== "undefined" && navigator.onLine,
  ) {}

  async get(id: string): Promise<T | undefined> {
    return (await this.local.get(id)) ?? (await this.remote.get(id));
  }

  async put(record: T): Promise<void> {
    await this.local.put(record);
    this.pending.add(record.id);
    await this.sync();
  }

  async delete(id: string): Promise<void> {
    await this.local.delete(id);
    if (this.isOnline()) {
      await this.remote.delete(id);
    }
  }

  async list(): Promise<T[]> {
    return this.local.list();
  }

  async sync(): Promise<void> {
    if (!this.isOnline()) {
      return;
    }
    for (const id of [...this.pending]) {
      const record = await this.local.get(id);
      if (record) {
        await this.remote.put(record);
      }
      this.pending.delete(id);
    }
  }
}
