import type { Repo } from "@repo/core-data";
import type { DataAdapter, Label } from "../types";

const ENTITY_TYPE: Label["entityType"] = "labels.label";

export interface RepoAdapterOptions {
  seed?: Label[];
}

export class RepoAdapter implements DataAdapter<Label> {
  private seeded = false;

  constructor(
    private readonly repo: Repo<Label>,
    private readonly options: RepoAdapterOptions = {},
  ) {}

  async getAll(): Promise<Label[]> {
    const labels = await this.repo.list({ entityType: ENTITY_TYPE });
    if (labels.length > 0 || this.seeded || !this.options.seed?.length) {
      return labels.filter((label) => !label.deletedAt);
    }
    this.seeded = true;
    await Promise.all(this.options.seed.map((label) => this.repo.put(label)));
    return this.repo.list({ entityType: ENTITY_TYPE });
  }

  async getById(id: string): Promise<Label | null> {
    const label = await this.repo.get(id);
    return label && !label.deletedAt ? label : null;
  }

  async save(item: Label): Promise<void> {
    await this.repo.put({ ...item, entityType: ENTITY_TYPE });
  }

  async delete(id: string): Promise<void> {
    const current = await this.repo.get(id);
    if (!current) return;

    const now = new Date().toISOString();
    await this.repo.put({
      ...current,
      deletedAt: now,
      updatedAt: now,
      version: current.version + 1,
    });
  }
}
