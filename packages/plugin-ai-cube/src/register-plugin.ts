import { PluginRegistry } from "@repo/core/registry";
import type { PluginManifest } from "@repo/core/types";
import { AiCubeControlWidget } from "./control/ControlWidget";

const aiCubeManifest: PluginManifest = {
  name: "ai-cube",
  version: "0.1.0",
  displayName: "AI Cube",
  description:
    "Control-window tray surface with preview conversation and settings bridge. Live AI remains disabled until Phase 4.",
  author: "Jinlong",
  enabled: true,
  contentTypes: ["ai-message"],
  windows: {
    control: true,
  },
  events: {
    emit: ["ai-cube:mock-action", "ai-cube:privacy-reviewed"],
    listen: [],
  },
  dependencies: ["@repo/core", "@repo/core-data", "@repo/ui"],
  tauriCommands: [],
};

export function registerAiCubePlugin(): void {
  PluginRegistry.register(aiCubeManifest, {
    ControlWidget: AiCubeControlWidget,
  });
}
