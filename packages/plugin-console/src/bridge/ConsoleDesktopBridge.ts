import type { ConsoleDesktopEvent, GridItemSnapshot, GridItemTaskDraft } from "../types";

export type ConsoleDesktopEventHandler<TPayload = unknown> = (event: ConsoleDesktopEvent<TPayload>) => void;

export function gridItemToTask(item: GridItemSnapshot): GridItemTaskDraft {
  return {
    title: item.title || item.path || "Untitled grid item",
    description: [`Created from organizer grid item ${item.id}.`, item.path ? `Path: ${item.path}` : ""]
      .filter(Boolean)
      .join("\n"),
    source: "organizer-grid",
    sourceId: item.id,
    labels: item.kind === "app" ? ["label-app"] : ["label-focus"],
  };
}

export class ConsoleDesktopBridge {
  private readonly handlers = new Map<string, Set<ConsoleDesktopEventHandler>>();
  readonly events: ConsoleDesktopEvent[] = [];

  subscribe<TPayload>(type: string, handler: ConsoleDesktopEventHandler<TPayload>): () => void {
    const handlers = this.handlers.get(type) ?? new Set<ConsoleDesktopEventHandler>();
    handlers.add(handler as ConsoleDesktopEventHandler);
    this.handlers.set(type, handlers);
    return () => handlers.delete(handler as ConsoleDesktopEventHandler);
  }

  emit<TPayload>(type: string, payload: TPayload): ConsoleDesktopEvent<TPayload> {
    const event: ConsoleDesktopEvent<TPayload> = { type, payload, createdAt: new Date().toISOString() };
    this.events.push(event);
    this.handlers.get(type)?.forEach((handler) => handler(event));
    return event;
  }

  createTaskFromGridItem(item: GridItemSnapshot): GridItemTaskDraft {
    const task = gridItemToTask(item);
    this.emit("console:create-task-from-grid-item", { item, task });
    return task;
  }

  revealGridItem(item: GridItemSnapshot): ConsoleDesktopEvent<GridItemSnapshot> {
    return this.emit("console:reveal-grid-item", item);
  }
}
