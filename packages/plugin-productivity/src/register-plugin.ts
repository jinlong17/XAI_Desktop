import { PluginRegistry } from "@repo/core/registry";
import type { PluginManifest } from "@repo/core/types";
import { productivityConsoleViews } from "./console-views";

const productivityManifest: PluginManifest = {
  name: "productivity",
  version: "0.1.0",
  displayName: "效率工具",
  description: "Todos, pomodoro, habits, and matrix modules exposed to the Console shell.",
  author: "Jinlong",
  enabled: true,
  contentTypes: ["todo", "pomodoro-session", "habit"],
  windows: {
    control: true,
    overlay: true,
    console: true,
  },
  events: {
    emit: [
      "productivity:todo-created",
      "productivity:todo-updated",
      "productivity:pomodoro-completed",
      "productivity:habit-checked",
    ],
    listen: ["console:create-task-from-grid-item"],
  },
  dependencies: ["@repo/core", "@repo/core-data"],
  tauriCommands: [],
};

export function registerProductivityPlugin(): void {
  PluginRegistry.register(productivityManifest, {
    ConsoleViews: productivityConsoleViews,
  });
}
