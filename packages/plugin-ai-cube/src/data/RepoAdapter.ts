import type { Repo, RepoRecord } from "@repo/core-data";
import type { DataAdapter } from "../types";

export class RepoAdapter<T extends RepoRecord & { deletedAt?: string }> implements DataAdapter<T> {
  constructor(
    private readonly repo: Repo<T>,
    private readonly entityType: T["entityType"],
  ) {}

  async getAll(): Promise<T[]> {
    const records = await this.repo.list({ entityType: this.entityType });
    return records.filter((record) => !record.deletedAt);
  }

  async getById(id: string): Promise<T | null> {
    const record = await this.repo.get(id);
    return record && !record.deletedAt ? record : null;
  }

  async save(item: T): Promise<void> {
    await this.repo.put({ ...item, entityType: this.entityType });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
