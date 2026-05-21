import type { Repo } from "@repo/core-data";
import type { CalendarEvent, DataAdapter } from "../types";

const ENTITY_TYPE: CalendarEvent["entityType"] = "calendar.event";

export class RepoAdapter implements DataAdapter<CalendarEvent> {
  private seeded = false;

  constructor(
    private readonly repo: Repo<CalendarEvent>,
    private readonly seed: CalendarEvent[] = [],
  ) {}

  async getAll(): Promise<CalendarEvent[]> {
    const events = await this.repo.list({ entityType: ENTITY_TYPE, orderBy: { field: "startsAt", direction: "asc" } });
    if (events.length > 0 || this.seeded || this.seed.length === 0) {
      return events.filter((event) => !event.deletedAt);
    }
    this.seeded = true;
    await Promise.all(this.seed.map((event) => this.repo.put(event)));
    return this.getAll();
  }

  async getById(id: string): Promise<CalendarEvent | null> {
    const event = await this.repo.get(id);
    return event && !event.deletedAt ? event : null;
  }

  async save(item: CalendarEvent): Promise<void> {
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
