import { PluginRegistry } from "@repo/core/registry";
import type { PluginManifest } from "@repo/core/types";
import { labelsConsoleViews } from "./console-view";

const labelsManifest: PluginManifest = {
  name: "labels",
  version: "0.1.0",
  displayName: "全局标签",
  description: "Shared labels, picker primitives, and Console labels module.",
  author: "Jinlong",
  enabled: true,
  contentTypes: ["label"],
  windows: {
    control: true,
    console: true,
  },
  events: {
    emit: ["labels:created", "labels:updated", "labels:deleted"],
    listen: [],
  },
  dependencies: ["@repo/core", "@repo/core-data"],
  tauriCommands: [],
};

export function registerLabelsPlugin(): void {
  PluginRegistry.register(labelsManifest, {
    ConsoleViews: labelsConsoleViews,
  });
}
