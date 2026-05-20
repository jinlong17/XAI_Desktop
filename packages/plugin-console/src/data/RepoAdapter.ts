import type { Repo } from "@repo/core-data";
import type { ConsoleNotification, DataAdapter } from "../types";

const ENTITY_TYPE: ConsoleNotification["entityType"] = "console.notification";

export class RepoAdapter implements DataAdapter<ConsoleNotification> {
  private seeded = false;

  constructor(
    private readonly repo: Repo<ConsoleNotification>,
    private readonly seed: ConsoleNotification[] = [],
  ) {}

  async getAll(): Promise<ConsoleNotification[]> {
    const notifications = await this.repo.list({ entityType: ENTITY_TYPE, orderBy: { field: "createdAt", direction: "desc" } });
    if (notifications.length > 0 || this.seeded || this.seed.length === 0) {
      return notifications.filter((notification) => !notification.deletedAt);
    }
    this.seeded = true;
    await Promise.all(this.seed.map((notification) => this.repo.put(notification)));
    return this.getAll();
  }

  async getById(id: string): Promise<ConsoleNotification | null> {
    const notification = await this.repo.get(id);
    return notification && !notification.deletedAt ? notification : null;
  }

  async save(item: ConsoleNotification): Promise<void> {
    await this.repo.put({ ...item, entityType: ENTITY_TYPE });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
