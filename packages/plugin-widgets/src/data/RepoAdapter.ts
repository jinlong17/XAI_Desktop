import type { Repo } from "@repo/core-data";
import type { DataAdapter, WidgetEntity } from "../types";

const ENTITY_TYPE: WidgetEntity["entityType"] = "widgets.widget";

export class RepoAdapter implements DataAdapter<WidgetEntity> {
  private seeded = false;

  constructor(
    private readonly repo: Repo<WidgetEntity>,
    private readonly seed: WidgetEntity[] = [],
  ) {}

  async getAll(): Promise<WidgetEntity[]> {
    const widgets = await this.repo.list({ entityType: ENTITY_TYPE });
    if (widgets.length > 0 || this.seeded || this.seed.length === 0) {
      return widgets.filter((widget) => !widget.deletedAt);
    }
    this.seeded = true;
    await Promise.all(this.seed.map((widget) => this.repo.put(widget)));
    return this.getAll();
  }

  async getById(id: string): Promise<WidgetEntity | null> {
    const widget = await this.repo.get(id);
    return widget && !widget.deletedAt ? widget : null;
  }

  async save(item: WidgetEntity): Promise<void> {
    await this.repo.put({ ...item, entityType: ENTITY_TYPE, syncScope: "device-local" });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
