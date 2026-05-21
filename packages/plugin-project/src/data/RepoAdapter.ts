import type { Repo, RepoRecord } from "@repo/core-data";
import type { DataAdapter } from "../types";

export interface RepoAdapterOptions<T extends RepoRecord> {
  entityType: T["entityType"];
  seed?: T[];
}

export class RepoAdapter<T extends RepoRecord & { deletedAt?: string; version?: number }> implements DataAdapter<T> {
  private seeded = false;

  constructor(
    private readonly repo: Repo<T>,
    private readonly options: RepoAdapterOptions<T>,
  ) {}

  async getAll(): Promise<T[]> {
    const records = await this.repo.list({ entityType: this.options.entityType });
    if (records.length > 0 || this.seeded || !this.options.seed?.length) {
      return records.filter((record) => !record.deletedAt);
    }
    this.seeded = true;
    await Promise.all(this.options.seed.map((record) => this.repo.put(record)));
    return this.getAll();
  }

  async getById(id: string): Promise<T | null> {
    const record = await this.repo.get(id);
    return record && !record.deletedAt ? record : null;
  }

  async save(item: T): Promise<void> {
    await this.repo.put({ ...item, entityType: this.options.entityType });
  }

  async delete(id: string): Promise<void> {
    const current = await this.repo.get(id);
    if (!current) return;

    const now = new Date().toISOString();
    await this.repo.put({
      ...current,
      deletedAt: now,
      updatedAt: now,
      ...(typeof current.version === "number" ? { version: current.version + 1 } : {}),
    });
  }
}
