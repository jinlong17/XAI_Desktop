import type { Repo } from "@repo/core-data";
import type { ClipboardEntry, DataAdapter } from "../types";

const ENTITY_TYPE: ClipboardEntry["entityType"] = "clipboard.entry";

export class RepoAdapter implements DataAdapter<ClipboardEntry> {
  private seeded = false;

  constructor(
    private readonly repo: Repo<ClipboardEntry>,
    private readonly seed: ClipboardEntry[] = [],
  ) {}

  async getAll(): Promise<ClipboardEntry[]> {
    const entries = await this.repo.list({ entityType: ENTITY_TYPE, orderBy: { field: "createdAt", direction: "desc" } });
    if (entries.length > 0 || this.seeded || this.seed.length === 0) {
      return entries.filter((entry) => !entry.deletedAt);
    }
    this.seeded = true;
    await Promise.all(this.seed.map((entry) => this.repo.put(entry)));
    return this.getAll();
  }

  async getById(id: string): Promise<ClipboardEntry | null> {
    const entry = await this.repo.get(id);
    return entry && !entry.deletedAt ? entry : null;
  }

  async save(item: ClipboardEntry): Promise<void> {
    await this.repo.put({ ...item, entityType: ENTITY_TYPE, syncScope: "device-local" });
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
